//------------------------------------------------------------------------------
import wog from 'window-or-global';
import Deque from 'double-ended-queue';
import { prevent } from './util';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class ZeroTimeout {
	static timeouts = new Deque([]);
	static messageName = 'zero-timeout-message';

	static messageHandler(e) {
		if (e.source === wog && e.data === ZeroTimeout.messageName) {
			while (!ZeroTimeout.timeouts.isEmpty())
				ZeroTimeout.timeouts.shift()(e);

			return prevent(e);
		}
	}

	static initialize() {
		wog.addEventListener && wog.addEventListener.constructor === Function
			&& wog.addEventListener('message', ZeroTimeout.messageHandler, true);
	}
}
//------------------------------------------------------------------------------
ZeroTimeout.initialize();
//------------------------------------------------------------------------------
export default function setZeroTimeout(fn) {
	ZeroTimeout.timeouts.push(fn);
	wog.postMessage(ZeroTimeout.messageName, '*');
}
//------------------------------------------------------------------------------
