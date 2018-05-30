import * as t from '@babel/types';
import { NodeTemplate } from '../ast-parser/node';
import { Generics, Syntax } from '../ast-parser/constants';
import TemplateTransformer from './template-transformer';

export default class TypedArrayTransformer extends TemplateTransformer {
    generate(tmpl: NodeTemplate, _classProperty: t.ClassProperty | t.TSPropertySignature): t.TSType {
        const argument = tmpl.arguments[0];

        if(argument.type == Syntax.Identifier) {
            switch(argument.value) {
                case Generics.Int8:
                    return t.tsTypeReference(t.identifier('Int8Array'));
                case Generics.UInt8:
                    return t.tsTypeReference(t.identifier('Buffer'));
                case Generics.Int16:
                    return t.tsTypeReference(t.identifier('Int16Array'));
                case Generics.UInt16:
                    return t.tsTypeReference(t.identifier('Uint16Array'));
                case Generics.Int32:
                    return t.tsTypeReference(t.identifier('Int32Array'));
                case Generics.UInt32:
                    return t.tsTypeReference(t.identifier('Uint32Array'));
                case Generics.Float:
                    return t.tsTypeReference(t.identifier('Float32Array'));
            }
        }
        throw new Error(`Received invalid type for typed array argument`);
    }
}