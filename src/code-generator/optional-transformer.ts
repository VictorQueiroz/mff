import * as t from '@babel/types';
import { ParamTemplate } from '../ast-parser/param';
import { NodeTemplate } from '../ast-parser/node';
import TemplateTransformer from './template-transformer';

export default class OptionalTransformer extends TemplateTransformer {
    generate(tmpl: NodeTemplate, classProperty: t.ClassProperty | t.TSPropertySignature): t.TSType {
        const [firstArgument] = tmpl.arguments;
        const interpreter = this.generator.interpreters.containerDeclaration;

        classProperty.optional = true;

        return interpreter.processParamType(firstArgument, classProperty);
    }
    generateClassConstructorPropertyAssignmentForParam(name: string, param: ParamTemplate) {
        const interpreter = this.generator.interpreters.containerDeclaration;
        const statements: t.Statement[] = param.arguments.reduce((statements, argument) => (
            statements.concat(interpreter.createClassPropertyAssignment(name, argument))
        ), []);

        return [
            t.ifStatement(t.callExpression(
                t.memberExpression(t.identifier('params'), t.identifier('hasOwnProperty')),
                [t.stringLiteral(name)]
            ), t.blockStatement(statements))
        ];
    }
}