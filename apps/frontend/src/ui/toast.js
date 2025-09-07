// simple global toast helper that components & axios can use
let _enqueue;
export const setEnqueue = (fn) => { _enqueue = fn; };
export const toast = (message, options = {}) => {
    if (_enqueue) _enqueue(message, options);
};
