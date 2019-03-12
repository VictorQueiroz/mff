export interface ICommentDecorator {
    name: string;
    args: string[];
}

/**
 * Processes decorators that are set up through
 * comments
 */
export default class CommentDecoratorProcessor {
    /**
     * Allowed characters in decorator or
     * decorator argument
     */
    private allowedCharacters = /[a-zA-Z0-9\_\.]/;
    private offset = 0;
    constructor(private comments: string[]) {

    }
    public find() {
        const decorators = new Array<ICommentDecorator>();
        const { comments, allowedCharacters } = this;

        for(const comment of comments) {
            while(this.offset < comment.length) {
                this.offset = comment.indexOf('@', this.offset);
                if(this.offset === -1) {
                    break;
                }
                ++this.offset;
                let decorator = '';
                let i;
                for(i = this.offset; i < comment.length; i++) {
                    if(!allowedCharacters.test(comment[i])) {
                        decorator = comment.substring(this.offset, i);
                        break;
                    }
                }
                this.offset = i;
                const args = new Array<string>();
                for(i = this.offset; i < comment.length; i++) {
                    const endOfString = i === (comment.length - 1);
                    if(!allowedCharacters.test(comment[i]) || endOfString) {
                        if(endOfString) {
                            ++i;
                        }
                        const arg = comment.substring(this.offset, i);
                        if(arg.trim() !== '') {
                            args.push(arg.trim());
                        }
                        this.offset = i;
                    }
                    const ch = comment.charCodeAt(i);
                    if(this.chIsEndOfLine(ch)) {
                        i++;
                        break;
                    }
                }
                decorators.push({
                    name: decorator,
                    args
                });
                this.offset = i;
            }
        }

        return decorators;
    }
    private chIsEndOfLine(ch: number) {
        if(ch === 10) { // \n Line break
            return true;
        }
        return false;
    }
}