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

    for(let i = 0; i < values.length; i++) {
        assert.equal(schema.getGenericDefault(values[i].type), values[i].value);
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