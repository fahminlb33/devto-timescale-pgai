import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const pool = new pg.Pool();

// pool.on("connect", (client) => {
// 	client.query(
// 		`select set_config('ai.ollama_host', '${import.meta.env.VITE_OLLAMA_BASE_URI}', false)`,
// 	);
// });

pool.options.host = import.meta.env.VITE_DB_HOST;
pool.options.port = import.meta.env.VITE_DB_PORT;
pool.options.database = import.meta.env.VITE_DB_NAME;
pool.options.user = import.meta.env.VITE_DB_USERNAME;
pool.options.password = import.meta.env.VITE_DB_PASSWORD;

pool.connect();

const db = drizzle({ client: pool, logger: true });

export default db;
