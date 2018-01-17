import gql from 'graphql-tag';

export const cityFragment = gql`
    fragment CityData on City {
        id
        name
        population
        country {
            name
        }
    }
`;

export const countryFragment = gql`
    fragment CountryData on Country {
        code
        name
        population
    }
`;
