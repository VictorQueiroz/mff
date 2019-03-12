/* tslint:disable */
import Long from 'long';
import { Serializer, Deserializer } from '/home/victor/Personal/mff/src';
export class Util {
    public decode(deserializer: Deserializer): DataContainer {
        const id = deserializer.readUInt32();
        if(id === 0x9139fedd) {
            return comment.Comment.decode(deserializer, true);
        }
        if(id === 0x4fb6501a) {
            return Post.decode(deserializer, true);
        }
        if(id === 0x449fd2ff) {
            return User.decode(deserializer, true);
        }
        if(id === 0x8f80a490) {
            return Msg.decode(deserializer, true);
        }
        if(id === 0xab01d5d4) {
            return geo.URL.decode(deserializer, true);
        }
        if(id === 0x9432f5e) {
            return geo.URLComplex.decode(deserializer, true);
        }
        if(id === 0x6c2f09a) {
            return geo.data.Address.decode(deserializer, true);
        }
        throw new Error(`No container found with id ${id}`);
    }
}
export abstract class DataContainer {
    public getContainerName = () => this.__name;
    public getContainerId = () => this.__id;
    public abstract encode(serializer: Serializer): void;
    constructor(private __id: number, private __name: string) {}
}
export namespace comment {
        export abstract class TComment extends DataContainer {
            public abstract encode(serializer: Serializer): void;
            public static decode(deserializer: Deserializer): TComment {
                const id = deserializer.readUInt32();
                if(id === 0x9139fedd) {
                    return Comment.decode(deserializer, true);
                }
                throw new Error(`Expected one of 2436497117 ids but got ${id} instead`);
            }
        }
        interface ICommentParams {
            text: string;
        }
        export class Comment extends TComment implements ICommentParams {
            public readonly text: string;
            constructor(params: ICommentParams)
            {
                super(2436497117, "comment.comment");
                this.text = params.text;
            }
            public static decode(deserializer: Deserializer, ignoreHeader = true): Comment {
                if(ignoreHeader !== true) {
                    const id = deserializer.readUInt32();
                    if(2436497117 !== id) {
                        throw new Error(
                            `Invalid container id: Expected 2436497117 but received ${id} instead.`
                        );
                    }
                }
                let v_3638045649 /* text */: string = '';
                v_3638045649 /* text */ = deserializer.readBuffer(deserializer.readUInt32()).toString('utf8');
                return new Comment({
                    "text": v_3638045649 /* text */
                });
            }
            public encode(serializer: Serializer, ignoreHeader = true): void {
                if(ignoreHeader != true) serializer.writeUInt32(2436497117);
                serializer.writeString(this.text);
            }
            public copy(params: Partial<ICommentParams>): Comment {
                let changed = false;
                if(!changed && this.text !== params.text) changed = true;
                if(changed) {
                    return new Comment({
                        ...this,
                        ...params
                    });
                }
                return this;
            }
        }
}
export abstract class TPost extends DataContainer {
    public abstract encode(serializer: Serializer): void;
    public static decode(deserializer: Deserializer): TPost {
        const id = deserializer.readUInt32();
        if(id === 0x4fb6501a) {
            return Post.decode(deserializer, true);
        }
        throw new Error(`Expected one of 1337348122 ids but got ${id} instead`);
    }
}
interface IPostParams {
    id: Long;
    comments: Array<comment.TComment>;
}
export class Post extends TPost implements IPostParams {
    public readonly id: Long;
    public readonly comments: Array<comment.TComment>;
    constructor(params: IPostParams)
    {
        super(1337348122, "post");
        this.id = params.id;
        this.comments = params.comments;
    }
    public static decode(deserializer: Deserializer, ignoreHeader = true): Post {
        if(ignoreHeader !== true) {
            const id = deserializer.readUInt32();
            if(1337348122 !== id) {
                throw new Error(
                    `Invalid container id: Expected 1337348122 but received ${id} instead.`
                );
            }
        }
        let v_4274775460 /* id */: Long;
        let v_3215616698 /* comments */: Array<comment.TComment> = new Array<comment.TComment>();
        v_4274775460 /* id */ = deserializer.readUInt64();
        let v_3651858165 /* comments */ = deserializer.readUInt32();
        let v_3456001784 /* comments */: comment.TComment;
        while(v_3651858165 /* comments */ > 0) {
            v_3456001784 /* comments */ = comment.TComment.decode(deserializer);
            v_3215616698 /* comments */.push(v_3456001784 /* comments */);
            --v_3651858165 /* comments */;
        }
        return new Post({
            "id": v_4274775460 /* id */,
            "comments": v_3215616698 /* comments */
        });
    }
    public encode(serializer: Serializer, ignoreHeader = true): void {
        if(ignoreHeader != true) serializer.writeUInt32(1337348122);
        serializer.writeUInt64(this.id);
        serializer.writeUInt32(this.comments.length);
        for(const item of this.comments) {
            item.encode(serializer);
        }
    }
    public copy(params: Partial<IPostParams>): Post {
        let changed = false;
        if(!changed && this.id !== params.id) changed = true;
        if(!changed && this.comments !== params.comments) changed = true;
        if(changed) {
            return new Post({
                ...this,
                ...params
            });
        }
        return this;
    }
}
export abstract class TUser extends DataContainer {
    public abstract encode(serializer: Serializer): void;
    public static decode(deserializer: Deserializer): TUser {
        const id = deserializer.readUInt32();
        if(id === 0x449fd2ff) {
            return User.decode(deserializer, true);
        }
        throw new Error(`Expected one of 1151324927 ids but got ${id} instead`);
    }
}
interface IUserParams {
    id?: Buffer;
    name: string;
    age?: number;
    address: geo.data.TAddress;
    posts: Array<TPost>;
}
export class User extends TUser implements IUserParams {
    public readonly id?: Buffer;
    public readonly name: string;
    public readonly age?: number;
    public readonly address: geo.data.TAddress;
    public readonly posts: Array<TPost>;
    constructor(params: IUserParams)
    {
        super(1151324927, "user");
        this.id = params.id;
        this.name = params.name;
        this.age = params.age;
        this.address = params.address;
        this.posts = params.posts;
    }
    public static decode(deserializer: Deserializer, ignoreHeader = true): User {
        if(ignoreHeader !== true) {
            const id = deserializer.readUInt32();
            if(1151324927 !== id) {
                throw new Error(
                    `Invalid container id: Expected 1151324927 but received ${id} instead.`
                );
            }
        }
        let v_2755993532 /* id */: Buffer | undefined = undefined;
        let v_231458619 /* name */: string = '';
        let v_3952656601 /* age */: number | undefined = undefined;
        let v_1747845703 /* address */: geo.data.TAddress;
        let v_178372132 /* posts */: Array<TPost> = new Array<TPost>();
        if(deserializer.readUInt8() === 1) {
            v_2755993532 /* id */ = deserializer.readBuffer(deserializer.readUInt32());
        }
        v_231458619 /* name */ = deserializer.readBuffer(deserializer.readUInt32()).toString('utf8');
        if(deserializer.readUInt8() === 1) {
            v_3952656601 /* age */ = deserializer.readUInt32();
        }
        v_1747845703 /* address */ = geo.data.TAddress.decode(deserializer);
        let v_1447721798 /* posts */ = deserializer.readUInt32();
        let v_446206154 /* posts */: TPost;
        while(v_1447721798 /* posts */ > 0) {
            v_446206154 /* posts */ = TPost.decode(deserializer);
            v_178372132 /* posts */.push(v_446206154 /* posts */);
            --v_1447721798 /* posts */;
        }
        return new User({
            "id": v_2755993532 /* id */,
            "name": v_231458619 /* name */,
            "age": v_3952656601 /* age */,
            "address": v_1747845703 /* address */,
            "posts": v_178372132 /* posts */
        });
    }
    public encode(serializer: Serializer, ignoreHeader = true): void {
        if(ignoreHeader != true) serializer.writeUInt32(1151324927);
        const v_89370520 = this.id;
        if(v_89370520) {
            serializer.writeUInt8(1);
            const v_2266915407 /* v_89370520 */ = v_89370520;
            serializer.writeUInt32(v_2266915407 /* v_89370520 */.length);
            serializer.writeBuffer(v_2266915407 /* v_89370520 */);
        }
        else 
        {
            serializer.writeUInt8(0);
        }
        serializer.writeString(this.name);
        const v_2480772569 = this.age;
        if(v_2480772569) {
            serializer.writeUInt8(1);
            serializer.writeUInt32(v_2480772569);
        }
        else 
        {
            serializer.writeUInt8(0);
        }
        this.address.encode(serializer);
        serializer.writeUInt32(this.posts.length);
        for(const item of this.posts) {
            item.encode(serializer);
        }
    }
    public copy(params: Partial<IUserParams>): User {
        let changed = false;
        if(!changed && this.id !== params.id) changed = true;
        if(!changed && this.name !== params.name) changed = true;
        if(!changed && this.age !== params.age) changed = true;
        if(!changed && this.address !== params.address) changed = true;
        if(!changed && this.posts !== params.posts) changed = true;
        if(changed) {
            return new User({
                ...this,
                ...params
            });
        }
        return this;
    }
}
export abstract class TMsg extends DataContainer {
    public abstract encode(serializer: Serializer): void;
    public static decode(deserializer: Deserializer): TMsg {
        const id = deserializer.readUInt32();
        if(id === 0x8f80a490) {
            return Msg.decode(deserializer, true);
        }
        throw new Error(`Expected one of 2407572624 ids but got ${id} instead`);
    }
}
interface IMsgParams {
    body: Buffer;
}
export class Msg extends TMsg implements IMsgParams {
    public readonly body: Buffer;
    constructor(params: IMsgParams)
    {
        super(2407572624, "msg");
        this.body = params.body;
    }
    public static decode(deserializer: Deserializer, ignoreHeader = true): Msg {
        if(ignoreHeader !== true) {
            const id = deserializer.readUInt32();
            if(2407572624 !== id) {
                throw new Error(
                    `Invalid container id: Expected 2407572624 but received ${id} instead.`
                );
            }
        }
        let v_980539595 /* body */: Buffer;
        v_980539595 /* body */ = deserializer.readBuffer(deserializer.readUInt32());
        return new Msg({
            "body": v_980539595 /* body */
        });
    }
    public encode(serializer: Serializer, ignoreHeader = true): void {
        if(ignoreHeader != true) serializer.writeUInt32(2407572624);
        const v_2507323963 /* this.body */ = this.body;
        serializer.writeUInt32(v_2507323963 /* this.body */.length);
        serializer.writeBuffer(v_2507323963 /* this.body */);
    }
    public copy(params: Partial<IMsgParams>): Msg {
        let changed = false;
        if(!changed && this.body !== params.body) changed = true;
        if(changed) {
            return new Msg({
                ...this,
                ...params
            });
        }
        return this;
    }
}
export namespace geo {
        export abstract class TTURL extends DataContainer {
            public abstract encode(serializer: Serializer): void;
            public static decode(deserializer: Deserializer): TTURL {
                const id = deserializer.readUInt32();
                if(id === 0xab01d5d4) {
                    return URL.decode(deserializer, true);
                }
                if(id === 0x9432f5e) {
                    return URLComplex.decode(deserializer, true);
                }
                throw new Error(`Expected one of 2869024212 / 155397982 ids but got ${id} instead`);
            }
        }
        interface IURLParams {
            href: string;
        }
        export class URL extends TTURL implements IURLParams {
            public readonly href: string;
            constructor(params: IURLParams)
            {
                super(2869024212, "geo.URL");
                this.href = params.href;
            }
            public static decode(deserializer: Deserializer, ignoreHeader = true): URL {
                if(ignoreHeader !== true) {
                    const id = deserializer.readUInt32();
                    if(2869024212 !== id) {
                        throw new Error(
                            `Invalid container id: Expected 2869024212 but received ${id} instead.`
                        );
                    }
                }
                let v_1226681949 /* href */: string = '';
                v_1226681949 /* href */ = deserializer.readBuffer(deserializer.readUInt32()).toString('utf8');
                return new URL({
                    "href": v_1226681949 /* href */
                });
            }
            public encode(serializer: Serializer, ignoreHeader = true): void {
                if(ignoreHeader != true) serializer.writeUInt32(2869024212);
                serializer.writeString(this.href);
            }
            public copy(params: Partial<IURLParams>): URL {
                let changed = false;
                if(!changed && this.href !== params.href) changed = true;
                if(changed) {
                    return new URL({
                        ...this,
                        ...params
                    });
                }
                return this;
            }
        }
        interface IURLComplexParams {
            protocol: string;
            port: number;
        }
        export class URLComplex extends TTURL implements IURLComplexParams {
            public readonly protocol: string;
            public readonly port: number;
            constructor(params: IURLComplexParams)
            {
                super(155397982, "geo.URLComplex");
                this.protocol = params.protocol;
                this.port = params.port;
            }
            public static decode(deserializer: Deserializer, ignoreHeader = true): URLComplex {
                if(ignoreHeader !== true) {
                    const id = deserializer.readUInt32();
                    if(155397982 !== id) {
                        throw new Error(
                            `Invalid container id: Expected 155397982 but received ${id} instead.`
                        );
                    }
                }
                let v_1358725288 /* protocol */: string = '';
                let v_3433894430 /* port */: number;
                v_1358725288 /* protocol */ = deserializer.readBuffer(deserializer.readUInt32()).toString('utf8');
                v_3433894430 /* port */ = deserializer.readUInt16();
                return new URLComplex({
                    "protocol": v_1358725288 /* protocol */,
                    "port": v_3433894430 /* port */
                });
            }
            public encode(serializer: Serializer, ignoreHeader = true): void {
                if(ignoreHeader != true) serializer.writeUInt32(155397982);
                serializer.writeString(this.protocol);
                serializer.writeUInt16(this.port);
            }
            public copy(params: Partial<IURLComplexParams>): URLComplex {
                let changed = false;
                if(!changed && this.protocol !== params.protocol) changed = true;
                if(!changed && this.port !== params.port) changed = true;
                if(changed) {
                    return new URLComplex({
                        ...this,
                        ...params
                    });
                }
                return this;
            }
        }
        export namespace data {
                export abstract class TAddress extends DataContainer {
                    public abstract encode(serializer: Serializer): void;
                    public static decode(deserializer: Deserializer): TAddress {
                        const id = deserializer.readUInt32();
                        if(id === 0x6c2f09a) {
                            return Address.decode(deserializer, true);
                        }
                        throw new Error(`Expected one of 113438874 ids but got ${id} instead`);
                    }
                }
                interface IAddressParams {
                    streetName: string;
                    streetNumber: number;
                    url: TTURL;
                }
                export class Address extends TAddress implements IAddressParams {
                    public readonly streetName: string;
                    public readonly streetNumber: number;
                    public readonly url: TTURL;
                    constructor(params: IAddressParams)
                    {
                        super(113438874, "geo.data.address");
                        this.streetName = params.streetName;
                        this.streetNumber = params.streetNumber;
                        this.url = params.url;
                    }
                    public static decode(deserializer: Deserializer, ignoreHeader = true): Address {
                        if(ignoreHeader !== true) {
                            const id = deserializer.readUInt32();
                            if(113438874 !== id) {
                                throw new Error(
                                    `Invalid container id: Expected 113438874 but received ${id} instead.`
                                );
                            }
                        }
                        let v_3762068692 /* streetName */: string = '';
                        let v_2717333464 /* streetNumber */: number = 0;
                        let v_2790903919 /* url */: TTURL;
                        v_3762068692 /* streetName */ = deserializer.readBuffer(deserializer.readUInt32()).toString('utf8');
                        v_2717333464 /* streetNumber */ = deserializer.readUInt32();
                        v_2790903919 /* url */ = TTURL.decode(deserializer);
                        return new Address({
                            "streetName": v_3762068692 /* streetName */,
                            "streetNumber": v_2717333464 /* streetNumber */,
                            "url": v_2790903919 /* url */
                        });
                    }
                    public encode(serializer: Serializer, ignoreHeader = true): void {
                        if(ignoreHeader != true) serializer.writeUInt32(113438874);
                        serializer.writeString(this.streetName);
                        serializer.writeUInt32(this.streetNumber);
                        this.url.encode(serializer);
                    }
                    public copy(params: Partial<IAddressParams>): Address {
                        let changed = false;
                        if(!changed && this.streetName !== params.streetName) changed = true;
                        if(!changed && this.streetNumber !== params.streetNumber) changed = true;
                        if(!changed && this.url !== params.url) changed = true;
                        if(changed) {
                            return new Address({
                                ...this,
                                ...params
                            });
                        }
                        return this;
                    }
                }
        }
}
/* tslint:enable */
