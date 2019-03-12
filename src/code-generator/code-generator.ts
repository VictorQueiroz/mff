import * as crc from 'cyclic-rc';
import {
    Node,
    NodeContainerDeclaration,
    NodeContainerParam,
    NodeContainerGroup,
    NodeMemberExpression,
    NodeIdentifier
} from '../ast-parser/node';
import { Syntax, Container, Generics } from '../ast-parser/constants';
import { ASTParser } from '..';
import { randomBytes } from 'crypto';
import ContainerGroupGenerator from './container-group-generator';
import { ASTParserOptions } from '../ast-parser';
import ModuleResolver from './module-resolver';
import UtilClassCodeGenerator from './util-class-code-generator';
import DataContainerCodeGenerator from './data-container-code-generator';
import CodeStream from './code-stream';

export interface IFileResult {
    path: string;
    contents: string;
    namespace: string[];
}

export interface CodeGeneratorOptions extends Partial<ASTParserOptions> {
    prefixPackage: string[];
    indentationSize: number;
    moduleAliases: Map<string, string>;
}

export interface ICodeGenerator {
    getFiles(): IFileResult[];
    setParentNode(node?: Node): void;
    processNode(node: Node): string;
    getVariableName(name: string, variant?: string, includeComment?: boolean): string;
    indentCode(...args: string[]): string;
    getPackageName(): string;
    increaseDepth(): void;
    decreaseDepth(): void;
    getContainers(): Container[];
    getContainer(name: string): Container;
    getNodeListFromParamExpression(node: Node): Node[];
    getInterfaceName(name: string): string;
    getCurrentNode(): Node | undefined;
    setCurrentNode(node?: Node): void;
    getParamDefaultFromType(node: Node): string;
    /**
     * Returns the node that holds the current node
     */
    getParentNode(): Node | undefined;
    translateParamType(node: Node): string;
    getPrefixPackage(): string[];
    /**
     * Return current namespace path we're in
     */
    getCurrentPath(): string[];
    addFile(file: Pick<IFileResult, 'path' | 'contents'>): void;
    getClassNameFromList(node: NodeContainerDeclaration | NodeContainerGroup): string;
}

