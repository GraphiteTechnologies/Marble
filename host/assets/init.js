(function() {
    let nextCallbackId = 0;
    const callbacks = {};

    window.executeCommand = function(command) {
        return new Promise((resolve, reject) => {
            const callbackId = `callback_${nextCallbackId++}`;

            callbacks[callbackId] = {resolve, reject};

            window.ipc.postMessage(JSON.stringify({
                type: 'Command',
                command: command,
                callback_id: callbackId,
            }));
        });
    };

    window.__resolvePromise = function(callbackId, success, result) {
        const callback = callbacks[callbackId];

        if(!callback)
            return;

        if(success) {
            callback.resolve(result);
        } else {
            callback.reject(result);
        }

        delete callbacks[callbackId];
    };

    document.addEventListener('keydown', function(event) {
        const isModifierOnly = ['Meta', 'Control', 'Alt', 'Shift'].includes(event.key);

        if((event.metaKey || event.ctrlKey || event.altKey) && !isModifierOnly) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        }
    }, true);
})();
