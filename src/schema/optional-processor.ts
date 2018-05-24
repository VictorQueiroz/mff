import TemplateProcessor from './template-processor';
import { PropertyType } from './template-processor';
import Deserializer from './deserializer';
import { Param } from '../ast-parser/param';

export default class OptionalProcessor extends TemplateProcessor<Param> {
    encode(args: Param[], value: any) {
        const serializer = this.schema.serializer;

        if(typeof value != 'undefined') {
            serializer.writeBoolean(true);
            this.schema.encodeContainerParam(args[0], value);
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
