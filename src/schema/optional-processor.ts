import TemplateProcessor from './template-processor';
import { PropertyType } from './template-processor';
import Deserializer from './deserializer';
import Serializer from './serializer';
import { Param } from '../ast-parser/param';

export default class OptionalProcessor extends TemplateProcessor<Param> {
    encode(serializer: Serializer, args: Param[], value: any) {
        if(value != undefined && value != null) {
            serializer.writeBoolean(true);
            this.schema.encodeContainerParam(serializer, args[0], value);
            return;
        }

        serializer.writeBoolean(false);
    }

    decode(deserializer: Deserializer, args: Param[], result: any, prop: PropertyType) {
        if(!deserializer.readBoolean())
            return;

        this.schema.decodeContainerParam(deserializer, args[0], result, prop);
    }
}
