import React, { Component } from 'react';
import Results from './Results';
import { connect } from 'react-redux';
import { setSearchTerm } from '../store/search';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { cityFragment } from '../queries/QueryFragments';

const query = gql`
    query($search: String) {
        cities(search: $search) {
            ...CityData
        }
    }
    ${cityFragment}
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
                    <input ref={(e) => this.input = e} onChange={this.searchUpdated} value={this.state.search}/>
                    <button>Search</button>
                    <Results cities={this.props.data && this.props.data.cities}/>
                </form>
            </div>
        )
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
    searchTerm: state.search.searchTerm
});

const mapDispatchToProps = {
    setSearchTerm
}

export default connect(mapStateToProps, mapDispatchToProps)(
    graphql(
        query,
        {
            skip: (props) => !props.searchTerm,
            options: (props) => ({ variables: { search: props.searchTerm }})
        }
    )(Search)
);
