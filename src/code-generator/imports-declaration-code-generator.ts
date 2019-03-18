import CodeGeneratorChild from './code-generator-child';

export default class ImportsDeclarationCodeGenerator extends CodeGeneratorChild {
    public generate() {
        const {write, valueOf} = this.cs;
        const resolver = this.getModuleResolver();
        [
            `import Long from '${resolver.resolve('long')}';\n`,
            `import { Serializer, Deserializer } from '${resolver.resolve('message-ff')}';\n`
        ].map((text) => write(text));
        return valueOf();
    }
}