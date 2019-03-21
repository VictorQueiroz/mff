import CodeGeneratorChild from './code-generator-child';

export default class ImportsDeclarationCodeGenerator extends CodeGeneratorChild {
    public generate() {
        const {write, append, valueOf} = this.cs;
        const resolver = this.getModuleResolver();
        for(const i of resolver.imports.values()) {
            write('import');
            if(i.default) {
                append(` ${i.default}`);
            }
            if(i.args.length) {
                append(` { ${i.args.join(', ')} }`);
            }
            append(` from "${i.name}"`);
            append(';\n');
        }
        resolver.imports.clear();
        return valueOf();
    }
}