import * as t from '@babel/types';
import CodeGenerator from './index';
import { Container } from '../ast-parser/constants';

export interface ReferenciesList {
    [s: string]: t.TSTypeReference[]
}

/**
 * Generate AST for container class
 */
export default class ContainerClassCreator {
    generator: CodeGenerator;

    constructor(generator: CodeGenerator) {
        this.generator = generator;
    }

    /**
     * Convert container name slices into a real AST path
     */
    slicesToTsQualifiedName(slices: string[]): t.TSQualifiedName | t.Identifier {        
        if(slices.length < 2)
            return t.identifier(slices[0]);

        let i = 0;
        let result: t.TSQualifiedName | t.Identifier = t.tsQualifiedName(t.identifier(slices[i++]), t.identifier(slices[i++]));

        while(i < slices.length) {
            result = t.tsQualifiedName(result, t.identifier(slices[i++]));
        }

        return result;
    }

    getTsQualifiedContainerType(container: Container, separator: string) {
        return this.slicesToTsQualifiedName(container.type.split(separator));
    }

    generate(separator: string): t.Declaration[] {
        const containerNameProperty = t.classProperty(t.identifier('__container_name'), null);
        containerNameProperty.typeAnnotation = t.tsTypeAnnotation(t.tsStringKeyword());
        containerNameProperty.accessibility = 'private';

        const body: (t.ClassMethod | t.ClassProperty)[] = [
            containerNameProperty
        ];

        const containers = this.generator.getContainers();

        for(let i = 0; i < containers.length; i++) {
            const container = containers[i];
            const slices = container.name.split(separator);
            const reference = t.tsTypeReference(
                this.slicesToTsQualifiedName(slices)
            );

            // TODO: check why babel types ignore the fact that body can be null
            body.push(<any>{
                ...t.classMethod('method', t.identifier('instanceOf'), [
                    {...t.identifier('name'), typeAnnotation: t.tsTypeAnnotation(t.tsLiteralType(t.stringLiteral(container.name)))}
                ], t.blockStatement([])),
                body: null,
                returnType: t.tsTypeAnnotation(t.tsTypePredicate(t.tsThisType(), t.tsTypeAnnotation(reference)))
            });
        }

        for(let i = 0; i < containers.length; i++) {
            const container = containers[i];
            const reference = t.tsTypeReference(this.getTsQualifiedContainerType(container, separator));

            // TODO: check why babel types ignore the fact that body can be null
            body.push(<any>{
                ...t.classMethod('method', t.identifier('instanceOf'), [
                    {...t.identifier('name'), typeAnnotation: t.tsTypeAnnotation(t.tsLiteralType(t.stringLiteral(container.type)))}
                ], t.blockStatement([])),
                body: null,
                returnType: t.tsTypeAnnotation(t.tsTypePredicate(t.tsThisType(), t.tsTypeAnnotation(reference)))
            });
        }

        body.push(t.classMethod('method', t.identifier('instanceOf'), [{
            ...t.identifier('name'),
            typeAnnotation: t.tsTypeAnnotation(t.tsStringKeyword())
        }], t.blockStatement([
            t.ifStatement(
                t.binaryExpression('==', 
                    t.memberExpression(t.thisExpression(), t.identifier('__container_name')),
                    t.identifier('name')
                ),
                t.returnStatement(t.booleanLiteral(true)),
            ),
            t.returnStatement(t.booleanLiteral(false))
        ])));

        body.push(t.classMethod('constructor', t.identifier('constructor'), [
            {...t.identifier('name'), typeAnnotation: t.tsTypeAnnotation(t.tsStringKeyword())}
        ], t.blockStatement([
            t.expressionStatement(t.assignmentExpression('=', 
                t.memberExpression(t.thisExpression(), t.identifier('__container_name')),
                t.identifier('name')
            ))
        ])));

        const declaration = t.classDeclaration(t.identifier('Container'), null, t.classBody(body));

        return [
            t.exportNamedDeclaration(declaration, [])
        ];
    }
}