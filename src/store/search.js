import { createReducer } from './reduxUtils';

const defaultState = {
    searchTerm: '',
    selectedCountry: null
};

const reducerFunctions = {
    'SET_SEARCH_TERM': (state, payload) => ({ ...state, searchTerm: payload }),
    'SET_SELECTED_COUNTRY': (state, payload) => ({ ...state, selectedCountry: payload })
};

export const [
    reducer,
    setSearchTerm,
    setSelectedCountry
] = createReducer(reducerFunctions, defaultState);

export default reducer;
