//------------------------------------------------------------------------------
import { Component as PreactComponent } from 'preact';
import disp, { subscribe, unsubscribe } from '../lib/store';
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
		const { willSetState, didSetState } = this;
		const cb = didSetState ?
			() => {
				didSetState.call(this, this.state, state);
				callback && callback();
			}
			: callback;

		willSetState && willSetState.call(this, state);
		return super.setState.call(this, state, cb);
	}

	// 	before the component gets mounted to the DOM
	componentWillMount() {
		const { willMount } = this;
		willMount && willMount.call(this);
	}

	// after the component gets mounted to the DOM
	componentDidMount() {
		const { didMount } = this;

		if (didMount)
			didMount.call(this, this.props);

		const { mount } = this;

		if (mount) {
			mount.call(this, this.props, this.state);
			this.__mount = true;
		}
			
		const { storePaths } = this;

		if (storePaths && subscribe(storePaths))
			disp(state => state.pubIn(storePaths));
	}

	// prior to removal from the DOM
	componentWillUnmount() {
		const { willUnmount } = this;
		willUnmount && willUnmount.call(this);
		const { storePaths } = this;
		storePaths && unsubscribe(storePaths);
	}

	// before new props get accepted
	componentWillReceiveProps(props, context) {
		const { willReceiveProps } = this;

		this.storePaths && unsubscribe(this.storePaths);
		
		if (willReceiveProps)
			willReceiveProps.call(this, props);

		const { mount } = this;

		if (mount) {
			if (!this.__mount)
				mount.call(this, props, this.state);

			delete this.__mount;
		}
	
		const { storePaths } = this;

		if (storePaths && subscribe(storePaths))
			disp(state => state.pubIn(storePaths));
	}

	// before render(). Return false to skip render
	shouldComponentUpdate(props, state, context) {
		const { shouldUpdate } = this;
		delete this.__mount;
		return shouldUpdate ? shouldUpdate.call(this, props, state, context) : true;
	}

	// before render()
	componentWillUpdate(props, state, context) {
		const { willUpdate } = this;
		willUpdate && willUpdate.call(this, props, state, context);
	}

	// after render()
	componentDidUpdate(previousProps, previousState, previousContext) {
		const { didUpdate } = this;
		didUpdate && didUpdate.call(this, previousProps, previousState, previousContext);
	}

	// mergeState(state, callback) {
	// 	if (shallowEqual(this.state, state))
	// 		return;

	// 	this.setState(state, callback);
	// }
}
//------------------------------------------------------------------------------
