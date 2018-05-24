import Deserializer from './deserializer';
import { Param as DefaultParam } from '../ast-parser/param';
import { NodeLiteralNumber } from '../ast-parser/node';
import TemplateProcessor from './template-processor';
import { PropertyType } from './template-processor';
import { Syntax } from '../ast-parser/constants';
import { isTypedArray } from './utilities';

export type Param = DefaultParam | NodeLiteralNumber;

export default class StrictSizeProcessor extends TemplateProcessor<Param> {
    validate(result: any, length: number) {
        let valid: boolean = false;

        if(Array.isArray(result) || typeof result == 'string')
            valid = result.length == length;
        else if(typeof result == 'number')
            valid = result == length;
        else if(isTypedArray(result) || Buffer.isBuffer(result))
            valid = result.byteLength == length;

        return valid;
    }

    encode(args: Param[], input: any) {
        const firstArgument = args[0];
        const secondArgument = args[1];
        let length: number = 0;

        if(firstArgument.type == Syntax.LiteralNumber)
            throw new Error(`Invalid value for first argument`);
        else if(secondArgument.type == Syntax.LiteralNumber)
            length = secondArgument.value;
        else
            throw new Error(`Invalid value for second argument, must be a literal number`);

        if(!this.validate(input, length))
            throw new Error(`Received invalid size for strict-sized param`);

        this.schema.encodeContainerParam(firstArgument, input);
    }

    decode(deserializer: Deserializer, args: Param[], result: any, prop: PropertyType) {
        const firstArgument = args[0];
        const secondArgument = args[1];

        let length = 0;

        if(firstArgument.type == Syntax.LiteralNumber)
            throw new Error(`Invalid first argument for strict size template`);
        else if(secondArgument.type == Syntax.LiteralNumber)
            length = secondArgument.value;
        else
            throw new Error(`Invalid value for second argument, must be a literal number`);

        this.schema.decodeContainerParam(deserializer, firstArgument, result, prop);

        if(!this.validate(result[prop], length))
            throw new Error(`Received invalid size for strict-sized param`);
    }
}
