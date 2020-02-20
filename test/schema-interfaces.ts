/* tslint:disable */
import Long from "long";
export namespace comment {
    export type TComment = Comment;
    export interface Comment {
        readonly _id?: 0x9139fedd;
        readonly _type?: "comment.Comment";
        readonly _name: "comment.comment";
        readonly text: string;
    }
}
export type TPost = Post;
export interface Post {
    readonly _id?: 0x4fb6501a;
    readonly _type?: "Post";
    readonly _name: "post";
    readonly id: Long;
    readonly comments: Array<comment.TComment>;
}
export type TUsersResult = UsersResult;
export interface UsersResult {
    readonly _id?: 0xc8c23916;
    readonly _type?: "UsersResult";
    readonly _name: "usersResult";
    readonly users: Map<number, TUser>;
}
export type TUser = User;
export interface User {
    readonly _id?: 0x449fd2ff;
    readonly _type?: "User";
    readonly _name: "user";
    readonly id?: Buffer;
    readonly name: string;
    readonly age?: number;
    readonly address: geo.data.TAddress;
    readonly posts: Array<TPost>;
}
export type TMsg = Msg;
export interface Msg {
    readonly _id?: 0xd3c81697;
    readonly _type?: "Msg";
    readonly _name: "msg";
    readonly id: Long;
    readonly body: Buffer;
}
export namespace geo {
    export type TTURL = URL | URLComplex;
    export interface URL {
        readonly _id?: 0xab01d5d4;
        readonly _type?: "geo.TURL";
        readonly _name: "geo.URL";
        readonly href: string;
    }
    export interface URLComplex {
        readonly _id?: 0x9432f5e;
        readonly _type?: "geo.TURL";
        readonly _name: "geo.URLComplex";
        readonly protocol: string;
        readonly port: number;
    }
    export namespace data {
        export type TAddress = Address | AddressEmpty;
        export interface Address {
            readonly _id?: 0x6c2f09a;
            readonly _type?: "geo.data.Address";
            readonly _name: "geo.data.address";
            /**
             *
             * Address street name
             */
            readonly streetName: string;
            /**
             *
             * Address street number
             */
            readonly streetNumber: number;
            /**
             *
             * Url
             */
            readonly url: TTURL;
        }
        export interface AddressEmpty {
            readonly _id?: 0xa65445ed;
            readonly _type?: "geo.data.Address";
            readonly _name: "geo.data.addressEmpty";
        }
    }
}
/* tslint:enable */
