import { NodeContainerGroup } from "../ast-parser/node";
import CodeGeneratorChild from "./code-generator-child";
import ContainerDeclarationGenerator from "./container-declaration-generator";
import { Syntax } from "../ast-parser/constants";

export default class ContainerGroupGenerator extends CodeGeneratorChild {
    public generate(item: NodeContainerGroup): string {
        this.setParentNode(item);
        this.setCurrentNode(item);
        const {write, append, valueOf} = this.cs;
        const interfaceName = `T${this.getInterfaceName(item.name)}`;
        const containerDeclGenerator = this.getGenerator<ContainerDeclarationGenerator>('containerDeclaration');
        write(
            `export abstract class ${interfaceName} extends DataContainer {\n`,
            () => {
                const stubs = new Array<{
                    stubMethod: string;
                    args: string[];
                    returnType: string;
                }>({
                    stubMethod: 'encode',
                    args: ['serializer: Serializer'],
                    returnType: 'void'
                });

                for(const { stubMethod, args, returnType } of stubs) {
                    write(
                        `public abstract ${stubMethod}(${args.join(', ')}): ${returnType};\n`,
                    );
                }

                append(containerDeclGenerator.createToplevelDecodeMethod(item));
            },
            '}\n'
        );

        for(const node of item.body) {
            if(node.type === Syntax.ContainerDeclaration) {
                append(containerDeclGenerator.generate(node));
                continue;
            }
            append(this.processNode(node));
        }

        this.setParentNode(undefined);
        this.setCurrentNode(undefined);
        return valueOf();
    }
}