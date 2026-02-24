const listeners = {};

export const eventBus = {
    on(event, callback) {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(callback);

        return () => {
            listeners[event] = listeners[event].filter(cb => cb !== callback);
        };
    },

    emit(event, data) {
        if (!listeners[event]) return;
        listeners[event].slice().forEach(callback => callback(data));
    }
};

