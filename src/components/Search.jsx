import React, { Component } from 'react';
import Results from './Results';
import { connect } from 'react-redux';
import { setSearchTerm, setSelectedCountryCode } from '../store/search';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { countryFragment } from '../queries/QueryFragments';
import CountryData from './CountryData';

import './Search.css';

const query = gql`
    query searchCountries($search: String) {
        countries(search: $search) {
            ...CountryData
        }
    }
    ${countryFragment}
`;

const mutation = gql`
    mutation updatePopulation($input: UpdatePopulationInput!) {
        updatePopulation(input: $input) {
            code
            population
        }
    }
`;

class Search extends Component {

    input;

    constructor() {
        super();
        this.state = {
            search: '',
            committedSearch: ''
        };
    }

    render() {
        return (
            <div className="Search">
                <form onSubmit={this.submitSearch}>
                    <input className="SearchBox" ref={(e) => this.input = e} onChange={this.searchUpdated} value={this.state.search} placeholder="Search..."/>
                    <button>Search</button>
                    <Results countries={this.props.searchResults && this.props.searchResults.countries} selectCountry={this.props.setSelectedCountryCode}/>
                </form>
                {(this.props.selectedCountryCode !== null && this.props.searchResults && this.props.searchResults.countries) && (
                    <CountryData
                        country={this.props.searchResults.countries.find(c => c.code === this.props.selectedCountryCode)}
                        addPerson={this.updatePop('Add')}
                        removePerson={this.updatePop('Remove')}/>
                )}
            </div>
        )
    }

    updatePop = (type) => async (country) => {
        this.props.updatePopulation({
            variables: {
                input: {
                    code: country.code,
                    value: 1,
                    type: type
                }
            }
        });
    }

    submitSearch = (e) => {
        e.preventDefault();
        this.props.setSearchTerm(this.state.search);
    }

    searchUpdated = () => {
        this.setState({ search: this.input.value });
    }
}

const mapStateToProps = (state) => ({
    searchTerm: state.search.searchTerm,
    selectedCountryCode: state.search.selectedCountryCode
});

const mapDispatchToProps = {
    setSearchTerm,
    setSelectedCountryCode
}

export default connect(mapStateToProps, mapDispatchToProps)(
    compose(
        graphql(
            query,
            {
                skip: (props) => !props.searchTerm,
                options: (props) => ({ variables: { search: props.searchTerm }}),
                name: 'searchResults'
            }
        ),
        graphql(
            mutation,
            {
                name: 'updatePopulation',
                // props: ({ownProps, updatePopulation }) => ({
                //     updatePopulation: ({ variables: { input } }) => {
                //         return updatePopulation({
                //             variables: { input },
                //             update: (store, { data: { updatePopulation }}) => {
                //                 const queryKey = { query: query, variables: { search: ownProps.searchTerm } };
                //                 const data = store.readQuery(queryKey);
                //                 data.countries.find(c => c.code === updatePopulation.code).population = updatePopulation.population;
                //                 store.writeQuery({ ...queryKey, data });
                //             }
                //         })
                //     }
                // })
            }
        )
    )(Search)
);
