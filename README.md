# message-ff

Full implementation of a Message Format Framework, it'll help you format messages with its contents using an intuitive language for type definitions.

This module implements an AST Parser written in JavaScript which uses a C api to generate an AST from the given text input. So the following code will be received by `ASTParser`, processed, parsed and then generated into containers.

```
type User {
    user -> string id, string name
}
```

The code above declare a single container named `user` which have `id` and `name` properties of type `string`. It means that when schema receive the encoding function for this container, it'll know exactly what each property to expect, encode or decode.

## Usage

```js
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