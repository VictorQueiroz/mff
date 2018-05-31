import * as t from '@babel/types';
import { Syntax } from '../ast-parser/constants';
import { Param } from '../ast-parser/param';
import { NodeTemplate } from '../ast-parser/node';
import TemplateTransformer from './template-transformer';

export default class StrictSizeTransformer extends TemplateTransformer {
    generate(tmpl: NodeTemplate, classProperty: t.ClassProperty | t.TSPropertySignature): t.TSType {
        const [firstArgument] = tmpl.arguments;
        const containerDeclarationInterpreter = this.generator.interpreters.containerDeclaration;

        return containerDeclarationInterpreter.processParamType(firstArgument, classProperty);
    }
    createParamAssignmentExpression(name: string, argument: Param | any) {
        if(argument.type == Syntax.LiteralNumber)
            return [];

        return super.createParamAssignmentExpression(name, argument);
    }
}