import CodeGeneratorChild from "./code-generator-child";
import { Node } from "../ast-parser/node";
import CodeStream from "./code-stream";

export interface ITypeCodecOptions {
    /**
     * Variable that value should be assigned to
     */
    assignmentVariable: string;
}

export default abstract class TypeCodeGenerator<T extends Node> extends CodeGeneratorChild {
    public cs = new CodeStream(this);
    public generate() {
        return '';
    }
    public abstract getEncodingCode(node: T, options: ITypeCodecOptions): string;
    public abstract getDecodingCode(node: T, options: ITypeCodecOptions): string;
}