import { createActionCreator } from "./utils";

const SET_SEARCH_TERM = 'SET_SEARCH_TERM';

const defaultState = {
    searchTerm: ''
};

export const setSearchTerm = createActionCreator(SET_SEARCH_TERM);

export default (state = defaultState, action) => {
    switch (action.type) {
        case SET_SEARCH_TERM:
            return { ...state, searchTerm: action.payload };
        default:
            return state;
    }
};
