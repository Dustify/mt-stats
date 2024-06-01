
import axios from "axios";
import React from "react";

import { Line, Bar, Chart } from "react-chartjs-2";
import { useLoaderData } from "react-router-dom";

import { ChartService } from "../service/ChartService.js";
import { IPackets } from "mt-stats-lib";

export const PacketsLoader = async ({ params }: any) => {
    return (await axios.get(`/api/packets/${params.gatewayId}`)).data;
};

export const Packets = () => {
    const data = useLoaderData() as IPackets[];
    const expand = ChartService.ExpandData(data);

    const packet_count = ChartService.GetChartProps(
        "Packet Count",
        expand, [
        {
            label: "Value",
            data: expand.data.map(x => x.packet_count)
        }
    ]);

    const breakdown = ChartService.GetChartProps(
        "Packet Breakdown",
        expand, [
        {
            label: "Timed",
            data: expand.data.map(x => x.packet_timed)
        },
        {
            label: "Node info direct",
            data: expand.data.map(x => x.packet_nodeinfo_direct)
        },
        {
            label: "Traceroute request",
            data: expand.data.map(x => x.packet_tr_req)
        },
        {
            label: "Traceroute response",
            data: expand.data.map(x => x.packet_tr_res)
        },
        {
            label: "Routing",
            data: expand.data.map(x => x.packet_routing)
        },
        {
            label: "Position request",
            data: expand.data.map(x => x.packet_pos_req)
        },
        {
            label: "Position direct",
            data: expand.data.map(x => x.packet_pos_direct)
        },
    ]);

    breakdown.type = "bar";
    breakdown.options.scales.x.stacked = true;
    breakdown.options.scales.y.stacked = true;

    const sr = ChartService.GetChartProps(
        "Senders & Receivers",
        expand, [
        {
            label: 'Senders',
            data: expand.data.map(x => x.senders),
        },
        {
            label: 'Receivers',
            data: expand.data.map(x => x.receivers),
        }
    ]);

    return <>
        <Line {...packet_count} />
        <Bar {...breakdown} />
        <Line {...sr} />
    </>;
}