//------------------------------------------------------------------------------
import { Component as PreactComponent } from 'preact';
import disp, { subscribe, unsubscribe } from '../lib/store';
import { shallowEqual } from '../lib/util';
//import { shallowEqual } from '../lib/util';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Component extends PreactComponent {
	// public

	// constructor(props, context) {
	// 	super(props, context);
	// }

	//if (force || !shallowEqual(this.state, state))

	setState(state, callback) {
		if (this.willSetState)
			this.willSetState(state);

		if (this.willUpdateState)
			for (const n of Object.keys(state))
				if (!shallowEqual(this.state[n], state[n])) {
					this.willUpdateState(state);
					break;
				}

		const cb = this.didSetState ?
			() => {
				this.didSetState(this.state, state);

				if (callback)
					callback();
			}
			: callback;

		return super.setState.call(this, state, cb);
	}

	// 	before the component gets mounted to the DOM
	componentWillMount() {
		if (this.willMount)
			this.willMount();
	}

	static __mountId = 0

	// prior to removal from the DOM
	componentWillUnmount() {
		if (this.willUnmount)
			this.willUnmount();

		if (this.storePaths)
			unsubscribe(this.storePaths);

		if (this.__mount)
			unsubscribe(this.__mount);
	}
	
	// after the component gets mounted to the DOM
	componentDidMount() {
		if (this.didMount)
			this.didMount(this.props);

		if (this.mount) {
			this.__mount = state => {
				this.mount(this.__props);
				delete this.__props;
			};

			subscribe(this.__mount, '$__mount__#' + (++Component.__mountId));

			this.__props = this.props;

			disp(state => state.pubIn(this.__mount));
		}

		if (this.storePaths && subscribe(this.storePaths))
			disp(state => state.pubIn(this.storePaths));
	}

	// before new props get accepted
	componentWillReceiveProps(props, context) {
		if (this.willReceiveProps)
			this.willReceiveProps(props);

		if (this.mount/* && !shallowEqual(this.props, props)*/) {
			this.__props = props;
			disp(state => state.pubIn(this.__mount));
		}

		if (this.storePaths)
			disp(state => state.pubIn(this.storePaths));
	}

	// before render(). Return false to skip render
	shouldComponentUpdate(props, state, context) {
		const r = this.shouldUpdate
			? this.shouldUpdate(props, state, context)
			: super.shouldComponentUpdate
				? super.shouldComponentUpdate.call(this, props, state, context)
				: true;

		return r;
	}

	// before render()
	componentWillUpdate(props, state, context) {
		if (this.willUpdate)
			this.willUpdate(props, state, context);
	}

	// render(props, state, context) {
	// 	delete this.__mountCalled;
	// 	return super.render.call(this, props, state, context);
	// }

	// after render()
	componentDidUpdate(previousProps, previousState, previousContext) {
		if (this.didUpdate)
			this.didUpdate(previousProps, previousState, previousContext);
	}

	// mergeState(state, callback) {
	// 	if (shallowEqual(this.state, state))
	// 		return;

	// 	this.setState(state, callback);
	// }
}
//------------------------------------------------------------------------------
