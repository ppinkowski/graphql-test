import { Client } from 'pg';
import nodeCleanup from 'node-cleanup';

let pgClient;

nodeCleanup(() => {
    if (pgClient) {
        pgClient.end();
    }
});

const getPgClient = async () => {
    if (!pgClient) {
        pgClient = new Client({ connectionString: 'postgres://postgres:password@192.168.99.100:32791/postgres' });
        await pgClient.connect();
    }
    return pgClient;
}

const executeQuery = async (sql) => {
    console.log(sql);
    const client = await getPgClient();
    const result = await client.query(sql);
    return result;
}

export default executeQuery;
