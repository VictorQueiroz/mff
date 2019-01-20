import { Syntax } from './constants';

export interface NodeIdentifier {
    type: Syntax.Identifier;
    value: string;
}

export interface NodeMemberExpression {
    type: Syntax.MemberExpression;
    left: NodeIdentifier | NodeMemberExpression;
    right: string;
}

/**
 * Node representing template expression (i.e. Vector<Vector<A>>)
 */
export interface NodeTemplate {
    type: Syntax.Template;
    arguments: Node[];
    name: string;
}

export interface NodeContainerParam {
    type: Syntax.ContainerParam;
    paramType: Node;
    name: string;
}

export interface NodeTemplateDeclaration {
    type: Syntax.TemplateDeclaration;
    arguments: Node[];
    body: Node;
}

export interface NodeContainerDeclaration {
    type: Syntax.ContainerDeclaration;
    name: string;
    body: Node[];
}

export interface NodeImportDeclaration {
    type: Syntax.ImportDeclaration;
    path: string;
}

export interface NodeNamespace {
    name: string;
    type: Syntax.Namespace;
    body: Node[];
}

export interface NodeContainerGroup {
    type: Syntax.ContainerGroup;
    body: Node[];
    name: string;
}

export interface NodeAlias {
    type: Syntax.Alias;
    value: Node;
    name: string;
}

export interface NodeLiteralNumber {
    type: Syntax.LiteralNumber;
    value: number;
}

export type Node = NodeNamespace | NodeIdentifier | NodeTemplate |
                    NodeMemberExpression | NodeImportDeclaration |
                    NodeContainerDeclaration | NodeContainerParam |
                    NodeContainerGroup | NodeAlias | NodeLiteralNumber | NodeTemplateDeclaration;