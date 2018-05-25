import TemplateProcessor from './template-processor';
import { PropertyType } from './template-processor';
import Deserializer from './deserializer';
import { Param, ParamGeneric, Params } from '../ast-parser/param';
import { Generics } from '../ast-parser/constants';

const typedArrays = {
    Int8Array: '[object Int8Array]',
    Int16Array: '[object Int16Array]',
    Int32Array: '[object Int32Array]',
    Uint8Array: '[object Uint8Array]',
    Uint8ClampedArray: '[object Uint8ClampedArray]',
    Uint16Array: '[object Uint16Array]',
    Uint32Array: '[object Uint32Array]',
    Float32Array: '[object Float32Array]',
    Float64Array: '[object Float64Array]'
};

export default class VectorProcessor extends TemplateProcessor<Param> {
    decode(deserializer: Deserializer, args: Param[], result: any, prop: PropertyType) {
        const length = deserializer.readUInt32();
        const array = new Array(length);
        const arrayOf = args[0];

        for(let i = 0; i < length; i++)
            this.schema.decodeContainerParam(deserializer, arrayOf, array, i);

        result[prop] = array;
    }

    encodeTypedArray(arrayOf: ParamGeneric, input: any) {
        let valid: boolean = false;
        const safeName = Object.prototype.toString.call(input);

        switch(arrayOf.name) {
            case Generics.Int8:
                valid = typedArrays.Int8Array == safeName;
                break;
            case Generics.UInt8:
                valid = typedArrays.Uint8Array == safeName;
                break;
            case Generics.Int16:
                valid = typedArrays.Int16Array == safeName;
                break;
            case Generics.UInt16:
                valid = typedArrays.Uint16Array == safeName;
                break;
            case Generics.Int32:
                valid = typedArrays.Int32Array == safeName;
                break;
            case Generics.UInt32:
                valid = typedArrays.Uint32Array == safeName;
                break;
            default:
                valid = Buffer.isBuffer(input);
        }

        if(!valid)
            throw new Error(`Unexpected typed array type for vector`);

        const length = input.byteLength;
        const serializer = this.schema.serializer;

        serializer.writeUInt32(length);
        serializer.writeBuffer(Buffer.from(input));
    }

    encode(args: Param[], input: any) {
        const serializer = this.schema.serializer;
        const arrayOf = args[0];

        if(arrayOf.type == Params.Generic) {
            switch(arrayOf.name) {
                case Generics.Int8:
                case Generics.UInt8:
                case Generics.Int16:
                case Generics.UInt16:
                case Generics.Int32:
                case Generics.UInt32:
                    this.encodeTypedArray(arrayOf, input);
                    return;
            }
        }

        if(!Array.isArray(input))
            throw new Error(`"Vector" param value must be an array`);

        const ii = input.length;
        serializer.writeUInt32(ii);

        for(let i = 0; i < ii; i++)
            this.schema.encodeContainerParam(arrayOf, input[i]);
    }
}
