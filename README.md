# message-ff

Full implementation of a Message Formatting Framework, it'll help you format messages with its contents using an intuitive language for type definitions.

This module implements an AST Parser written in JavaScript which uses a C api to generate an AST from the given text input. So the following code will be received by `ASTParser`, processed, parsed and then generated into containers.

```
type User {
    user -> string id, string name
}
```

The code above declare a single container named `user` which have `id` and `name` properties of type `string`. It means that when schema receive the encoding function for this container, it'll know exactly what each property to expect, encode or decode.

## Usage

This module comes in two ways:

### Schema-dependent plain objects

This option should be used if you want to stay away from generating code and want something more compact.

Use a schema (inheritance or plain class from [schema/index.ts](src/schema/index.ts)) and submitting objects that will be transformed into binary or binary that will be transformed into objects. (Pay attention into `getContainerName`, `getContainerParams` and `createObject` methods if you want to understand how these objects are created or how the schema understand them). See usage below:

```ts
import { btc, Schema, ASTParser } from 'message-ff';

const parser = new ASTParser(btc.parse(`
    alias ObjectId = StrictSize<string, 24>;
    alias Date = int32;
    type User {
        user {
            string id;
            Vector<Post> posts;
        }
    }
    type Post {
        post -> ObjectId id, string body, Date createdAt;
    }
`), {
    directory: __dirname,
    containers: [],
    namespaceSeparator: '.'
});

parser.parse();

const post = ['post', {
    id: '859f1c26f66e73a7b9a0250b',
    body: 'simple post',
    date: 1527481356
}];

const schema = new Schema(parser.containers);

// Encode object in binary format
conts buffer = schema.encode(['user', {
    id: '2',
    posts: [
        post
    ]
}]);

// Decode it to it's human readable state
assert.deepEqual(schema.decode(buffer), ['user', {
    id: '2',
    posts: [
        post
    ]
}]);
```

### Automatically-generated TypeScript classes

This is a second way of using the language in your advantage. The `CodeGenerator` class will generate several TypeScript classes that you can not only use to take advantage of type-safety classes provided by TypeScript language, but also encode, decode and use some immutable utility method available on each class.

The `CodeGenerator` class will take care of analyzing the AST and generating a compatible code. Remember that all container types are going to become `T${typeName}` and container names are going to have first letter upper cased.

See usage [here](test/code-generator.ts).

### Automatically-generated TypeScript interfaces

You can also tweak CodeGenerator class a little bit so it'll just generate simple TypeScript interfaces and you won't have to deal with any additional generated code on your final JavaScript build. This might be huge gain for those developing applications to run in a web browser or are worried about file size for some other reason.

```ts
import { btc } from 'message-ff';
import * as fs from 'fs';
import ASTPreprocessor from 'message-ff/lib/ast-parser/ast-preprocessor';
import { CodeGenerator } from 'message-ff/lib/code-generator';
import EmptyCodeGenerator from 'message-ff/lib/code-generator/empty-code-generator';
import ContainerDeclarationInterfaceGenerator from 'message-ff/lib/code-generator/container-declaration-interface-generator';
import ContainerGroupInterfaceGenerator from 'message-ff/lib/code-generator/container-group-interface-generator';

const nodes = btc.parse(fs.readFileSync(path.resolve(__dirname, '../test/schema.txt'), 'utf8'));
const preprocessor = new ASTPreprocessor(nodes, {
    directory: path.resolve(__dirname, '../test')
});
const cg = new CodeGenerator(preprocessor.getResult());

// ignore Util class
cg.generators.set('utilClass', new EmptyCodeGenerator(cg));
// ignore DataContainer class
cg.generators.set('dataContainer', new EmptyCodeGenerator(cg));
// ignore message-ff and other imports
cg.generators.set('importsDeclaration', new EmptyCodeGenerator(cg));
cg.generators.set('containerDeclaration', new ContainerDeclarationInterfaceGenerator(cg));
cg.generators.set('containerGroup', new ContainerGroupInterfaceGenerator(cg));

fs.writeFileSync(path.resolve(__dirname, '../src/schema.ts'), cg.generate());
```

This will give you the opportunity of type guarding your code without having the hassle of having more code on your final build. Click [here](test/schema-interfaces.ts) to see the final result of the script above.

## Building from source
```
git clone https://github.com/VictorQueiroz/mff.git
cd mff
git submodule update --init --recursive
```

Still don't know what the heck am I talking about? Try the [FAQ](https://github.com/VictorQueiroz/mff/wiki/Frequently-Asked-Questions) article.