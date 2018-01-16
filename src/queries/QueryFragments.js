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
