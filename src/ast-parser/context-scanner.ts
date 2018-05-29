import Parser from './index';
import { Syntax } from './constants';

/**
 * Scan parser context and look for container 
 * matches based on expression path.
 *
 * -- Brief description --
 * An expression path is an array of strings determining a container reference, 
 * either it points directly to a container type (matching various containers) or 
 * it points directly to a single container.
 * 
 * Context scanner will look into AST trying to find namespaces that matches the 
 * given path.
 *
 * TODO: Improve searching algorithm and break it in many parts
 */
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
        let ii = path.length - 1;

        for(let i = ii; i >= 0; i--) {
            result = [path.slice(0, i), path.slice(i)].reduce((result: string[][], path: string[]) => {
                if(result.length > 0)
                    return result;

                return this._match(path.concat(expressionPath));
            }, []);

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