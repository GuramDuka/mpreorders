//------------------------------------------------------------------------------
//var locale = $locutus.php.localeCategories.LC_TIME
const lcTime = undefined;// = $locutus.php.locales[locale].LC_TIME
//------------------------------------------------------------------------------
function _xPad(x, pad, r) {
	if (typeof r === 'undefined')
		r = 10;
	for (; parseInt(x, 10) < r && r > 1; r /= 10)
		x = pad.toString() + x;
	return x.toString();
};
//------------------------------------------------------------------------------
const _formats = {
	a: d => lcTime.a[d.getDay()],
	A: d => lcTime.A[d.getDay()],
	b: d => lcTime.b[d.getMonth()],
	B: d => lcTime.B[d.getMonth()],
	C: d => _xPad(parseInt(d.getFullYear() / 100, 10), 0),
	d: ['getDate', '0'],
	e: ['getDate', ' '],
	// eslint-disable-next-line
	g: d => _xPad(parseInt(_formats.G(d) / 100, 10), 0),
	G: d => {
		let y = d.getFullYear();
		// eslint-disable-next-line
		const V = parseInt(_formats.V(d), 10);
		// eslint-disable-next-line
		const W = parseInt(_formats.W(d), 10);

		if (W > V) {
			y++;
		}
		else if (W === 0 && V >= 52)
			y--;

		return y;
	},
	H: ['getHours', '0'],
	I: d => {
		const iI1 = d.getHours() % 12;
		return _xPad(iI1 === 0 ? 12 : iI1, 0);
	},
	j: d => {
		let ms = d - new Date('' + d.getFullYear() + '/1/1 GMT');
		// Line differs from Yahoo implementation which would be
		// equivalent to replacing it here with:
		ms += d.getTimezoneOffset() * 60000;
		const doy = parseInt(ms / 60000 / 60 / 24, 10) + 1;
		return _xPad(doy, 0, 100);
	},
	k: ['getHours', '0'],
	// not in PHP, but implemented here (as in Yahoo)
	l: d => {
		const l = d.getHours() % 12;
		return _xPad(l === 0 ? 12 : l, ' ');
	},
	m: d => _xPad(d.getMonth() + 1, 0),
	M: ['getMinutes', '0'],
	p: d => lcTime.p[d.getHours() >= 12 ? 1 : 0],
	P: d => lcTime.P[d.getHours() >= 12 ? 1 : 0],
	s: d => Date.parse(d) / 1000, // Yahoo uses return parseInt(d.getTime()/1000, 10);
	S: ['getSeconds', '0'],
	u: d => {
		const dow = d.getDay();
		return ((dow === 0) ? 7 : dow);
	},
	U: d => {
		const doy = parseInt(_formats.j(d), 10);
		const rdow = 6 - d.getDay();
		const woy = parseInt((doy + rdow) / 7, 10);
		return _xPad(woy, 0);
	},
	V: d => {
		// eslint-disable-next-line
		const woy = parseInt(_formats.W(d), 10);
		const dow11 = (new Date('' + d.getFullYear() + '/1/1')).getDay();
		// First week is 01 and not 00 as in the case of %U and %W,
		// so we add 1 to the final result except if day 1 of the year
		// is a Monday (then %W returns 01).
		// We also need to subtract 1 if the day 1 of the year is
		// Friday-Sunday, so the resulting equation becomes:
		let idow = woy + (dow11 > 4 || dow11 <= 1 ? 0 : 1);
		if (idow === 53 && (new Date('' + d.getFullYear() + '/12/31')).getDay() < 4) {
			idow = 1;
		}
		else if (idow === 0) {
			idow = _formats.vV(new Date('' + (d.getFullYear() - 1) + '/12/31'));
		}
		return _xPad(idow, 0);
	},
	w: 'getDay',
	W: d => {
		const doy = parseInt(_formats.j(d), 10);
		const rdow = 7 - _formats.u(d);
		const woy = parseInt((doy + rdow) / 7, 10);
		return _xPad(woy, 0, 10);
	},
	y: d => _xPad(d.getFullYear() % 100, 0),
	Y: 'getFullYear',
	z: d => {
		const o = d.getTimezoneOffset();
		const hH = _xPad(parseInt(Math.abs(o / 60), 10), 0);
		const mM = _xPad(o % 60, 0);
		return (o > 0 ? '-' : '+') + hH + mM;
	},
	Z: d => d.toString().replace(/^.*\(([^)]+)\)$/, '$1'),
	'%': d => '%'
};
//------------------------------------------------------------------------------
const _aggregates = {
	c: 'locale',
	D: '%m/%d/%y',
	F: '%y-%m-%d',
	h: '%b',
	n: '\n',
	r: 'locale',
	R: '%H:%M',
	t: '\t',
	T: '%H:%M:%S',
	x: 'locale',
	X: 'locale'
};
//------------------------------------------------------------------------------
function replaceAggregate(m0, m1) {
	const f = _aggregates[m1];
	return (f === 'locale' ? lcTime[m1] : f);
}
//------------------------------------------------------------------------------
export default function strftime(fmt, timestamp) {
	//       discuss at: http://locutus.io/php/strftime/
	//      original by: Blues (http://tech.bluesmoon.info/)
	// reimplemented by: Brett Zamir (http://brett-zamir.me)
	//         input by: Alex
	//      bugfixed by: Brett Zamir (http://brett-zamir.me)
	//      improved by: Brett Zamir (http://brett-zamir.me)
	//           note 1: Uses global: locutus to store locale info
	//        example 1: strftime("%A", 1062462400); // Return value will depend on date and locale
	//        returns 1: 'Tuesday'

	// var setlocale = require('../strings/setlocale')

	// var $global = (typeof window !== 'undefined' ? window : global)
	// $global.$locutus = $global.$locutus || {}
	// var $locutus = $global.$locutus

	// // ensure setup of localization variables takes place
	// setlocale('LC_ALL', 0)

	// First replace aggregates (run in a loop because an agg may be made up of other aggs)
	while (fmt.match(/%[cDFhnrRtTxX]/))
		fmt = fmt.replace(/%([cDFhnrRtTxX])/g, replaceAggregate);

	// Now replace formats - we need a closure so that the date object gets passed through
	const str = fmt.replace(/%([aAbBCdegGHIjklmMpPsSuUVwWyYzZ%])/g, (m0, m1) => {
		const _date = (typeof timestamp === 'undefined')
			? new Date()
			: (timestamp instanceof Date)
				? new Date(timestamp)
				: new Date(timestamp * 1000);
		const f = _formats[m1];

		if (typeof f === 'string')
			return _date[f]();

		if (typeof f === 'function')
			return f(_date);

		if (typeof f === 'object' && typeof f[0] === 'string')
			return _xPad(_date[f[0]](), f[1]);

		// Shouldn't reach here
		return m1;
	});

	return str;
}
//------------------------------------------------------------------------------
