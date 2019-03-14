import { ICodeGenerator, IFileResult } from "./code-generator";
import { Node, NodeContainerDeclaration, NodeContainerGroup } from "../ast-parser/node";
import CodeStream from './code-stream';

/**
 * Uses AST nodes to generate code. Attention: It is fully responsible of
 * the *child* to repass it's children to the parent so it can be processed,
 * in case it was not processed by the child or needs to be processed by the parent
 * after that
 */
export default abstract class CodeGeneratorChild implements ICodeGenerator {
    public cs = new CodeStream(this);

    constructor(public parent: ICodeGenerator) {

    }

    public getGenerator<T extends ICodeGenerator = ICodeGenerator>(name: string): T {
        return this.parent.getGenerator<T>(name);
    }

    public getCurrentNode() {
        return this.parent.getCurrentNode();
    }

    public setParentNode(node?: Node) {
        this.parent.setParentNode(node);
    }

    public setCurrentNode(node?: Node) {
        this.parent.setCurrentNode(node);
    }

    public getFiles() {
        return this.parent.getFiles();
    }

    public getContainers() {
        return this.parent.getContainers();
    }

    public getNodeListFromParamExpression(node: Node): Node[] {
        return this.parent.getNodeListFromParamExpression(node);
    }

    public processNode(node: Node): string {
        return this.parent.processNode(node);
    }

    public indentCode(...args: string[]): string {
        return this.parent.indentCode(...args);
    }

    public indentFrom(start: string, getContent: () => string, end: string): string {
        let contents = '';
        contents += this.indentCode(start);
        contents += this.indentWith(getContent);
        contents += this.indentCode(end);
        return contents;
    }
    public indentWith(getContent: () => string): string {
        let contents = '';
        this.increaseDepth();
        contents += getContent();
        this.decreaseDepth();
        return contents;
    }

    public getPrefixPackage() {
        return this.parent.getPrefixPackage();
    }

    public getPackageName(): string {
        return this.parent.getPackageName();
    }

    public getInterfaceName(name: string): string {
        return this.parent.getInterfaceName(name);
    }

    public getParamDefaultFromType(node: Node) {
        return this.parent.getParamDefaultFromType(node);
    }

    public getParentNode() {
        return this.parent.getParentNode();
    }

    public translateParamType(node: Node) {
        return this.parent.translateParamType(node);
    }

    public increaseDepth() {
        return this.parent.increaseDepth();
    }

    public decreaseDepth() {
        return this.parent.decreaseDepth();
    }

    public getContainer(name: string) {
        return this.parent.getContainer(name);
    }

    public addFile(file: Pick<IFileResult, 'contents' | 'path'>) {
        this.parent.addFile(file);
    }

    public getCurrentPath() {
        return this.parent.getCurrentPath();
    }

    public getClassNameFromList(node: NodeContainerDeclaration | NodeContainerGroup) {
        return this.parent.getClassNameFromList(node);
    }

    public getVariableName(name: string, variant?: string, includeComment?: boolean) {
        return this.parent.getVariableName(name, variant, includeComment);
    }

    public abstract generate(node: Node): string;
}
