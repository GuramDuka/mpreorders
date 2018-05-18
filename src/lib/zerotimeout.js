//------------------------------------------------------------------------------
import Deque from 'double-ended-queue';
import { prevent } from './util';
import root from './root';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class ZeroTimeout {
	static timeouts = new Deque([]);
	static messageName = 'zero-timeout-message';

	static messageHandler(e) {
		if (e.source === root && e.data === ZeroTimeout.messageName) {
			while (!ZeroTimeout.timeouts.isEmpty())
				ZeroTimeout.timeouts.shift()(e);

			return prevent(e);
		}
	}

	static initialize() {
		root.addEventListener && root.addEventListener.constructor === Function
			&& root.addEventListener('message', ZeroTimeout.messageHandler, true);
	}
}
//------------------------------------------------------------------------------
ZeroTimeout.initialize();
//------------------------------------------------------------------------------
export default function setZeroTimeout(fn) {
	ZeroTimeout.timeouts.push(fn);
	root.postMessage && root.postMessage(ZeroTimeout.messageName, '*');
}
//------------------------------------------------------------------------------
