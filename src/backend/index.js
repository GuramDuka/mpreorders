//------------------------------------------------------------------------------
//import AbortController from 'abortcontroller-polyfill';
import root from '../lib/root';
import { serializeURIParams, randomInteger } from '../lib/util';
import disp, { getStore } from '../lib/store';
import { stringify, destringify } from '../lib/json';
//------------------------------------------------------------------------------
// nginx proxy configuration
// proxy_cache_path /var/cache/nginx/ram use_temp_path=off keys_zone=ram:4M inactive=1d max_size=1024M;

// upstream mpreorders_backend_upstream {
// 	keepalive 8;
// 	server 31.210.212.158:65480 weight=1;
// 	server 213.109.6.191:65480 weight=5;
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

// 	# https://nginx.ru/ru/docs/http/ngx_http_upstream_module.html#keepalive
// 	proxy_http_version 1.1;
// 	#proxy_set_header Connection "Keep-Alive";
// 	proxy_set_header Connection "";
// 	proxy_read_timeout     600;
// 	proxy_connect_timeout  600;

// 	proxy_redirect off;
// 	proxy_buffering on;
// 	sendfile on;
// 	tcp_nopush on;
// 	proxy_cache_lock on;
// 	proxy_cache_lock_timeout 1h;
// 	proxy_cache_use_stale updating;
// 	proxy_cache_methods GET HEAD;
// 	proxy_cache ram;
// 	proxy_cache_key "$proxy_host$uri$is_args$args";
// 	proxy_cache_revalidate off;
// 	proxy_max_temp_file_size 4m;

// 	#gzip               off;
// 	#gzip_http_version  1.0;
// 	#gzip_vary          on;
// 	#gzip_min_length    512;
// 	#gzip_comp_level    3;
// 	#gzip_proxied       any;
// 	#gzip_types         text/plain text/css text/javascript application/javascript application/json application/x-javascript text/xml application/xml application/xml+rss;

