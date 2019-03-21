import autobind from 'autobind-decorator';
import { ICodeGenerator } from './code-generator';

@autobind
export default class CodeStream {
    private code = '';
    constructor(private generator: ICodeGenerator) {
    }
    public write(start: string, getContent?: () => void, end?: string) {
        if(typeof getContent !== 'function' || typeof end !== 'string' || typeof start !== 'string') {
            this.code += this.generator.indentCode(start);
            return;
        }
        this.code += this.generator.indentCode(start);
        this.generator.increaseDepth();
        getContent();
        this.generator.decreaseDepth();
        this.code += this.generator.indentCode(end);
    }
    public prepend(value: string) {
        this.code = value + this.code;
    }
    public append(value: string) {
        this.code += value;
    }
    /**
     * @returns Return the contents at `code` property and clears it
     */
    public valueOf() {
        const value = this.code;
        this.code = '';
        return value;
    }
}
