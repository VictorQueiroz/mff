import { Generics } from './constants';

export function isGeneric(type: string): type is Generics {
    switch(type) {
        case Generics.String:
        case Generics.Float:
        case Generics.Double:
        case Generics.Int8:
        case Generics.UInt8:
        case Generics.Boolean:
        case Generics.Int32:
        case Generics.Int64:
        case Generics.Int16:
        case Generics.UInt16:
        case Generics.UInt32:
        case Generics.UInt64:
            return true;
    }
    return false;
}