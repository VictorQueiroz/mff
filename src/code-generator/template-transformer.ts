import * as t from '@babel/types';
import CodeGenerator from './index';
import { ParamTemplate, Params } from '../ast-parser/param';
import { NodeTemplate } from '../ast-parser/node';

export default abstract class TemplateTransformer {
    generator: CodeGenerator;
    constructor(generator: CodeGenerator) {
        this.generator = generator;
    }
    createParamAssignmentExpression(name: string, param: any) {
        const interpreter = this.generator.interpreters.containerDeclaration;
        if(param.type != Params.Generic && param.type != Params.Template && param.type != Params.Reference) {
            throw new Error(`Unexpected param type "${param.type}" you should handle it inside appropriate template transformer`);
        }
        return interpreter.createClassPropertyAssignment(name, param);
    }
    /**
     * Create assignment statements for container constructor (i.e. this.name = params.name)
     */
    generateClassConstructorPropertyAssignmentForParam(name: string, param: ParamTemplate): t.Statement[] {
        return param.arguments.reduce((statements, param) => {
            return statements.concat(this.createParamAssignmentExpression(name, param));
        }, []);
    }
    abstract generate(tmpl: NodeTemplate, classProperty: t.ClassProperty | t.TSPropertySignature): t.TSType;
}
