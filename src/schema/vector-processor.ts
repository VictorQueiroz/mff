import TemplateProcessor from './template-processor';
import { PropertyType } from './template-processor';
import Deserializer from './deserializer';
import { Param } from '../ast-parser/param';

export default class VectorProcessor extends TemplateProcessor<Param> {
    decode(deserializer: Deserializer, args: Param[], result: any, prop: PropertyType) {
        const length = deserializer.readUInt32();
        const array = new Array(length);
        const arrayOf = args[0];

        for(let i = 0; i < length; i++)
            this.schema.decodeContainerParam(deserializer, arrayOf, array, i);

        result[prop] = array;
    }

    encode(args: Param[], input: any) {
        const serializer = this.schema.serializer;
        const arrayOf = args[0];

        if(!Array.isArray(input))
            throw new Error(`"Vector" param value must be an array`);

        const ii = input.length;
        serializer.writeUInt32(ii);

        for(let i = 0; i < ii; i++)
            this.schema.encodeContainerParam(arrayOf, input[i]);
    }
}
