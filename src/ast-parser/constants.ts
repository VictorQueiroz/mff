import { Param } from './param';

/**
 * ATTENTION: It is mandatory that it matches Btc::Syntax "enum" at src/node_ast.cc
 */
export enum Syntax {
    Alias = 'Alias',
    String = 'String',
    ContainerDeclaration = 'ContainerDeclaration',
    Identifier = 'Identifier',
    ContainerGroup = 'ContainerGroup',
    Template = 'Template',
    ContainerParam = 'ContainerParam',
    ImportDeclaration = 'ImportDeclaration',
    Namespace = 'Namespace',
    LiteralString = 'LiteralString',
    LiteralNumber = 'LiteralNumber',
    MemberExpression = 'MemberExpression',
    TemplateDeclaration = 'TemplateDeclaration'
}

export enum Generics {
    String = 'string',
    Float = 'float',
    Double = 'double',
    Int8 = 'int8',
    Int16 = 'int16',
    Int32 = 'int32',
    Int64 = 'int64',
    UInt8 = 'uint8',
    UInt16 = 'uint16',
    UInt32 = 'uint32',
    UInt64 = 'uint64',
    Boolean = 'bool'
}

export interface ContainerParam {
    name: string;
    type: Param;
}

export interface Container {
    id: number;
    params: ContainerParam[];
    name: string;
    type: string;
}