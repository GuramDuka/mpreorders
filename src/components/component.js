//------------------------------------------------------------------------------
//import 'preact/debug';
import { Component as PreactComponent } from 'preact';
import disp, { subscribe, unsubscribe } from '../lib/store';
import { shallowEqual } from '../lib/util';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Component extends PreactComponent {
	constructor(props, context) {
		super(props, context);

		const { willReceiveProps } = this;
		willReceiveProps && willReceiveProps.call(this, props, context);
	}

	// 	before the component gets mounted to the DOM
	componentWillMount() {
		const { willMount } = this;
		willMount && willMount.call(this);
	}

	// after the component gets mounted to the DOM
	componentDidMount() {
		const { didMount, storePaths } = this;

		storePaths && subscribe(storePaths) && disp(state => {
			storePaths.forEach(data => {
				if (Array.isArray(data))
					for (const { path } of data)
						state = state.setIn(path, state.getIn(path));
				else if (data.constructor === Object || data instanceof Object)
					state = state.setIn(data.path, state.getIn(data.path));
				else
					state = state.setIn(data, state.getIn(data));

				return state;
			});

			return state;
		});

		didMount && didMount.call(this);
	}

	// prior to removal from the DOM
	componentWillUnmount() {
		const { props, willUnmount } = this;
		const { storePaths } = props;

		storePaths && unsubscribe(storePaths);
		willUnmount && willUnmount.call(this);

		// used in mergeState
		delete this._icb;
	}

	// before new props get accepted
	componentWillReceiveProps(props, context) {
		const { willReceiveProps } = this;
		willReceiveProps && willReceiveProps.call(this, props, context);
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

	mergeState(state, callback) {
		if (shallowEqual(this.state, state))
			return;

		if (this._icb === undefined && this.fetchStorePaths)
			this._icb = () => {
				const { storePaths } = this;

				if (storePaths) {
					let def = false;
					// check undefined stored value for initial fetching
					for (const key of storePaths.keys()) {
						if (def)
							break;

						const data = storePaths.get(key);

						if (Array.isArray(data))
							for (const { path, alias } of data) {
								if (def)
									break;
								def = state[alias ? alias : path] !== undefined;
							}
						else if (data.constructor === Object || data instanceof Object)
							def = state[data.alias ? data.alias : data.path] !== undefined;
						else
							def = state[data] !== undefined;

					}

					def || this.fetchStorePaths();
				}
				callback && callback.call(this);
				this._icb = false;
			};

		this.setState(state, this._icb || callback);
	}
}
//------------------------------------------------------------------------------
