import CodeGeneratorChild from './code-generator-child';

export default class DataContainerCodeGenerator extends CodeGeneratorChild {
    public generate() {
        const {write, valueOf} = this.cs;
        write('export abstract class DataContainer {\n', () => {
            write('public getContainerName = () => this.__name;\n');
            write('public getContainerId = () => this.__id;\n');
            write(`public abstract encode(serializer: Serializer): void;\n`);
            write('constructor(private __id: number, private __name: string) {}\n');
        }, '}\n');
        return valueOf();
    }
}