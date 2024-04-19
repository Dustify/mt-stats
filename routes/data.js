import express from "express";
const router = express.Router();
export default router;

import { getPgClient } from "../util.js";

router.get("/stats_pb/:gatewayId", async (req, res, next) => {
    const pgc = getPgClient();
    await pgc.connect();
    const result = {};
    // START

    const gatewayId = req.params.gatewayId;

    const hourly_stats = await pgc.query(`
    SELECT
        date_trunc('hour', "timestamp") as "t",
        min("packet_rxSnr") as "snr_min",
        max("packet_rxSnr") as "snr_max",
        median("packet_rxSnr") as "snr_med",
        avg("packet_rxSnr") as "snr_avg",
        
        min("packet_rxRssi") as "rssi_min",
        max("packet_rxRssi") as "rssi_max",
        median("packet_rxRssi") as "rssi_med",
        avg("packet_rxRssi") as "rssi_avg",

        min("TELEMETRY_APP_deviceMetrics_channelUtilization") as "cu_min",
        max("TELEMETRY_APP_deviceMetrics_channelUtilization") as "cu_max",

        min("TELEMETRY_APP_deviceMetrics_airUtilTx") as "aut_min",
        max("TELEMETRY_APP_deviceMetrics_airUtilTx") as "aut_max",

        count(*) as "packet_count",	
        count(*) filter (where packet_to = 4294967295 and packet_decoded_portnum != 'TEXT_MESSAGE_APP') AS "packet_timed",
        count(*) filter (where packet_to != 4294967295 and packet_decoded_portnum = 'NODEINFO_APP') AS "packet_nodeinfo_direct",
        count(*) filter (where packet_to != 4294967295 and packet_decoded_portnum = 'TRACEROUTE_APP' and "packet_decoded_wantResponse" = true) AS "packet_tr_req",
        count(*) filter (where packet_to != 4294967295 and packet_decoded_portnum = 'TRACEROUTE_APP' and "packet_decoded_wantResponse" is null) AS "packet_tr_res",
        count(*) filter (where packet_to != 4294967295 and packet_decoded_portnum = 'ROUTING_APP' and "packet_decoded_wantResponse" is null) AS "packet_routing",
        count(*) filter (where packet_to != 4294967295 and packet_decoded_portnum = 'POSITION_APP' and "packet_decoded_wantResponse" = true) AS "packet_pos_req",
        count(*) filter (where packet_to != 4294967295 and packet_decoded_portnum = 'POSITION_APP' and "packet_decoded_wantResponse" is null) AS "packet_pos_direct",
        count(*) filter (where packet_decoded_portnum = 'TEXT_MESSAGE_APP') AS "packet_text",

        count(distinct packet_from) as "senders",
        count(distinct packet_to) as "receivers"	
        
    FROM 
        public.raw_pb
    WHERE
        "timestamp" >= (NOW() - INTERVAL '7 DAYS') and
        "gatewayId" = $1
    GROUP BY
        "t"
    ORDER BY 
        "t"
    `, [
        gatewayId
    ]);

    result.hourly_stats = hourly_stats.rows;

    const nodeinfo = await pgc.query(`
    SELECT 
        distinct on ("packet_from")
        "packet_from",
        "NODEINFO_APP_id" as "id",
        "NODEINFO_APP_longName" as "longName",
        "NODEINFO_APP_shortName" as "shortName",
        "NODEINFO_APP_hwModel" as "hwModel",
        "NODEINFO_APP_role" as "role",
        "NODEINFO_APP_isLicensed" as "isLicensed",
        "timestamp"
    FROM 
        public.raw_pb
    WHERE
        packet_decoded_portnum = 'NODEINFO_APP' and
        "gatewayId" = $1

    order by 
        "packet_from",
        "timestamp" desc
    `, [
        gatewayId
    ]);

    result.nodeinfo = nodeinfo.rows;

    const decorateNode = (obj) => {
        if (obj.packet_from) {
            const n = result.nodeinfo.find(x => x.packet_from === obj.packet_from);

            if (n) {
                obj.from_longname = n.longName;
                obj.from_shortname = n.shortName;
            }
        }

        if (obj.packet_to) {
            if ("4294967295" === obj.packet_to) {
                obj.to_longname = "";
                obj.to_shortname = "";
            } else {
                const n = result.nodeinfo.find(x => x.packet_from === obj.packet_to);

                if (n) {
                    obj.to_longname = n.longName;
                    obj.to_shortname = n.shortName;
                }
            }
        }
    };

    const decorateNodes = (items) => {
        items.forEach(decorateNode);
    };

    const telemetry_gen = await pgc.query(`
    SELECT 
        distinct on ("packet_from")
		"timestamp",
        "packet_from",
    	"TELEMETRY_APP_deviceMetrics_batteryLevel" as "batteryLevel",
		"TELEMETRY_APP_deviceMetrics_voltage" as "voltage",
		"TELEMETRY_APP_deviceMetrics_airUtilTx" as "airUtilTx",
		"TELEMETRY_APP_deviceMetrics_channelUtilization" as "channelUtilization",
        "TELEMETRY_APP_deviceMetrics_uptimeSeconds" as "uptimeSeconds"
    FROM 
        public.raw_pb
    WHERE
        packet_decoded_portnum = 'TELEMETRY_APP' and
        (
            "TELEMETRY_APP_deviceMetrics_batteryLevel" is not null or
            "TELEMETRY_APP_deviceMetrics_voltage" is not null or
            "TELEMETRY_APP_deviceMetrics_airUtilTx" is not null or
            "TELEMETRY_APP_deviceMetrics_channelUtilization" is not null or
            "TELEMETRY_APP_deviceMetrics_uptimeSeconds" is not null
        ) and
        "gatewayId" = $1

    order by 
        "packet_from",
        "timestamp" desc
    `, [
        gatewayId
    ]);

    result.telemetry_gen = telemetry_gen.rows;
    decorateNodes(result.telemetry_gen);

    const telemetry_env = await pgc.query(`
    SELECT 
        distinct on ("packet_from")
		"timestamp",
        "packet_from",
        "TELEMETRY_APP_environmentMetrics_temperature" as "temperature",
		"TELEMETRY_APP_environmentMetrics_relativeHumidity" as "relativeHumidity",
		"TELEMETRY_APP_environmentMetrics_barometricPressure" as "barometricPressure",
        "TELEMETRY_APP_environmentMetrics_gasResistance" as "gasResistance"
    FROM 
        public.raw_pb
    WHERE
        packet_decoded_portnum = 'TELEMETRY_APP' and
        (
            "TELEMETRY_APP_environmentMetrics_temperature" is not null or
            "TELEMETRY_APP_environmentMetrics_relativeHumidity" is not null or
            "TELEMETRY_APP_environmentMetrics_barometricPressure" is not null
        ) and
        "gatewayId" = $1

    order by 
        "packet_from",
        "timestamp" desc
    `, [
        gatewayId
    ]);

    result.telemetry_env = telemetry_env.rows;
    decorateNodes(result.telemetry_env);

    const sender_stats = await pgc.query(`
    SELECT
        distinct(packet_from),
        count(*) as "count",	
        count(*) filter (where packet_to = 4294967295 and "packet_decoded_wantResponse" is null and packet_decoded_portnum = 'TEXT_MESSAGE_APP') AS "c_text",
	 	count(*) filter (where packet_to = 4294967295 and "packet_decoded_wantResponse" is null and packet_decoded_portnum = 'NODEINFO_APP') AS "c_nodeinfo",
	 	count(*) filter (where packet_to = 4294967295 and "packet_decoded_wantResponse" = true and packet_decoded_portnum = 'NODEINFO_APP') AS "c_nodeinfo_wr",
	 	count(*) filter (where packet_to = 4294967295 and "packet_decoded_wantResponse" is null and packet_decoded_portnum = 'TELEMETRY_APP') AS "c_telemetry",
	 	count(*) filter (where packet_to = 4294967295 and "packet_decoded_wantResponse" is null and packet_decoded_portnum = 'POSITION_APP') AS "c_position",
	 	count(*) filter (where packet_to = 4294967295 and "packet_decoded_wantResponse" = true and packet_decoded_portnum = 'POSITION_APP') AS "c_position_wr",
        count(*) filter (where packet_to = 4294967295 and "packet_decoded_wantResponse" is null and packet_decoded_portnum = 'RANGE_TEST_APP') AS "c_range",
        count(*) filter (where packet_to = 4294967295 and "packet_decoded_wantResponse" is null and packet_decoded_portnum = 'STORE_FORWARD_APP') AS "c_storeforward",

	 	count(*) filter (where packet_to != 4294967295 and "packet_decoded_wantResponse" is null and packet_decoded_portnum = 'TEXT_MESSAGE_APP') AS "d_text",
	 	count(*) filter (where packet_to != 4294967295 and "packet_decoded_wantResponse" is null and packet_decoded_portnum = 'NODEINFO_APP') AS "d_nodeinfo",
	 	count(*) filter (where packet_to != 4294967295 and "packet_decoded_wantResponse" = true and packet_decoded_portnum = 'NODEINFO_APP') AS "d_nodeinfo_wr",
	 	count(*) filter (where packet_to != 4294967295 and "packet_decoded_wantResponse" is null and packet_decoded_portnum = 'POSITION_APP') AS "d_position",
	 	count(*) filter (where packet_to != 4294967295 and "packet_decoded_wantResponse" = true and packet_decoded_portnum = 'POSITION_APP') AS "d_position_wr",
	 	count(*) filter (where packet_to != 4294967295 and "packet_decoded_wantResponse" is null and packet_decoded_portnum = 'ROUTING_APP') AS "d_routing",
	 	count(*) filter (where packet_to != 4294967295 and "packet_decoded_wantResponse" is null and packet_decoded_portnum = 'TRACEROUTE_APP') AS "d_tr",
	 	count(*) filter (where packet_to != 4294967295 and "packet_decoded_wantResponse" = true and packet_decoded_portnum = 'TRACEROUTE_APP') AS "d_tr_wr",
        count(*) filter (where packet_to != 4294967295 and "packet_decoded_wantResponse" is null and packet_decoded_portnum = 'STORE_FORWARD_APP') AS "d_storeforward",

        count(*) filter (where packet_decoded_portnum = 'ADMIN_APP') AS "admin"
    FROM 
        public.raw_pb
    WHERE
        "timestamp" >= (NOW() - INTERVAL '1 DAYS') and
        "gatewayId" = $1
    GROUP BY
        "packet_from"
    ORDER BY 
        "count" desc
    `, [
        gatewayId
    ]);

    result.sender_stats = sender_stats.rows;
    decorateNodes(result.sender_stats);

    const receiver_stats = await pgc.query(`
    SELECT
        distinct(packet_to),
        count(*) as "count",	
        count(*) filter (where packet_to = 4294967295 and "packet_decoded_wantResponse" is null and packet_decoded_portnum = 'TEXT_MESSAGE_APP') AS "c_text",
	 	count(*) filter (where packet_to = 4294967295 and "packet_decoded_wantResponse" is null and packet_decoded_portnum = 'NODEINFO_APP') AS "c_nodeinfo",
	 	count(*) filter (where packet_to = 4294967295 and "packet_decoded_wantResponse" = true and packet_decoded_portnum = 'NODEINFO_APP') AS "c_nodeinfo_wr",
	 	count(*) filter (where packet_to = 4294967295 and "packet_decoded_wantResponse" is null and packet_decoded_portnum = 'TELEMETRY_APP') AS "c_telemetry",
	 	count(*) filter (where packet_to = 4294967295 and "packet_decoded_wantResponse" is null and packet_decoded_portnum = 'POSITION_APP') AS "c_position",
	 	count(*) filter (where packet_to = 4294967295 and "packet_decoded_wantResponse" = true and packet_decoded_portnum = 'POSITION_APP') AS "c_position_wr",
        count(*) filter (where packet_to = 4294967295 and "packet_decoded_wantResponse" is null and packet_decoded_portnum = 'RANGE_TEST_APP') AS "c_range",
        count(*) filter (where packet_to = 4294967295 and "packet_decoded_wantResponse" is null and packet_decoded_portnum = 'STORE_FORWARD_APP') AS "c_storeforward",

	 	count(*) filter (where packet_to != 4294967295 and "packet_decoded_wantResponse" is null and packet_decoded_portnum = 'TEXT_MESSAGE_APP') AS "d_text",
	 	count(*) filter (where packet_to != 4294967295 and "packet_decoded_wantResponse" is null and packet_decoded_portnum = 'NODEINFO_APP') AS "d_nodeinfo",
	 	count(*) filter (where packet_to != 4294967295 and "packet_decoded_wantResponse" = true and packet_decoded_portnum = 'NODEINFO_APP') AS "d_nodeinfo_wr",
	 	count(*) filter (where packet_to != 4294967295 and "packet_decoded_wantResponse" is null and packet_decoded_portnum = 'POSITION_APP') AS "d_position",
	 	count(*) filter (where packet_to != 4294967295 and "packet_decoded_wantResponse" = true and packet_decoded_portnum = 'POSITION_APP') AS "d_position_wr",
	 	count(*) filter (where packet_to != 4294967295 and "packet_decoded_wantResponse" is null and packet_decoded_portnum = 'ROUTING_APP') AS "d_routing",
	 	count(*) filter (where packet_to != 4294967295 and "packet_decoded_wantResponse" is null and packet_decoded_portnum = 'TRACEROUTE_APP') AS "d_tr",
	 	count(*) filter (where packet_to != 4294967295 and "packet_decoded_wantResponse" = true and packet_decoded_portnum = 'TRACEROUTE_APP') AS "d_tr_wr",
        count(*) filter (where packet_to != 4294967295 and "packet_decoded_wantResponse" is null and packet_decoded_portnum = 'STORE_FORWARD_APP') AS "d_storeforward"

    FROM 
        public.raw_pb
    WHERE
        "timestamp" >= (NOW() - INTERVAL '1 DAYS') and
        "gatewayId" = $1
    GROUP BY
        "packet_to"
    ORDER BY 
        "count" desc
    `, [
        gatewayId
    ]);

    result.receiver_stats = receiver_stats.rows;
    decorateNodes(result.receiver_stats);

    const messages = await pgc.query(`
    SELECT
        distinct("packet_from", "packet_id"),
        "timestamp",
        "packet_from",
        "packet_to",
        "TEXT_MESSAGE_APP_value" as "text"
    FROM 
        public.raw_pb
    WHERE
        "gatewayId" = $1 and
        packet_decoded_portnum = 'TEXT_MESSAGE_APP'
    ORDER BY 
        "timestamp" desc

    limit 100
    `, [
        gatewayId
    ]);

    result.messages = messages.rows;
    decorateNodes(result.messages);

    const positions = await pgc.query(`
    SELECT 
        distinct on ("packet_from")
        "timestamp",
        "packet_from",
        "POSITION_APP_latitudeI" / 1e7 as "latitude",
        "POSITION_APP_longitudeI" / 1e7 as "longitude",
        "POSITION_APP_altitude" as "altitude",
        "POSITION_APP_time" as "time",
        "POSITION_APP_precisionBits" as "precisionBits",
        "POSITION_APP_PDOP" as "PDOP",
        "POSITION_APP_groundSpeed" as "groundSpeed",
        "POSITION_APP_satsInView" as "satsInView",
        "POSITION_APP_groundTrack" as "groundTrack",
        "POSITION_APP_timestamp" as "x_timestamp"
    FROM 
        public.raw_pb
    WHERE
        packet_decoded_portnum = 'POSITION_APP' and
        "POSITION_APP_latitudeI" is not null and
        "gatewayId" = $1

    order by 
        "packet_from",
        "timestamp" desc
    `, [
        gatewayId
    ]);

    result.positions = positions.rows;
    decorateNodes(result.positions);

    const routes = await pgc.query(`
    SELECT 
        distinct on (packet_from, packet_id)
        "timestamp",
        "packet_from",
        "packet_to",
        "TRACEROUTE_APP_route" as "route"
    FROM 
        public.raw_pb
    where 
        packet_decoded_portnum = 'TRACEROUTE_APP' and
        "packet_decoded_requestId" is not null and
        "timestamp" >= (NOW() - INTERVAL '1 DAYS') and
        "gatewayId" = $1
    ORDER BY 
        "packet_from",
        "packet_id"
    `, [
        gatewayId
    ]);

    for (const route of routes.rows) {
        const r = [];

        const addNode = (id) => {
            let t = "Unknown";
            const info = result.nodeinfo.find(x => x.packet_from === id.toString());

            if (info) {
                t = `(${info.shortName}) ${info.longName}`;
            }

            r.push(t);
        };

        addNode(route.packet_from);

        const p = JSON.parse(route.route);

        if (p) {
            p.reverse();
            p.forEach(addNode);
        }

        addNode(route.packet_to);

        route.result = r.join(" > ");
    }

    result.routes = routes.rows;

    // END
    await pgc.end();
    res.send(result);
});

