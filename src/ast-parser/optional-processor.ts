import TemplateProcessor from './template-processor';
import { Node } from './node';
import { Param } from './param';

class OptionalProcessor extends TemplateProcessor<Param> {
    process(args: Node[]) {
        if(args.length != 1)
            throw new Error(`Invalid length of arguments for Optional template`);

        return args.map(arg => {
            return this.parser.parseParamType(arg);
        });
    }
}

export default OptionalProcessor;