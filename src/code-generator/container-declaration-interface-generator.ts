import { NodeContainerDeclaration } from '../ast-parser/node';
import ContainerDeclarationGenerator from './container-declaration-generator';

export default class ContainerDeclarationInterfaceGenerator extends ContainerDeclarationGenerator {
    public generate(node: NodeContainerDeclaration) {
        const {write, append, valueOf} = this.cs;
        this.setCurrentNode(node);
        if(node.leadingComments.length) {
            this.attachComments(node.leadingComments);
        }
        const container = this.getContainer(node.name);
        write(`interface ${this.getClassNameFromList(node)} {\n`, () => {
            write(`readonly _id?: 0x${container.id.toString(16)};\n`);
            write(`readonly _type?: "${container.type}";\n`);
            write(`readonly _name: "${container.name}";\n`);
            append(this.createContainerInterfaceParams(node, (param) => `readonly ${param}`));
        }, '}\n');
        this.setCurrentNode(undefined);
        return valueOf();
    }
}