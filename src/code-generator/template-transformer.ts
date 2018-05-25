import * as t from '@babel/types';
import CodeGenerator from './index';
import { NodeTemplate } from '../ast-parser/node';

export default abstract class TemplateTransformer {
    generator: CodeGenerator;
    constructor(generator: CodeGenerator) {
        this.generator = generator;
    }
    abstract generate(tmpl: NodeTemplate, classProperty: t.ClassProperty | t.TSPropertySignature): t.TSType;
}
