export default class Deserializer {
    view: Buffer;
    offset: number = 0;
    buffer: ArrayBuffer;

    constructor(buffer: ArrayBuffer, byteOffset: number = 0, length: number = buffer.byteLength) {
        this.buffer = buffer;
        this.view = Buffer.from(this.buffer, byteOffset, length);
    }

    readUInt8() {
        const value = this.view.readUInt8(this.offset);
        this.offset += 1;

        return value;
    }

    readInt8() {
        const value = this.view.readInt8(this.offset);
        this.offset += 1;

        return value;
    }

    readFloat() {
        const value = this.view.readFloatLE(this.offset);
        this.offset += 4;

        return value;
    }

    readDouble() {
        const value = this.view.readDoubleLE(this.offset);
        this.offset += 4;

        return value;
    }

    readBuffer(length: number) {
        const result = Buffer.from(this.buffer, this.offset, length);
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
        const result = this.view.readUInt32LE(this.offset);
        this.offset += 4;

        return result;
    }

    readInt32() {
        const result = this.view.readInt32LE(this.offset);
        this.offset += 4;

        return result;
    }

    readInt16() {
        const result = this.view.readInt16LE(this.offset);
        this.offset += 2;

        return result;
    }

    readUInt16() {
        const result = this.view.readUInt16LE(this.offset);
        this.offset += 2;

        return result;
    }
}