import Long from 'long';

export default class Serializer {
    private buffer: ArrayBuffer;
    private view: Buffer;
    private offset: number = 0;
    private memoryGrowthAmount = 1024*4;

    constructor(private length: number = 1024) {
        this.buffer = new ArrayBuffer(this.length);
        this.view = Buffer.from(this.buffer);
    }

    public getBuffer() {
        return this.view.slice(0, this.offset);
    }

    public allocate(length: number) {
        if((this.offset + length) >= this.length) {
            const { view: oldView } = this;

            this.length += length + this.memoryGrowthAmount;
            this.buffer = new ArrayBuffer(this.length);
            this.view = Buffer.from(this.buffer);

            oldView.copy(this.view, 0);
        }
    }

    public writeBuffer(source: Buffer) {
        if(!Buffer.isBuffer(source))
            throw new Error('Argument must be a buffer instance');

        const length = source.byteLength;

        this.allocate(length);
        source.copy(this.view, this.offset, 0, length);
        this.offset += length;
    }

    public writeBoolean(n: boolean) {
        if(typeof n !== 'boolean') {
            throw new Error('Unexpected type for boolean value. It must be native true or false');
        }
        this.writeUInt8(n ? 1 : 0);
    }

    public writeInt8(n: number) {
        this.allocate(1);
        this.view.writeInt8(n, this.offset);
        this.offset++;
    }

    public writeUInt8(n: number) {
        this.allocate(1);
        this.view.writeUInt8(n, this.offset);
        this.offset++;
    }

    public writeUInt16(n: number) {
        this.allocate(2);
        this.view.writeUInt16LE(n, this.offset);
        this.offset += 2;
    }

    public writeInt16(n: number) {
        this.allocate(2);
        this.view.writeInt16LE(n, this.offset);
        this.offset += 2;
    }

    public writeUInt32(n: number) {
        this.allocate(4);
        this.view.writeUInt32LE(n, this.offset);
        this.offset += 4;
    }

    public writeInt32(n: number) {
        this.allocate(4);
        this.view.writeInt32LE(n, this.offset);
        this.offset += 4;
    }

    public writeUInt64(n: Long | number) {
        let long: Long | undefined;
        if(typeof n === 'number') {
            long = new Long(n, 0);
        } else {
            long = n;
        }
        this.writeLong(long, true);
    }

    public writeInt64(n: Long | number) {
        let long: Long | undefined;
        if(typeof n === 'number') {
            long = new Long(n, 0);
        } else {
            long = n;
        }
        this.writeLong(long, false);
    }

    public writeDouble(n: number) {
        this.allocate(8);
        this.view.writeDoubleLE(n, this.offset);
        this.offset += 8;
    }

    public writeFloat(n: number) {
        this.allocate(4);
        this.view.writeFloatLE(n, this.offset);
        this.offset += 4;
    }

    public writeString(n: string) {
        const str = Buffer.from(n, 'utf8');

        this.writeUInt32(str.byteLength);
        this.writeBuffer(str);
    }

    private writeLong(n: Long, unsigned: boolean) {
        if(unsigned) {
            this.writeUInt32(n.getLowBitsUnsigned());
            this.writeUInt32(n.getHighBitsUnsigned());
        } else {
            this.writeInt32(n.getLowBits());
            this.writeInt32(n.getHighBits());
        }
    }
}