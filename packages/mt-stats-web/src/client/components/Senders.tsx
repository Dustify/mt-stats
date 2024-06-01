
import axios from "axios";
import React from "react";

import { useLoaderData } from "react-router-dom";

export const SendersLoader = async ({ params }: any) => {
    return (await axios.get(`/api/senders/${params.gatewayId}`)).data;
};

export const Senders = () => {
    const data = useLoaderData() as any[];

    if (!data.length) {
        return <></>;
    }

    const sourceColumns = [
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
        "c_storeforward",

        "d_text",
        "d_nodeinfo",
        "d_nodeinfo_wr",
        "d_position",
        "d_position_wr",
        "d_routing",
        "d_tr",
        "d_tr_wr",
        "d_storeforward",

        "admin"
    ];

    const targetColumns = [
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
        "SF",

        "Text",
        "NI",
        "NI (WR)",
        "Pos.",
        "Pos. (WR)",
        "Routing",
        "Trace",
        "Trace (WR)",
        "SF",

        "Admin"
    ];

    return <>
        <h3>Senders (24 hours) ({data.length})</h3>
        <table className="table table-bordered">
            <thead>
                {/* <tr> master header
                    <th colspan="4"></th>
                    <th colspan="8">Channel</th>
                    <th colspan="9">Direct</th>
                </tr> */}
                <tr>
                    {
                        targetColumns.map((x, i) =>
                            <th key={i} scope="col">{x}</th>
                        )
                    }
                </tr>
            </thead>
            <tbody>
                {
                    data.map((x, i) =>
                        <tr key={i}>
                            {
                                sourceColumns.map((y, iy) =>
                                    <td key={iy}>{x[y]}</td>
                                )
                            }
                        </tr>
                    )
                }
            </tbody>
        </table>
    </>;
}