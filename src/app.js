import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import cookieParser from "cookie-parser";
import logger from "morgan";
import mqtt from "mqtt";
import { rateLimit } from "express-rate-limit";

import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import dataRouter from "./routes/data.js";
import { getPgClient } from "./util.js";

const app = express();
export default app;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const rateLimitMinutes = 10;
const rps = 10;

const limiter = rateLimit({
    windowMs: rateLimitMinutes * 60 * 1000,
    max: rateLimitMinutes * 60 * rps
});

// apply rate limiter to all requests
app.use(limiter);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/data", dataRouter);
app.use("//data", dataRouter); // fuk u

const log = (...data) => {
    console.log(new Date().toString().substring(0, 24), ...data);
};

import { ServiceEnvelope } from "@buf/meshtastic_protobufs.bufbuild_es/meshtastic/mqtt_pb.js";
import { User, RouteDiscovery, Position, Routing } from "@buf/meshtastic_protobufs.bufbuild_es/meshtastic/mesh_pb.js"
import { Telemetry } from "@buf/meshtastic_protobufs.bufbuild_es/meshtastic/telemetry_pb.js";
import { AdminMessage } from "@buf/meshtastic_protobufs.bufbuild_es/meshtastic/admin_pb.js";
import { StoreAndForward } from "@buf/meshtastic_protobufs.bufbuild_es/meshtastic/storeforward_pb.js";

