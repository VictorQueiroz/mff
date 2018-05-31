export default class Deserializer {
    offset: number = 0;
    buffer: Buffer;

    constructor(buffer: Buffer, offset: number = 0) {
        this.buffer = buffer;
        this.offset = offset;
    }

    readUInt8() {
        const value = this.buffer.readUInt8(this.offset);
        this.offset += 1;

        return value;
    }

    readInt8() {
        const value = this.buffer.readInt8(this.offset);
        this.offset += 1;

        return value;
    }

    readFloat() {
        const value = this.buffer.readFloatLE(this.offset);
        this.offset += 4;

        return value;
    }

    readDouble() {
        const value = this.buffer.readDoubleLE(this.offset);
        this.offset += 8;

        return value;
    }

    readBuffer(length: number) {
        const result = this.buffer.slice(this.offset, this.offset + length);
        this.offset += length;

        return result;
    }

    readBoolean() {
        const value = this.readUInt8();
        if(value == 1)
            return true;
        else if(value == 0)
            return false;

        console.warn('Got unexpected for boolean. Expected 1 or 0 but got %d instead', value);
        return value ? true : false;
    }

    readUInt32() {
        const result = this.buffer.readUInt32LE(this.offset);
        this.offset += 4;

        return result;
    }

    readInt32() {
        const result = this.buffer.readInt32LE(this.offset);
        this.offset += 4;

        return result;
    }

    readInt16() {
        const result = this.buffer.readInt16LE(this.offset);
        this.offset += 2;

        return result;
    }

    readUInt16() {
        const result = this.buffer.readUInt16LE(this.offset);
        this.offset += 2;

        return result;
    }
}