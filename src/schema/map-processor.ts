import TemplateProcessor from './template-processor';
import { PropertyType } from './template-processor';
import Deserializer from './deserializer';
import Serializer from './serializer';
import { Param, Params } from '../ast-parser/param';

export default class MapProcessor extends TemplateProcessor<Param> {
    private static errors = {
        keyMustBeGeneric: new Error('Key argument must be generic')
    };

    public encode(serializer: Serializer, args: Param[], value: Map<any, any>) {
        serializer.writeUInt32(value.size);

        const [keyParam, valueParam] = args;

        if(keyParam.type !== Params.Generic) {
            throw MapProcessor.errors.keyMustBeGeneric;
        }

        for(const key of value.keys()) {
            this.schema.encodeGeneric(serializer, keyParam.name, key);
            this.schema.encodeContainerParam(serializer, valueParam, value.get(key));
        }
    }

    public decode(deserializer: Deserializer, args: Param[], result: any, prop: PropertyType) {
        const length = deserializer.readUInt32();

        const [
            key,
            value
        ] = args;

        if(key.type !== Params.Generic) {
            throw MapProcessor.errors.keyMustBeGeneric;
        }

        const map = new Map();

        for(let i = 0; i < length; i++) {
            const data: any = {};
            const keyValue = this.schema.decodeGeneric(deserializer, key.name);

            this.schema.decodeContainerParam(deserializer, value, data, 'result');

            map.set(keyValue, data.result);
        }

        result[prop] = map;
    }
}
