//------------------------------------------------------------------------------
import wog from 'window-or-global';
import Deque from 'double-ended-queue';
//import uuidv1 from 'uuid/v1';
//import * as PubSub from 'pubsub-js';
import setZeroTimeout from '../lib/zerotimeout';
import { defaultState } from '../config';
import { stringify, destringify } from '../lib/json';
import { shallowEqual } from '../lib/util';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class State { // must be singleton
	topic = 'STORE'
	actions = new Deque([])
	trailers = []
	topicsSubscribers = new Map()
	rTopicsSubscribers = new Map()
	subscribers = new Map()
	pushedSubscribers = new Map()

	constructor() {
		this.restore();
	}

	publish() {
		const { pushedSubscribers } = this;

		for (const [functor, msgs] of pushedSubscribers.entries())
			functor(msgs, this);

		// clear messages
		delete this.messages;
		pushedSubscribers.clear();

		return this;
	}

	pushTopicMessages(vPath, sPath, topicSubscribers, rPath, r, functor) {
		let msg, t = functor ? [functor] : Array.from(topicSubscribers.values());

		for (const subscriber of t) {
			const data = this.subscribers.get(subscriber);

			if (data === undefined)
				throw new Error('invalid subscriber');

			const validator = data.validators[rPath], valid = validator === undefined ? true :
				validator.constructor === Function || validator instanceof Function
					? validator(sPath.replace(r, '$1'), sPath, r)
					: sPath === validator;

			if (!valid)
				continue;

			if (msg === undefined) {
				let i = this.mutatedPaths[sPath];

				if (i === undefined)
					this.mutatedPaths[sPath] = i = this.messages.length;

				const v = vPath[vPath.length - 1];
				const { key, node } = v;

				this.messages[i] = msg = { ...v, path: sPath, value: node[key] };
			}

			let msgs = this.pushedSubscribers.get(subscriber);

			if (msgs === undefined)
				this.pushedSubscribers.set(subscriber, msgs = {});

			const path = rPath ? rPath : sPath;
			const alias = data.aliases[path];

			if (alias === undefined)
				msgs[path] = msg;
			else
				msgs[alias] = msg.value;
		}

		return this;
	}

	publishPath(vPath, functor) {
		// call not from inside disp
		// antipattern, but only as an exception and it is the fastest method
		// now this happens only from backend bfetch function for auth
		if (this.mutatedPaths === undefined)
			return;

		let sPath = '';

		for (const v of vPath)
			sPath += '.' + v.key;

		sPath = sPath.substr(1);

		let topicSubscribers = this.topicsSubscribers.get(sPath);

		// if no one is subscribed to this path then search within regexp subscribers
		if (topicSubscribers === undefined) {
			for (const [p, r] of this.rTopicsSubscribers.entries())
				if (r.test(sPath))
					this.pushTopicMessages(vPath, sPath, this.topicsSubscribers.get(p), p, r, functor);
			return this;
		}

		return this.pushTopicMessages(vPath, sPath, topicSubscribers, undefined, undefined, functor);
	}

	subscribe(functor, path, alias, validator) {
		if (functor === undefined || functor === null)
			throw new Error('invalid subscriber');

		if (functor.constructor === Map || functor instanceof Map) {
			for (const [key, value] of functor.entries())
				this.subscribe(key, value);
			return this;
		}

		if (Array.isArray(path)) {
			for (const data of path)
				this.subscribe(functor, data);
			return this;
		}

		if (path === undefined || path === null)
			throw new Error('invalid path');

		if (!(functor.constructor === Function || functor instanceof Function))
			throw new Error('invalid subscriber');

		let t;

		if (path.constructor === RegExp || path instanceof RegExp) {
			const p = stringify({ source: path.source, flags: path.flags });

			t = this.topicsSubscribers.get(p);

			if (t === undefined) {
				this.rTopicsSubscribers.set(p, new RegExp(path.source, path.flags));
				this.topicsSubscribers.set(p, t = new Set());
			}
			path = p;
		}
		else if (path.constructor === Object || path instanceof Object) {
			return this.subscribe(functor, path.path, path.alias, path.validator);
		}
		else {
			t = this.topicsSubscribers.get(path);

			if (t === undefined)
				this.topicsSubscribers.set(path, t = new Set());
		}

		if (t.has(functor))
			throw new Error('subscriber already subscribed');

		t.add(functor);

		t = this.subscribers.get(functor);

		if (t === undefined)
			this.subscribers.set(functor, t = {
				aliases: {},
				validators: {},
				topics: 0
			});

		t.aliases[path] = alias;
		t.validators[path] = validator;
		t.topics++;

		return this;
	}

	unsubscribe(functor, path) {
		if (functor === undefined || functor === null)
			throw new Error('invalid subscriber');

		if (functor.constructor === Map || functor instanceof Map) {
			for (const [key, value] of functor.entries())
				this.unsubscribe(key, value);
			return this;
		}

		if (Array.isArray(path)) {
			for (const data of path)
				this.unsubscribe(functor, data);
			return this;
		}

		const s = this.subscribers.get(functor);

		if (!s)
			throw new Error('subscriber not subscribed');

		if (path === undefined || path === null) {
			for (const p of Object.keys(s.aliases))
				this.unsubscribe(functor, p);
			return this;
		}

		if (path.constructor === RegExp || path instanceof RegExp)
			path = stringify({ source: path.source, flags: path.flags });
		else if (path.constructor === Object || path instanceof Object)
			return this.unsubscribe(functor, path.path);

		const t = this.topicsSubscribers.get(path);

		if (t === undefined)
			throw new Error('path not subscribed');

		if (!t.has(functor))
			throw new Error('subscriber not subscribed');

		if (this.pushedSubscribers.has(functor))
			throw new Error('unsubscribe is not possible, message pushing in progress');

		t.delete(functor);

		if (t.size === 0) {
			this.topicsSubscribers.delete(path);
			this.rTopicsSubscribers.delete(path);
		}

		if (--s.topics === 0)
			this.subscribers.delete(functor);

		return this;
	}

	performActions = () => {
		const store = this;
		const { actions, trailers } = store;

		store.startDisp();

		while (!actions.isEmpty()) {
			const functor = actions.shift();
			const state = functor(store);

			if (state !== store)
				throw new Error('invalid value');
		}

		store.stopDisp().publish().store();

		for (const trailer of trailers)
			trailer(store);

		// truncate array
		trailers.length = 0;
	}

	path2msg(path) {
		return Array.isArray(path)
			? [this.topic].concat(path).join('.')
			: this.topic + '.' + path;
	}

	restore() {
		// On preact build prerendering wog.localStorage === undefined
		// Alternatively use 'preact build --no-prerender' to disable prerendering.
		let state = wog.localStorage && wog.localStorage.getItem('state');

		if (state !== undefined && state !== null) {
			state = destringify(state);

			if (defaultState.metaver !== state.metaver)
				state = defaultState;
		}
		else
			state = defaultState;

		this.root = state;
	}

	store() {
		if (this.dirty) {
			const { root } = this;
			root.version = (~~root.version) + 1;
			wog.localStorage.setItem('state', stringify(root));
			delete this.dirty;
		}
	}

	startDisp() {
		if (this.isDispatched())
			throw new Error('already dispatching');

		this.mutatedPaths = {};
		this.messages = [];

		return this;
	}

	isDispatched() {
		return this.mutatedPaths !== undefined;
	}

	isNotDispatched() {
		return this.mutatedPaths === undefined;
	}

	stopDisp() {
		if (this.isNotDispatched())
			throw new Error('not dispatched');

		delete this.mutatedPaths;

		return this;
	}

	getPath(path) {
		let rPath;

		if (path === undefined || path === null)
			return [{ key: 0, node: {} }];

		if (Array.isArray(path)) {
			rPath = path;
		}
		else {
			const p = path.toString();
			const s = p.split('.');
			rPath = s.length === 0 ? (p.length === 0 ? [] : [p]) : s;
		}

		let nn, n = this.root, vPath = [];

		for (const k of rPath) {
			if ((nn = n[k]) === undefined)
				nn = {};

			vPath.push({ key: k, node: n });
			n = nn;
		}

		// if (createNode) {
		// 	const j = vPath.length - 1;

		// 	for (let i = 0; i < j; i++) {
		// 		const { key, node } = vPath[i];

		// 		if (node[key] !== (n = vPath[i + 1].node)) {
		// 			node[key] = n;
		// 			this.dirty = true;
		// 		}
		// 	}
		// }

		if (vPath.length === 0)
			throw new Error('invalid path');

		return vPath;
	}

	tracebackPath(vPath, setNodes = false) {
		let n, d = false;

		for (let i = vPath.length - 1; i > 0; i--) {
			const { key, node } = vPath[i - 1];

			if (node[key] !== (n = vPath[i].node))
				if (setNodes) {
					node[key] = n;
					this.dirty = d = true;
				}
				else
					d = true;
		}

		return d;
	}

	getNode(path, mutateLevels, manipulator, arg0, equ) {
		const vPath = this.getPath(path);
		const { key, node } = vPath[vPath.length - 1];

		if (equ && equ(node[key], arg0))
			return arg0;

		if (mutateLevels > vPath.length)
			throw new Error('invalid mutate levels');
			
		const r = manipulator.call(this, node, key, arg0, vPath);

		while (mutateLevels > 0) {
			this.publishPath(vPath.slice(0, vPath.length));
			vPath.pop();
			mutateLevels--;
		}

		return r;
	}

	checkDispatched() {
		if (this.isNotDispatched())
			throw new Error('Must be dispatched for change state');
		return this;
	}

	static mPubIn() { }

	pubIn(path, mutateLevels = 1) {
		if (Array.isArray(path)) {
			const [functor, paths] = path;

			if (functor.constructor === Function || functor instanceof Function) {
				if (Array.isArray(paths))
					for (const p of paths)
						this.pubIn([functor, p], mutateLevels);
				else {
					const vPath = this.getPath(paths);

					if (mutateLevels > vPath.length)
						throw new Error('invalid mutate levels');

					while (mutateLevels > 0) {
						this.publishPath(vPath.slice(0, vPath.length), functor);
						vPath.pop();
						mutateLevels--;
					}
				}
			}
			else
				for (const p of path)
					this.pubIn(p, mutateLevels);
		}
		else if (path.constructor === Function || path instanceof Function) {
			const s = this.subscribers.get(path);

			if (!s)
				throw new Error('subscriber not subscribed');

			for (const p of Object.keys(s.aliases))
				this.pubIn(p, mutateLevels);

			return this;
		}
		else if (path.constructor === RegExp || path instanceof RegExp)
			// silently ignore regexp path, user component must publish manually independently
			;
		else if (path.constructor === Map || path instanceof Map)
			for (const p of path.values())
				this.pubIn(p, mutateLevels);
		else if (path.constructor === Object || path instanceof Object) {
			this.pubIn(path.path, mutateLevels);
		}
		else
			this.checkDispatched().getNode(path, mutateLevels, State.mPubIn);

		return this;
	}

	cmpSetIn(path, value, mutateLevels = 1) {
		this.checkDispatched().getNode(path, mutateLevels, State.mSetIn, value, shallowEqual);
		return this;
	}

	static mSetIn(node, key, value, vPath) {
		node[key] = value;
		this.tracebackPath(vPath, true);
		this.dirty = true;
	}

	setIn(path, value, mutateLevels = 1) {
		this.checkDispatched().getNode(path, mutateLevels, State.mSetIn, value);
		return this;
	}

	static mMergeIn(node, key, value, vPath) {
		let v = node[key], d = false;

		if (v === undefined) {
			node[key] = v = {};
			d = true;
		}

		// eslint-disable-next-line
		for (const k in value) {
			v[k] = value[k];
			d = true;
		}

		if (d) {
			this.tracebackPath(vPath, true);
			this.dirty = true;
		}
	}

	mergeIn(path, iterable, mutateLevels = 1) {
		this.checkDispatched().getNode(path, mutateLevels, State.mMergeIn, iterable);
		return this;
	}

	static mUpdateIn(node, key, functor, vPath) {
		node[key] = functor(node[key]);
		this.tracebackPath(vPath, true);
		this.dirty = true;
	}

	updateIn(path, functor, mutateLevels = 1) {
		this.checkDispatched().getNode(path, mutateLevels, State.mUpdateIn, functor);
		return this;
	}

	static mEditIn(node, key, functor, vPath) {
		let v = node[key];

		if (v === undefined)
			node[key] = v = {};

		functor(v, key, node);
		this.tracebackPath(vPath, true);
		this.dirty = true;
	}

	editIn(path, functor, mutateLevels = 1) {
		this.checkDispatched().getNode(path, mutateLevels, State.mEditIn, functor);
		return this;
	}

	static mDeleteIn(node, key, arg0, vPath) {
		if (node.constructor === Object || node instanceof Object) {
			const keys = Object.keys(node).length;
			delete node[key];
			if (keys !== Object.keys(node).length) {
				this.tracebackPath(vPath, true);
				this.dirty = true;
			}
		}
		else {
			delete node[key];
			this.dirty = true;
		}
	}

	deleteIn(path, mutateLevels = 1) {
		this.checkDispatched().getNode(path, mutateLevels, State.mDeleteIn);
		return this;
	}

	static mToggleIn(node, key, arg0, vPath) {
		if (node.constructor === Object || node instanceof Object) {
			if (node[key]) {
				const keys = Object.keys(node).length;
				delete node[key];
				if (keys !== Object.keys(node).length) {
					this.tracebackPath(vPath, true);
					this.dirty = true;
				}
			}
			else {
				node[key] = true;
				this.tracebackPath(vPath, true);
				this.dirty = true;
			}
		}
		else {
			if (node[key])
				delete node[key];
			else
				node[key] = true;
			this.tracebackPath(vPath, true);
			this.dirty = true;
		}
	}

	toggleIn(path, mutateLevels = 1) {
		this.checkDispatched().getNode(path, mutateLevels, State.mToggleIn);
		return this;
	}

	static mFlagIn(node, key, value, vPath) {
		if (node.constructor === Object || node instanceof Object) {
			if (value) {
				node[key] = true;
				this.tracebackPath(vPath, true);
				this.dirty = true;
			}
			else {
				const keys = Object.keys(node).length;
				delete node[key];
				if (keys !== Object.keys(node).length) {
					this.tracebackPath(vPath, true);
					this.dirty = true;
				}
			}
		}
		else {
			if (value)
				node[key] = true;
			else
				delete node[key];
			this.dirty = true;
		}
	}

	flagIn(path, value, mutateLevels = 1) {
		this.checkDispatched().getNode(path, mutateLevels, State.mFlagIn, value);
		return this;
	}

	static mUndefIn(node, key, value, vPath) {
		if (node.constructor === Object || node instanceof Object) {
			if (value !== undefined) {
				node[key] = value;
				this.tracebackPath(vPath, true);
				this.dirty = true;
			}
			else {
				const keys = Object.keys(node).length;
				delete node[key];
				if (keys !== Object.keys(node).length) {
					this.tracebackPath(vPath, true);
					this.dirty = true;
				}
			}
		}
		else {
			if (value !== undefined)
				node[key] = value;
			else
				delete node[key];
			this.dirty = true;
		}
	}

	undefIn(path, value, mutateLevels = 1) {
		this.checkDispatched().getNode(path, mutateLevels, State.mUndefIn, value);
		return this;
	}

	static mGetIn(node, key, defaultValue) {
		const value = node[key];
		return value === undefined ? defaultValue : value;
	}

	getIn(path, defaultValue) {
		return this.getNode(path, 0, State.mGetIn, defaultValue);
	}

	mapIn(path, defaultValue = {}) {
		return this.getNode(path, 0, State.mGetIn, defaultValue);
	}
}
//------------------------------------------------------------------------------
const store = new State();
//------------------------------------------------------------------------------
export function getStore() {
	return store;
}
//------------------------------------------------------------------------------
export function subscribe(functor, path, alias) {
	return store.subscribe(functor, path, alias);
}
//------------------------------------------------------------------------------
export function unsubscribe(functor, path) {
	return store.unsubscribe(functor, path);
}
//------------------------------------------------------------------------------
// disp save order of requests, FIFO - first in, first out dispatch
//------------------------------------------------------------------------------
export default function disp(functor, trailer
	//, exclusive, sync
) {
	const { actions, trailers, performActions } = store;
	const empty = actions.isEmpty();

	// if (sync) {
	// 	if (!empty)
	// 		throw new Error('already dispatched async');

	// 	const state = functor(store.startDisp()).stopDispatch();

	// 	if (state !== store)
	// 		throw new Error('invalid value');

	// 	if (store.publish())
	// 		store.store();

	// 	return true;
	// }

	// // if already executing exclusive action, silently ignore new actions
	// // for example if on user button click long time loading and on data ready
	// // change current route view
	// if (!empty && store.actions.peekFront().exclusive)
	// 	return undefined;

	// store.actions.push({
	// 	id: uuidv1(),
	// 	action: functor,
	// 	exclusive: !!exclusive
	// });

	functor && actions.push(functor);
	trailer && trailers.push(trailer);

	if (empty && !actions.isEmpty())
		setZeroTimeout(performActions);

	return store;
}
//------------------------------------------------------------------------------
