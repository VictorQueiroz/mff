import Parser from './index';
import { Syntax } from './constants';

class ContextScanner {
    /**
     * Root parser
     */
    parser: Parser;

    constructor(parser: Parser) {
        this.parser = parser;
    }

    match(expressionPath: string[]) {
        const path = this.parser.path;
        let result: string[][];

        for(let i = path.length - 1; i >= 0; i--) {
            result = this._match(path.slice(0, i).concat(expressionPath));

            if(result.length)
                return result;
        }

        return this._match(expressionPath);
    }

    _match(expressionPath: string[]) {
        const matches = [];
        let body = this.parser.ast;
        let expressionIndex = 0;
        const path: string[] = [];

        bodyLoop:
        while(true) {
            for(let i = 0; i < body.length; i++) {
                const item = body[i];

                if(expressionIndex == (expressionPath.length - 1)) {
                    if(item.type != Syntax.ContainerGroup)
                        continue;
                    
                    if(item.name == expressionPath[expressionIndex]) {
                        // collect container declaration names
                        for(let j = 0; j < item.body.length; j++) {
                            const item2 = item.body[j];

                            if(item2.type == Syntax.ContainerDeclaration) {
                                matches.push(path.concat([item2.name]));
                            }
                        }

                        if(matches.length)
                            return matches;
                    } else {
                        for(let j = 0; j < item.body.length; j++) {
                            const item2 = item.body[j];

                            if(item2.type != Syntax.ContainerDeclaration)
                                continue;

                            if(item2.name == expressionPath[expressionIndex])
                                return [path.concat(item2.name)];
                        }
                    }
                    continue;
                }

                if(item.type == Syntax.Namespace && item.name == expressionPath[expressionIndex]) {
                    path.push(item.name);
                    body = item.body;
                    expressionIndex++;
                    continue bodyLoop;
                }
            }

            break;
        }

        return matches;
    }
}

export default ContextScanner;