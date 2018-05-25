import ASTParser from '../src/ast-parser';
import Schema from '../src/schema';
import * as assert from 'assert';
import * as crypto from 'crypto';

const astParser = new ASTParser({
    text: `
        import "schema.txt";
    `
}, {
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
        }
    };
}