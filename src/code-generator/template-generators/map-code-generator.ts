import TemplateCodeGenerator from './template-code-generator';
import { NodeContainerParam } from '../../ast-parser/node';
import { ITypeCodecOptions } from '../type-code-generator';
import { Syntax } from '../../ast-parser/constants';

export default class MapCodeGenerator extends TemplateCodeGenerator {
    public getDefaultValueExpression() {
        return 'new Map()';
    }
    public getEncodingCode(node: NodeContainerParam, options: ITypeCodecOptions) {
        const {valueOf, append, write} = this.cs;
        const {paramType} = node;
        if(paramType.type !== Syntax.Template) {
            throw new Error('Invalid param type for Map code generator');
        }
        write(`serializer.writeUInt32(${options.assignmentVariable}.size);\n`);
        write(`for(const [key, value] of ${options.assignmentVariable}) {\n`, () => {
            append(this.getContainerDeclarationGenerator().createParamEncodingStatement(
                {...node, paramType: paramType.arguments[0], type: Syntax.ContainerParam},
                {
                    assignmentVariable: 'key'
                }
            ));
            append(this.getContainerDeclarationGenerator().createParamEncodingStatement(
                {...node, paramType: paramType.arguments[1], type: Syntax.ContainerParam},
                {
                    assignmentVariable: 'value'
                }
            ));
        }, '}\n');
        return valueOf();
    }
    public getDecodingCode(node: NodeContainerParam, options: ITypeCodecOptions) {
        const {valueOf, write, append} = this.cs;
        const {paramType} = node;
        if(paramType.type !== Syntax.Template) {
            throw new Error('Invalid param type for Map code generator');
        }
        const lengthVariable = this.getVariableName(node.name, 'map length');
        const keyVariable = this.getVariableName(node.name, 'map key');
        const valueVariable = this.getVariableName(node.name, 'map value');
        write(`let ${lengthVariable} = deserializer.readUInt32();\n`);
        write(`let ${keyVariable}: ${this.translateParamType(paramType.arguments[0])};\n`);
        write(`let ${valueVariable}: ${this.translateParamType(paramType.arguments[1])};\n`);
        write(`while(${lengthVariable} > 0) {\n`, () => {
            append(this.getContainerDeclarationGenerator().createParamDecodingStatement(
                {...node, paramType: paramType.arguments[0], type: Syntax.ContainerParam},
                {
                    assignmentVariable: keyVariable
                }
            ));
            append(this.getContainerDeclarationGenerator().createParamDecodingStatement(
                {...node, paramType: paramType.arguments[1], type: Syntax.ContainerParam},
                {
                    assignmentVariable: valueVariable
                }
            ));
            write(`${options.assignmentVariable}.set(${keyVariable}, ${valueVariable});\n`);
            write(`--${lengthVariable};\n`);
        }, '}\n');
        return valueOf();
    }
}