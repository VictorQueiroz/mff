import * as assert from 'assert';
import * as crypto from 'crypto';
import Serializer from '../src/schema/serializer';
import Deserializer from '../src/schema/deserializer';
import { test } from 'sarg';

let serializer: Serializer;
let deserializer: Deserializer;

test('should write simple int32 integer', () => {
    serializer = new Serializer();
    serializer.writeInt32(1000);

    deserializer = new Deserializer(serializer.getBuffer());
    assert.equal(1000, deserializer.readInt32());
});

test('should write negative numbers', () => {
    serializer = new Serializer();
    serializer.writeInt32(-12032940);

    deserializer = new Deserializer(serializer.getBuffer());
    assert.equal(-12032940, deserializer.readInt32());
});

test('should write max 32 bit safe integer', () => {
    serializer = new Serializer();
    serializer.writeInt32(2147483647);

    deserializer = new Deserializer(serializer.getBuffer());
    assert.equal(2147483647, deserializer.readInt32());
});

test('should throw an error if we try to write above 2147483647', () => {
    serializer = new Serializer();
    assert.throws(() => {
        serializer.writeInt32(2147483647 + 1);
    });
});

test('should encode true value', () => {
    serializer = new Serializer();
    serializer.writeBoolean(true);

    deserializer = new Deserializer(serializer.getBuffer());
    assert.equal(deserializer.readBoolean(), true);
});

test('should encode false value', () => {
    serializer = new Serializer();
    serializer.writeBoolean(false);

    deserializer = new Deserializer(serializer.getBuffer());
    assert.equal(deserializer.readBoolean(), false);
});

test('should write unsigned 32-bit integer', () => {
    serializer = new Serializer();
    serializer.writeUInt32(0xFFFFFFFF);

    deserializer = new Deserializer(serializer.getBuffer());
    assert.equal(deserializer.readUInt32(), 0xFFFFFFFF);
});

test('should write bytes', () => {
    serializer = new Serializer();
    const bytes1 = crypto.randomBytes(64);
    const bytes2 = crypto.randomBytes(64);

    serializer.writeUInt32(64);
    serializer.writeBuffer(bytes1);

    serializer.writeUInt32(64);
    serializer.writeBuffer(bytes2);

    deserializer = new Deserializer(serializer.getBuffer());
    assert.ok(deserializer.readBuffer(deserializer.readUInt32()).equals(bytes1));
    assert.ok(deserializer.readBuffer(deserializer.readUInt32()).equals(bytes2));
});

test('should encode simple string', () => {
    serializer = new Serializer();
    serializer.writeString('hi. my name is X');

    deserializer = new Deserializer(serializer.getBuffer());
    assert.equal('hi. my name is X', deserializer.readBuffer(deserializer.readUInt32()).toString('utf8'));
});

test('should encode russian characters', () => {
    serializer = new Serializer();
    serializer.writeString('Здравствуй. Как дела?');

    deserializer = new Deserializer(serializer.getBuffer());
    assert.equal('Здравствуй. Как дела?', deserializer.readBuffer(deserializer.readUInt32()).toString('utf8'));
});

test('should encode emojis correctly', () => {
    serializer = new Serializer();
    serializer.writeString('message: 🎱');

    deserializer = new Deserializer(serializer.getBuffer());
    assert.equal('message: 🎱', deserializer.readBuffer(deserializer.readUInt32()).toString('utf8'));
});

test('should encode 2048 length string', () => {
    serializer = new Serializer();
    const string = crypto.randomBytes(1024).toString('hex');

    serializer.writeString(string);
    deserializer = new Deserializer(serializer.getBuffer());
    assert.equal(deserializer.readBuffer(deserializer.readUInt32()).toString('utf8'), string);
});

test('should encode 32-bit integer into float', () => {
    serializer = new Serializer();
    serializer.writeFloat(2.387939260590663e-38);

    deserializer = new Deserializer(serializer.getBuffer());

    assert.equal(deserializer.readFloat(), 2.387939260590663e-38);
});

test('should encode double integer', () => {
    serializer = new Serializer();
    serializer.writeDouble(-38.5824766);

    deserializer = new Deserializer(serializer.getBuffer());

    assert.equal(deserializer.readDouble(), -38.5824766);
});

test('should encode 16-bit integer', () => {
    serializer = new Serializer();
    serializer.writeInt16(32767);

    deserializer = new Deserializer(serializer.getBuffer());
    assert.equal(deserializer.readInt16(), 32767);
});

test('should encode 16-bit unsigned integer', () => {
    serializer = new Serializer();
    serializer.writeUInt16(65535);

    deserializer = new Deserializer(serializer.getBuffer());
    assert.equal(deserializer.readUInt16(), 65535);
});