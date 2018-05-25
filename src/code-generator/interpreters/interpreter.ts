import CodeGenerator from '../index';
import * as t from '@babel/types';

export default abstract class Interpreter<T = any> {
    generator: CodeGenerator;
    constructor(generator: CodeGenerator) {
        this.generator = generator;
    }
    abstract interpret(node: T): t.Statement[];
}