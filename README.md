# message-ff

Full implementation of a Message Format Framework, it'll help you format messages with its contents using an intuitive language for type definitions.

## Usage
```js
import { Schema, ASTParser } from 'message-ff';
import * as crypto from 'crypto';

const parser = new ASTParser({
    text: `
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
    `
}, {
    directory: __dirname,
    containers: [],
    namespaceSeparator: '.'
});

parser.parse();

const schema = new Schema(parser.containers);

schema.encode(['user', {
    id: '2',
    posts: [['post', {
        id: crypto.randomBytes(12).toString('hex'),
        body: '',
        createdAt: Date.now()/1000
    }]]
}]);
```