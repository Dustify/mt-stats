let nfvc_node = "";

const render = async () => {
    const select = document.getElementById("gateways");
    const gatewayId = select.value;

    document.getElementById("wrapper_chart").innerHTML = "";
    document.getElementById("wrapper_table").innerHTML = "";

    const data = await (await fetch(`data/stats_pb/${gatewayId}`)).json();

    const nfvc = document.getElementById("nfvc");
    nfvc.innerHTML = "";

    let gatewayIdBase10 = "";

    for (const node of data.nodeinfo) {
        if (node.id === gatewayId) {
            gatewayIdBase10 = node.packet_from;
        }

        nfvc.innerHTML += `<option value="${node.packet_from}">(${node.shortName}) ${node.longName}</option>`;
    }

    nfvc.value = nfvc_node || gatewayIdBase10;

    let vdata = await (await fetch(`data/voltage/${gatewayId}/${nfvc.value}`)).json();

    const x_axis = [];

    const now = new Date(new Date().toISOString().substring(0, 14) + "00Z");

    for (let i = 0; i < (7 * 24); i++) {
        const d = new Date(now);
        d.setHours(d.getHours() - i);

        x_axis.push(d.toString().substring(0, 21));
    }

    x_axis.reverse();

    const create_chart = (req) => {
        const sets = req.sets;

        if (!sets) {
            throw new Error("No data sets!");
        }

        const first = sets[0];

        if (!sets) {
            throw new Error("No first data set!");
        }

        let elem = document.getElementById(first.name);

        if (elem) {
            elem.parentElement.remove();
        }

        const wrapper = document.createElement("div");
        wrapper.setAttribute("class", "gc");

        elem = document.createElement("canvas");
        elem.setAttribute("id", first.name);

        wrapper.appendChild(elem);
        document.getElementById("wrapper_chart").appendChild(wrapper);

        const annotations = {
        };

        for (let i = 0; i < x_axis.length; i++) {
            if (!x_axis[i].endsWith("00:00")) {
                continue;
            }

            annotations["line" + i] = {
                type: 'line',
                xMin: i,
                xMax: i
            };
        }

        const ds = [];

        for (const set of sets) {
            ds.push({
                label: set.name,
                data: set.data
            });
        }

        // SQ doesn't like this - justified as chart.js has to be used this way
        new Chart(document.getElementById(first.name), {
            type: req.type || 'line',
            data: {
                labels: req.x_axis || x_axis,
                datasets: ds
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    annotation: {
                        annotations: annotations
                    }
                },
                scales: {
                    x: {
                        stacked: req.stacked,
                    },
                    y: {
                        stacked: req.stacked
                    }
                }
            }
        });
    };

    const expand = (set) => {
        const result = [];

        for (let i = 0; i < x_axis.length; i++) {
            const s = set.find(x => new Date(x.t).toString().substring(0, 21) === x_axis[i]);

            if (!s) {
                continue;
            }

            result[i] = s;
        }

        return result;
    };

    vdata = expand(vdata);

    create_chart({
        sets: [{
            name: "v_min",
            data: vdata.map(x => x.v_min)
        }, {
            name: "v_max",
            data: vdata.map(x => x.v_max)
        }, {
            name: "v_med",
            data: vdata.map(x => x.v_med)
        }, {
            name: "v_avg",
            data: vdata.map(x => x.v_avg)
        }]
    });

    data.hourly_stats = expand(data.hourly_stats);

    create_chart({
        sets: [{
            name: "snr_min",
            data: data.hourly_stats.map(x => x.snr_min)
        }, {
            name: "snr_max",
            data: data.hourly_stats.map(x => x.snr_max)
        }, {
            name: "snr_med",
            data: data.hourly_stats.map(x => x.snr_med)
        }, {
            name: "snr_avg",
            data: data.hourly_stats.map(x => x.snr_avg)
        }]
    });

    create_chart({
        sets: [{
            name: "rssi_min",
            data: data.hourly_stats.map(x => x.rssi_min),
        }, {
            name: "rssi_max",
            data: data.hourly_stats.map(x => x.rssi_max),
        }, {
            name: "rssi_med",
            data: data.hourly_stats.map(x => x.rssi_med),
        }, {
            name: "rssi_avg",
            data: data.hourly_stats.map(x => x.rssi_avg)
        }]
    });

    create_chart({
        sets: [{
            name: "cu_min",
            data: data.hourly_stats.map(x => x.cu_min),
        }, {
            name: "cu_max",
            data: data.hourly_stats.map(x => x.cu_max),
        }]
    });

    create_chart({
        sets: [{
            name: "aut_min",
            data: data.hourly_stats.map(x => x.aut_min),
        }, {
            name: "aut_max",
            data: data.hourly_stats.map(x => x.aut_max),
        }]
    });

    create_chart({
        sets: [{
            name: "packet_count",
            data: data.hourly_stats.map(x => x.packet_count)
        }]
    });

    create_chart({
        sets: [{
            name: "packet_timed",
            data: data.hourly_stats.map(x => x.packet_timed),
        }, {
            name: "packet_nodeinfo_direct",
            data: data.hourly_stats.map(x => x.packet_nodeinfo_direct),
        }, {
            name: "packet_tr_req",
            data: data.hourly_stats.map(x => x.packet_tr_req),
        }, {
            name: "packet_tr_res",
            data: data.hourly_stats.map(x => x.packet_tr_res),
        }, {
            name: "packet_routing",
            data: data.hourly_stats.map(x => x.packet_routing),
        }, {
            name: "packet_pos_req",
            data: data.hourly_stats.map(x => x.packet_pos_req),
        }, {
            name: "packet_pos_direct",
            data: data.hourly_stats.map(x => x.packet_pos_direct),
        }, {
            name: "packet_text",
            data: data.hourly_stats.map(x => x.packet_text),
        }],
        type: "bar",
        stacked: true
    });

    create_chart({
        sets: [{
            name: "senders",
            data: data.hourly_stats.map(x => x.senders),
        }, {
            name: "receivers",
            data: data.hourly_stats.map(x => x.receivers)
        }]
    });

    const sortTimestampDesc = (set) => {
        set.sort((a, b) => {
            return new Date(a.timestamp).getTime() < new Date(b.timestamp).getTime() ? 1 : -1;
        });
    };

    sortTimestampDesc(data.telemetry_gen);
    sortTimestampDesc(data.telemetry_env);
    sortTimestampDesc(data.nodeinfo);
    sortTimestampDesc(data.positions);
    sortTimestampDesc(data.routes);

    const create_table = (req) => {

        let html = "<div>";
        html += `<h3>${req.t}</h3>`;
        html += `<table class="table table-bordered"><thead><tr>`;

        let sums = {};

        if (req.mh) {
            for (const mh of req.mh) {
                html += `<th colspan="${mh.c}">${mh.t}</th>`;
            }

            html += "</tr><tr>";
        }

        for (const [i, c] of req.c.entries()) {
            let result = (req.cn && req.cn[i]) || c;

            if (req.sum && req.sum.indexOf(c) > -1) {
                let sum = 0;

                for (const d of req.d) {
                    sum += parseInt(d[c]);
                }

                sums[c] = sum;

                result += `<br />${sum}`;
            }

            html += `<th scope="col">${result}</th>`;
        }

        // header

        html += "</tr></thead><tbody>";

        // body

        for (const d of req.d) {
            html += `<tr>`;

            for (const c of req.c) {
                let v = d[c] || "";

                if (c === "timestamp") {
                    v = new Date(v).toString().substring(0, 24);
                }

                if (req.dp && req.dp.indexOf(c) > -1) {
                    v = parseFloat(v || 0).toFixed(2);
                }

                if (c === "latitude" || c === "longitude") {
                    v = parseFloat(v || 0).toFixed(7);
                }

                if (v && sums[c]) {
                    const pct = (v / sums[c] * 100).toFixed(2);

                    v += `<br />${pct}%`;
                }

                html += `<td>${v}</td>`;
            }

            html += `</tr>`;
        }

        html += "</tbody></table></div>";

        const wrapper = document.getElementById("wrapper_table");
        wrapper.innerHTML += html;
    };

    create_table({
        t: `Senders (24 hours) (${data.sender_stats.length})`,
        d: data.sender_stats,
        c: [
            "packet_from",
            "from_shortname",
            "from_longname",
            "count",
            "c_text",
            "c_nodeinfo",
            "c_nodeinfo_wr",
            "c_telemetry",
            "c_position",
            "c_position_wr",
            "c_range",
            "d_text",
            "d_nodeinfo",
            "d_nodeinfo_wr",
            "d_position",
            "d_position_wr",
            "d_routing",
            "d_tr",
            "d_tr_wr",
            "admin"
        ],
        mh: [
            { t: "", c: 4 },
            { t: "Channel", c: 7 },
            { t: "Direct", c: 8 },
        ],
        cn: [
            "From",
            "SName",
            "LName",
            "Count",
            "Text",
            "NI",
            "NI (WR)",
            "Tele.",
            "Pos.",
            "Pos. (WR)",
            "Range",
            "Text",
            "NI",
            "NI (WR)",
            "Pos.",
            "Pos. (WR)",
            "Routing",
            "Trace",
            "Trace (WR)",
            "Admin"
        ],
        sum: [
            "count",
            "c_text",
            "c_nodeinfo",
            "c_nodeinfo_wr",
            "c_telemetry",
            "c_position",
            "c_position_wr",
            "c_range",
            "d_text",
            "d_nodeinfo",
            "d_nodeinfo_wr",
            "d_position",
            "d_position_wr",
            "d_routing",
            "d_tr",
            "d_tr_wr",
            "admin"
        ]
    });

    create_table({
        t: `Receivers (24 hours) (${data.receiver_stats.length})`,
        d: data.receiver_stats,
        c: [
            "packet_to",
            "to_shortname",
            "to_longname",
            "count",
            "c_text",
            "c_nodeinfo",
            "c_nodeinfo_wr",
            "c_telemetry",
            "c_position",
            "c_position_wr",
            "c_range",
            "d_text",
            "d_nodeinfo",
            "d_nodeinfo_wr",
            "d_position",
            "d_position_wr",
            "d_routing",
            "d_tr",
            "d_tr_wr"
        ],
        mh: [
            { t: "", c: 4 },
            { t: "Channel", c: 7 },
            { t: "Direct", c: 8 },
        ],
        cn: [
            "To",
            "SName",
            "LName",
            "Count",
            "Text",
            "NI",
            "NI (WR)",
            "Tele.",
            "Pos.",
            "Pos. (WR)",
            "Range",
            "Text",
            "NI",
            "NI (WR)",
            "Pos.",
            "Pos. (WR)",
            "Routing",
            "Trace",
            "Trace (WR)",
        ],
        sum: [
            "count",
            "c_text",
            "c_nodeinfo",
            "c_nodeinfo_wr",
            "c_telemetry",
            "c_position",
            "c_position_wr",
            "c_range",
            "d_text",
            "d_nodeinfo",
            "d_nodeinfo_wr",
            "d_position",
            "d_position_wr",
            "d_routing",
            "d_tr",
            "d_tr_wr"
        ]
    });

    create_table({
        t: `Telemetry (device)`,
        d: data.telemetry_gen,
        c: [
            "timestamp",
            "packet_from",
            "from_shortname",
            "from_longname",
            "airUtilTx",
            "channelUtilization",
            "batteryLevel",
            "voltage",
            "uptimeSeconds"
        ],
        dp: [
            "airUtilTx",
            "channelUtilization",
            "batteryLevel",
            "voltage"
        ]
    });

    create_table({
        t: `Telemetry (environment)`,
        d: data.telemetry_env,
        c: [
            "timestamp",
            "packet_from",
            "from_shortname",
            "from_longname",
            "barometricPressure",
            "relativeHumidity",
            "temperature"
        ],
        dp: [
            "barometricPressure",
            "relativeHumidity",
            "temperature"
        ]
    });

    create_table({
        t: `Positions`,
        d: data.positions,
        c: [
            "timestamp",
            "packet_from",
            "from_shortname",
            "from_longname",
            "latitude",
            "longitude",

            "altitude",
            "time",
            "precisionBits",
            "PDOP",
            "groundSpeed",
            "satsInView",
            "groundTrack",
            "x_timestamp"
        ],
        dp: [
            "barometricPressure",
            "relativeHumidity",
            "temperature"
        ]
    });

    create_table({
        t: `All nodes (${data.nodeinfo.length})`,
        d: data.nodeinfo,
        c: [
            "timestamp",
            "packet_from",
            "shortName",
            "longName",
            "id",
            "hwModel",
            "role",
            "isLicensed"
        ]
    });

    create_table({
        t: `Traceroutes (24 hours)`,
        d: data.routes,
        c: [
            "timestamp",
            "result"
        ]
    });

    create_table({
        t: `Messages (last 100)`,
        d: data.messages,
        c: [
            "timestamp",
            "packet_from",
            "from_shortname",
            "from_longname",
            "packet_to",
            "to_shortname",
            "to_longname",
            "text"
        ]
    });
};

(async () => {
    const gateways = await (await fetch("data/gateways")).json();
    const select = document.getElementById("gateways");

    select.innerHTML = "";

    for (const gw of gateways) {
        let text = gw.gatewayId;

        if (gw.name) {
            text += " " + gw.name;
        }

        select.innerHTML += `<option value="${gw.gatewayId}">${text}</option>`;
    }

    select.onchange = () => {
        nfvc_node = "";
        render();
    };

    const nfvc = document.getElementById("nfvc");
    nfvc.onchange = () => {
        nfvc_node = nfvc.value;
        render();
    };

    render();
})();