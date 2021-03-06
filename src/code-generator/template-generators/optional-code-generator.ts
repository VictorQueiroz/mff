import { ITypeCodecOptions } from "../type-code-generator";
import { NodeContainerParam } from "../../ast-parser/node";
import { Syntax } from "../../ast-parser/constants";
import TemplateCodeGenerator from './template-code-generator';

export default class OptionalCodeGenerator extends TemplateCodeGenerator {
    public getDecodingCode(node: NodeContainerParam, options: ITypeCodecOptions) {
        const {valueOf, append, write} = this.cs;
        const {paramType} = node;
        if(paramType.type !== Syntax.Template) {
            throw new Error('Received invalid container param');
        }
        const containerDeclGenerator = this.getContainerDeclarationGenerator();
        write(`if(deserializer.readUInt8() === 1) {\n`, () => {
            append(containerDeclGenerator.createParamDecodingStatement({
                ...node,
                type: Syntax.ContainerParam,
                paramType: paramType.arguments[0]
            }, options));
        }, '}\n');
        return valueOf();
    }
    public getEncodingCode(node: NodeContainerParam, options: ITypeCodecOptions) {
        const {paramType} = node;
        const {write, valueOf, append} = this.cs;
        if(paramType.type !== Syntax.Template) {
            throw new Error('Received invalid param type');
        }
        const constValue = this.getVariableName(node.name, 'optional ensured value', false);
        write(`const ${constValue} = ${options.assignmentVariable};\n`);
        write(`if(${constValue}) {\n`, () => {
            write('serializer.writeUInt8(1);\n');
            append(this.getContainerDeclarationGenerator().createParamEncodingStatement({
                ...paramType,
                type: Syntax.ContainerParam,
                paramType: paramType.arguments[0]
            }, {
                assignmentVariable: constValue
            }));
        }, `}\n`);
        write('else \n');
        write('{\n', () => {
            write('serializer.writeUInt8(0);\n');
        }, '}\n');
        return valueOf();
    }
    public getDefaultValueExpression() {
        return 'undefined';
    }
}