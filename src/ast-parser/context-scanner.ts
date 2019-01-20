import Parser from './index';
import { Syntax } from './constants';
import { Node } from './node';

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
    constructor(private parser: Parser) {
    }

    public match(expressionPath: string[]) {
        let result: string[][];
        const path = this.parser.path;

        if(path.length > 0) {
            const ii = path.length;

            for(let i = ii; i >= 0; i--) {
                result = this._match(path.slice(0, i).concat(expressionPath));

                if(result.length)
                    return result;
            }
        }

        return this._match(expressionPath);
    }

    public _match(expressionPath: string[]) {
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

    /**
     * Resolve a type inside a context
     * @param name Container name/container type to look for
     * @param body Body to look for
     * @param namespace Namespace to start from
     */
    public resolveTypeInBody(name: string, body: Node[], namespace: string[]): Node[] {
        const results = new Array<Node>();
        for(const node of body) {
            /**
             * Since the `name` can't point to a namespace
             * we have to ignore if this is not a container name or container group
             */
            if(namespace.length === 0) {
                if(node.type !== Syntax.ContainerGroup && node.type !== Syntax.ContainerDeclaration) {
                    continue;
                }
                if(node.type === Syntax.ContainerGroup) {
                    if(node.name === name) {
                        results.push(node);
                        continue;
                    }
                    for(let item of node.body) {
                        if(item.type === Syntax.TemplateDeclaration) {
                            item = item.body;
                        }
                        if(item.type === Syntax.ContainerDeclaration && item.name === name) {
                            results.push(item);
                            break;
                        }
                    }
                } else if(name === node.name) {
                    results.push(node);
                }
                continue;
            } else if(node.type === Syntax.Namespace) {
                if(node.name === namespace[0]) {
                    results.push(...this.resolveTypeInBody(name, node.body, namespace.slice(1)));
                    continue;
                }
            }
        }
        return results;
    }
}

export default ContextScanner;