export default class Serializer {
    private buffers: Buffer[];

    constructor() {
        this.buffers = [];
    }

    public getBuffer() {
        return Buffer.concat(this.buffers);
    }

    writeBuffer(source: Buffer) {
        if(!Buffer.isBuffer(source))
            throw new Error('Argument must be a buffer instance');

        const length = source.byteLength;
        const result = Buffer.allocUnsafe(length);

        source.copy(result, 0, 0, length);

        this.buffers.push(result);
    }

    writeBoolean(n: boolean) {
        if(typeof n != 'boolean')
            throw new Error('Unexpected type for boolean value. It must be native true or false');
        this.writeUInt8(n ? 1 : 0);
    }

    writeInt8(n: number) {
        const buffer = Buffer.allocUnsafe(1);
        buffer.writeInt8(n, 0);
        this.buffers.push(buffer);
    }

    writeUInt8(n: number) {
        const buffer = Buffer.allocUnsafe(1);
        buffer.writeUInt8(n, 0);
        this.buffers.push(buffer);
    }

    writeUInt16(n: number) {
        const buffer = Buffer.allocUnsafe(2);
        buffer.writeUInt16LE(n, 0);
        this.buffers.push(buffer);
    }

    writeInt16(n: number) {
        const buffer = Buffer.allocUnsafe(2);
        buffer.writeInt16LE(n, 0);
        this.buffers.push(buffer);
    }

    writeUInt32(n: number) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeUInt32LE(n, 0);
        this.buffers.push(buffer);
    }

    writeInt32(n: number) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeInt32LE(n, 0);
        this.buffers.push(buffer);
    }

    writeDouble(n: number) {
        const buffer = Buffer.allocUnsafe(8);
        buffer.writeDoubleLE(n, 0);
        this.buffers.push(buffer);
    }

    writeFloat(n: number) {
        const buffer = Buffer.allocUnsafe(4);
        buffer.writeFloatLE(n, 0);
        this.buffers.push(buffer);
    }

    writeString(n: string) {
        const str = Buffer.from(n, 'utf8');

        this.writeUInt32(str.byteLength);
        this.writeBuffer(str);
    }
}