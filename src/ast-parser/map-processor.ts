import TemplateProcessor from "./template-processor";
import { Param } from "./param";
import { Node } from "./node";

export default class MapProcessor extends TemplateProcessor<Param> {
    process(args: Node[]) {
        if(args.length != 2)
            throw new Error('Map should have two arguments');

        return args.map(arg => this.parser.parseParamType(arg));
    }
}