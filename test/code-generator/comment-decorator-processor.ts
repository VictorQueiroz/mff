import CommentDecoratorProcessor from '../../src/code-generator/comment-decorator-processor';
import { test } from 'sarg';
import { expect } from 'chai';

test('it should process decorator from comments', async () => {
    expect(new CommentDecoratorProcessor([
        `@decorator1 A B C\n@decorator2 D E F`
    ]).find()).to.be.deep.equal([{
        name: 'decorator1',
        args: ['A', 'B', 'C']
    }, {
        name: 'decorator2',
        args: ['D', 'E', 'F']
    }]);
});