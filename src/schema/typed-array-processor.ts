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

export default class TypedArrayProcessor extends TemplateProcessor<Param> {
    static errorNonGeneric = new Error(`Input for typed array must be generic`);
    static errorUnexpectedValue = new Error(`Unexpected typed array type for typed array encoder`);

    decode(deserializer: Deserializer, args: Param[], result: any, prop: PropertyType) {
        const length = deserializer.readUInt32();
        const arrayOf = args[0];

        if(arrayOf.type != Params.Generic)
            throw TypedArrayProcessor.errorNonGeneric;

        const buffer = deserializer.readBuffer(length);
        let output: any;

        switch(arrayOf.name) {
            case Generics.UInt8:
                output = buffer;
                break;
            default:
                throw TypedArrayProcessor.errorUnexpectedValue;
        }

        result[prop] = output;
    }

    _encode(arrayOf: ParamGeneric, input: any) {
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
            throw TypedArrayProcessor.errorUnexpectedValue;

        const length = input.byteLength;
        const serializer = this.schema.serializer;

        serializer.writeUInt32(length);
        serializer.writeBuffer(Buffer.from(input));
    }

    encode(args: Param[], input: any) {
        const arrayOf = args[0];

        if(arrayOf.type != Params.Generic)
            throw TypedArrayProcessor.errorNonGeneric;

        this._encode(arrayOf, input);
    }
}
