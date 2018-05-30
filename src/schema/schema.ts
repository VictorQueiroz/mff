import { Container, Generics } from '../ast-parser/constants';
import { Params, ParamTemplate, Param } from '../ast-parser/param';
import Serializer from './serializer';
import Deserializer from './deserializer';
import StrictSizeProcessor from './strict-size-processor';
import { PropertyType } from './template-processor';
import TemplateProcessor from './template-processor';
import VectorProcessor from './vector-processor';
import OptionalProcessor from './optional-processor';
import TypedArrayProcessor from './typed-array-processor';

export interface SchemaOptions {
    templateProcessors?: Map<string, TemplateProcessor>;
}

class Schema {
    serializer: Serializer;
    containers: Map<string, Container> = new Map();
    containersCRC: Map<number, Container> = new Map();
    templateProcessors: Map<string, TemplateProcessor> = new Map();

    constructor(containers: Container[], options?: SchemaOptions) {
        containers.forEach(container => {
            this.containers.set(container.name, container);
            this.containersCRC.set(container.id, container);
        });

        this.serializer = new Serializer;
        this.templateProcessors.set('StrictSize', new StrictSizeProcessor(this));
        this.templateProcessors.set('Vector', new VectorProcessor(this));
        this.templateProcessors.set('TypedArray', new TypedArrayProcessor(this));
        this.templateProcessors.set('Optional', new OptionalProcessor(this));

        if(options && options.templateProcessors) {
            const iterator = options.templateProcessors.keys();
            let current = iterator.next();

            while(!current.done) {
                const processor = options.templateProcessors.get(current.value);
                if(processor) {
                    this.templateProcessors.set(current.value, processor);
                }
                current = iterator.next();
            }
        }
    }

    decodeGeneric(des: Deserializer, type: string): string | number | boolean {
        switch(type) {
            case Generics.Double:
                return des.readDouble();
            case Generics.Float:
                return des.readFloat();
            case Generics.Int16:
                return des.readInt16();
            case Generics.UInt16:
                return des.readUInt16();
            case Generics.UInt8:
                return des.readUInt8();
            case Generics.Int8:
                return des.readInt8();
            case Generics.Int32:
                return des.readInt32();
            case Generics.UInt32:
                return des.readUInt32();
            case Generics.String:
                return des.readBuffer(des.readUInt32()).toString('utf8');
            case Generics.Boolean:
                return des.readBoolean();
            default:
                throw new Error(`Can't decode generic of "${type}"`);
        }
    }

    encodeGeneric(type: string, value: any) {
        const serializer = this.serializer;

        switch(type) {
            case Generics.Double:
                serializer.writeDouble(value);
                break;
            case Generics.Float:
                serializer.writeFloat(value);
                break;
            case Generics.Int16:
                serializer.writeInt16(value);
                break;
            case Generics.UInt16:
                serializer.writeUInt16(value);
                break;
            case Generics.UInt8:
                serializer.writeUInt8(value);
                break;
            case Generics.Int8:
                serializer.writeInt8(value);
                break;
            case Generics.Int32:
                serializer.writeInt32(value);
                break;
            case Generics.UInt32:
                serializer.writeUInt32(value);
                break;
            case Generics.String:
                serializer.writeString(value);
                break;
            case Generics.Boolean:
                serializer.writeBoolean(value);
                break;
            default:
                throw new Error(`Can't encode generic of "${type}"`);
        }
    }

    /**
     * Get container name from object. 
     * Generally defined as [$container_name, $params]
     */
    getContainerName(value: any): string {
        return value[0];
    }

    getContainerParams(value: any): any {
        return value[1];
    }

    createObject(container: Container, params: any): any {
        return [container.name, params];
    }

    encodeReference(containers: string[], value: any) {
        const name = this.getContainerName(value);

        if(containers.indexOf(name) == -1)
            throw new Error(`Expected ${containers.join(' or ')} but got ${name} instead`);

        this.encode(value);
    }

    decodeTemplate(deserializer: Deserializer, template: ParamTemplate, result: any, prop: PropertyType) {
        const processor = this.templateProcessors.get(template.name);

        if(!processor)
            throw new Error(`No template processor for template "${template.name}"`);

        processor.decode(deserializer, template.arguments, result, prop);
    }

    decode(deserializer: Buffer | Deserializer): any {
        if(Buffer.isBuffer(deserializer)) {
            return this.decode(new Deserializer(deserializer.buffer, deserializer.byteOffset, deserializer.byteLength));
        }

        const id = deserializer.readUInt32();
        const container = this.containersCRC.get(id);

        if(!container)
            throw new Error(`No container found for CRC hash of ${id}`);

        const props: any = {};
        const params = container.params;
        const ii = params.length;

        for(let i = 0; i < ii; i++) {
            const param = params[i];
            const property = param.name;
            
            this.decodeContainerParam(deserializer, param.type, props, property);
        }

        return this.createObject(container, props);
    }

    decodeContainerParam(deserializer: Deserializer, param: Param, result: any, prop: PropertyType): any {
        switch(param.type) {
            case Params.Generic:
                result[prop] = this.decodeGeneric(deserializer, param.name);
                break;
            case Params.Reference:
                result[prop] = this.decode(deserializer);
                break;
            case Params.Template:
                this.decodeTemplate(deserializer, param, result, prop);
        }
    }

    encodeTemplate(param: ParamTemplate, value: any) {
        const processor = this.templateProcessors.get(param.name);

        if(!processor)
            throw new Error(`No template for encoding "${param.name}" template`);

        processor.encode(param.arguments, value);
    }

    encodeContainerParam(param: Param, value: any) {
        switch(param.type) {
            case Params.Generic:
                this.encodeGeneric(param.name, value);
                break;
            case Params.Reference:
                this.encodeReference(param.containers, value);
                break;
            case Params.Template:
                this.encodeTemplate(param, value);
                break;
        }
    }

    public encode(name: any, props?: undefined): Buffer;
    public encode(name: string, props: any): Buffer;
    public encode(name: string | any, props?: any): Buffer {
        if(typeof name == 'object') {
            props = this.getContainerParams(name);
            name = this.getContainerName(name);
        }

        const container = this.containers.get(name);

        if(!container)
            throw new Error(`Unexpected container name "${name}"`);

        const params = container.params;
        const ii = params.length;
        const serializer = this.serializer;
        const startOffset = serializer.getOffset();

        serializer.writeUInt32(container.id);

        for(let i = 0; i < ii; i++) {
            const param = params[i];

            this.encodeContainerParam(param.type, props[param.name]);
        }

        const endOffset = serializer.getOffset();

        return Buffer.from(serializer.getBuffer(), startOffset, endOffset - startOffset);
    }
}

export default Schema;