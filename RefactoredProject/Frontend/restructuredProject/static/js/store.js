// js/store.js
export function createStore(initialState = {}) {
  let state = structuredClone(initialState);
  const listeners = new Set();

  function get() { return state; }

  function set(patch) {
    state = { ...state, ...patch };
    for (const fn of listeners) fn(state);
  }

  function subscribe(fn) {
    listeners.add(fn);
    fn(state); // initial push
    return () => listeners.delete(fn);
  }

  return { get, set, subscribe };
}
