//------------------------------------------------------------------------------
import { Component as PreactComponent } from 'preact';
import disp, { subscribe, unsubscribe } from '../../lib/store';
import { shallowEqual } from '../../lib/util';
//import { shallowEqual } from '../../lib/util';
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

	// prior to removal from the DOM
	componentWillUnmount() {
		if (this.willUnmount)
			this.willUnmount();

		if (this.storePaths)
			unsubscribe(this.storePaths);

		if (this.__mount)
			unsubscribe(this.__mount);
	}

	static __mountId = 0
	
	// 	before the component gets mounted to the DOM and
	componentWillMount() {
		if (this.willMount)
			this.willMount();

		if (this.mount) {
			if (!this.__mount)
				this.__mount = () => {
					this.mount(this.__props);
					delete this.__props;
				};
			this.__props = this.props;
			subscribe(this.__mount, '$__mount__#' + (++Component.__mountId));
			disp(state => state.pubIn(this.__mount));
		}

		if (this.storePaths && subscribe(this.storePaths))
			disp(state => state.pubIn(this.storePaths));
	}

	// after the component gets mounted to the DOM
	componentDidMount() {
		if (this.didMount)
			this.didMount(this.props);
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
