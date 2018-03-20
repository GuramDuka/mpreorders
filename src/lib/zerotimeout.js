//------------------------------------------------------------------------------
import wog from 'window-or-global';
import Deque from 'double-ended-queue';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class ZeroTimeout {
	static timeouts = new Deque([]);
	static messageName = 'zero-timeout-message';

	static messageHandler(e) {
		if (e.source === wog && e.data === ZeroTimeout.messageName) {
			e.stopPropagation();
			e.preventDefault();
			
			while (!ZeroTimeout.timeouts.isEmpty())
				ZeroTimeout.timeouts.shift()(e);
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
