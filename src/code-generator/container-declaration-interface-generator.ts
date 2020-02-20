import { NodeContainerDeclaration } from '../ast-parser/node';
import ContainerDeclarationGenerator from './container-declaration-generator';
import { ICodeGenerator } from './code-generator';

export interface IContainerInterfaceOptions {
    readonly?: boolean;
}

export default class ContainerDeclarationInterfaceGenerator extends ContainerDeclarationGenerator {
    private options: IContainerInterfaceOptions;
    constructor(parent: ICodeGenerator, options?: IContainerInterfaceOptions) {
        super(parent);
        this.options = {
            readonly: true,
            ...options
        };
    }
    public generate(node: NodeContainerDeclaration) {
        const {write, append, valueOf} = this.cs;
        this.setCurrentNode(node);
        if(node.leadingComments.length) {
            this.attachComments(node.leadingComments);
        }
        const container = this.getContainer(node.name);
        const paramPrefix = this.getInterfaceParamPrefix();
        write(`export interface ${this.getClassNameFromList(node)} {\n`, () => {
            write(`${paramPrefix}_id?: 0x${container.id.toString(16)};\n`);
            write(`${paramPrefix}_type?: "${container.type}";\n`);
            write(`${paramPrefix}_name: "${container.name}";\n`);
            append(this.createContainerInterfaceParams(node, (param) => `${paramPrefix}${param}`));
        }, '}\n');
        this.setCurrentNode(undefined);
        return valueOf();
    }
    public getInterfaceParamPrefix() {
        let text = '';
        const {readonly} = this.options;
        if(readonly) {
            text += 'readonly';
        }

        if(text.length > 0) {
            text += ' ';
        }
        return text;
    }
}