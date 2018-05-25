import * as t from '@babel/types';
import { NodeTemplate } from '../ast-parser/node';
import TemplateTransformer from './template-transformer';

export default class VectorTransformer extends TemplateTransformer {
    generate(tmpl: NodeTemplate, classProperty: t.ClassProperty | t.TSPropertySignature): t.TSType {
        const containerDeclarationInterpreter = this.generator.interpreters.containerDeclaration;
        const args = tmpl.arguments.map(n => {
            return containerDeclarationInterpreter.processParamType(n, classProperty);
        });

        return t.tsArrayType(t.tsUnionType(args));
    }
}