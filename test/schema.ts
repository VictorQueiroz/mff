import ASTParser from '../src/ast-parser';
import Schema from '../src/schema';
import * as assert from 'assert';
import * as crypto from 'crypto';
import btc from '../src/btc';
import { Generics } from '../src/ast-parser/constants';

const astParser = new ASTParser(btc.parse(`
    import "schema.txt";
`), {
    directory: __dirname,
    containers: [],
    namespaceSeparator: '.'
});

astParser.parse();

export default function() {
    return {
        'it should encode complex containers': function() {
            const buffer = new Schema(astParser.containers).encode(['user', {
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

            assert.deepEqual(new Schema(astParser.containers).decode(buffer), ['user', {
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
        },

        'it should perform validation when optional fields receive value': function() {
            const id = crypto.randomBytes(12);
            const buffer = new Schema(astParser.containers).encode(['user', {
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

            assert.deepEqual(new Schema(astParser.containers).decode(buffer), ['user', {
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
        },

        'it should perform encode and decode of various containers': function() {
            const schema = new Schema(astParser.containers);

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

        'getGenericDefault(): it should find defaults for generic types': function() {
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
                assert.equal(schema.getGenericDefault('', values[i].type), values[i].value);
            }
        },

        'it should not encode null properties for optional fields': () => {
            const schema = new Schema(parse(`type User {
                user -> Optional<string> name
            }`));
            assert.deepStrictEqual(schema.decode(schema.encode(['user', { name: null }])), ['user', {}]);
        }
    };
}