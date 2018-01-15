//------------------------------------------------------------------------------
import root from 'window-or-global';
import Deque from 'double-ended-queue';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class ZeroTimeout {
    static timeouts = new Deque([]);
    static messageName = 'zero-timeout-message';

    static messageHandler(e) {
    	if (e.source === root && e.data === ZeroTimeout.messageName) {
    		e.stopPropagation();
    		if (!ZeroTimeout.timeouts.isEmpty())
    			ZeroTimeout.timeouts.shift()();
    	}
    }

    static initialize() {
    	root.addEventListener('message', ZeroTimeout.messageHandler, true);
    }
}
//------------------------------------------------------------------------------
ZeroTimeout.initialize();
//------------------------------------------------------------------------------
export function setZeroTimeout(fn) {
	ZeroTimeout.timeouts.push(fn);
	root.postMessage(ZeroTimeout.messageName, '*');
}
//------------------------------------------------------------------------------
