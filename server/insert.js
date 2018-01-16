const query = require('./db');

const codes = [
    'HUN',
    'PAN',
    'ATF',
    'TZA',
    'SGS',
    'BGD',
    'BLZ',
    'SWE',
    'COK',
    'MDV',
    'SWZ',
    'LBR',
    'COG',
    'ESH',
    'VGB',
    'YUG',
    'KNA',
    'LBN',
    'MAR',
    'VCT',
    'MAC',
    'BEL',
    'CUB',
    'BRN',
    'TKM',
    'GAB',
    'ETH',
    'ATG',
    'BVT',
    'BFA',
    'CCK',
    'SLE',
    'NLD',
    'GBR',
    'GIN',
    'SYC',
    'DNK',
    'FSM',
    'PYF',
    'USA',
    'LBY',
    'TCD',
    'HKG',
    'HRV',
    'BHR',
    'THA',
    'RUS',
    'TON',
    'GLP',
    'AUS',
    'PER',
    'SHN',
    'MEX',
    'MYS',
    'MLI',
    'POL',
    'CRI',
    'IDN',
    'ANT',
    'CHN',
    'MHL',
    'BTN',
    'PRI',
    'YEM',
    'EST',
    'UKR',
    'TKL',
    'CYM',
    'MDG',
    'AFG',
    'MKD',
    'MNG',
    'MDA',
    'PRY',
    'GRL',
    'VAT',
    'ROM',
    'OMN',
    'ITA',
    'HMD',
    'ARE',
    'SDN',
    'BRB',
    'SLB',
    'PNG',
    'ISR',
    'HTI',
    'STP',
    'NGA',
    'PCN',
    'GMB',
    'GNQ'
];

(async () => {
    let total = 0;
    for (const code of codes) {
        for (var i = 0; i < 10000; i++) {
            const date = new Date(new Date(1990, 0, 1).valueOf() + (86400000 * i));
            const gdp = Math.round(1000000 + (Math.random() * 10000000));
            const sql = `INSERT INTO countrygdp (countrycode, entrydate, gdp) VALUES ('${code}', '${date.toISOString()}', ${gdp})`;
            await query(sql);
            total++;
        }
    }
    console.log(`Done! Inserted ${total} values`);
})();