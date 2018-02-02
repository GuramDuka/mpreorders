//------------------------------------------------------------------------------
//import wog from 'window-or-global';
import 'whatwg-fetch';
//import 'abortcontroller-polyfill';
import { copy, serializeURIParams } from '../lib/util';
import disp, { getStore } from '../lib/store';
//------------------------------------------------------------------------------
// nginx proxy configuration
// proxy_cache_path /var/cache/nginx/ram use_temp_path=off keys_zone=ram:4M inactive=1d max_size=1024M;

// upstream mpreorders_backend_upstream {
// 	# The keepalive parameter sets the maximum number of idle keepalive connections
// 	# to upstream servers that are preserved in the cache of each worker process. When
// 	# this number is exceeded, the least recently used connections are closed.
// 	keepalive 8;
// 	server 31.210.212.158:65480;
// 	#server 178.210.36.54:65480;
// }

// location ~ ^/mpreorders/api/backend {

// 	rewrite ^/mpreorders/api/backend(.*)$ /opt/hs/preact$1 break;
// 	proxy_pass http://mpreorders_backend_upstream;

// 	keepalive_disable msie6;
// 	keepalive_requests 1000;
// 	keepalive_timeout 600;

// 	proxy_set_header Host $host;
// 	proxy_set_header X-Real-IP $remote_addr;
// 	proxy_set_header X-Real-Port $remote_port;
// 	proxy_set_header X-Server-Addr $server_addr;
// 	proxy_set_header X-Server-Name $server_name;
// 	proxy_set_header X-Server-Port $server_port;

// 	proxy_http_version 1.1;
// 	proxy_set_header Connection "Keep-Alive";
// 	proxy_read_timeout     600;
// 	proxy_connect_timeout  600;

// 	proxy_redirect off;
// 	proxy_buffering on;
// 	sendfile on;
// 	tcp_nopush on;
// 	proxy_cache_lock on;
//  proxy_cache_lock_timeout 1h;
//  proxy_cache_use_stale updating;
//  proxy_cache_methods GET HEAD;
//  proxy_cache ram;
//  proxy_cache_key "$proxy_host$uri$is_args$args";
//  proxy_cache_revalidate off;
//  proxy_max_temp_file_size 4m;

// 	proxy_set_header 'Service-Worker-Allowed' '/';
// 	add_header 'Service-Worker-Allowed' '/';
// }
//------------------------------------------------------------------------------
//const BACKEND_URL = 'http://31.210.212.158:65480/opt/hs/react';
const BACKEND_URL = 'https://shintorg48.ru/mpreorders/api/backend';
export default BACKEND_URL;
//------------------------------------------------------------------------------
export function bfetch(opts_, success, fail, start) {
	const opts = copy(opts_);

	if (opts.method === undefined)
		opts.method = 'GET';

	if (opts.credentials === undefined)
		opts.credentials = 'omit';

	if (opts.mode === undefined)
		opts.mode = 'cors';

	if (opts.cache === undefined)
		opts.cache = 'default';

	let headers = opts.headers;
	const r = opts.r !== undefined ? { ...opts.r } : undefined;

	if (!opts.noauth) {
		// send auth data
		// antipattern, but only as an exception and it is the fastest method
		const auth = getStore().getIn('auth');

		if (auth.authorized) {
			headers = headers ? headers : new Headers();
			headers.append('X-Access-Data', auth.link + ', ' + auth.hash);
		}

		// need for caching authorized request separate from regular not authorized
		if (opts.r && auth) {
			if (opts.a === true && auth.authorized)
				r.a = true;
			else if (opts.a === '' && auth.link)
				r.a = auth.link;

			if (auth.employee) {
				if (opts.e === true)
					r.e = true;
				else if (opts.e === '' && auth.employee)
					r.e = auth.employee;
			}
		}
	}

	if (r !== undefined && opts.rmod)
		opts.rmod(r);

	let url = BACKEND_URL;

	if (r !== undefined) {
		if (opts.method === 'GET')
			url += '?' + serializeURIParams({ r });
		else if (opts.method === 'PUT')
			opts.body = JSON.stringify(r);
	}

	// headers = headers ? headers : new Headers();
	// headers.append('Cache-Control', 'no-cache, must-revalidate');

	if (headers && !headers.entries().next().done)
		opts.headers = headers;

	const data = {};
	const retv = {};
	try {
		// eslint-disable-next-line
		eval('retv.controller = new AbortController()');
	}
	catch (e) {
		retv.controller = { abort: () => true };
	}
	opts.signal = retv.controller.signal;
	retv.promise = fetch(url, opts).then(response => {
		const contentType = response.headers.get('content-type');

		// check if access denied
		let xaLink = response.headers.get('x-access-data'), xaEmployee;

		if (xaLink) {
			[xaLink, xaEmployee] = xaLink.split(',');
			xaLink = xaLink.length !== 0 ? xaLink.trim() : undefined;

			if (xaEmployee !== undefined)
				xaEmployee = xaEmployee.trim();
		}

		if (xaLink === null)
			xaLink = undefined;

		disp(store => {
			const auth = store.getIn('auth');

			if (auth.link !== xaLink || auth.employee !== xaEmployee)
				store = store.deleteIn('auth.authorized', 2);

			return store;
		});

		data.headers = response.headers;

		if (contentType) {
			if (contentType.includes('application/json'))
				return response.json();
			if (contentType.includes('text/'))
				return response.text();
			if (contentType.includes('image/'))
				return response.arrayBuffer();
		}

		// will be caught below
		throw new TypeError('Oops, we haven\'t right type of response! Status: '
			+ response.status + ', ' + response.statusText + ', content-type: ' + contentType);
	}).then(result => {
		if (result === undefined || result === null ||
			!(result.constructor === Object || result instanceof Object
				|| Array.isArray(result)
				|| result.constructor === ArrayBuffer || result instanceof ArrayBuffer))
			throw new TypeError('Oops, we haven\'t got data! ' + result);

		result.date = new Date(data.headers.get('date'));

		let xMaxAge = data.headers.get('cache-control');
		xMaxAge = xMaxAge && xMaxAge.split(',').find(v => v.match(/max-age/gi));
		xMaxAge = xMaxAge && xMaxAge.replace(/max-age|[= ]/gi, '');
		result.maxAge = ~~xMaxAge; // fast convert string to integer

		success && success(result, opts);
	}).catch(error => {
		fail && fail(error, opts);
	});

	start && start(opts);

	return retv;
}
//------------------------------------------------------------------------------
export function imgR(u, w, h, cs, jq) {
	const r = { m: 'img', u };

	if (w !== undefined)
		r.w = w;

	if (h !== undefined)
		r.h = h;

	if (cs !== undefined)
		r.cs = cs;

	if (jq !== undefined)
		r.jq = jq;

	return r;
}
//------------------------------------------------------------------------------
export function icoR(u, w, h, cs, jq) {
	return { ...imgR(u, w, h, cs, jq), f: 'ico' };
}
//------------------------------------------------------------------------------
export function icoUrl(u, w, h, cs, jq) {
	return BACKEND_URL + '?' + serializeURIParams({ r: icoR(u, w, h, cs, jq) });
}
//------------------------------------------------------------------------------
export function imgUrl(u) {
	return BACKEND_URL + '?' + serializeURIParams({ r: imgR(u) });
}
//------------------------------------------------------------------------------
