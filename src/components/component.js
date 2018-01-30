//------------------------------------------------------------------------------
import { Component as PreactComponent } from 'preact';
import disp, { subscribe, unsubscribe } from '../lib/store';
import { isArrow } from '../lib/util';
import { isArray } from 'util';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Component extends PreactComponent {
	// public

	// constructor(props, context) {
	// 	super(props, context);
	// }

	// 	before the component gets mounted to the DOM
	componentWillMount() {
		const { willMount } = this;
		willMount && willMount.call(this);
	}

	// after the component gets mounted to the DOM
	componentDidMount() {
		const { didMount, mount, props, context } = this;
		didMount && didMount.call(this);
		mount && mount.call(this, props, context);
		this._reinitialize();
	}

	// prior to removal from the DOM
	componentWillUnmount() {
		const { willUnmount } = this;
		willUnmount && willUnmount.call(this);
		this._deinitialize();
	}

	// before new props get accepted
	componentWillReceiveProps(props, context) {
		this._deinitialize();
		const { willReceiveProps, mount } = this;
		willReceiveProps && willReceiveProps.call(this, props, context);
		mount && mount.call(this, props, context);
		this._reinitialize();
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

	// private

	// called from componentWillReceiveProps, componentDidMount
	_reinitialize() {
		const { storePaths, storeDisp, storeTrailer } = this;

		if (storePaths && subscribe(storePaths)) {
			this._storeSubscription = true;

			const functor = state => {
				for (const data of storePaths.values())
					if (Array.isArray(data))
						for (const { path } of data)
							state = state.setIn(path, state.getIn(path));
					else if (data.constructor === Object || data instanceof Object)
						state = state.setIn(data.path, state.getIn(data.path));
					else
						state = state.setIn(data, state.getIn(data));

				if (storeDisp)
					state = storeDisp.call(this, state, this.props, this.state, this.context);

				return state;
			};
			const trailer = storeTrailer
				&& (store => storeTrailer.call(this, store, this.props, this.state, this.context));

			disp(functor, trailer);
		}
	}

	// called from componentWillReceiveProps, componentWillUnmount
	_deinitialize() {
		const { storePaths, _storeSubscription } = this;
		storePaths && _storeSubscription && unsubscribe(storePaths);
		delete this._storeSubscription;
	}
}
//------------------------------------------------------------------------------
