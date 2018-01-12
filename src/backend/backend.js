//------------------------------------------------------------------------------
import Deque from 'double-ended-queue';
import disp, { store } from './store';
//------------------------------------------------------------------------------
// node_modules\react-scripts\config\webpack.config.prod.js
// new SWPrecacheWebpackPlugin({
// runtimeCaching: [{
//     urlPattern: /^(.*)$/,
//     handler: 'networkFirst'
//   }, {
//   urlPattern: /\/articles\//,
//   handler: 'fastest',
//   options: {
//     cache: {
//       maxEntries: 10,
//       name: 'articles-cache'
//     }
//   }
// }],
// verbose: true
//------------------------------------------------------------------------------
// nginx proxy configuration
// upstream reorders_backend_upstream {
//   # The keepalive parameter sets the maximum number of idle keepalive connections
//   # to upstream servers that are preserved in the cache of each worker process. When
//   # this number is exceeded, the least recently used connections are closed.
//   keepalive 8;
//   server 31.210.212.158:65480;
//   #server 178.210.36.54:65480;
// }
  
// upstream reorders_static_backend_upstream {
//   keepalive 8;
//   server 178.210.36.54:5000;
// }
  
// location ~ ^/reorders/api/backend {
//   #access_log /var/log/nginx/reorders_api_access.log proxy;
//   #error_log /var/log/nginx/reorders_api_error.log debug;
//   #rewrite_log on;

//   rewrite ^/reorders/api/backend(.*)$ /opt/hs/react$1 break;
//   proxy_pass http://reorders_backend_upstream;

//   keepalive_disable msie6;
//   keepalive_requests 1000;
//   keepalive_timeout 600;

//   proxy_set_header Host $host;
//   proxy_set_header X-Real-IP $remote_addr;
//   proxy_set_header X-Real-Port $remote_port;
//   proxy_set_header X-Server-Addr $server_addr;
//   proxy_set_header X-Server-Name $server_name;
//   proxy_set_header X-Server-Port $server_port;

//   proxy_http_version 1.1;
//   proxy_set_header Connection "Keep-Alive";
//   proxy_read_timeout     600;
//   proxy_connect_timeout  600;

//   proxy_redirect off;
//   proxy_buffering on;
//   sendfile on;
//   tcp_nopush on;
//   proxy_cache_lock on;
//   proxy_cache_lock_timeout 1h;
//   proxy_cache_use_stale updating;

//   proxy_set_header 'Service-Worker-Allowed' '/';
//   add_header 'Service-Worker-Allowed' '/';
// }

// location ~ ^/reorders(.*)$ {

//   rewrite ^/reorders(.*)$ $1 break;
//   proxy_pass http://reorders_static_backend_upstream;

//   keepalive_disable msie6;
//   keepalive_requests 1000;
//   keepalive_timeout 600;

//   proxy_set_header Host $host;
//   proxy_set_header X-Real-IP $remote_addr;
//   proxy_set_header X-Real-Port $remote_port;
//   proxy_set_header X-Server-Addr $server_addr;
//   proxy_set_header X-Server-Name $server_name;
//   proxy_set_header X-Server-Port $server_port;

//   proxy_http_version 1.1;
//   proxy_set_header Connection "Keep-Alive";
//   proxy_read_timeout     600;
//   proxy_connect_timeout  600;

//   proxy_redirect off;
//   proxy_buffering on;
//   sendfile on;
//   tcp_nopush on;
//   proxy_cache_lock on;
//   proxy_cache_lock_timeout 1h;
//   proxy_cache_use_stale updating;

//   proxy_set_header 'Service-Worker-Allowed' '/';
//   add_header 'Service-Worker-Allowed' '/';
// }  
//------------------------------------------------------------------------------
// see proxy config in package.json
const pubUrl = process && process.env && process.env.PUBLIC_URL
  && process.env.PUBLIC_URL.constructor === String ? process.env.PUBLIC_URL : '';
