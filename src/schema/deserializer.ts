import Long from 'long';

export default class Deserializer {
    public offset: number = 0;
    public buffer: Buffer;

    constructor(buffer: Buffer, offset: number = 0) {
        this.buffer = buffer;
        this.offset = offset;
    }

    public readUInt8() {
        const value = this.buffer.readUInt8(this.offset);
        this.offset += 1;

        return value;
    }

    public readUInt64(): Long {
        const low = this.readUInt32();
        const high = this.readUInt32();

        return new Long(low, high, true);
    }

    public readInt64(): Long {
        const low = this.readInt32();
        const high = this.readInt32();

        return new Long(low, high, false);
    }

    public readInt8() {
        const value = this.buffer.readInt8(this.offset);
        this.offset += 1;

        return value;
    }

    public readFloat() {
        const value = this.buffer.readFloatLE(this.offset);
        this.offset += 4;

        return value;
    }

    public readDouble() {
        const value = this.buffer.readDoubleLE(this.offset);
        this.offset += 8;

        return value;
    }

    public readBuffer(length: number) {
        const result = this.buffer.slice(this.offset, this.offset + length);
        this.offset += length;

        return result;
    }

    public readBoolean() {
        const value = this.readUInt8();
        if(value == 1)
            return true;
        else if(value == 0)
            return false;

        console.warn('WARNING: Got unexpected value for boolean. Expected 1 or 0 but got %d instead', value);
        return value ? true : false;
    }

    public readUInt32() {
        const result = this.buffer.readUInt32LE(this.offset);
        this.offset += 4;

        return result;
    }

    public readInt32() {
        const result = this.buffer.readInt32LE(this.offset);
        this.offset += 4;

        return result;
    }

    public readInt16() {
        const result = this.buffer.readInt16LE(this.offset);
        this.offset += 2;

        return result;
    }

    public readUInt16() {
        const result = this.buffer.readUInt16LE(this.offset);
        this.offset += 2;

        return result;
    }
}