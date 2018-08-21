import { Node, NodeContainerParam, NodeContainerGroup } from './node';
import ContextScanner from './context-scanner';
import * as crc from 'cyclic-rc';

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

export interface ASTParserOptions {
    path?: string[];
    parent?: ASTParser;
    directory: string;
    containers: Container[];
    namespaceSeparator?: string;
}

class ASTParser {
    static defineDefaultOptions(options: any) {
        const defaults: any = {
            namespaceSeparator: '::',
            path: []
        };
        Object.keys(defaults).forEach(prop => {
            if(!options.hasOwnProperty(prop))
                options[prop] = defaults[prop];
        });
    }

    ast: Node[];
    path: string[];
    parent?: ASTParser;
    scanner: ContextScanner;
    options: ASTParserOptions;
    containers: Container[];
    namespaceSeparator: string;
    templateProcessors: Map<string, TemplateProcessor<any>>

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
        this.templateProcessors.set('TypedArray', new TypedArrayProcessor(this));
        this.templateProcessors.set('StrictSize', new StrictSizeProcessor(this));
    }

    parse() {
        for(let i = 0; i < this.ast.length; i++) {
            this.parseAstItem(this.ast[i]);
        }
    }

    parseParamType(paramType: Node): Param {
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
                    containers: matches.map(m => m.join(this.namespaceSeparator))
                };
            }
            case Syntax.Template: {
                const templateProcessor = this.templateProcessors.get(paramType.name);

                if(!templateProcessor)
                    throw new Error(`Unexpected template variable "${paramType.name}"`);

                return {
                    type: Params.Template,
                    name: paramType.name,
                    arguments: templateProcessor.process(paramType.arguments)
                };
            }
            case Syntax.MemberExpression: {
                const expressionPath = this.processMemberExpression(paramType);
                const matches = this.scanner.match(expressionPath);

                if(matches.length == 0)
                    throw new Error(`No match found for member expression ${expressionPath.join(' -> ')}`);

                return {
                    type: Params.Reference,
                    containers: matches.map(m => m.join(this.namespaceSeparator))
                };
            }
        }

        throw new Error(`Unexpected param type "${paramType.type}"`);
    }

    processMemberExpression(paramType: Node): string[] {
        if(paramType.type == Syntax.MemberExpression) {
            const left = this.processMemberExpression(paramType.left);
            return [...left, paramType.right];
        } else if(paramType.type == Syntax.Identifier) {
            return [paramType.value];
        } else {
            throw new Error('Invalid member expression');
        }
    }

    parseContainerParam(param: NodeContainerParam): ContainerParam {
        return {
            name: param.name,
            type: this.parseParamType(param.paramType)
        };
    }

    createCrcString(ast: Node): string {
        switch(ast.type) {
            case Syntax.ContainerDeclaration:
                return `${this.path.concat([ast.name]).join('.')} -> ${ast.body.map(node => this.createCrcString(node)).join(',')}`;
            case Syntax.ContainerParam:
                return `${ast.name}:${this.createCrcString(ast.paramType)}`;
            case Syntax.Identifier:
                return ast.value;
            case Syntax.MemberExpression:
                return `${this.createCrcString(ast.left)}.${ast.right}`;
            case Syntax.Template: {
                const processor = this.templateProcessors.get(ast.name);

                if(!processor)
                    throw new Error(`No template processor found to process ${ast.name} arguments`);

                const args = processor.createCrcString(ast.arguments);
                return `${ast.name}<${args.join(',')}>`;
            }
        }
        throw new Error(`Unexpected node type for crc string generation: ${ast.type}`);
    }

    processContainerGroupNode(ast: Node, parent: NodeContainerGroup) {
        switch(ast.type) {
            case Syntax.ContainerDeclaration: {
                const params = [];
                for(let i = 0; i < ast.body.length; i++) {
                    const item = ast.body[i];

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
        }

        throw new Error(`Invalid node for container group "${ast.type}"`)
    }

    parseAstItem(ast: Node) {
        switch(ast.type) {
            case Syntax.Namespace: {
                this.path.push(ast.name);

                const body = ast.body;
                const ii = body.length;

                for(let i = 0; i < ii; i++)
                    this.parseAstItem(body[i]);

                this.path.pop();
                break;
            }

            case Syntax.ContainerGroup: {
                const body = ast.body;
                for(let i = 0; i < body.length; i++) {
                    const item = body[i];
                    this.processContainerGroupNode(item, ast);
                }
                break;
            }
        }
    }
}

export default ASTParser;