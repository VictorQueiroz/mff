import { test } from 'sarg';
import { geo, Util, UsersResult, TUser, User, TUsersResult } from './schema';
import { Serializer, Deserializer } from '../src';
import { expect } from 'chai';
import { randomBytes } from 'crypto';

test('it should encode and decode constructor', () => {
    const s = new Serializer();
    new geo.URL({
        href: 'https://www.google.com.br'
    }).encode(s);
    const url = geo.URL.decode(new Deserializer(s.getBuffer()));
    expect(url.href).to.be.equal('https://www.google.com.br');
});

test('it should not clone when property content hasn\'t changed', () => {
    const url = new geo.URL({
        href: 'https://www.google.com.br'
    });
    expect(url.copy({ href: 'https://www.google.com.br' })).to.be.equal(url);
});

test('it should clone when a property change', () => {
    const address = new geo.data.Address({
        url: new geo.URL({
            href: 'https://www.blomvastgoed.com'
        }),
        streetNumber: 4465,
        streetName: 'Mulberry Avenue'
    });
    expect(address.copy({ streetNumber: 4464 })).to.not.be.equal(address);
});

test('it should decode containers using Util class', () => {
    const serializer = new Serializer();
    new geo.URL({
        href: 'https://www.google.com.br'
    }).encode(serializer, false);
    const deserializer = new Deserializer(serializer.getBuffer());
    const decoded = new Util().decode(deserializer);
    if(!(decoded instanceof geo.URL)) {
        throw new Error('Invalid type');
    }
    expect(decoded.href).to.be.deep.equal(new geo.URL({
        href: 'https://www.google.com.br'
    }).href);
});

test('it should work with Map<K, V>', () => {
    const users = new Map<number, TUser>();
    for(let j = 0; j < 256*256; j++) {
        users.set(j, new User({
            name: randomBytes(8).toString('hex'),
            posts: [],
            address: new geo.data.AddressEmpty()
        }));
    }
    const result = new UsersResult({
        users
    });
    const serializer = new Serializer();
    result.encode(serializer, false);
    const decoded = TUsersResult.decode(new Deserializer(serializer.getBuffer()));
    if(!(decoded instanceof UsersResult)) {
        throw new Error('Expected UsersResult but got something else');
    }
    let i = 0;
    for(const [key, user] of decoded.users) {
        expect(key).to.be.equal(i);
        const expected = users.get(key);
        if(!expected || !(expected instanceof User) ||
        !(user instanceof User) || !(user.address instanceof geo.data.AddressEmpty)) {
            throw new Error('Items did not match');
        }
        expect({
            name: expected.name,
            age: expected.age,
            posts: []
        }).to.be.deep.equal({
            name: user.name,
            age: user.age,
            posts: []
        });
        i++;
    }
    expect(decoded.users.size).to.be.equal(256*256);
});
