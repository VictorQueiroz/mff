import Deserializer from './deserializer';
import Schema from './schema';
import { Param } from '../ast-parser/param';

export type PropertyType = string | number;

export default abstract class TemplateProcessor<Argument = Param, Input = any> {
    schema: Schema;

    constructor(schema: Schema) {
        this.schema = schema;
    }
    abstract encode(args: Argument[], value: Input): void;
    abstract decode(deserializer: Deserializer, input: Argument[], result: any, prop: any): void;
}