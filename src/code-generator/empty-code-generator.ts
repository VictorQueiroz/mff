import CodeGeneratorChild from './code-generator-child';

export default class EmptyCodeGenerator extends CodeGeneratorChild {
    public generate() {
        return '';
    }
}
