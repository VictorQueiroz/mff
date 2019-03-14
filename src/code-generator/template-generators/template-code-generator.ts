import TypeCodeGenerator from '../type-code-generator';
import { NodeContainerParam } from '../../ast-parser/node';
import ContainerDeclarationGenerator from '../container-declaration-generator';

export default abstract class TemplateCodeGenerator extends TypeCodeGenerator<NodeContainerParam> {
    public getContainerDeclarationGenerator() {
        return this.getGenerator<ContainerDeclarationGenerator>('containerDeclaration');
    }
}