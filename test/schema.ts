import Schema from '../src/schema';
import * as assert from 'assert';
import * as crypto from 'crypto';
import { parse } from './utilities';
import { Generics } from '../src/ast-parser/constants';
import { test } from 'sarg';

const containers = parse(`
    import "schema.txt";
`, {
    directory: __dirname,
    namespaceSeparator: '.'
});

function getSchema(text: string) {
    return new Schema(parse(text));
}

test('it should support Map template', () => {
    const schema = getSchema(`
        type Object {
            object -> Map<uint32, string> properties
        }
    `);

    const map = new Map<number, string>();

    for(let i = 0; i < 100; i++) {
        map.set(crypto.randomBytes(4).readInt32LE(0), crypto.randomBytes(4).toString('hex'));
    }

    schema.encode(['object', {
        properties: map
    }]);
});

test('it should encode complex containers', () => {
    const buffer = new Schema(containers).encode(['user', {
        name: 'simple user',
        age: 10,
        address: ['geo.data.address', {
            streetName: 'Av. 2002',
            streetNumber: 2010,
            url: ['geo.URL', {
                href: ''
            }]
        }],
        posts: [
            ['post', {
                comments: []
            }]
        ]
    }]);

    assert.deepEqual(new Schema(containers).decode(buffer), ['user', {
        name: 'simple user',
        age: 10,
        address: ['geo.data.address', {
            streetName: 'Av. 2002',
            streetNumber: 2010,
            url: ['geo.URL', {
                href: ''
            }]
        }],
        posts: [
            ['post', {
                comments: []
            }]
        ]
    }]);
});

test('it should perform validation when optional fields receive value', () => {
    const id = crypto.randomBytes(12);
    const buffer = new Schema(containers).encode(['user', {
        id,
        name: 'simple user',
        age: 10,
        address: ['geo.data.address', {
            streetName: 'Av. 2002',
            streetNumber: 2010,
            url: ['geo.URL', {
                href: ''
            }]
        }],
        posts: []
    }]);

    assert.deepEqual(new Schema(containers).decode(buffer), ['user', {
        id,
        name: 'simple user',
        age: 10,
        address: ['geo.data.address', {
            streetName: 'Av. 2002',
            streetNumber: 2010,
            url: ['geo.URL', {
                href: ''
            }]
        }],
        posts: []
    }]);
});

test('it should perform encode and decode of various containers', () => {
    const schema = new Schema(containers);

    for(let i = 0; i < 10000; i++) {
        const buffer = schema.encode(['geo.data.address', {
            streetName: 'Av. 2002',
            streetNumber: 2000 + i,
            url: ['geo.URL', {
                href: 'url 1'
            }]
        }]);
        assert.deepEqual(schema.decode(buffer), ['geo.data.address', {
            streetName: 'Av. 2002',
            streetNumber: 2000 + i,
            url: ['geo.URL', {
                href: 'url 1'
            }]
        }]);
    }
});

test('it should deal well with slices of current array buffer', () => {
    const schema = new Schema(containers);
    const msg = schema.encode(['geo.data.address', {
        streetName: 'Av. 2002',
        streetNumber: 2000,
        url: ['geo.URL', {
            href: 'url 1'
        }]
    }]);
    assert.deepEqual(schema.decode(msg), ['geo.data.address', {
        streetName: 'Av. 2002',
        streetNumber: 2000,
        url: ['geo.URL', {
            href: 'url 1'
        }]
    }]);
    const encoded = schema.encode(['msg', {
        body: msg
    }]);
    const decoded = schema.decode(encoded);
    assert.ok(decoded[1].body.equals(msg));
    assert.deepEqual(schema.decode(decoded[1].body), ['geo.data.address', {
        streetName: 'Av. 2002',
        streetNumber: 2000,
        url: ['geo.URL', {
            href: 'url 1'
        }]
    }]);
});