(async function () {
    const pgc = getPgClient();
    await pgc.connect();

    // SQL UPDATES
    const sql_updates = [
        `ALTER TABLE IF EXISTS public.raw_pb ADD COLUMN IF NOT EXISTS "NODEINFO_APP_isLicensed" boolean`,
        `ALTER TABLE IF EXISTS public.raw_pb ADD COLUMN IF NOT EXISTS "packet_decoded_replyId" bigint`,
        `ALTER TABLE IF EXISTS public.raw_pb ADD COLUMN IF NOT EXISTS "packet_decoded_emoji" bigint`,
        `ALTER TABLE IF EXISTS public.raw_pb ADD COLUMN IF NOT EXISTS "ADMIN_APP_setOwner_longName" character varying(128)`,
        `ALTER TABLE IF EXISTS public.raw_pb ADD COLUMN IF NOT EXISTS "ADMIN_APP_setOwner_shortName" character varying(8)`,
        `ALTER TABLE IF EXISTS public.raw_pb ADD COLUMN IF NOT EXISTS "ADMIN_APP_beginEditSettings" boolean`,
        `ALTER TABLE IF EXISTS public.raw_pb ADD COLUMN IF NOT EXISTS "RANGE_TEST_APP_value" character varying(128)`,
        `ALTER TABLE IF EXISTS public.raw_pb ADD COLUMN IF NOT EXISTS "packet_channel" bigint`,
        `ALTER TABLE IF EXISTS public.raw_pb ADD COLUMN IF NOT EXISTS "STORE_FORWARD_APP_rr" character varying(1024)`,
        `ALTER TABLE IF EXISTS public.raw_pb ADD COLUMN IF NOT EXISTS "STORE_FORWARD_APP_heartbeat_period" bigint`,
        `ALTER TABLE IF EXISTS public.raw_pb ADD COLUMN IF NOT EXISTS "TELEMETRY_APP_deviceMetrics_uptimeSeconds" bigint`,
        `update public.raw_pb set "TELEMETRY_APP_deviceMetrics_airUtilTx" = null where "TELEMETRY_APP_deviceMetrics_airUtilTx" > 100`,
        `CREATE INDEX IF NOT EXISTS raw_pb_gateway_timestamp_idx on raw_pb ("gatewayId", "timestamp")`,
        `ALTER TABLE IF EXISTS public.raw_pb ADD COLUMN IF NOT EXISTS "TELEMETRY_APP_environmentMetrics_gasResistance" numeric`,
        `ALTER TABLE IF EXISTS public.raw_pb ADD COLUMN IF NOT EXISTS "TELEMETRY_APP_environmentMetrics_iaq" numeric`,
        `ALTER TABLE IF EXISTS public.raw_pb ADD COLUMN IF NOT EXISTS "TELEMETRY_APP_powerMetrics_ch3Current" numeric`,
        `ALTER TABLE IF EXISTS public.raw_pb ADD COLUMN IF NOT EXISTS "TELEMETRY_APP_powerMetrics_ch3Voltage" numeric`,
        `ALTER TABLE IF EXISTS public.raw_pb ADD COLUMN IF NOT EXISTS "POSITION_APP_altitudeHae" numeric`,
        `ALTER TABLE IF EXISTS public.raw_pb ADD COLUMN IF NOT EXISTS "TELEMETRY_APP_environmentMetrics_distance" numeric`,
        `ALTER TABLE IF EXISTS public.raw_pb ADD COLUMN IF NOT EXISTS "STORE_FORWARD_APP_text" character varying(1024)`,
    ];

    for (const sql_update of sql_updates) {
        try {
            console.log("Executing SQL update: " + sql_update);
            await pgc.query(sql_update);
            console.log("> Update complete");
        }
        catch (error) {
            console.log("> WARNING: Update failed");
        }
    }

    const processObject = (o, prefix, result) => {
        for (const p in o) {
            const key = prefix + p;
            const v = o[p];

            if (v instanceof Object) {
                processObject(v, `${prefix}${p}_`, result);
            } else {
                const c = { key: key, value: v };

                if (typeof c.value === "string") {
                    const v = c.value.replaceAll("'", "''");
                    c.value = `'${v}'`;
                }

                result.push(c);
            }
        }
    };

    const map = {
        "NODEINFO_APP": User,
        "TRACEROUTE_APP": RouteDiscovery,
        "POSITION_APP": Position,
        "TELEMETRY_APP": Telemetry,
        "ROUTING_APP": Routing,
        "TEXT_MESSAGE_APP": { fromBinary: s => s.toString() },
        "ADMIN_APP": AdminMessage,
        "RANGE_TEST_APP": { fromBinary: s => s.toString() },
        "STORE_FORWARD_APP": StoreAndForward
    };

    const extractPayload = (result, type, row) => {
        const payload = Buffer.from(row.packet_decoded_payload, 'base64');
        let v = map[type].fromBinary(payload);

        if (v instanceof Object) {
            v = v.toJson();

            if (type === "TRACEROUTE_APP") {
                v.route = JSON.stringify(v.route);
            }

            if (type === "TELEMETRY_APP") {
                if (v?.deviceMetrics?.airUtilTx && v.deviceMetrics.airUtilTx > 100) {
                    console.log("airUtilTx > 100, setting null");
                    v.deviceMetrics.airUtilTx = null;
                }
            }

            processObject(v, type + "_", result);
        } else {
            const t = typeof v;

            if (t === "string") {
                v = v.replaceAll("'", "''");

                result.push({ key: `${type}_value`, value: `'${v}'` });
            }
        }
    };

    const extract = async () => {
        const rows = (await pgc.query(`select id, packet_decoded_portnum, packet_decoded_payload from raw_pb where expanded = true and extracted = false`)).rows;

        for (const row of rows) {
            try {
                const type = row.packet_decoded_portnum;

                if (!map[type]) {
                    log("UNHANDLED EXTRACT", type)
                    continue;
                }

                const result = [{ key: "extracted", value: true }];

                if (row.packet_decoded_payload) {
                    extractPayload(result, type, row);
                }

                const update = result.map(x => `"${x.key}"=${x.value}`).join(",");

                try {
                    await pgc.query(`update raw_pb set ${update} where id = ${row.id}`);
                }
                catch (error) {
                    console.log(error.message);
                }
            }
            catch (err) {
                console.log("PB extract error", err);
            }
        }
    };

    const expand = async () => {
        const rows = (await pgc.query(`select data, id from raw_pb where expanded = false`)).rows;

        for (const row of rows) {
            try {
                const p = ServiceEnvelope.fromBinary(row.data).toJson();

                if (!p.packet.decoded) {
                    console.log("No decode, deleting", p.packet);
                    await pgc.query(`delete from raw_pb where id = ${row.id}`);
                    continue;
                }

                log(p.packet.decoded.portnum, p.packet.from, p.packet.to);

                

                const result = [
                    { key: "expanded", value: true }
                ];

                if (p.packet.rxTime) {
                    result.push({ key: "timestamp", value: `'${new Date(p.packet.rxTime * 1000).toISOString()}'` });
                }

                processObject(p, "", result);

                const update = result.map(x => `"${x.key}"=${x.value}`).join(",");

                await pgc.query(`update raw_pb set ${update} where id = ${row.id}`);
            }
            catch (err) {
                console.log("PB expand error", err);
            }
        }

        await extract();
    };

    await expand();

    const mqttClient = mqtt.connect(process.env["MQTT_ADDRESS"], { clean: false, clientId: process.env["MQTT_CLIENTID"] });

    mqttClient.on("error", (error) => {
        log("mqttClient error", error);
    });

    const processProtobuf = async (topic, message) => {
        try {
            await pgc.query("insert into raw_pb (data) values ($1)", [message]);

            log("PROTOBUF str", topic);

            await expand();
        }
        catch (exception) {
            log("ERROR", exception);
        }
    };

    mqttClient.on("connect", () => {
        log("mqttClient connect");

        mqttClient.subscribe("#", (error) => {
            log("mqttClient subscribe", error);
        });

        mqttClient.on("message", (topic, message) => {
            if (topic.indexOf("/c/") > -1) {
                processProtobuf(topic, message);
                return;
            }

            if (topic.indexOf("/e/") > -1) {
                processProtobuf(topic, message);
                return;
            }

            log("UNHANDLED", topic, message.toString());
        });
    });
})();