// 	#proxy_set_header 'Service-Worker-Allowed' '/';
// 	#add_header 'Service-Worker-Allowed' '/';
// 	#add_header 'Access-Control-Allow-Origin' '*';
// 	#proxy_set_header 'Access-Control-Allow-Origin' '*';
// }
//------------------------------------------------------------------------------
//const BACKEND_URL = 'http://31.210.212.158:65480/opt/hs/react';
const BACKEND_URL = 'https://shintorg48.ru/mpreorders/api/backend';
export default BACKEND_URL;
//------------------------------------------------------------------------------
const mustRefreshUrlsItemName = 'must-refresh-urls';
const mustRefreshUrls = (() => {
	const u = root.localStorage
		&& root.localStorage.getItem(mustRefreshUrlsItemName);

	if (u)
		return destringify(u);

	return {};
})();
//------------------------------------------------------------------------------
const ma0 = /max-age/gi;
const ma1 = /max-age|[= ]/gi;
//------------------------------------------------------------------------------
function getMaxAge(opts) {
	let xMaxAge = opts.responseHeaders.get('cache-control');

	if (xMaxAge) {
		xMaxAge = xMaxAge && xMaxAge.split(',').find(v => v.match(ma0));
		xMaxAge = xMaxAge && xMaxAge.replace(ma1, '');
		xMaxAge = ~~xMaxAge; // fast convert string to integer
	}

	return xMaxAge;
}
//------------------------------------------------------------------------------
export function bfetch(opts, success, fail, start) {
	if (opts.method === undefined)
		opts.method = 'GET';

	if (opts.credentials === undefined)
		opts.credentials = 'omit';

	if (opts.mode === undefined)
		opts.mode = 'cors';

	if (opts.cache === undefined)
		opts.cache = 'default';

	const r = {};

	// antipattern, but only as an exception and it is the fastest method
	const store = getStore();

	// send auth data
	const auth = store.getIn('auth');
	const authorized = auth && auth.authorized && !opts.noauth;

	// need for caching authorized request separate from regular not authorized
	if (opts.r)
		r.r = opts.r;

	if (authorized && opts.a === true)
		r.a = true;
	else if (authorized && opts.a === '')
		r.a = auth.link;

	if (authorized && auth.employee && opts.e === true)
		r.e = true;
	else if (authorized && auth.employee && opts.e === '')
		r.e = auth.employee;

	let headers = opts.headers;

	if (r.a || r.e) {
		headers = headers ? headers : new Headers();
		headers.append('X-Access-Data', auth.link + ', ' + auth.hash);
	}

	if (opts.rmod)
		opts.rmod(r);

	opts.url = BACKEND_URL;

	if (opts.method === 'GET') {
		// find and remove expired urls
		{
			const now = (new Date()).getTime();
			let modified = false;

			for (const k of Object.keys(mustRefreshUrls))
				if (mustRefreshUrls[k] <= now) {
					delete mustRefreshUrls[k];
					modified = true;
				}

			if (modified) {
				if (Object.keys(mustRefreshUrls).length === 0)
					root.localStorage.removeItem(mustRefreshUrlsItemName);
				else
					root.localStorage.setItem(
						mustRefreshUrlsItemName,
						stringify(mustRefreshUrls));
			}
		}
	
		opts.url += '?' + serializeURIParams(r);
		// special handling for data updated in previous requests, need fetch fresh data
		let endOfLife = mustRefreshUrls[opts.url];

		if (endOfLife !== undefined)
			opts.u = '&u=' + endOfLife;
	}
	else if (opts.method === 'PUT')
		opts.body = JSON.stringify(r.r);

	if (headers && !headers.entries().next().done)
		opts.headers = headers;

	try {
		// eslint-disable-next-line
		eval('opts.controller = new AbortController()');
	}
	catch (e) {
		opts.controller = { abort: () => true };
	}
	//opts.signal = opts.controller.signal;
	opts.promise = fetch(opts.url + (opts.u ? opts.u : ''), opts).then(response => {
		const contentType = response.headers.get('content-type');

		// check if access denied
		if (!opts.noauth && opts.r && (opts.r.a || opts.r.e)) {
			let xaLink = response.headers.get('x-access-data'), xaEmployee;

			if (xaLink) {
				[xaLink, xaEmployee] = xaLink.split(',');
				xaLink = xaLink.length !== 0 ? xaLink.trim() : undefined;

				if (xaEmployee !== undefined)
					xaEmployee = xaEmployee.trim();
			}

			if (xaLink === null)
				xaLink = undefined;

			// antipattern, but only as an exception and it is the fastest method
			const auth = getStore().getIn('auth');

			if (!auth || auth.link !== xaLink || auth.employee !== xaEmployee)
				disp(store => store.deleteIn('auth.authorized', 2));
		}

		opts.responseHeaders = response.headers;

		if (contentType) {
			if (contentType.includes('application/json'))
				return response.json();
			if (contentType.includes('text/'))
				return response.text();
			if (contentType.includes('image/'))
				return opts.blob
					? response.blob()
					: response.arrayBuffer();
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

		result.date = new Date(opts.responseHeaders.get('date'));

		const eol = opts.responseHeaders.get('End-Of-Life');

		if (eol)
			result.endOfLife = new Date(eol);

		if (opts.refreshUrls) {
			if (Array.isArray(opts.refreshUrls))
				for (const a of opts.refreshUrls)
					for (const k of Object.keys(a))
						mustRefreshUrls[k] = a[k].getTime();
			else
				for (const k of Object.keys(opts.refreshUrls))
					mustRefreshUrls[k] = opts.refreshUrls[k].getTime();

			root.localStorage.setItem(
				mustRefreshUrlsItemName,
				stringify(mustRefreshUrls));
		}
	
		const xMaxAge = getMaxAge(opts);

		if (xMaxAge)
			result.maxAge = xMaxAge;

		success && success(result, opts);
	}).catch(error => {
		fail && fail(error, opts);
	});

	start && start(opts);

	return opts.promise;
}
//------------------------------------------------------------------------------
export function imgReq(...args) {
	const [arg0] = args;
	const r = { m: 'image' };

	if (arg0.constructor === Object || arg0 instanceof Object) {
		for (const k of Object.keys(arg0))
			if (arg0[k] !== undefined)
				r[k] = arg0[k];
	}
	else
		[r.u, r.w, r.h] = args;

	// eslint-disable-next-line
	return { r: r };
}
//------------------------------------------------------------------------------
export function imgUrl(...args) {
	const [arg0] = args;
	const s = BACKEND_URL + '?';
	const r = {};

	if (arg0.constructor === Object || arg0 instanceof Object) {
		for (const k of Object.keys(arg0))
			r[k] = arg0[k];
	}
	else
		[r.u, r.w, r.h] = args;

	return s + serializeURIParams(imgReq(r));
}
//------------------------------------------------------------------------------
export function imgKey(...args) {
	const r = imgReq(...args).r;
	const { u, w, h } = r;

	delete r.m;
	delete r.u;
	delete r.w;
	delete r.h;

	let key = 'i' + u.replace(/-/g, '');

	if (w !== undefined)
		key += '_' + w;

	if (h !== undefined) {
		if (w === undefined)
			key += '_';
		key += 'x' + h;
	}

	for (const k of Object.keys(r))
		if (r[k] !== undefined)
			key += '_' + k + '_' + r[k];

	return key;
}
//------------------------------------------------------------------------------
