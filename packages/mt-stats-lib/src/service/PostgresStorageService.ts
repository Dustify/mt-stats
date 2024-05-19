import { IStorageService } from "../if/IStorageService.js";

import pg from "pg";
import { IRawMessage } from "../model/IRawMessage.js";
import { IUnpackedMessage } from "../model/IUnpackedMessage.js";
import { ICompleteMessage } from "../model/ICompleteMessage.js";
import { ServiceBase } from "./ServiceBase.js";
import { SchemaUpdates } from "../util/SchemaUpdates.js";
import { IGateway } from "../model/IGateway.js";

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

    public async GetGateways(): Promise<IGateway[]> {
        const names: {
            id: string;
            short: string;
            long: string;
        }[] = (await this.Client.query(`
            SELECT
                distinct on ("NODEINFO_APP_id") 
                "NODEINFO_APP_id" as "id",
                "NODEINFO_APP_shortName" as "short",
                "NODEINFO_APP_longName" as "long"
            FROM 
                public.raw_pb

            WHERE
                "NODEINFO_APP_id" is not null

            order by 
                "NODEINFO_APP_id",
                "timestamp" desc
        `)).rows;

        const gws: {
            gatewayId: string;
            count: number;
        }[] = (await this.Client.query(`
            SELECT
                distinct ("gatewayId") as "gatewayId",
                count(*) as "count"
            FROM 
                public.raw_pb
            WHERE
                "gatewayId" is not null
            GROUP BY
                "gatewayId"
            ORDER BY 
                "count" desc
            `)).rows;

        const result: IGateway[] = [];

        for (const gw of gws) {
            const item: IGateway = {
                Id: gw.gatewayId,
                Name: ""
            };

            const name = names.find(x => x.id === gw.gatewayId);

            if (name) {
                item.Name = `(${name.short}) ${name.long}`
            }

            result.push(item);
        }

        return result;
    }

    private GenerateUpdate(source: any): string {
        const result: string[] = [];

        for (const prop in source) {
            if (prop === "id") {
                continue;
            }

            let value = source[prop];

            if (typeof value === "string") {
                value = value.replaceAll("'", "''");
                value = `'${value}'`;
            }

            result.push(`"${prop}" = ${value}`);
        }

        return result.join(", ");
    }

    public async Connect(): Promise<void> {
        this.Info("Connect start");

        await this.Client.connect();


        for (const sql_update of SchemaUpdates) {
            try {
                this.Info("Executing SQL update: " + sql_update);
                await this.Client.query(sql_update);
                this.Info("> Update complete");
            }
            catch (error) {
                this.Warn("> WARNING: Update failed", error);
            }
        }

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

        this.Info("GetRawMessages end");

        return response.rows;
    }

    public async StoreUnpackedMessage(message: IUnpackedMessage): Promise<void> {
        this.Info("StoreUnpackedMessage start");

        const updates = this.GenerateUpdate(message);

        const update = `update raw_pb set ${updates} where id = ${message.id}`;

        await this.Client.query(update);

        this.Info("StoreUnpackedMessage end");
    }

    public async GetUnpackedMessages(): Promise<IUnpackedMessage[]> {
        this.Info("GetUnpackedMessages start");

        const response = await this.Client.query(
            `select id, packet_decoded_portnum, packet_decoded_payload from raw_pb where expanded = true and extracted = false`
        );

        this.Info("GetUnpackedMessages end");

        return response.rows;
    }

    public async StoreCompleteMessage(message: ICompleteMessage): Promise<void> {
        this.Info("StoreCompleteMessage start");

        const updates = this.GenerateUpdate(message);
        const update = `update raw_pb set ${updates} where id = ${message.id}`;

        try {
            await this.Client.query(update);
        }
        catch (error) {
            this.Error("StoreCompleteMessage error", error);
        }

        this.Info("StoreCompleteMessage end");
    }
}