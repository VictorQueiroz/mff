import TemplateProcessor from './template-processor';
import { Node, NodeLiteralNumber } from './node';
import { Param as DefaultParam } from './param';
import { Syntax } from './constants';

export type Param = DefaultParam | NodeLiteralNumber;

class StrictSizeProcessor extends TemplateProcessor<Param> {
    createCrcString(args: Node[]): string[] {
        return args.reduce((result, param) => {
            let parsed: string[] = [];

            if(param.type == Syntax.LiteralNumber)
                parsed.push(param.value.toString());
            else
                parsed = parsed.concat(super.createCrcString([param]));

            return result.concat(parsed);
        }, new Array<string>());
    }
    process(args: Node[]) {
        if(args.length != 2)
            throw new Error(`Invalid length of arguments for StrictSize template`);

        return args.map((arg) => {
            if(arg.type == Syntax.LiteralNumber)
                return arg;
            return this.parser.parseParamType(arg);
        });
    }
}

export default StrictSizeProcessor;