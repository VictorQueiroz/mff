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
                type: 'Identifier'
            }, {
                value: 'B',
                type: 'Identifier'
            }],
            body: {
                name: 'Vector2DItem',
                containerType: '',
                body: [{
                    paramType: {
                        value: 'A',
                        type: 'Identifier'
                    },
                    name: 'x',
                    type: 'ContainerParam'
                }, {
                    paramType: {
                        value: 'B',
                        type: 'Identifier'
                    },
                    name: 'y',
                    type: 'ContainerParam'
                }],
                type: 'ContainerDeclaration'
            },
            type: 'TemplateDeclaration'
        }],
        name: 'Vector2DItem_t',
        type: 'ContainerGroup'
    }]);
});