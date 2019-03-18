import CodeGeneratorChild from './code-generator-child';

export default class UtilClassCodeGenerator extends CodeGeneratorChild {
    public generate(): string {
        const {write, valueOf} = this.cs;
        write('export class Util {\n', () => {
            write('public decode(deserializer: Deserializer): DataContainer {\n', () => {
                write('const id = deserializer.readUInt32();\n');
                for(const container of this.getContainers()) {
                    const name = this.getPrefixPackage().concat(container.name.split('.'));
                    name[name.length - 1] = this.getInterfaceName(name[name.length - 1]);
                    write(`if(id === 0x${container.id.toString(16)}) {\n`, () => {
                        write(`return ${name.join('.')}.decode(deserializer, true);\n`);
                    }, '}\n');
                }
                write('throw new Error(`No container found with id ${id}`);\n');
            }, '}\n');
        }, '}\n');
        return valueOf();
    }
}