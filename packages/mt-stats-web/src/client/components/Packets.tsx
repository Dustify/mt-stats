
import axios from "axios";
import React from "react";

import { Line, Bar } from "react-chartjs-2";
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
        }
    ]);

    // const aut = ChartService.GetChartProps(
    //     "TX Utilisation",
    //     expand, [
    //     {
    //         label: 'Minimum',
    //         data: expand.data.map(x => x.aut_min),
    //     },
    //     {
    //         label: 'Maximum',
    //         data: expand.data.map(x => x.aut_max),
    //     },
    //     {
    //         label: 'Average',
    //         data: expand.data.map(x => x.aut_avg),
    //     },
    //     {
    //         label: 'Median',
    //         data: expand.data.map(x => x.aut_med),
    //     },
    // ]);

    return <div className="container">
        <Line {...packet_count} />
        <Bar {...breakdown} />
    </div>;
}