import * as fs from 'fs';
import * as ts from 'typescript';
import * as vm from 'vm';
import * as assert from 'assert';
import DefaultSchema from '../src/schema';
import CodeGenerator from '../src/code-generator';
import { Container } from '../src/ast-parser/constants';

const generator = require('@babel/generator').default;

export class Schema extends DefaultSchema {
    constructors: any;
    constructor(containers: Container[], constructors: any) {
        super(containers);
        this.constructors = constructors;
    }

    getContainerName(value: any): string {
        return value.__container_name;
    }

    getContainerParams(value: any): any {
        return value;
    }

    createObject(container: Container, params: any): any {
        const Constructor = this.constructors.schema.names.get(container.name);
        return new Constructor(params);
    }
}

export default function() {
    return {
        'it should compile schema into code': function() {
            const ast = new CodeGenerator(fs.readFileSync(__dirname + '/schema.txt', 'utf8'), __dirname, {
                namespaceSeparator: '.'
            });
            const program = ast.generate();
            const code = generator(program).code;

            fs.writeFileSync(__dirname + '/../test.schema.ts', code);

            const output = ts.transpileModule(code, {
                compilerOptions: {
                    target: ts.ScriptTarget.ESNext,
                    module: ts.ModuleKind.CommonJS
                }
            }).outputText;
            const constructors: any = {};
            const context = vm.createContext({
                exports: constructors
            });
            vm.runInNewContext(output, context);
            
            const schema = new Schema(ast.getContainers(), constructors);
            
            const data = new constructors.geo.data.address({
                streetName: '',
                streetNumber: 0,
                url: new constructors.geo.URL({
                    href: ''
                })
            });
            assert.deepEqual(schema.decode(schema.encode(data)), new constructors.geo.data.address({
                streetName: '',
                streetNumber: 0,
                url: new constructors.geo.URL({
                    href: ''
                })
            }));
        }
    };
}