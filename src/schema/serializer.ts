export default class Serializer {
    private buffer: ArrayBuffer;
    private view: Buffer;
    private offset: number = 0;

    constructor(private length: number = 0xfff) {
        this.buffer = new ArrayBuffer(this.length);
        this.view = Buffer.from(this.buffer);
    }

    public getBuffer() {
        return this.view.slice(0, this.offset);
    }

    allocate(length: number) {
        if((this.offset + length) >= this.length) {
            const { view: oldView } = this;

            this.length += length + 0xfff;
            this.buffer = new ArrayBuffer(this.length);
            this.view = Buffer.from(this.buffer);

            oldView.copy(this.view, 0);
        }
    }

    writeBuffer(source: Buffer) {
        if(!Buffer.isBuffer(source))
            throw new Error('Argument must be a buffer instance');

        const length = source.byteLength;

        this.allocate(length);
        source.copy(this.view, this.offset, 0, length);
        this.offset += length;
    }

    writeBoolean(n: boolean) {
        if(typeof n != 'boolean')
            throw new Error('Unexpected type for boolean value. It must be native true or false');
        this.writeUInt8(n ? 1 : 0);
    }

    writeInt8(n: number) {
        this.allocate(1);
        this.view.writeInt8(n, this.offset);
        this.offset++;
    }

    writeUInt8(n: number) {
        this.allocate(1);
        this.view.writeUInt8(n, this.offset);
        this.offset++;
    }

    writeUInt16(n: number) {
        this.allocate(2);
        this.view.writeUInt16LE(n, this.offset);
        this.offset += 2;
    }

    writeInt16(n: number) {
        this.allocate(2);
        this.view.writeInt16LE(n, this.offset);
        this.offset += 2;
    }

    writeUInt32(n: number) {
        this.allocate(4);
        this.view.writeUInt32LE(n, this.offset);
        this.offset += 4;
    }

    writeInt32(n: number) {
        this.allocate(4);
        this.view.writeInt32LE(n, this.offset);
        this.offset += 4;
    }

    writeDouble(n: number) {
        this.allocate(8);
        this.view.writeDoubleLE(n, this.offset);
        this.offset += 8;
    }

    writeFloat(n: number) {
        this.allocate(4);
        this.view.writeFloatLE(n, this.offset);
        this.offset += 4;
    }

    writeString(n: string) {
        const str = Buffer.from(n, 'utf8');

        this.writeUInt32(str.byteLength);
        this.writeBuffer(str);
    }
}