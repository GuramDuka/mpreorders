﻿let re = new RegExp('^category\\.(.*)\\.order$', 'g');
re = /^category\.(.*)\.order$/g;
let s = 'category.1234.order';
console.log(re.exec(s));
console.log(s.replace(re, '$1'));
console.log(s.match(re));
console.log(s.search(re));
console.log(/^category\.(.*)\.order$/g);
console.log(new RegExp(re.source, re.flags));
console.log({ source: '1', flags: '2' });
s = 'searchOrderDirection';
console.log(s.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1.$2').toLowerCase());
s = [1,2,3];
console.log(s);
delete s[1];
console.log(JSON.stringify(s));
let obj = { first: 'Jane', last: 'Doe' };
let { first: f, last: l } = obj;
console.log(f, l);