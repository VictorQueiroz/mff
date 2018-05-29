import * as t from '@babel/types';
import { Container, Syntax } from '../ast-parser/constants';
import {
    Node
} from '../ast-parser/node';
import {
    ContainerDeclarationInterpreter
} from './interpreters';
import ASTParser from '../ast-parser';
import TemplateTransformer from './template-transformer';
import VectorTransformer from './vector-transformer';
import StrictSizeTransformer from './strict-size-transformer';
import OptionalTransformer from './optional-transformer';
import ContainerClassCreator from './container-class-creator';
import * as fs from 'fs';

const babel = require('@babel/core');

/**
 * Parse schema generating both a JSON file with containers and 
 * a definitions file for TypeScript projects so containers can be used 
 * as types
 */
export default class CodeGenerator {
    private parser: ASTParser;
    private containers: Container[] = [];
    private code: string;
    private ast: Node[];
    private path: string[] = [];
    private templateTransformers: Map<string, TemplateTransformer> = new Map();
    public interpreters: {
        containerDeclaration: ContainerDeclarationInterpreter;
    };

    constructor(contents: string, directory: string, options?: any) {
        this.code = contents;
        this.containers = [];
        this.parser = new ASTParser({
            text: this.code
        }, {
            containers: this.containers,
            directory,
            ...options
        });
        this.ast = this.parser.ast;
        this.path = [];

        this.parser.parse();

        this.templateTransformers.set('Vector', new VectorTransformer(this));
        this.templateTransformers.set('Optional', new OptionalTransformer(this));
        this.templateTransformers.set('StrictSize', new StrictSizeTransformer(this));

        this.interpreters = {
            containerDeclaration: new ContainerDeclarationInterpreter(this)
        };
    }

    public getContainers() {
        return this.containers;
    }

    /**
     * Get container inside of current namespace 
     * path using parsed containers
     */
    public getContainer(name: string) {
        return this.containers.find(container => {
            return container.name == this.path.concat([name]).join(this.parser.options.namespaceSeparator);
        });
    }

    getFileAst(file: string): t.Statement[] {
        const babelResult = babel.transform(fs.readFileSync(__dirname + '/' + file).toString('utf8'), {
            ast: true,
            root: __dirname + '/../../',
            plugins: [
                '@babel/plugin-syntax-typescript'
            ]
        });

        let result: t.Statement[];

        if(t.isFile(babelResult.ast))
            result = babelResult.ast.program.body;
        else
            throw new Error(`Invalid result for ast ${babelResult.ast.type}`);

        return result;
    }

    generate(): t.Program {
        const body: t.Statement[] = [
            ...this.getFileAst('templates/constructors-container.ts'),
            t.exportNamedDeclaration(new ContainerClassCreator(this).generate(this.parser.namespaceSeparator), [])
        ];

        for(let i = 0; i < this.ast.length; i++)
           body.push(...this.process(this.ast[i]));

        return t.program(body);
    }

    process(node: Node): any[] {
        switch(node.type) {
            case Syntax.Namespace: {
                const body = [];
                this.path.push(node.name);

                for(let i = 0; i < node.body.length; i++) {
                    body.push(...this.process(node.body[i]));
                }

                this.path.pop();
                
                return [
                    t.exportNamedDeclaration(t.tsModuleDeclaration(t.identifier(node.name), t.tsModuleBlock(body)), [])
                ];
            }
            case Syntax.ContainerGroup: {
                const body = node.body.reduce((list, node) => list.concat(this.process(node)), <t.Declaration[]>[]);
                const tsTypes = [];

                for(let i = 0; i < node.body.length; i++) {
                    const item = node.body[i];

                    if(item.type != Syntax.ContainerDeclaration)
                        continue;

                    tsTypes.push(t.tsTypeReference(t.identifier(item.name)));
                }

                const typeAliasDeclaration = t.tsTypeAliasDeclaration(t.identifier(node.name), null, t.tsUnionType(tsTypes));

                return [
                    t.exportNamedDeclaration(typeAliasDeclaration, []),
                    ...body
                ];
            }
            case Syntax.ContainerDeclaration:
                return this.interpreters.containerDeclaration.interpret(node);
        }
        throw new Error(`Unhandled node "${node.type}"`);
    }

    public getTemplateTransformer(name: string) {
        const transformer = this.templateTransformers.get(name);

        if(!transformer)
            throw new Error(`No transformer found for template "${name}"`);

        return transformer;
    }
}