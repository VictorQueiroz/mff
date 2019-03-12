import TypeCodeGenerator, { ITypeCodecOptions } from "../type-code-generator";

export default class TypedArrayCodeGenerator extends TypeCodeGenerator<any> {
    public getDecodingCode(_: any, options: ITypeCodecOptions) {
        const {valueOf, write} = this.cs;
        write(
            `${options.assignmentVariable} = deserializer.readBuffer(deserializer.readUInt32());\n`
        );
        return valueOf();
    }
    public getEncodingCode(_: any, { assignmentVariable }: ITypeCodecOptions) {
        const {valueOf, write} = this.cs;
        const byteArrayVariable = this.getVariableName(assignmentVariable);
        write(`const ${byteArrayVariable} = ${assignmentVariable};\n`);
        write(`serializer.writeUInt32(${byteArrayVariable}.length);\n`);
        write(`serializer.writeBuffer(${byteArrayVariable});\n`);
        return valueOf();
    }
}