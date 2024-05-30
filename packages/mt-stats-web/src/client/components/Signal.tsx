
import axios from "axios";
import React from "react";
import { Line } from "react-chartjs-2";
import { useLoaderData } from "react-router-dom";
import { ISignal } from "mt-stats-lib/dist/model/ISignal";
import { ChartService } from "../service/ChartService.js";

export const SignalLoader = async ({ params }: any) => {
    return (await axios.get(`/api/signal/${params.gatewayId}`)).data;
};

export const Signal = () => {
    const data = useLoaderData() as ISignal[];
    const expand = ChartService.ExpandData(data);

    const snr = ChartService.GetChartProps(
        "SNR",
        expand, [
        {
            label: 'Minimum',
            data: expand.data.map(x => x.snr_min),
        },
        {
            label: 'Maximum',
            data: expand.data.map(x => x.snr_max),
        },
        {
            label: 'Average',
            data: expand.data.map(x => x.snr_avg),
        },
        {
            label: 'Median',
            data: expand.data.map(x => x.snr_med),
        },
    ]);

    const rssi = ChartService.GetChartProps(
        "RSSI",
        expand, [
        {
            label: 'Minimum',
            data: expand.data.map(x => x.rssi_min),
        },
        {
            label: 'Maximum',
            data: expand.data.map(x => x.rssi_max),
        },
        {
            label: 'Average',
            data: expand.data.map(x => x.rssi_avg),
        },
        {
            label: 'Median',
            data: expand.data.map(x => x.rssi_med),
        },
    ]);

    return <div className="container">
        <Line {...snr} />
        <Line {...rssi} />
    </div>;
}