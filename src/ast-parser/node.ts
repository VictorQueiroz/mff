import { Syntax } from './constants';

export interface NodeRange {
    readonly startOffset: number;
    readonly endOffset: number;
    readonly startLineNumber: number;
    readonly endLineNumber: number;
}

export interface NodeBase {
    readonly range: NodeRange;
    readonly leadingComments: string[];
    readonly trailingComments: string[];
}

export interface NodeIdentifier extends NodeBase {
    readonly type: Syntax.Identifier;
    readonly value: string;
}

export interface NodeMemberExpression extends NodeBase {
    readonly type: Syntax.MemberExpression;
    readonly left: NodeIdentifier | NodeMemberExpression;
    readonly right: string;
}

/**
 * Node representing template expression (i.e. Vector<Vector<A>>)
 */
export interface NodeTemplate extends NodeBase {
    readonly type: Syntax.Template;
    readonly arguments: Node[];
    readonly name: string;
}

export interface NodeContainerParam extends NodeBase {
    readonly type: Syntax.ContainerParam;
    readonly paramType: Node;
    readonly name: string;
}

export interface NodeTemplateDeclaration extends NodeBase {
    readonly type: Syntax.TemplateDeclaration;
    readonly arguments: Node[];
    readonly body: Node;
}

export interface NodeContainerDeclaration extends NodeBase {
    readonly type: Syntax.ContainerDeclaration;
    readonly name: string;
    readonly body: Node[];
}

export interface NodeImportDeclaration extends NodeBase {
    readonly type: Syntax.ImportDeclaration;
    readonly path: string;
}

export interface NodeNamespace extends NodeBase {
    readonly name: string;
    readonly type: Syntax.Namespace;
    readonly body: Node[];
}

export interface NodeContainerGroup extends NodeBase {
    readonly type: Syntax.ContainerGroup;
    readonly body: Node[];
    readonly name: string;
}

export interface NodeAlias extends NodeBase {
    readonly type: Syntax.Alias;
    readonly value: Node;
    readonly name: string;
}

export interface NodeLiteralNumber extends NodeBase {
    readonly type: Syntax.LiteralNumber;
    readonly value: number;
}

export type Node = NodeNamespace | NodeIdentifier | NodeTemplate |
                    NodeMemberExpression | NodeImportDeclaration |
                    NodeContainerDeclaration | NodeContainerParam |
                    NodeContainerGroup | NodeAlias | NodeLiteralNumber | NodeTemplateDeclaration;