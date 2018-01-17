import React from 'react';

import './Results.css';

const Results = ({ countries, selectCountry }) => (
    <div className="Results">
        {countries && countries.slice().sort((a, b) => a.name.localeCompare(b.name)).map(c => (
            <div key={c.code} onClick={() => selectCountry(c.code)}>
                {c.name}
            </div>
        ))}
    </div>
);

export default Results;
