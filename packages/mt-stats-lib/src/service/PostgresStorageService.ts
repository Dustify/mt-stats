import { IStorageService } from "../if/IStorageService";

import pg from "pg";
import { IRawMessage } from "../model/IRawMessage";
import { IUnpackedMessage } from "../model/IUnpackedMessage";
import { ICompleteMessage } from "../model/ICompleteMessage";
import { ServiceBase } from "./ServiceBase";

export class PostgresStorageService extends ServiceBase implements IStorageService {
    private Client: pg.Client;

    constructor() {
        super();

        this.Info("constructor start");

        const opts: pg.ClientConfig = {
            host: process.env["POSTGRES_ADDRESS"],
            port: parseInt(process.env["POSTGRES_PORT"] || ""),
            database: process.env["POSTGRES_DB"],
            user: process.env["POSTGRES_USER"],
            password: process.env["POSTGRES_PASSWORD"]
        };

        this.Client = new pg.Client(opts);

        this.Info("constructor end");
    }

    public async Connect(): Promise<void> {
        this.Info("Connect start");

        await this.Client.connect()

        this.Info("Connect end");
    }

    public async StoreRawMessage(message: IRawMessage): Promise<void> {
        this.Info("StoreRawMessage start");

        await this.Client.query(
            "insert into raw_pb (data) values ($1)",
            [
                message.data
            ]
        );

        this.Info("StoreRawMessage end");
    }

    public async GetRawMessages(): Promise<IRawMessage[]> {
        this.Info("GetRawMessages start");

        const response = await this.Client.query(
            "select data, id from raw_pb where expanded = false"
        );

        this.Info("GetRawMessages", `${response.rows.length} rows`)

        const result: IRawMessage[] = [];

        for (const row of response.rows) {
            result.push(row);
        }

        this.Info("GetRawMessages end");

        return result;
    }

    public async StoreUnpackedMessage(message: IUnpackedMessage): Promise<void> {
        this.Info("StoreUnpackedMessage start");

        this.Info("StoreUnpackedMessage end");
    }

    public async GetUnpackedMessages(): Promise<IUnpackedMessage[]> {
        this.Info("GetUnpackedMessages start");

        const response = await this.Client.query(
            `select id, packet_decoded_portnum, packet_decoded_payload from raw_pb where expanded = true and extracted = false`
        );

        const result: IUnpackedMessage[] = [];

        for (const row of response.rows) {
            debugger
        }

        this.Info("GetUnpackedMessages end");

        return result;
    }

    public async StoreCompleteMessage(message: ICompleteMessage): Promise<void> {
        this.Info("StoreCompleteMessage start");

        this.Info("StoreCompleteMessage start");
    }
}