//------------------------------------------------------------------------------
import { Component as PreactComponent } from 'preact';
import disp, { subscribe, unsubscribe } from '../lib/store';
//import { shallowEqual } from '../lib/util';
//------------------------------------------------------------------------------
function pubStorePaths(storePaths) {
	return disp(state => {
		const paths = storePaths.values();

		for (const data of paths)
			if (Array.isArray(data))
				for (const { path } of data)
					state = state.pubIn(path);
			else if (data.constructor === Object || data instanceof Object)
				state = state.pubIn(data.path);
			else
				state = state.pubIn(data);

		return state;
	});
}
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
			mount.call(this, this.props);
			this.__mount = true;
		}
			
		const { storePaths } = this;

		if (storePaths && subscribe(storePaths))
			pubStorePaths(storePaths);
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
		const curStorePaths = this.storePaths;
		
		if (willReceiveProps)
			willReceiveProps.call(this, props);

		const { mount } = this;

		if (mount) {
			if (!this.__mount)
				mount.call(this, props);

			delete this.__mount;
		}
	
		const { storePaths } = this;

		if (curStorePaths !== storePaths) {
			unsubscribe(curStorePaths);

			if (storePaths)
				subscribe(storePaths);
		}

		if (storePaths)
			pubStorePaths(storePaths);
	}

	// before render(). Return false to skip render
	shouldComponentUpdate(props, state, context) {
		const { shouldUpdate } = this;
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
