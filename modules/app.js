export function refresh(state) {
    for (let listener of state.listeners) {
        listener(state);
    }
}
