import * as t from '@babel/types';
import { NodeTemplate } from '../ast-parser/node';
import TemplateTransformer from './template-transformer';

export default class StrictSizeTransformer extends TemplateTransformer {
    generate(tmpl: NodeTemplate, classProperty: t.ClassProperty | t.TSPropertySignature): t.TSType {
        const [firstArgument] = tmpl.arguments;
        const containerDeclarationInterpreter = this.generator.interpreters.containerDeclaration;

        return containerDeclarationInterpreter.processParamType(firstArgument, classProperty);
    }
}