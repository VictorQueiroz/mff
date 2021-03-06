import { Node, NodeContainerParam, NodeContainerGroup } from './node';
import ContextScanner from './context-scanner';
import crc from 'cyclic-rc';

// Default template processors
import VectorProcessor from './vector-processor';
import OptionalProcessor from './optional-processor';
import TemplateProcessor from './template-processor';
import TypedArrayProcessor from './typed-array-processor';
import {
    Syntax,
    Container,
    ContainerParam
} from './constants';
import { Params, Param } from './param';
import ASTPreprocessor from './ast-preprocessor';
import StrictSizeProcessor from './strict-size-processor';
import { isGeneric } from './utils';
import MapProcessor from './map-processor';

export interface ASTParserOptions {
    path?: string[];
    parent?: ASTParser;
    directory: string;
    containers: Container[];
    namespaceSeparator?: string;
}

class ASTParser {
    public static defineDefaultOptions(options: any) {
        const defaults: any = {
            namespaceSeparator: '::',
            path: []
        };
        Object.keys(defaults).forEach((prop) => {
            if(!options.hasOwnProperty(prop))
                options[prop] = defaults[prop];
        });
    }

    public ast: Node[];
    public path: string[];
    public parent?: ASTParser;
    public scanner: ContextScanner;
    public options: ASTParserOptions;
    public containers: Container[];
    public namespaceSeparator: string;
    public templateProcessors: Map<string, TemplateProcessor<any>>;

    constructor(ast: Node[], options: ASTParserOptions) {
        ASTParser.defineDefaultOptions(options);

        this.ast = new ASTPreprocessor(ast, {
            directory: options.directory
        }).getResult();
        this.path = options.path || [];
        this.parent = options.parent;
        this.scanner = new ContextScanner(this);
        this.options = options;
        this.containers = options.containers;
        this.namespaceSeparator = options.namespaceSeparator || '::';
        this.templateProcessors = new Map();

        this.templateProcessors.set('Vector', new VectorProcessor(this));
        this.templateProcessors.set('Optional', new OptionalProcessor(this));
        this.templateProcessors.set('Map', new MapProcessor(this));
        this.templateProcessors.set('TypedArray', new TypedArrayProcessor(this));
        this.templateProcessors.set('StrictSize', new StrictSizeProcessor(this));
    }

    public parse() {
        for(const item of this.ast) {
            this.parseAstItem(item);
        }
    }

    public parseParamType(paramType: Node): Param {
        switch(paramType.type) {
            case Syntax.Identifier: {
                const type = paramType.value;

                if(isGeneric(type)) {
                    return {
                        type: Params.Generic,
                        name: type
                    };
                }

                const matches = this.scanner.match([type]);

                if(matches.length == 0)
                    throw new Error(`No match found for type "${type}"`);

                return {
                    type: Params.Reference,
                    containers: matches.map((m) => m.join(this.namespaceSeparator))
                };
            }
            case Syntax.Template: {
                const templateProcessor = this.templateProcessors.get(paramType.name);
                let outputArguments: any[];

                if(!templateProcessor) {
                    const results = this.scanner.resolveTypeInBody(paramType.name, this.ast, this.path);
                    if(results.length === 0) {
                        throw new Error(`Unexpected template variable "${paramType.name}"`);
                    }
                    outputArguments = paramType.arguments;
                } else {
                    outputArguments = templateProcessor.process(paramType.arguments);
                }

                return {
                    type: Params.Template,
                    name: paramType.name,
                    arguments: outputArguments
                };
            }
            case Syntax.MemberExpression: {
                const expressionPath = this.processMemberExpression(paramType);
                const matches = this.scanner.match(expressionPath);

                if(matches.length == 0)
                    throw new Error(`No match found for member expression ${expressionPath.join(' -> ')}`);

                return {
                    type: Params.Reference,
                    containers: matches.map((m) => m.join(this.namespaceSeparator))
                };
            }
        }

        throw new Error(`Unexpected param type "${paramType.type}"`);
    }

    public processMemberExpression(paramType: Node): string[] {
        if(paramType.type == Syntax.MemberExpression) {
            const left = this.processMemberExpression(paramType.left);
            return [...left, paramType.right];
        } else if(paramType.type == Syntax.Identifier) {
            return [paramType.value];
        } else {
            throw new Error('Invalid member expression');
        }
    }

    public parseContainerParam(param: NodeContainerParam): ContainerParam {
        return {
            name: param.name,
            type: this.parseParamType(param.paramType)
        };
    }

    public createCrcString(ast: Node): string {
        switch(ast.type) {
            case Syntax.ContainerDeclaration:
                return `${this.path.concat([ast.name]).join('.')} -> ` +
                        `${ast.body.map((node) => this.createCrcString(node)).join(',')}`;
            case Syntax.ContainerParam:
                return `${ast.name}:${this.createCrcString(ast.paramType)}`;
            case Syntax.Identifier:
                return ast.value;
            case Syntax.MemberExpression:
                return `${this.createCrcString(ast.left)}.${ast.right}`;
            case Syntax.Template: {
                const processor = this.templateProcessors.get(ast.name);
                let args: string[];

                if(!processor) {
                    const results = this.scanner.resolveTypeInBody(ast.name, this.ast, this.path);
                    if(results.length === 0) {
                        throw new Error(`No template processor found to process ${ast.name} arguments`);
                    }
                    args = ast.arguments.map((arg) => this.createCrcString(arg));
                } else {
                    args = processor.createCrcString(ast.arguments);
                }

                return `${ast.name}<${args.join(',')}>`;
            }
        }
        throw new Error(`Unexpected node type for crc string generation: ${ast.type}`);
    }

    public processContainerGroupNode(ast: Node, parent: NodeContainerGroup) {
        switch(ast.type) {
            case Syntax.ContainerDeclaration: {
                const params = [];
                for(const item of ast.body) {
                    if(item.type == Syntax.ContainerParam) {
                        params.push(this.parseContainerParam(item));
                    }
                }
                const crcValue = `${parent.name} ${this.createCrcString(ast)}`;
                this.containers.push({
                    id: crc.crc_32(crcValue),
                    type: this.path.concat([parent.name]).join(this.namespaceSeparator),
                    params,
                    name: this.path.concat([ast.name]).join(this.namespaceSeparator)
                });
                return;
            }
            case Syntax.TemplateDeclaration:
                return;
        }

        throw new Error(`Invalid node for container group "${ast.type}"`);
    }

    public parseAstItem(ast: Node) {
        switch(ast.type) {
            case Syntax.Namespace: {
                this.path.push(ast.name);

                for(const item of ast.body)
                    this.parseAstItem(item);

                this.path.pop();
                break;
            }

            case Syntax.ContainerGroup: {
                const body = ast.body;
                for(const item of body) {
                    this.processContainerGroupNode(item, ast);
                }
                break;
            }
        }
    }
}

export default ASTParser;