router.get("/voltage/:gatewayId/:from", async (req, res, next) => {
    const pgc = getPgClient();
    await pgc.connect();
    // START

    const gid = req.params.gatewayId;
    const from = req.params.from;

    const result = await pgc.query(`
    SELECT
        date_trunc('hour', "timestamp") as "t",
        min("TELEMETRY_APP_deviceMetrics_voltage") as "v_min",
        max("TELEMETRY_APP_deviceMetrics_voltage") as "v_max",
        median("TELEMETRY_APP_deviceMetrics_voltage") as "v_med",
        avg("TELEMETRY_APP_deviceMetrics_voltage") as "v_avg"
    FROM 
        public.raw_pb
    WHERE
        "packet_from" = $1 and
        "gatewayId" = $2 and
        "packet_decoded_portnum" = 'TELEMETRY_APP' and
        "TELEMETRY_APP_deviceMetrics_voltage" is not null and
        "timestamp" >= (NOW() - INTERVAL '7 DAYS')
    group by
        "t"
    ORDER BY 
        "t" asc
    `, [
        from,
        gid
    ]);

    // END
    await pgc.end();
    res.send(result.rows);
});

router.get("/gateways", async (req, res, next) => {
    const pgc = getPgClient();
    await pgc.connect();
    // START

    const names = (await pgc.query(`
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

    const gws = (await pgc.query(`
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

    for (const gw of gws) {
        const name = names.find(x => x.id === gw.gatewayId);

        if (name) {
            gw.name = `(${name.short}) ${name.long}`
        }
    }

    // END
    await pgc.end();
    res.send(gws);
});