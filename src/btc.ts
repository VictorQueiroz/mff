import { Node } from './ast-parser/node';

export interface BTC {
    parse(text: string): Node[];
}

export default <BTC>(require('bindings')('btcjs'));