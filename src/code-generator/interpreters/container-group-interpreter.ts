import * as t from '@babel/types';
import { Syntax } from '../../ast-parser/constants';
import { NodeContainerGroup } from '../../ast-parser/node';
import Interpreter from './interpreter';

export default class ContainerGroupInterpreter extends Interpreter {
    getAliasDeclarationName(node: NodeContainerGroup): t.Identifier {
        return t.identifier(node.name);
    }

    interpret(node: NodeContainerGroup) {
        const body = node.body.reduce((list, node) => list.concat(this.generator.process(node)), <t.Declaration[]>[]);
        const tsTypes = [];

        for(let i = 0; i < node.body.length; i++) {
            const item = node.body[i];

            if(item.type != Syntax.ContainerDeclaration)
                continue;

            tsTypes.push(t.tsTypeReference(t.identifier(item.name)));
        }

        const typeAliasDeclaration = t.tsTypeAliasDeclaration(this.getAliasDeclarationName(node), null, t.tsUnionType(tsTypes));

        return [
            t.exportNamedDeclaration(typeAliasDeclaration, []),
            ...body
        ];
    }
}