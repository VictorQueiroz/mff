export default class Serializer {
    private buffer: ArrayBuffer;
    private length: number;
    private offset: number;
    private view: Buffer;

    constructor() {
        this.length = 2048 * 4;
        this.buffer = new ArrayBuffer(this.length);
        this.view = Buffer.from(this.buffer, 0);
        this.offset = 0;
    }

    public getOffset() {
        return this.offset;
    }

    public getBuffer() {
        return this.buffer;
    }

    checkLength(byteLength: number) {
        if((this.offset + byteLength) >= this.length) {
            const oldView = this.view;
            const length = this.length + byteLength + (2048 * 4);

            this.buffer = new ArrayBuffer(length);
            this.length = length;
            this.view = Buffer.from(this.buffer);
            this.view.set(oldView);
        }
    }

    writeBuffer(buffer: Buffer) {
        if(!Buffer.isBuffer(buffer))
            throw new Error('Argument must be a buffer instance');

        const length = buffer.byteLength;

        this.checkLength(length);
        this.offset += buffer.copy(this.view, this.offset, 0, length);
    }

    writeBoolean(n: boolean) {
        if(typeof n != 'boolean')
            throw new Error('Unexpected type for boolean value. It must be native true or false');
        this.writeUInt8(n ? 1 : 0);
    }

    writeInt8(n: number) {
        this.checkLength(1);
        this.offset = this.view.writeInt8(n, this.offset);
    }

    writeUInt8(n: number) {
        this.checkLength(1);
        this.offset = this.view.writeUInt8(n, this.offset);
    }

    writeUInt16(n: number) {
        this.checkLength(2);
        this.offset = this.view.writeUInt16LE(n, this.offset);
    }

    writeInt16(n: number) {
        this.checkLength(2);
        this.offset = this.view.writeInt16LE(n, this.offset);
    }

    writeUInt32(n: number) {
        this.checkLength(4);
        this.offset = this.view.writeUInt32LE(n, this.offset);
    }

    writeInt32(n: number) {
        this.checkLength(4);
        this.offset = this.view.writeInt32LE(n, this.offset);
    }

    writeDouble(n: number) {
        this.checkLength(8);
        this.offset = this.view.writeDoubleLE(n, this.offset);
    }

    writeFloat(n: number) {
        this.checkLength(4);
        this.offset = this.view.writeFloatLE(n, this.offset);
    }

    writeString(n: string) {
        const str = Buffer.from(n, 'utf8');

        this.writeUInt32(str.byteLength);
        this.writeBuffer(str);
    }
}