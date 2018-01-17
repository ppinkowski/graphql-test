import { createReducer } from './reduxUtils';

const defaultState = {
    searchTerm: '',
    selectedCountryCode: null
};

const reducerFunctions = {
    'SET_SEARCH_TERM': (state, payload) => ({ ...state, searchTerm: payload }),
    'SET_SELECTED_COUNTRY': (state, payload) => ({ ...state, selectedCountryCode: payload })
};

export const [
    reducer,
    setSearchTerm,
    setSelectedCountryCode
] = createReducer(reducerFunctions, defaultState);

export default reducer;
