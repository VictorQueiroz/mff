import { test } from 'sarg';
import { btc } from '../src';
import { deepEqual } from 'assert';

test('it should support template declarations', () => {
    deepEqual(btc.parse(`
        type Vector2DItem_t {
            template<typename A, typename B>
            Vector2DItem -> A x, B y
        }
    `), [{
        body: [{
            arguments: [{
                value: 'A',
                leadingComments: [],
                trailingComments: [],
                type: 'Identifier'
            }, {
                value: 'B',
                leadingComments: [],
                trailingComments: [],
                type: 'Identifier'
            }],
            body: {
                name: 'Vector2DItem',
                containerType: '',
                body: [{
                    paramType: {
                        value: 'A',
                        leadingComments: [],
                        trailingComments: [],
                        type: 'Identifier'
                    },
                    name: 'x',
                    leadingComments: [],
                    trailingComments: [],
                    type: 'ContainerParam'
                }, {
                    paramType: {
                        value: 'B',
                        leadingComments: [],
                        trailingComments: [],
                        type: 'Identifier'
                    },
                    name: 'y',
                    leadingComments: [],
                    trailingComments: [],
                    type: 'ContainerParam'
                }],
                leadingComments: [],
                trailingComments: [],
                type: 'ContainerDeclaration'
            },
            leadingComments: [],
            trailingComments: [],
            type: 'TemplateDeclaration'
        }],
        name: 'Vector2DItem_t',
        leadingComments: [],
        trailingComments: [],
        type: 'ContainerGroup'
    }]);
});