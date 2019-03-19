import { NodeContainerDeclaration, Node, NodeContainerParam, Comment } from "../ast-parser/node";
import { Syntax } from "../ast-parser/constants";
import CodeGeneratorChild from "./code-generator-child";
import GenericCodeGenerator from "./generic-code-generator";
import { ITypeCodecOptions } from "./type-code-generator";
import CodeStream from "./code-stream";
import TemplateCodeGenerator from './template-generators/template-code-generator';

/**
 * Responsible for generating container declaration code
 */
export default class ContainerDeclarationGenerator extends CodeGeneratorChild {
    public generate(item: NodeContainerDeclaration): string {
        this.setCurrentNode(item);

        let lastParam: Node | undefined;
        for(const node of item.body) {
            if(node.type === Syntax.ContainerParam) {
                lastParam = node;
            }
        }

        const container = this.getContainer(item.name);
        const parentNode = this.getParentNode();
        const {write, append, valueOf} = this.cs;

        if(!parentNode || parentNode.type !== Syntax.ContainerGroup) {
            throw new Error('Parent node of a container declaration must always be a container group');
        }

        this.createContainerParamsInterface(item);
        this.writeContainerClassComments(item);

        const interfaceName = this.getInterfaceName(item.name);
        const parentInterfaceName = this.getInterfaceName(parentNode.name);

        write(
            `export class ${interfaceName} extends T${parentInterfaceName} implements I${interfaceName}Params {\n`,
            () => {
                append(this.createContainerInterfaceParams(item, (c) => {
                    return `public readonly ${c}`;
                }));

                write('constructor(');

                if(lastParam) {
                    append(`params: I${interfaceName}Params`);
                }
                append(')\n');
                write('{\n', () => {
                    write(`super(${container.id}, "${container.name}");\n`);
                    for(const param of container.params) {
                        write(`this.${param.name} = params.${param.name};\n`);
                    }
                }, '}\n');

                /* container body */
                write(
                    `public static decode(deserializer: Deserializer, ignoreHeader = true): ${interfaceName} {\n`,
                    () => append(this.createDecodingStatements(item)),
                    '}\n'
                );
                write(
                    'public encode(serializer: Serializer, ignoreHeader = true): void {\n',
                    () => append(this.createEncodingStatements(item)),
                    '}\n'
                );
                write(
                    `public copy(params: Partial<I${interfaceName}Params>): ${interfaceName} {\n`,
                    () => append(this.createCopyStatements(item)),
                    '}\n'
                );
            },
            '}\n'
        );

        this.setCurrentNode(undefined);

        return valueOf();
    }
    public attachComments(comments: Comment[]): string {
        const {write, valueOf} = new CodeStream(this);
        if(comments.length === 0) return '';
        for(const comment of comments) {
            switch(comment.type) {
                case Syntax.SingleLineComment:
                    write(`// ${comment.value}\n`);
                    break;
                case Syntax.MultiLineComment: {
                    write(`/**\n`);
                    const lines = comment.value.split('\n');
                    for(const line of lines) {
                        if(!line.trim()) {
                            continue;
                        }
                        write(` ${line.replace(/^(\ )+/, '')}\n`);
                    }
                    write(' */\n');
                }
            }
        }
        return valueOf();
    }
    public createCopyStatements(item: NodeContainerDeclaration): string {
        const {write, valueOf} = new CodeStream(this);
        write('let changed = false;\n');
        for(const node of item.body) {
            if(node.type !== Syntax.ContainerParam) {
                continue;
            }
            write(`if(!changed && this.${node.name} !== params.${node.name}) changed = true;\n`);
        }
        write('if(changed) {\n', () => {
            write(`return new ${this.getInterfaceName(item.name)}({\n`, () => {
                write(`...this,\n`);
                write(`...params\n`);
            }, `});\n`);
        }, '}\n');
        write('return this;\n');
        return valueOf();
    }
    public createContainerParamsInterface(item: NodeContainerDeclaration) {
        const {write, append} = this.cs;
        const interfaceName = `I${this.getInterfaceName(item.name)}Params`;
        write(`interface ${interfaceName} {\n`, () => {
            append(this.createContainerInterfaceParams(item));
        }, '}\n');
    }
    public createContainerInterfaceParams(
        item: NodeContainerDeclaration,
        transform: (value: string) => string = (v) => v
    ) {
        let optional = '';
        const {write, append, valueOf} = new CodeStream(this);
        for(const node of item.body) {
            if(node.type !== Syntax.ContainerParam) {
                continue;
            }
            if(node.leadingComments.length > 0) {
                append(this.attachComments(node.leadingComments));
            }
            let paramType: string;
            if(node.paramType.type === Syntax.Template && node.paramType.name === 'Optional') {
                optional = '?';
                paramType = this.translateParamType(node.paramType.arguments[0]);
            } else {
                optional = '';
                paramType = this.translateParamType(node.paramType);
            }
            write(transform(`${node.name}${optional}: ${paramType};\n`));
        }
        return valueOf();
    }
    public getDecoratorFromParam(node: Node): string {
        if(node.type !== Syntax.ContainerParam) {
            return '';
        }
        return '';
    }
    public createDecodingStatements(node: Node): string {
        if(node.type !== Syntax.ContainerDeclaration) {
            throw new TypeError('Node must be a container declaration');
        }
        const {write, valueOf, append} = new CodeStream(this);
        const container = this.getContainer(node.name);
        write('if(ignoreHeader !== true) {\n', () => {
            write('const id = deserializer.readUInt32();\n');
            write(`if(${container.id} !== id) {\n`, () => {
                write(
                    `throw new Error(\n`,
                    () => {
                        write(`\`Invalid container id: Expected ${container.id} but received \${id} instead.\`\n`);
                    },
                    ');\n'
                );
            }, '}\n');
        }, '}\n');
        const paramsValues = new Map<string, string>();
        for(const item of node.body) {
            if(item.type !== Syntax.ContainerParam) {
                continue;
            }
            paramsValues.set(item.name, this.getVariableName(item.name));
            write(
                `let ${paramsValues.get(item.name)}: ${this.translateParamType(item.paramType)}`
            );
            const defaultValue = this.getParamDefaultFromType(item.paramType);
            if(defaultValue) {
                append(` = ${defaultValue};\n`);
            } else {
                append(';\n');
            }
        }
        let lastParam: NodeContainerParam | undefined;
        for(const item of node.body) {
            if(item.type !== Syntax.ContainerParam) {
                continue;
            }
            const assignmentVariable = paramsValues.get(item.name);
            if(!assignmentVariable) {
                throw new Error(`Could not find variable name for variable ${item.name}`);
            }
            append(this.createParamDecodingStatement(item, {
                assignmentVariable
            }));
            lastParam = item;
        }
        write(`return new ${this.getClassNameFromList(node)}({\n`, () => {
            for(const item of node.body) {
                if(item.type !== Syntax.ContainerParam) {
                    continue;
                }
                write(`\"${item.name}\": ${paramsValues.get(item.name)}`);
                if(lastParam !== item) {
                    append(',\n');
                } else {
                    append('\n');
                }
            }
        }, '});\n');
        return valueOf();
    }
    public createEncodingStatements(item: NodeContainerDeclaration) {
        const original = this.getContainer(item.name);
        const {append, write, valueOf} = new CodeStream(this);
        write(
            `if(ignoreHeader != true) serializer.writeUInt32(${original.id});\n`
        );
        for(const node of item.body) {
            if(node.type !== Syntax.ContainerParam) {
                continue;
            }
            append(this.createParamEncodingStatement(
                node,
                {
                    assignmentVariable: `this.${node.name}`
                }
            ));
        }
        return valueOf();
    }
    public createParamDecodingStatement(node: Node, options: ITypeCodecOptions): string {
        if(node.type !== Syntax.ContainerParam) {
            throw new TypeError('Node must be container param type');
        }
        const paramType = node.paramType;
        if(paramType.type === Syntax.Identifier) {
            const contents = new GenericCodeGenerator(this).getDecodingCode(paramType, options);
            if(contents) {
                return contents;
            }
        } else if(paramType.type === Syntax.Template) {
            const typeGenerator = this.getGenerator<TemplateCodeGenerator>(`templateGenerator::${paramType.name}`);
            return typeGenerator.getDecodingCode(node, options);
        }
        const { assignmentVariable } = options;
        return this.indentCode(
            `${assignmentVariable} = ${this.translateParamType(node.paramType)}.decode(deserializer);\n`
        );
    }
    public createToplevelDecodeMethod(node: Node): string {
        if(node.type !== Syntax.ContainerGroup) {
            throw new Error('Node must be container group type');
        }
        const {write, valueOf} = new CodeStream(this);
        write(
            `public static decode(deserializer: Deserializer): ${this.getClassNameFromList(node)} {\n`,
            () => {
                write('const id = deserializer.readUInt32();\n');
                const ids = new Array<number>();
                for(const item of node.body) {
                    if(item.type !== Syntax.ContainerDeclaration) {
                        continue;
                    }
                    const container = this.getContainer(item.name);
                    ids.push(container.id);
                    write(`if(id === 0x${container.id.toString(16)}) {\n`, () => {
                        write(`return ${this.getClassNameFromList(item)}.decode(deserializer, true);\n`);
                    }, '}\n');
                }
                write(
                    `throw new Error(\`Expected one of ${ids.join(' / ')} ids but got \${id} instead\`);\n`
                );
            },
            '}\n'
        );
        return valueOf();
    }
    public createParamEncodingStatement(node: Node, options: ITypeCodecOptions): string {
        if(node.type !== Syntax.ContainerParam) {
            throw new TypeError('Node must be container param type');
        }
        const {assignmentVariable} = options;
        const paramType = node.paramType;
        const {write, valueOf} = new CodeStream(this);
        if(paramType.type === Syntax.Identifier) {
            const contents = new GenericCodeGenerator(this).getEncodingCode(paramType, options);
            if(contents) {
                return contents;
            }
        } else if(paramType.type === Syntax.Template) {
            const typeGenerator = this.getGenerator<TemplateCodeGenerator>(
                `templateGenerator::${paramType.name}`
            );
            return typeGenerator.getEncodingCode(node, options);
        }
        write(`${assignmentVariable}.encode(serializer, false);\n`);
        return valueOf();
    }
    private writeContainerClassComments(item: NodeContainerDeclaration) {
        const {append} = this.cs;
        if(!item.leadingComments.length) {
            return;
        }
        append(this.attachComments(item.leadingComments));
    }
}