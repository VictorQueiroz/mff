import * as assert from 'assert';
import * as crypto from 'crypto';
import Serializer from '../src/schema/serializer';
import Deserializer from '../src/schema/deserializer';

export default function() {
    let serializer: Serializer,
        deserializer: Deserializer;

    return {
        'should write simple int32 integer': function() {
            serializer = new Serializer();
            serializer.writeInt32(1000);

            deserializer = new Deserializer(serializer.getBuffer());
            assert.equal(1000, deserializer.readInt32());
        },

        'should write negative numbers': function() {
            serializer = new Serializer();
            serializer.writeInt32(-12032940);

            deserializer = new Deserializer(serializer.getBuffer());
            assert.equal(-12032940, deserializer.readInt32());
        },

        'should write max 32 bit safe integer': function() {
            serializer = new Serializer();
            serializer.writeInt32(2147483647);

            deserializer = new Deserializer(serializer.getBuffer());
            assert.equal(2147483647, deserializer.readInt32());
        },

        'should throw an error if we try to write above 2147483647': function() {
            serializer = new Serializer();
            assert.throws(function() {
                serializer.writeInt32(2147483647 + 1);
            });
        },

        'should encode true value': function() {
            serializer = new Serializer();
            serializer.writeBoolean(true);

            deserializer = new Deserializer(serializer.getBuffer());
            assert.equal(deserializer.readBoolean(), true);
        },

        'should encode false value': function() {
            serializer = new Serializer();
            serializer.writeBoolean(false);

            deserializer = new Deserializer(serializer.getBuffer());
            assert.equal(deserializer.readBoolean(), false);
        },

        'should write unsigned 32-bit integer': function() {
            serializer = new Serializer();
            serializer.writeUInt32(0xFFFFFFFF);

            deserializer = new Deserializer(serializer.getBuffer());
            assert.equal(deserializer.readUInt32(), 0xFFFFFFFF);
        },

        'should write bytes': function() {
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
        },

        'should encode simple string': function() {
            serializer = new Serializer();
            serializer.writeString('hi. my name is X');

            deserializer = new Deserializer(serializer.getBuffer());
            assert.equal('hi. my name is X', deserializer.readBuffer(deserializer.readUInt32()).toString('utf8'));
        },

        'should encode russian characters': function() {
            serializer = new Serializer();
            serializer.writeString('Здравствуй. Как дела?');

            deserializer = new Deserializer(serializer.getBuffer());
            assert.equal('Здравствуй. Как дела?', deserializer.readBuffer(deserializer.readUInt32()).toString('utf8'));
        },

        'should encode emojis correctly': function() {
            serializer = new Serializer();
            serializer.writeString('message: 🎱');

            deserializer = new Deserializer(serializer.getBuffer());
            assert.equal('message: 🎱', deserializer.readBuffer(deserializer.readUInt32()).toString('utf8'));
        },

        'should encode 2048 length string': function() {
            serializer = new Serializer();
            const string = crypto.randomBytes(1024).toString('hex');

            serializer.writeString(string);
            deserializer = new Deserializer(serializer.getBuffer());
            assert.equal(deserializer.readBuffer(deserializer.readUInt32()).toString('utf8'), string);
        },

        'should encode 32-bit integer into float': function() {
            serializer = new Serializer();
            serializer.writeFloat(2.387939260590663e-38);

            deserializer = new Deserializer(serializer.getBuffer());

            assert.equal(deserializer.readFloat(), 2.387939260590663e-38);
        },

        'should encode double integer': function() {
            serializer = new Serializer();
            serializer.writeDouble(-38.5824766);

            deserializer = new Deserializer(serializer.getBuffer());

            assert.equal(deserializer.readDouble(), -38.5824766);
        },

        'should encode 16-bit integer': function() {
            serializer = new Serializer();
            serializer.writeInt16(32767);

            deserializer = new Deserializer(serializer.getBuffer());
            assert.equal(deserializer.readInt16(), 32767);
        },

        'should encode 16-bit unsigned integer': function() {
            serializer = new Serializer();
            serializer.writeUInt16(65535);

            deserializer = new Deserializer(serializer.getBuffer());
            assert.equal(deserializer.readUInt16(), 65535);
        }
    };
}