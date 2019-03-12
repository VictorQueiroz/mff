import TypeCodeGenerator, { ITypeCodecOptions } from "../type-code-generator";
import { NodeContainerParam } from "../../ast-parser/node";
import { Syntax } from "../../ast-parser/constants";
import ContainerDeclarationGenerator from "../container-declaration-generator";

export default class VectorCodeGenerator extends TypeCodeGenerator<NodeContainerParam> {
    public getDecodingCode(node: NodeContainerParam, options: ITypeCodecOptions) {
        const {write, valueOf, append} = this.cs;
        const {paramType} = node;
        if(paramType.type !== Syntax.Template) {
            throw new Error('Param type must always be a template');
        }
        const lengthVariable = this.getVariableName(node.name, 'vector length');
        const outputVariable = this.getVariableName(node.name, 'vector item value');
        write(`let ${lengthVariable} = deserializer.readUInt32();\n`);
        write(
            `let ${outputVariable}: ${this.translateParamType(paramType.arguments[0])};\n`
        );
        write(`while(${lengthVariable} > 0) {\n`, () => {
            append(new ContainerDeclarationGenerator(this).createParamDecodingStatement({
                ...node,
                type: Syntax.ContainerParam,
                name: node.name,
                paramType: paramType.arguments[0],
            }, {
                assignmentVariable: outputVariable
            }));
            write(`${options.assignmentVariable}.push(${outputVariable});\n`);
            write(`--${lengthVariable};\n`);
        }, '}\n');
        return valueOf();
    }
    public getEncodingCode(node: NodeContainerParam, options: ITypeCodecOptions) {
        const {write, append, valueOf} = this.cs;
        const {assignmentVariable} = options;
        const {paramType} = node;
        if(paramType.type !== Syntax.Template) {
            throw new Error('Invalid param type');
        }
        write(`serializer.writeUInt32(${assignmentVariable}.length);\n`);
        write(`for(const item of ${assignmentVariable}) {\n`, () => {
            append(new ContainerDeclarationGenerator(this).createParamEncodingStatement({
                ...node,
                type: Syntax.ContainerParam,
                paramType: paramType.arguments[0]
            }, { assignmentVariable: 'item' }));
        } ,'}\n');
        return valueOf();
    }
}