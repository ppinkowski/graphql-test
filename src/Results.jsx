import React from 'react';

const Results = ({ data }) => (
    <div>
        {data && data.cities && data.cities.map(c => (
            <div key={c.id}>
                <h2>{c.name} - {c.country.name}</h2>
                <span>{c.population}</span>
            </div>
        ))}
    </div>
);

export default Results;
