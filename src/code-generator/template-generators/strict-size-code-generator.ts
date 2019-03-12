import TypeCodeGenerator, { ITypeCodecOptions } from "../type-code-generator";
import { NodeContainerParam } from "../../ast-parser/node";
import ContainerDeclarationGenerator from "../container-declaration-generator";
import { Syntax, Generics } from "../../ast-parser/constants";

export default class StrictSizeCodeGenerator extends TypeCodeGenerator<NodeContainerParam> {
    public getDecodingCode(node: NodeContainerParam, options: ITypeCodecOptions) {
        const {valueOf, append, write} = this.cs;
        const {paramType} = node;
        if(paramType.type !== Syntax.Template) {
            throw new Error('Received invalid param type');
        }
        const [firstArgument, secondArgument] = paramType.arguments;
        append(new ContainerDeclarationGenerator(this).createParamDecodingStatement({
            ...node,
            paramType: firstArgument
        }, options));
        if(secondArgument.type !== Syntax.LiteralNumber) {
            throw new Error('Second argument of StrictSize must be of type number');
        }
        const size = secondArgument.value;
        if(firstArgument.type !== Syntax.Identifier) {
            throw new Error('First argument must be identifier');
        }
        const lengthVariable = this.getVariableName(node.name, 'length variable');
        write(`let ${lengthVariable}: number;`);
        switch(firstArgument.value) {
            case Generics.String:
                write(`${lengthVariable} = ${options.assignmentVariable}.length;\n`);
                break;
            default:
                throw new Error('Invalid first argument type');
        }
        write(`if(${lengthVariable} !== ${size}) {\n`, () => {
            write(
                `throw new Error(\`Expected ${size} but got \${valueVariable.length} instead\`);\n`
            );
        }, '}\n');
        return valueOf();
    }
    public getEncodingCode(node: NodeContainerParam, options: ITypeCodecOptions) {
        const {valueOf, append} = this.cs;
        const {paramType} = node;
        if(paramType.type !== Syntax.Template) {
            throw new Error('Invalid param type');
        }
        append(new ContainerDeclarationGenerator(this).createParamEncodingStatement({
            ...node,
            paramType: paramType.arguments[0]
        }, options));
        return valueOf();
    }
}