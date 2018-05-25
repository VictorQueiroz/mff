import * as t from '@babel/types';
import { NodeTemplate } from '../ast-parser/node';
import TemplateTransformer from './template-transformer';

export default class OptionalTransformer extends TemplateTransformer {
    generate(tmpl: NodeTemplate, classProperty: t.ClassProperty | t.TSPropertySignature): t.TSType {
        const [firstArgument] = tmpl.arguments;
        const interpreter = this.generator.interpreters.containerDeclaration;

        classProperty.optional = true;

        return interpreter.processParamType(firstArgument, classProperty);
    }
}