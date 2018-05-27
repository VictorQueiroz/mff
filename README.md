# btc-js

## Usage
```js
import { Schema, ASTParser } from 'btc-js';
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