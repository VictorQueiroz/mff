import filesize from 'filesize';
import * as path from 'path';
import { btc } from '../src';
import * as fs from 'fs';
import ASTPreprocessor from '../src/ast-parser/ast-preprocessor';
import { CodeGenerator } from '../src/code-generator';
import { format } from 'util';

async function run(): Promise<number> {
    const nodes = btc.parse(fs.readFileSync(path.resolve(__dirname, '../test/schema.txt'), 'utf8'));
    const preprocessor = new ASTPreprocessor(nodes, {
        directory: path.resolve(__dirname, '../test')
    });
    const cg = new CodeGenerator(preprocessor.getResult(), {
        moduleAliases: new Map().set('message-ff', path.resolve(__dirname, '../src'))
    });
    const contents = Buffer.from(cg.generate(), 'utf8');

    fs.writeFileSync(path.resolve(__dirname, '../test/schema.ts'), contents);
    return contents.byteLength;
}

run().then((length) => {
    process.stdout.write(format(`schema generated. file size: %s\n`, filesize(length)));
}).catch((reason) => {
    process.stdout.write(`${reason}\n`);
    process.exit(1);
});