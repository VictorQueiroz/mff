import Parser from './index';
import { Node } from './node';

abstract class TemplateProcessor<T = any> {
    parser: Parser;

    constructor(parser: Parser) {
        this.parser = parser;
    }

    /**
     * Create CRC string from template arguments
     */
    createCrcString(args: Node[]): string[] {
        return args.map(arg => this.parser.createCrcString(arg));
    }

    abstract process(node: Node[]): T[];
}

export default TemplateProcessor;