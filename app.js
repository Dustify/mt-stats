import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import cookieParser from "cookie-parser";
import logger from "morgan";
import mqtt from "mqtt";

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

(async function () {
    const pgc = getPgClient();
    await pgc.connect();

    const processObject = (o, prefix, result) => {
        for (const p in o) {
            const key = prefix + p;
            const v = o[p];

            if (v instanceof Object) {
                processObject(v, `${prefix}${p}_`, result);
            } else {
                const c = { key: key, value: v };

                if (typeof c.value === "string") {
                    c.value = `'${c.value}'`;
                }

                result.push(c);
            }
        }
    };

    const extract = async () => {
        const rows = (await pgc.query(`select id, packet_decoded_portnum, packet_decoded_payload from raw_pb where extracted = false`)).rows;

        for (const row of rows) {
            try {
                const map = {
                    "NODEINFO_APP": User,
                    "TRACEROUTE_APP": RouteDiscovery,
                    "POSITION_APP": Position,
                    "TELEMETRY_APP": Telemetry,
                    "ROUTING_APP": Routing,
                    "TEXT_MESSAGE_APP": { fromBinary: s => s.toString() }
                };

                const type = row.packet_decoded_portnum;

                if (!map[type]) {
                    log("UNHANDLED EXTRACT", type)
                    continue;
                }

                const result = [{ key: "extracted", value: true }];

                if (row.packet_decoded_payload) {
                    const payload = Buffer.from(row.packet_decoded_payload, 'base64');
                    let v = map[type].fromBinary(payload);

                    if (v instanceof Object) {
                        v = v.toJson();

                        if (type === "TRACEROUTE_APP") {
                            v.route = JSON.stringify(v.route);
                        }

                        processObject(v, type + "_", result);
                    } else {
                        const t = typeof v;

                        if (t === "string") {
                            v = v.replaceAll("'", "''");

                            result.push({ key: `${type}_value`, value: `'${v}'` });
                        }
                    }
                }

                const update = result.map(x => `"${x.key}"=${x.value}`).join(",");

                try {
                    await pgc.query(`update raw_pb set ${update} where id = ${row.id}`);
                }
                catch (error) {
                    const col = /.*column "(.*?)".*/.exec(error?.message)[1] || "";
                    console.log(error.message, col, result.find(x => x.key === col).value);
                    debugger
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

                log(p.packet.decoded.portnum, p.packet.from, p.packet.to);

                const result = [
                    { key: "expanded", value: true },
                    { key: "timestamp", value: `'${new Date(p.packet.rxTime * 1000).toISOString()}'` }
                ];

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