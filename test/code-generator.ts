import { test } from 'sarg';
import { geo, Util } from './schema';
import { Serializer, Deserializer } from '../src';
import { expect } from 'chai';

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
