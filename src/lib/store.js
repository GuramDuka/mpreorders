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
class State {
	topic = 'STORE'
	actions = new Deque([])
	trailers = []
	topicsSubscribers = new Map()
	subscribers = new Map()
	pushedSubscribers = new Map()

	constructor() {
		this.restore();
	}

	publish() {
		const { messages, pushedSubscribers } = this;
		let r = true;

		if (messages && pushedSubscribers && messages.length !== 0 && pushedSubscribers.size !== 0)
			for (const [functor, msgs] of pushedSubscribers.entries())
				functor(msgs, this);
		else
			r = false;

		// clear messages
		delete this.messages;
		pushedSubscribers.clear();

		return r;
	}

	publishPath(vPath) {
		// call not from inside disp
		// antipattern, but only as an exception and it is the fastest method
		// now this happens only from backend bfetch function for auth
		if (this.mutatedPaths === undefined)
			return;

		let i, sPath = '';

		vPath.map(v => sPath += '.' + v.key);
		sPath = sPath.substr(1);

		const topicSubscribers = this.topicsSubscribers.get(sPath);

		// if no one is subscribed to this path then return
		if (topicSubscribers === undefined)
			return;

		if ((i = this.mutatedPaths[sPath]) === undefined)
			this.mutatedPaths[sPath] = i = this.messages.length;

		const v = vPath[vPath.length - 1];
		const { key, node } = v;
		const msg = { ...v, path: sPath, value: node[key] };

		this.messages[i] = msg;

		const { subscribers } = this;

		for (const subscriber of topicSubscribers.values()) {
			const data = subscribers.get(subscriber);

			if (data === undefined)
				throw new Error('invalid subscriber');

			let msgs = this.pushedSubscribers.get(subscriber);

			if (msgs === undefined)
				this.pushedSubscribers.set(subscriber, msgs = {});

			const alias = data.aliases[sPath];

			if (alias === undefined)
				msgs[sPath] = msg;
			else
				msgs[alias] = msg.value;
		}
	}

	subscribe(functor, path, alias) {
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

		if (path.constructor === Object || path instanceof Object)
			return this.subscribe(functor, path.path, path.alias);

		if (!(functor.constructor === Function || functor instanceof Function))
			throw new Error('invalid subscriber');

		let t = this.topicsSubscribers.get(path);

		if (t === undefined)
			this.topicsSubscribers.set(path, t = new Set());

		if (t.has(functor))
			throw new Error('subscriber already subscribed');

		t.add(functor);

		t = this.subscribers.get(functor);

		if (t === undefined)
			this.subscribers.set(functor, t = { aliases: {}, topics: 0 });

		t.aliases[path] = alias;
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

		if (path instanceof Object)
			return this.unsubscribe(functor, path.path);

		let t = this.topicsSubscribers.get(path);

		if (t === undefined)
			throw new Error('path not subscribed');

		if (!t.has(functor))
			throw new Error('subscriber not subscribed');

		if (this.pushedSubscribers.has(functor))
			throw new Error('unsubscribe is not possible, message pushing in progress');

		t.delete(functor);

		if (t.size === 0)
			this.topicsSubscribers.delete(path);

		t = this.subscribers.get(functor);

		if (--t.topics === 0)
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

		store.stopDisp();

		if (store.publish())
			store.store();

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

			if (defaultState.metadataVersion !== state.metadataVersion)
				state = defaultState;
		}
		else
			state = defaultState;

		state.version++;
		this.root = state;
	}

	store() {
		const { root } = this;
		wog.localStorage.setItem('state', stringify(root));
		root.version++;
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

	getPath(path, createNode) {
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

		if (createNode) {
			const j = vPath.length - 1;

			for (let i = 0; i < j; i++) {
				const { key, node } = vPath[i];

				if (node[key] !== (n = vPath[i + 1].node))
					node[key] = n;
			}
		}

		if (vPath.length === 0)
			throw new Error('invalid path');

		return vPath;
	}

	getNode(path, createNode, mutateLevels, manipulator, arg0, equ) {
		const vPath = this.getPath(path, createNode);
		const { key, node } = vPath[vPath.length - 1];

		if (equ && equ(node[key], arg0))
			return arg0;

		const r = manipulator.call(this, node, key, arg0);

		if (mutateLevels > vPath.length)
			throw new Error('invalid mutate levels');

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

	cmpSetIn(path, value, mutateLevels = 1) {
		this.checkDispatched().getNode(path, true, mutateLevels, State.mSetIn, value, shallowEqual);
		return this;
	}

	static mSetIn(node, key, value) {
		node[key] = value;
	}

	setIn(path, value, mutateLevels = 1) {
		this.checkDispatched().getNode(path, true, mutateLevels, State.mSetIn, value);
		return this;
	}

	static mPubIn(node, key, value) {
	}

	pubIn(path, mutateLevels = 1) {
		this.checkDispatched().getNode(path, true, mutateLevels, State.mPubIn);
		return this;
	}

	static mMergeIn(node, key, value) {
		let v = node[key];

		if (v === undefined)
			node[key] = v = {};

		// eslint-disable-next-line
		for (const k in value)
			v[k] = value[k];
	}

	mergeIn(path, iterable, mutateLevels = 1) {
		this.checkDispatched().getNode(path, true, mutateLevels, State.mMergeIn, iterable);
		return this;
	}

	static mUpdateIn(node, key, functor) {
		node[key] = functor(node[key]);
	}

	updateIn(path, functor, mutateLevels = 1) {
		this.checkDispatched().getNode(path, true, mutateLevels, State.mUpdateIn, functor);
		return this;
	}

	static mEditIn(node, key, functor) {
		let v = node[key];

		if (v === undefined)
			node[key] = v = {};

		functor(v, key, node);
	}

	editIn(path, functor, mutateLevels = 1) {
		this.checkDispatched().getNode(path, true, mutateLevels, State.mEditIn, functor);
		return this;
	}

	static mDeleteIn(node, key) {
		delete node[key];
	}

	deleteIn(path, mutateLevels = 1) {
		this.checkDispatched().getNode(path, true, mutateLevels, State.mDeleteIn);
		return this;
	}

	static mToggleIn(node, key) {
		if (node[key])
			delete node[key];
		else
			node[key] = true;
	}

	toggleIn(path, mutateLevels = 1) {
		this.checkDispatched().getNode(path, true, mutateLevels, State.mToggleIn);
		return this;
	}

	static mGetIn(node, key, defaultValue) {
		const value = node[key];
		return value === undefined ? defaultValue : value;
	}

	getIn(path, defaultValue) {
		return this.getNode(path, false, 0, State.mGetIn, defaultValue);
	}

	mapIn(path, defaultValue = {}) {
		return this.getNode(path, false, 0, State.mGetIn, defaultValue);
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
