import filesize from 'filesize';
import * as path from 'path';
import { btc } from '../src';
import * as fs from 'fs';
import ASTPreprocessor from '../src/ast-parser/ast-preprocessor';
import { CodeGenerator } from '../src/code-generator';
import { format } from 'util';
import EmptyCodeGenerator from '../src/code-generator/empty-code-generator';
import ContainerDeclarationInterfaceGenerator from '../src/code-generator/container-declaration-interface-generator';
import ContainerGroupInterfaceGenerator from '../src/code-generator/container-group-interface-generator';

async function run(): Promise<number> {
    const nodes = btc.parse(fs.readFileSync(path.resolve(__dirname, '../test/schema.txt'), 'utf8'));
    const preprocessor = new ASTPreprocessor(nodes, {
        directory: path.resolve(__dirname, '../test')
    });
    const cg = new CodeGenerator(preprocessor.getResult(), {
        moduleAliases: new Map().set(
            'message-ff',
            path.relative(path.resolve(__dirname, '../test'), path.resolve(__dirname, '../src'))
        )
    });
    const contents = Buffer.from(cg.generate(), 'utf8');

    fs.writeFileSync(path.resolve(__dirname, '../test/schema.ts'), contents);

    cg.generators.set('utilClass', new EmptyCodeGenerator(cg));
    cg.generators.set('dataContainer', new EmptyCodeGenerator(cg));
    cg.generators.set('containerDeclaration', new ContainerDeclarationInterfaceGenerator(cg));
    cg.generators.set('containerGroup', new ContainerGroupInterfaceGenerator(cg));

    fs.writeFileSync(path.resolve(__dirname, '../test/schema-interfaces.ts'), cg.generate());

    return contents.byteLength;
}

run().then((length) => {
    process.stdout.write(format(`schema generated. file size: %s\n`, filesize(length)));
}).catch((reason) => {
    process.stdout.write(`${reason}\n`);
    process.exit(1);
});