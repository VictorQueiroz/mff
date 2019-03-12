import { NodeIdentifier } from "../ast-parser/node";
import { Generics } from "../ast-parser/constants";
import TypeCodeGenerator, { ITypeCodecOptions } from "./type-code-generator";

/**
 * Class responsible for generating code related
 * to generic types
 */
export default class GenericCodeGenerator extends TypeCodeGenerator<NodeIdentifier> {
    public getEncodingCode(paramType: NodeIdentifier, { assignmentVariable }: ITypeCodecOptions) {
        const {write, valueOf} = this.cs;
        if(paramType.value === Generics.String) {
            write(`serializer.writeString(${assignmentVariable});\n`);
        } else if(paramType.value === Generics.UInt32) {
            write(`serializer.writeUInt32(${assignmentVariable});\n`);
        } else if(paramType.value === Generics.Double) {
            write(`serializer.writeDouble(${assignmentVariable});\n`);
        } else if(paramType.value === Generics.Int32) {
            write(`serializer.writeInt32(${assignmentVariable});\n`);
        } else if(paramType.value === Generics.Boolean) {
            write(`serializer.writeUInt8(${assignmentVariable} === true ? 1 : 0);\n`);
        } else if(paramType.value === Generics.UInt16) {
            write(`serializer.writeUInt16(${assignmentVariable});\n`);
        } else if(paramType.value === Generics.UInt64) {
            write(`serializer.writeUInt64(${assignmentVariable});\n`);
        }
        return valueOf();
    }
    public getDecodingCode(paramType: NodeIdentifier, { assignmentVariable }: ITypeCodecOptions) {
        const {write, valueOf} = this.cs;
        if(paramType.value === Generics.String) {
            write(
                `${assignmentVariable} = deserializer.readBuffer(deserializer.readUInt32()).toString('utf8');\n`
            );
        } else if(paramType.value === Generics.UInt32) {
            write(`${assignmentVariable} = deserializer.readUInt32();\n`);
        } else if(paramType.value === Generics.Double) {
            write(`${assignmentVariable} = deserializer.readDouble();\n`);
        } else if(paramType.value === Generics.Int32) {
            write(`${assignmentVariable} = deserializer.readInt32();\n`);
        } else if(paramType.value === Generics.Boolean) {
            write(`${assignmentVariable} = deserializer.readUInt8() ? true : false;\n`);
        } else if(paramType.value === Generics.UInt16) {
            write(`${assignmentVariable} = deserializer.readUInt16();\n`);
        } else if(paramType.value === Generics.UInt64) {
            write(`${assignmentVariable} = deserializer.readUInt64();\n`);
        }
        return valueOf();
    }
}