const BACKEND_URL = pubUrl + '/api/backend';
//------------------------------------------------------------------------------
export default BACKEND_URL;
let batchJob;
//------------------------------------------------------------------------------
export function bfetch(opts, success, fail, start) {
  if (opts.batch) {
    const b = { ...opts };
    delete b.batch;
    batchJob(b, (bOpts, bSuccess, bFail) => {
      bfetch(bOpts,
        result => bSuccess() && success && success.constructor === Function && success(result),
        error => bFail() && fail && fail.constructor === Function && fail(error),
        start && start.constructor === Function ? sOpts => start(sOpts) : undefined);
    });
    return;
  }

  if (opts.method === undefined)
    opts.method = 'GET';

  if (opts.credentials === undefined)
    opts.credentials = 'omit';

  if (opts.mode === undefined)
    opts.mode = 'cors';

  if (opts.cache === undefined)
    opts.cache = 'default';

  let headers = opts.headers, authData;
  const r = opts.r !== undefined ? { ...opts.r } : undefined;
 
  if (!opts.noauth) {
    // send auth data
    // antipattern, but only as an exception and it is the fastest method
    const auth = store.getState().getIn([], 'auth');

    if (auth && auth.authorized) {
      headers = headers ? headers : new Headers();
      authData = auth.uuid + ', ' + auth.hash;

      if (auth.token)
        authData += ', ' + auth.token;

      headers.append('X-Access-Data', authData);
    }

    // need for caching authorized request separate from regular not authorized
    if (opts.r && auth) {
      if (opts.a === true && auth.authorized)
        r.a = true;
      else if (opts.a === '' && auth.uuid)
        r.a = auth.uuid;

      if (auth.employee) {
        if (opts.e === true)
          r.e = true;
        else if (opts.e === '' && auth.employee)
          r.e = auth.employee;
      }
    }
  }

  if( r !== undefined && opts.rmod && opts.rmod.constructor === Function )
    opts.rmod(r);

  let url = BACKEND_URL;

  if( r !== undefined ) {
    if (opts.method === 'GET' )
      url += '?' + serializeURIParams({r:r});
    else if (opts.method === 'PUT')
      opts.body = JSON.stringify(r);
  }

  // headers = headers ? headers : new Headers();
  // headers.append('Cache-Control', 'no-cache, must-revalidate');
  
  if( headers && !headers.entries().next().done )
    opts.headers = headers;
    
  const fetchId = fetch(url, opts).then(response => {
    const contentType = response.headers.get('content-type');

    // check if access token refreshed
    let xAccessToken = response.headers.get('x-access-token');
    let xAccessTokenTimestamp;
    if (xAccessToken) {
      [xAccessToken, xAccessTokenTimestamp] = xAccessToken.split(',');
      xAccessToken = xAccessToken.length !== 0 ? xAccessToken.trim() : undefined;
      xAccessTokenTimestamp = ~~xAccessTokenTimestamp.trim();
    }
    // antipattern, but only as an exception and it is the fastest method
    //const state = store.getState();

    disp(state => state.editIn([], 'auth', v => {
      if (xAccessToken) {
        if( xAccessToken !== v.token || xAccessTokenTimestamp > v.timestamp ) {
          v.token = xAccessToken;
          v.timestamp = xAccessTokenTimestamp;
        }
      }
      else {
        delete v.token;
        delete v.timestamp;
        delete v.authorized;
      }
    }), true);

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
      (result.constructor !== Object && result.constructor !== Array && result.constructor !== ArrayBuffer))
      throw new TypeError('Oops, we haven\'t got data! ' + result);

    success && success.constructor === Function && success(result, opts);
  }).catch(error => {
    if (process.env.NODE_ENV === 'development')
      console.log(error);

    fail && fail.constructor === Function && fail(error, opts);
  });

  start && start.constructor === Function && start(opts);

  return fetchId;
}
//------------------------------------------------------------------------------
export function imgR(u, w, h, cs, jq) {
  const r = { m: 'img', u: u };

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
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class JobsQueue {
  static ldrs = new Deque([1, 1]);
  static reqs = new Deque([]);

  static end() {
    JobsQueue.ldrs.push(1);
    JobsQueue.queue();
    return true;
  }

  static queue() {
    for (; ;) {
      const job = JobsQueue.reqs.shift();

      if (job === undefined)
        break;

      const ldr = JobsQueue.ldrs.shift();

      if (ldr === undefined) {
        JobsQueue.reqs.push(job);
        setZeroTimeout(JobsQueue.queue);
        break;
      }

      job.launcher(job.opts, JobsQueue.end,
        // eslint-disable-next-line
        () => {
          if (job.n !== 0) {
            job.n--;
            JobsQueue.reqs.push(job);
            return false;
          }
          return JobsQueue.end();
        }
      );
    }
  }
}
//------------------------------------------------------------------------------
batchJob = function (opts, launcher) {
  JobsQueue.reqs.push({
    opts: opts,
    launcher,
    n: 3
  });
  JobsQueue.queue();
}
//------------------------------------------------------------------------------
