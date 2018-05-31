import btc from '../src/btc';
import ASTParser from '../src/ast-parser';
import { Container } from '../src/ast-parser/constants';

export function parse(text: string, options: any = {}) {
    const containers: Container[] = [];

    new ASTParser(btc.parse(text), {
        directory: '',
        ...options,
        containers
    }).parse();

    return containers;
}
