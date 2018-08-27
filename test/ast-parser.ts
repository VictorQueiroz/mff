import { Params } from '../src/ast-parser/param';
import * as assert from 'assert';
import { parse } from './utilities';
import { test } from 'sarg';

test('it should look for references inside namespaces', () => {
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
});

test('it should prioritize local containers', () => {
    assert.deepEqual(parse(`
        type TimeInterval {
            timeInterval
        }
        namespace filter {
            namespace schedule {
                type FilterSchedules {
                    filterSchedules -> TimeIntervalDirect interval
                }
                type SchedulesFilter {
                    schedulesFilter -> TimeInterval time
                }
                type TimeIntervalDirect {
                    timeIntervalDirect -> timeInterval time
                }
            }
            type TimeInterval {
                timeInterval
            }
            type TimeIntervalDirect {
                timeIntervalDirect -> timeInterval time
            }
        }
    `), [{
        id: 2192991637,
        type: 'TimeInterval',
        params: [],
        name: 'timeInterval'
    }, {
        id: 1481655917,
        type: 'filter::schedule::FilterSchedules',
        name: 'filter::schedule::filterSchedules',
        params: [{
            name: 'interval',
            type: {
                type: Params.Reference,
                containers: [
                    'filter::schedule::timeIntervalDirect'
                ]
            }
        }]
    }, {
        id: 4005121723,
        type: 'filter::schedule::SchedulesFilter',
        name: 'filter::schedule::schedulesFilter',
        params: [{
            name: 'time',
            type: {
                type: Params.Reference,
                containers: ['filter::timeInterval']
            }
        }]
    }, {
        id: 2924657150,
        type: 'filter::schedule::TimeIntervalDirect',
        name: 'filter::schedule::timeIntervalDirect',
        params: [{
            name: 'time',
            type: {
                type: Params.Reference,
                containers: ['filter::timeInterval']
            }
        }]
    }, {
        id: 3176971329,
        type: 'filter::TimeInterval',
        name: 'filter::timeInterval',
        params: []
    }, {
        id: 2892414978,
        type: 'filter::TimeIntervalDirect',
        name: 'filter::timeIntervalDirect',
        params: [{
            name: 'time',
            type: {
                type: Params.Reference,
                containers: ['filter::timeInterval']
            }
        }]
    }]);
});