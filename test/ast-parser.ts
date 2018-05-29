import ASTParser from '../src/ast-parser';
import { Container } from '../src/ast-parser/constants';
import { Params } from '../src/ast-parser/param';
import * as assert from 'assert';
import btc from '../src/btc';

function parse(text: string) {
    const containers: Container[] = [];

    new ASTParser(btc.parse(text), {
        directory: '',
        containers
    }).parse();

    return containers;
}

export default function() {
    return {
        'it should look for references inside namespaces': function() {
            assert.deepEqual(parse(`
                namespace api {
                    type TSetConfig {
                        SetConfig -> TConfig config
                    }
                    type TConfig {
                        config -> string key, string value
                    }
                }
            `), [{
                id: 3561931015,
                type: 'api::TSetConfig',
                params: [{
                    name: 'config',
                    type: {
                        type: Params.Reference,
                        containers: ['api::config']
                    }
                }],
                name: 'api::SetConfig'
            }, {
                id: 2472372924,
                type: 'api::TConfig',
                name: 'api::config',
                params: [{
                    name: 'key',
                    type: {
                        type: Params.Generic,
                        name: 'string'
                    }
                }, {
                    name: 'value',
                    type: {
                        type: Params.Generic,
                        name: 'string'
                    }
                }]
            }]);
        }
    };
};