export default class CodeGenerator implements ICodeGenerator {
    private files = new Array<IFileResult>();
    private path = new Array<string>();
    private depth = 0;
    private currentNode?: Node;
    private parentNode?: Node;
    private prefixPackage = new Array<string>();
    private containers = new Array<Container>();
    private indentationSize = 4;
    private generators = {
        containerGroup: new ContainerGroupGenerator(this)
    };
    private moduleResolver: ModuleResolver;
    constructor(private nodes: Node[], options: Partial<CodeGeneratorOptions> = {}) {
        if(options.prefixPackage) {
            this.prefixPackage = options.prefixPackage;
        }
        new ASTParser(nodes, {
            namespaceSeparator: '.',
            /**
             * We can pass empty directory since preprocessor was already
             * executed in these ast nodes
             */
            directory: '',
            containers: this.containers,
            ...options
        }).parse();
        if(typeof options.indentationSize !== 'undefined') {
            this.indentationSize = options.indentationSize;
        }
        this.moduleResolver = new ModuleResolver(options.moduleAliases || new Map());
    }
    public getFiles() {
        return [...this.files];
    }
    public addFile(file: Pick<IFileResult, 'path' | 'contents'>) {
        this.files.push({
            ...file,
            namespace: this.path.slice(0)
        });
    }
    public getCurrentNode() {
        return this.currentNode;
    }
    public getPrefixPackage() {
        return this.prefixPackage;
    }
    public getParentNode() {
        return this.parentNode;
    }
    public increaseDepth() {
        ++this.depth;
    }
    public decreaseDepth() {
        if(this.depth === 0) {
            throw new Error('Invalid calculation of depth. Depth cannot be lower than 0');
        }
        --this.depth;
    }
    public indentCode(...args: string[]): string {
        let result = '';
        for(const arg of args) {
            for(let i = 0 ; i < this.depth; i++) {
                for(let j = 0; j < this.indentationSize; j++) {
                    result += ' ';
                }
            }
            result += arg;
        }
        return result;
    }
    public getParamDefaultFromType(node: Node) {
        if(node.type === Syntax.Identifier) {
            if(node.value === Generics.UInt32) {
                return '0';
            } else if(node.value === Generics.Int32 || node.value === Generics.Int8 || node.value === Generics.UInt8) {
                return '0';
            } else if(node.value === Generics.Double) {
                return '0';
            } else if(node.value === Generics.String) {
                return '\'\'';
            }
            return '';
        } else if(node.type === Syntax.Template) {
            if(node.name === 'Vector') {
                return `new Array<${this.translateParamType(node.arguments[0])}>()`;
            } else if(node.name === 'TypedArray') {
                return '';
            } else if(node.name === 'Optional') {
                return 'undefined';
            }
            throw new Error(`Cannot provide a default value for template named "${node.name}"`);
        }
        return '';
    }
    public getContainers() {
        return this.containers;
    }
    public setParentNode(node?: Node) {
        this.parentNode = node;
    }
    public processNode(item: Node): string {
        const {write, append, valueOf} = new CodeStream(this);
        switch(item.type) {
            case Syntax.Namespace: {
                write(`export namespace ${item.name} {\n`, () => {
                    this.setParentNode(item);
                    this.setCurrentNode(item);
                    this.increaseDepth();
                    this.path.push(item.name);
                    for(const node of item.body) {
                        append(this.processNode(node));
                    }
                    this.path.pop();
                    this.decreaseDepth();
                    this.setCurrentNode(undefined);
                    this.setParentNode(undefined);
                }, '}\n');
                break;
            }
            case Syntax.ContainerGroup: {
                append(this.generators.containerGroup.generate(item));
                break;
            }
            default:
                throw new Error(`Node of type ${item.type} was not processed in main CodeGenerator class`);
        }
        return valueOf();
    }
    public setCurrentNode(node?: Node) {
        this.currentNode = node;
    }
    /**
     * Generates an unique identifier according to the current parameter, namespace and container name. It is
     * safe to use this function and it'll always return the same value as long as you keep inside container's context.
     *
     * As you already know it's safety, you should always use `variant` to specify some specific information for that
     * variable whenever you'll be dealing with a different value and don't need that specific value to be overwritten
     * or to be conflicted with other variable identifiers
     *
     * TODO: check if worth the heavy work that needs to be executed so we can maintain the uniqueness of the returned
     * value. Other options are: use an incremental id and the difference will not be much as long as we keep the
     * same order of variables
     *
     * @param paramName current param name
     * @param variant optional parameter used to not generated the same hash, it should be used whenever the variable
     * is not carrying the parameter value
     */
    public getVariableName(paramName: string, variant?: string, includeComment = true) {
        let variableHash = '';
        const currentNode = this.currentNode;
        if(currentNode && currentNode.type === Syntax.ContainerDeclaration) {
            let paramNode: NodeContainerParam | undefined;

            for(const node of currentNode.body) {
                if(node.type === Syntax.ContainerParam && node.name === paramName) {
                    paramNode = node;
                    break;
                }
            }

            if(paramNode) {
                variableHash = [
                    `${this.path.concat([paramName]).join('/')}:`,
                    `${this.translateParamType(paramNode.paramType)}`,
                    `(variant = ${variant})`
                ].join(' ');
            } else {
                // console.warn(
                //     'getVariableName() was called to create a variable that does not belong to a param. ' +
                //     'Falling back on the random variable generation algorithm'
                // );
            }
        }

        if(!variableHash) {
            // console.warn('Generating random variable since it was called outside of container context');
            variableHash = randomBytes(4).toString('hex');
        }
        // console.log('Generating crc hash from "%s"', variableHash);
        let comment = '';
        if(includeComment) {
            comment = ` /* ${paramName} */`;
        }
        return `v_${crc.crc_32(variableHash)}${comment}`;
    }
    public getContainer(name: string): Container {
        const original = this.containers.find(
            (container) => container.name === this.path.concat([name]).join('.')
        );
        if(!original) {
            throw new Error(`No original container generated for ${this.path.concat([name]).join('.')}`);
        }
        return original;
    }
    public getClassNameFromList(node: Node) {
        if(node.type !== Syntax.ContainerDeclaration && node.type !== Syntax.ContainerGroup) {
            throw new Error('What else could supply a param type if not a container declaration or container group?');
        }
        if(node.type === Syntax.ContainerGroup) {
            return `T${this.getInterfaceName(node.name)}`;
        }
        return this.getInterfaceName(node.name);
    }
    public getNodeListFromParamExpression(node: Node): Node[] {
        switch(node.type) {
            case Syntax.Identifier: {
                for(let i = 0; i < this.path.length + 1; i++) {
                    const namespace = this.path.slice(0, this.path.length - i);
                    const results = this.resolveTypeInBody(node.value, this.nodes, namespace);
                    if(results.length === 0) {
                        continue;
                    }
                    return results;
                }
                return [];
            }
            case Syntax.MemberExpression: {
                const name = node.right;
                const namespace = this.getNamespaceFromMemberExpression(node);
                const results = this.resolveTypeInBody(name, this.nodes, namespace.slice(0, namespace.length - 1));
                return results;
            }
        }
        return [];
    }
    public getNamespaceFromMemberExpression(
        node: NodeIdentifier | NodeMemberExpression,
        namespace = new Array<string>()
    ): string[] {
        switch(node.type) {
            case Syntax.MemberExpression:
                namespace = this.getNamespaceFromMemberExpression(node.left, namespace);
                return [...namespace, node.right];
            case Syntax.Identifier:
                return [...namespace, node.value];
        }
        return namespace;
    }
    /**
     * Translate param type to a valid TypeScript type
     * @param node Node to be translated from
     */
    public translateParamType(node: Node): string {
        switch(node.type) {
            case Syntax.Identifier: {
                if(node.value === Generics.String) {
                    return 'string';
                } else if(node.value === Generics.Float || node.value === Generics.Double) {
                    return 'number';
                } else if(node.value === Generics.UInt32 || node.value === Generics.Int32) {
                    return 'number';
                } else if(node.value === Generics.UInt8 || node.value === Generics.Int8) {
                    return 'number';
                } else if(node.value === Generics.UInt16 || node.value === Generics.Int16) {
                    return 'number';
                } else if(node.value === Generics.UInt64 || node.value === Generics.Int64) {
                    return 'Long';
                } else if(node.value === Generics.Boolean) {
                    return 'boolean';
                }
                const results = this.getNodeListFromParamExpression(node);
                if(results.length === 0) {
                    throw new Error(`No container name or type found for ${node.value}`);
                }
                return this.getClassNameFromList(results[0]);
            }
            case Syntax.MemberExpression: {
                const namespace = this.getNamespaceFromMemberExpression(node);
                const results = this.getNodeListFromParamExpression(node);
                if(results.length === 0) {
                    throw new Error(
                        `No container name or type found for ${node.right} (namespace = ${namespace.join('.')})`
                    );
                }
                for(let i = 0; i < namespace.length; i++) {
                    if(namespace[i] === this.path[i]) {
                        namespace.splice(i, 1);
                    } else {
                        namespace.unshift(...this.prefixPackage);
                        break;
                    }
                }
                return namespace.slice(0, namespace.length - 1).concat([
                    this.getClassNameFromList(results[0])
                ]).join('.');
            }
            case Syntax.Template:
                if(node.name === 'Vector') {
                    return `Array<${this.translateParamType(node.arguments[0])}>`;
                } else if(node.name === 'TypedArray') {
                    const arrayOf = node.arguments[0];
                    if(arrayOf.type !== Syntax.Identifier) {
                        throw new Error('TypedArray can contain only one argument and it must be an identifier');
                    }
                    if(arrayOf.value !== 'uint8') {
                        throw new Error('Current implementation only supports TypedArray<uint8>');
                    }
                    return 'Buffer';
                } else if(node.name === 'Optional') {
                    return `${this.translateParamType(node.arguments[0])} | undefined`;
                } else if(node.name === 'StrictSize') {
                    return this.translateParamType(node.arguments[0]);
                }
                throw new Error(`Unsupported template: ${node.name}`);
        }
        throw new Error(`Invalid param type: ${node.type}`);
    }
    /**
     * Resolve a type inside a context
     * @param name Container name/container type to look for
     * @param body Body to look for
     * @param namespace Namespace to start from
     */
    public resolveTypeInBody(name: string, body: Node[], namespace: string[]): Node[] {
        const results = new Array<Node>();
        for(const node of body) {
            /**
             * Since the `name` can't point to a namespace
             * we have to ignore if this is not a container name or container group
             */
            if(namespace.length === 0) {
                if(node.type !== Syntax.ContainerGroup && node.type !== Syntax.ContainerDeclaration) {
                    continue;
                }
                if(node.type === Syntax.ContainerGroup) {
                    if(node.name === name) {
                        results.push(node);
                        continue;
                    }
                    for(const item of node.body) {
                        if(item.type === Syntax.ContainerDeclaration && item.name === name) {
                            results.push(item);
                            break;
                        }
                    }
                } else if(name === node.name) {
                    results.push(node);
                }
                continue;
            } else if(node.type === Syntax.Namespace) {
                if(node.name === namespace[0]) {
                    results.push(...this.resolveTypeInBody(name, node.body, namespace.slice(1)));
                    continue;
                }
            }
        }
        return results;
    }
    public getCurrentPath(): string[] {
        return [...this.path];
    }
    /**
     * Get package name according to current path
     */
    public getPackageName() {
        return this.prefixPackage.concat(this.path).join('.');
    }
    public getInterfaceName(name: string) {
        return name.split('').reduce(
            (text, value, index) => index === 0 ? value.toUpperCase() : text + value,
            ''
        );
    }
    public generate(): string {
        const {write, append, valueOf} = new CodeStream(this);

        write('/* tslint:disable */\n');

        [
            `import Long from '${this.moduleResolver.resolve('long')}';\n`,
            `import { Serializer, Deserializer } from '${this.moduleResolver.resolve('message-ff')}';\n`
        ].map((text) => write(text));

        append(new UtilClassCodeGenerator(this).generate());
        append(new DataContainerCodeGenerator(this).generate());

        for(const node of this.nodes) {
            append(this.processNode(node));
        }
        write('/* tslint:enable */\n');

        return valueOf();
    }
}