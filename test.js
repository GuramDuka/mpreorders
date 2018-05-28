let re = new RegExp('^category\\.(.*)\\.order$', 'g');
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
let blob = new Blob([JSON.stringify('444', null, 2)], {type : 'application/json'});
console.log(blob);

function b64ToBlob(b64Data, contentType = '', sliceSize = 512) {
    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      var byteArray = new Uint8Array(byteNumbers);
  
      byteArrays.push(byteArray);
    }
  
    return new Blob(byteArrays, {type: contentType});
}

blob = b64ToBlob('UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoCAAEAAQAcJaQAA3AA/v3AgAA=', 'image/webp');
console.log(blob);

function x(F) {
	if (!F)
		throw Error("assert :P");
}

function V(F) {
	return new Int32Array(F)
}

function Z(a, b, c, d, e) {
	x(2328 >= e);
	if (512 >= e)
		let f = V(512);
	else if (f = V(e),
		null == f)
		return 0;
	return 1;
}

console.log(Z(0, 0));