import { Syntax } from './constants';

export interface NodeRange {
    startOffset: number;
    endOffset: number;
    startLineNumber: number;
    endLineNumber: number;
}

export interface NodeBase {
    range: NodeRange;
    leadingComments: string[];
    trailingComments: string[];
}

export interface NodeIdentifier extends NodeBase {
    type: Syntax.Identifier;
    value: string;
}

export interface NodeMemberExpression extends NodeBase {
    type: Syntax.MemberExpression;
    left: NodeIdentifier | NodeMemberExpression;
    right: string;
}

/**
 * Node representing template expression (i.e. Vector<Vector<A>>)
 */
export interface NodeTemplate extends NodeBase {
    type: Syntax.Template;
    arguments: Node[];
    name: string;
}

export interface NodeContainerParam extends NodeBase {
    type: Syntax.ContainerParam;
    paramType: Node;
    name: string;
}

export interface NodeTemplateDeclaration extends NodeBase {
    type: Syntax.TemplateDeclaration;
    arguments: Node[];
    body: Node;
}

export interface NodeContainerDeclaration extends NodeBase {
    type: Syntax.ContainerDeclaration;
    name: string;
    body: Node[];
}

export interface NodeImportDeclaration extends NodeBase {
    type: Syntax.ImportDeclaration;
    path: string;
}

export interface NodeNamespace extends NodeBase {
    name: string;
    type: Syntax.Namespace;
    body: Node[];
}

export interface NodeContainerGroup extends NodeBase {
    type: Syntax.ContainerGroup;
    body: Node[];
    name: string;
}

export interface NodeAlias extends NodeBase {
    type: Syntax.Alias;
    value: Node;
    name: string;
}

export interface NodeLiteralNumber extends NodeBase {
    type: Syntax.LiteralNumber;
    value: number;
}

export type Node = NodeNamespace | NodeIdentifier | NodeTemplate |
                    NodeMemberExpression | NodeImportDeclaration |
                    NodeContainerDeclaration | NodeContainerParam |
                    NodeContainerGroup | NodeAlias | NodeLiteralNumber | NodeTemplateDeclaration;