import TemplateProcessor from './template-processor';
import { Param } from './param';
import { Node } from './node';

class TypedArrayProcessor extends TemplateProcessor<Param> {
    process(types: Node[]): Param[] {
        return types.map(type => {
            return this.parser.parseParamType(type);
        });
    }
}

export default TypedArrayProcessor;