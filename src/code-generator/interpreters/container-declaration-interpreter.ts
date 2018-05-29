import Interpreter from './interpreter';
import {
    Node,
    NodeContainerParam,
    NodeTemplate,
    NodeContainerDeclaration,
    NodeIdentifier,
    NodeMemberExpression
} from '../../ast-parser/node';
import * as t from '@babel/types';
import { Generics, Syntax } from '../../ast-parser/constants';

/**
 * Transform container declaration into 
 * TypeScript code
 */
export default class ContainerDeclarationInterpreter extends Interpreter<NodeContainerDeclaration> {
    processContainerParams(params: Node[]) {
        const result = [];
        for(let i = 0; i < params.length; i++) {
            const node = params[i];

            if(node.type != Syntax.ContainerParam)
                continue;

            result.push(this.processContainerParam(node));
        }
        return result;
    }

    getClassDeclarationName(node: NodeContainerDeclaration): t.Identifier {
        return t.identifier(node.name);
    }

    interpret(node: NodeContainerDeclaration) {
        const classBody = this.processContainerParams(node.body);
        const body = node.body.reduce((results, item) => {
            if(item.type == Syntax.ContainerParam) {
                const signature = t.tsPropertySignature(t.identifier(item.name));
                const type = this.processParamType(item.paramType, signature);

                signature.typeAnnotation = t.tsTypeAnnotation(type);

                return results.concat([signature]);
            }
            return results;
        }, <t.TSPropertySignature[]>[]);

        this.createContainerMethods(node, classBody);

        const paramsInterface = t.tsInterfaceDeclaration(t.identifier(`${node.name}Params`), null, null, t.tsInterfaceBody(body));
        const classDeclaration = t.classDeclaration(this.getClassDeclarationName(node), t.identifier('Container'), t.classBody(classBody));
        const container = this.generator.getContainer(node.name);

        if(!container)
            throw new Error('Container not found');

        return [
            t.exportNamedDeclaration(paramsInterface, []),
            t.exportNamedDeclaration(classDeclaration, []),
            t.expressionStatement(t.callExpression(
                t.memberExpression(t.identifier('schema'), t.identifier('registerContainerExistence')),
                [t.stringLiteral(container.name), t.numericLiteral(container.id), t.identifier(node.name)]
            ))
        ];
    }

    createContainerMethods(node: NodeContainerDeclaration, body: Array<t.ClassMethod | t.ClassProperty | t.ClassPrivateProperty | t.TSDeclareMethod | t.TSIndexSignature>) {
        const paramsLength = node.body.reduce((total, node) => {
            if(node.type == Syntax.ContainerParam)
                return total + 1;

            return total;
        }, 0);
        const constructorParams = [];

        if(paramsLength > 0) {
            constructorParams.push({
                ...t.identifier('params'),
                typeAnnotation: t.tsTypeAnnotation(t.tsTypeReference(t.identifier(node.name + 'Params')))
            });
        }

        const paramsAssignment = node.body.reduce((body, param) => {
            if(param.type != Syntax.ContainerParam)
                return body;

            const left = t.memberExpression(
                t.thisExpression(),
                t.identifier(param.name)
            );

            const right = t.memberExpression(
                t.identifier('params'),
                t.identifier(param.name)
            );

            return body.concat([t.expressionStatement(
                t.assignmentExpression('=', left, right))]);
        }, <t.Statement[]>[]);

        const container = this.generator.getContainer(node.name);

        if(!container)
            throw new Error(`Container not found`);

        const containerConstructor = t.classMethod('constructor', t.identifier('constructor'), constructorParams, t.blockStatement([
            t.expressionStatement(t.callExpression((<any>t).super(), [
                t.stringLiteral(container.name)
            ])),
            ...paramsAssignment
        ]));
        body.push(containerConstructor);
    }

    processTemplate(template: NodeTemplate, property: t.ClassProperty | t.TSPropertySignature) {
        const transformer = this.generator.getTemplateTransformer(template.name);

        return transformer.generate(template, property);
    }

    processParamType(paramType: Node, property: t.ClassProperty | t.TSPropertySignature) {
        let type: t.TSType;

        if(paramType.type == Syntax.Identifier) {
            switch(paramType.value) {
                case Generics.String:
                    type = t.tsStringKeyword();
                    break;
                case Generics.Float:
                case Generics.Double:
                case Generics.Int8:
                case Generics.UInt8:
                case Generics.Int32:
                case Generics.Int64:
                case Generics.Int16:
                case Generics.UInt16:
                case Generics.UInt32:
                case Generics.UInt64:
                    type = t.tsNumberKeyword();
                    break;
                case Generics.Boolean:
                    type = t.tsBooleanKeyword();
                    break;
                default:
                    type = t.tsTypeReference(t.identifier(paramType.value));
            }
        } else if(paramType.type == Syntax.MemberExpression) {
            type = t.tsTypeReference(
                this.processMemberExpression(paramType)
            );
        } else if(paramType.type == Syntax.Template) {
            type = this.processTemplate(paramType, property);
        } else {
            throw new Error(`Unexpected param type "${paramType.type}"`);
        }

        return type;
    }

    /**
     * Convert container param to class property
     */
    processContainerParam(param: NodeContainerParam) {
        const name = t.identifier(param.name);
        const paramType = param.paramType;
        const property = t.classProperty(name, null);
        let type: t.TSType = this.processParamType(paramType, property)

        property.typeAnnotation = t.tsTypeAnnotation(type);

        return property;
    }

    processMemberExpression(expr: NodeIdentifier | NodeMemberExpression): t.TSQualifiedName | t.Identifier {
        switch(expr.type) {
            case Syntax.MemberExpression:
                return t.tsQualifiedName(this.processMemberExpression(expr.left), t.identifier(expr.right));
            case Syntax.Identifier:
                return t.identifier(expr.value);
        }
    }
}