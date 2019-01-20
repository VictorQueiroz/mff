import { Syntax } from './constants';
import { Node } from './node';
import * as fs from 'fs';
import * as path from 'path';

const btc = require('bindings')('btcjs');

export interface ASTPreprocessorOptions {
    directory: string;
}

/**
 * Process AST before it's really parsed 
 * by ASTParser so we can replace import declaration's
 * with it's AST file contents
 */
class ASTPreprocessor {
    ast: Node[];
    /**
     * Output with import statements replaced with AST content
     */
    private result: Node[];
    /**
     * Preprocessor options
     */
    private options: ASTPreprocessorOptions;
    /**
     * Registered aliases
     */
    private aliases: Map<string, Node>;

    constructor(ast: Node[], options: ASTPreprocessorOptions) {
        this.ast = ast;
        this.options = options;
        this.aliases = new Map();
        this.result = ast.reduce((result, node) => result.concat(this.process(node)), new Array<Node>());
    }

    public getResult(): Node[] {
        return this.result;
    }

    private process(ast: Node): Node[] {
        switch(ast.type) {
            case Syntax.Namespace: {
                const body: Node[] = ast.body.reduce((result, item) => {
                    return result.concat(this.process(item));
                }, new Array<Node>());

                return [{
                    ...ast,
                    body
                }];
            }
            case Syntax.ContainerGroup: {
                const body: Node[] = ast.body.reduce((nodes, node) => {
                    return nodes.concat(this.process(node));
                }, new Array<Node>());
                return [{
                    ...ast,
                    body
                }];
            }
            case Syntax.ContainerDeclaration:
                return [{
                    ...ast,
                    body: ast.body.reduce((params, param) => (
                        params.concat(this.process(param))
                    ), new Array<Node>())
                }];
            case Syntax.Template: {
                const args = ast.arguments.reduce((newArgs, arg) => {
                    return newArgs.concat(this.process(arg));
                }, new Array<Node>());
                return [{
                    ...ast,
                    arguments: args
                }];
            }
            case Syntax.Identifier: {
                const alias = this.aliases.get(ast.value);

                if(alias)
                    return [alias];

                return [ast];
            }
            case Syntax.ContainerParam: {
                let paramType = this.process(ast.paramType)[0];
                return [{
                    ...ast,
                    paramType
                }];
            }
            case Syntax.ImportDeclaration: {
                const modulePath = path.resolve(this.options.directory, ast.path);

                try {
                    fs.accessSync(modulePath, fs.constants.R_OK);
                } catch(reason) {
                    throw new Error(`Schema file "${modulePath}" not found or accessible`);
                }

                const preprocessor = new ASTPreprocessor(btc.parse(fs.readFileSync(modulePath).toString('utf8')), {
                    directory: path.dirname(modulePath)
                });

                return preprocessor.getResult();
            }
            case Syntax.Alias: {
                const result = this.process(ast.value);

                if(result.length > 1)
                    throw new Error(`Alias must have a single value`);
                else if(result.length > 0)
                    this.aliases.set(ast.name, result[0]);
                else
                    throw new Error(`Unexpected value for alias item`);

                return [];
            }
        }

        return [ast];
    }
}


export default ASTPreprocessor;