import { createReducer } from './reduxUtils';

const defaultState = {
    searchTerm: '',
    selectedCountry: null
};

export const [
    reducer,
    setSearchTerm,
    setSelectedCountry
] = createReducer({
    'SET_SEARCH_TERM': (state, payload) => ({ ...state, searchTerm: payload }),
    'SET_SELECTED_COUNTRY': (state, payload) => ({ ...state, selectedCountry: payload })
}, defaultState);

export default reducer;
