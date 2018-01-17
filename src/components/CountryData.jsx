import React, { Component } from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import './CountryData.css';

const query = gql`
    subscription populationUpdated($country: String!) {
        populationUpdated(code: $country) {
            code
            population
        }
    }
`;

class CountryData extends Component {

    constructor(props) {
        super(props);
        this.state = {
            population: props.country ? props.country.population : 0
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.country !== this.props.country) {
            this.setState({ population: nextProps.country.population });
        } else if (nextProps.updates.populationUpdated) {
            this.setState({ population: nextProps.updates.populationUpdated.population });
        }
    }

    render() {
        return (
            <div className="CountryData">
                <h3>{this.props.country.name} ({this.props.country.code})</h3>
                <h2>Population: {this.state.population.toLocaleString()}</h2>
                <div>
                    <button onClick={() => this.props.removePerson(this.props.country)}>-</button>
                    <button onClick={() => this.props.addPerson(this.props.country)}>+</button>
                </div>
            </div>
        );
    }
};

export default graphql(query, {
    name: 'updates',
    skip: ({ country }) => !country,
    options: ({ country }) => ({
        variables: { country: country.code }
    }),
    shouldResubscribe: (currentProps, nextProps) => currentProps.country !== nextProps.country
})(CountryData);