test('getGenericDefault(): it should find defaults for generic types', () => {
    const values = [{
        type: Generics.Double,
        value: 0,
    }, {
        type: Generics.Float,
        value: 0
    }, {
        type: Generics.Int16,
        value: 0
    }, {
        type: Generics.UInt16,
        value: 0
    }, {
        type: Generics.UInt8,
        value: 0
    }, {
        type: Generics.Int8,
        value: 0
    }, {
        type: Generics.Int32,
        value: 0
    }, {
        type: Generics.UInt32,
        value: 0
    }, {
        type: Generics.String,
        value: ''
    }, {
        type: Generics.Boolean,
        value: false
    }];

    const schema = new Schema([]);

    for(const value of values) {
        assert.equal(schema.getGenericDefault(value.type), value.value);
    }
});

test('it should not encode property when optional is not defined', () => {
    const schema = new Schema(parse(`
        type User {
            user -> Optional<string> name
        }
    `));

    assert.deepStrictEqual(schema.decode(schema.encode(['user', {}])), ['user', {}]);
});

test('it should not encode null properties for optional fields', () => {
    const schema = new Schema(parse(`type User {
        user -> Optional<string> name
    }`));
    assert.deepStrictEqual(schema.decode(schema.encode(['user', { name: null }])), ['user', {}]);
});

test('encodeGeneric() should encode double precision integers', () => {
    const schema = new Schema(parse(`type User {
        user -> double age
    }`));
    assert.deepStrictEqual(schema.decode(schema.encode(['user', {
        age: 10.5
    }])), ['user', {
        age: 10.5
    }]);
});

test('encodeGeneric() should encode floating point integers', () => {
    const schema = new Schema(parse(`type User {
        user -> float age
    }`));
    assert.deepStrictEqual(schema.decode(schema.encode(['user', {
        age: 20.99
    }])), ['user', {
        age: 20.989999771118164
    }]);
});

test('encodeGeneric() should encode signed 16-bit integer', () => {
    const schema = new Schema(parse(`type Link {
        link -> int16 clicks
    }`));
    assert.deepStrictEqual(schema.decode(schema.encode(['link', {
        clicks: 32767
    }])), ['link', {
        clicks: 32767
    }]);
});

test('encodeGeneric() should encode unsigned 16-bit integer', () => {
    const schema = new Schema(parse(`type Link {
        link -> uint16 clicks
    }`));
    assert.deepStrictEqual(schema.decode(schema.encode(['link', {
        clicks: 0xffff
    }])), ['link', {
        clicks: 0xffff
    }]);
});

test('encodeGeneric() should encode unsigned 8-bit integer', () => {
    const schema = new Schema(parse(`type Link {
        link -> uint8 id
    }`));
    assert.deepStrictEqual(schema.decode(schema.encode(['link', {
        id: 255
    }])), ['link', {
        id: 255
    }]);
});

test('encodeGeneric() should encode signed 8-bit integer', () => {
    const schema = new Schema(parse(`type Link {
        link -> int8 id
    }`));
    assert.deepStrictEqual(schema.decode(schema.encode(['link', {
        id: 127
    }])), ['link', {
        id: 127
    }]);
});

test('encodeGeneric() should encode signed 32-bit integer', () => {
    const schema = new Schema(parse(`type User {
        user -> int32 id
    }`));
    assert.deepStrictEqual(schema.decode(schema.encode(['user', {
        id: 0xffffff
    }])), ['user', {
        id: 0xffffff
    }]);
});

test('encodeGeneric() should encode boolean properties', () => {
    const schema = new Schema(parse(`type Link {
        link -> bool clicked
    }`));
    assert.deepStrictEqual(schema.decode(schema.encode(['link', {
        clicked: true
    }])), ['link', {
        clicked: true
    }]);
});

test('decode() should throw when received an invalid CRC hash', () => {
    const schema = new Schema(parse(`type Link {
        link -> bool clicked
    }`));
    assert.throws(
        () => schema.decode(Buffer.from('a0785a03', 'hex')),
        new Error('No container found for CRC hash of 56260768')
    );
});

test('encodeContainerParam() should encode default property for generic property', () => {
    const schema = new Schema(parse(`type Link {
        link -> bool clicked
    }`));
    assert.deepStrictEqual(schema.decode(schema.encode(
        ['link', {}]
    )), ['link', {
        clicked: false
    }]);
});
