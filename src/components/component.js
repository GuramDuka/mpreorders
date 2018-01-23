//------------------------------------------------------------------------------
//import 'preact/debug';
import { Component as PreactComponent } from 'preact';
import disp, { subscribe, unsubscribe } from '../lib/store';
import { shallowEqual } from '../lib/util';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Component extends PreactComponent {
	// constructor(props, context) {
	// 	super(props, context);
	// 	console.log('constructor');
	// }

	// 	before the component gets mounted to the DOM
	componentWillMount() {
		const { willMount } = this;
		willMount && willMount.call(this);
	}

	// after the component gets mounted to the DOM
	componentDidMount() {
		const { props, didMount, fetchState } = this;
		const { storePaths, dispPaths } = props;

		storePaths && subscribe(storePaths) && (!!dispPaths) === true &&
			disp(state => {
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
		fetchState && fetchState.call(this);
	}

	// prior to removal from the DOM
	componentWillUnmount() {
		const { props, willUnmount } = this;
		const { storePaths } = props;

		storePaths && unsubscribe(storePaths);
		willUnmount && willUnmount.call(this);
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

		this.setState(state, callback);
	}
}
//------------------------------------------------------------------------------
