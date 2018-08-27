import TemplateProcessor from './template-processor';
import { PropertyType } from './template-processor';
import Deserializer from './deserializer';
import Serializer from './serializer';
import { Param } from '../ast-parser/param';

export default class OptionalProcessor extends TemplateProcessor<Param> {
    encode(serializer: Serializer, args: Param[], value: Map<any, any>) {
        serializer.writeUInt32(value.size);

        for(const key of value.keys()) {
            this.schema.encodeContainerParam(serializer, args[0], key);
            this.schema.encodeContainerParam(serializer, args[1], value.get(key));
        }
    }

    decode(deserializer: Deserializer, args: Param[], result: any, prop: PropertyType) {
        const length = deserializer.readUInt32();

        for(let i = 0; i < length; i++) {
            this.schema.decodeContainerParam(deserializer, args[0], key, prop);
            this.schema.decodeContainerParam(deserializer, args[1], value.get(key), prop);
        }
    }
}
