import pg from "pg";

export const getPgClient = () => {
    const opts = {
        host: process.env["POSTGRES_ADDRESS"],
        port: process.env["POSTGRES_PORT"],
        database: process.env["POSTGRES_DB"],
        user: process.env["POSTGRES_USER"],
        password: process.env["POSTGRES_PASSWORD"]
    };

    return new pg.Client(opts);
};