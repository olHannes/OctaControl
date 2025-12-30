// js/store.js
export function createStore(initialState = {}) {
  let state = structuredClone(initialState);
  const listeners = new Set();

  function get() { return state; }
  function getState() { return state; }

  function set(patch) {
    state = { ...state, ...patch };
    for (const fn of listeners) fn(state);
  }

  function setSlice(sliceName, patch) {
    const currentSlice = state?.[sliceName] ?? {};
    state = { ...state, [sliceName]: { ...currentSlice, ...patch } };
    for (const fn of listeners) fn(state);
  }

  function subscribe(fn) {
    listeners.add(fn);
    fn(state);
    return () => listeners.delete(fn);
  }

  function subscribeSelector(selector, onChange) {
    let prev = selector(state);
    return subscribe((s) => {
      const next = selector(s);
      if (Object.is(prev, next)) return;
      prev = next;
      onChange(next, s);
    });
  }

  return { get, getState, set, setSlice, subscribe, subscribeSelector };
}
