import CodeGeneratorChild from './code-generator-child';
import { NodeContainerGroup } from '../ast-parser/node';
import { Syntax } from '../ast-parser/constants';

export default class ContainerGroupInterfaceGenerator extends CodeGeneratorChild {
    public generate(node: NodeContainerGroup) {
        const {write, append, valueOf} = this.cs;
        this.setCurrentNode(node);
        write(`export type ${this.getClassNameFromList(node)} = ${this.getContainerNames(node)};\n`);
        for(const item of node.body) {
            append(this.getGenerator('containerDeclaration').generate(item));
        }
        this.setCurrentNode(undefined);
        return valueOf();
    }
    public getContainerNames(group: NodeContainerGroup) {
        const names = [];
        for(const node of group.body) {
            this.setCurrentNode(node);
            if(node.type === Syntax.ContainerDeclaration) {
                names.push(this.getClassNameFromList(node));
            }
            this.setCurrentNode(group);
        }
        return names.join(' | ');
    }
}