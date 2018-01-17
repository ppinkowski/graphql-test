import React, { Component } from 'react';

import './CountryData.css';

class CountryData extends Component {
    render() {
        return (
            <div className="CountryData">
                <h3>{this.props.country.name} ({this.props.country.code})</h3>
                <h2>Population: {this.props.country.population.toLocaleString()}</h2>
                <div>
                    <button onClick={() => this.props.removePerson(this.props.country)}>-</button>
                    <button onClick={() => this.props.addPerson(this.props.country)}>+</button>
                </div>
            </div>
        );
    }
};

export default CountryData;
