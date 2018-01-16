export const createActionCreator = (type) => (payload) => ({
    type,
    payload
});

export const createReducer = (reducerFunctions, defaultState) => {
    const actionCreators = Object.keys(reducerFunctions).map(key => createActionCreator(key));
    const reducer = (state = defaultState, action) => {
        const reducerFunc = reducerFunctions[action.type];
        if (reducerFunc) {
            return reducerFunc(state, action.payload);
        }
        return state;
    }
    return [ reducer, ...actionCreators ];
}
