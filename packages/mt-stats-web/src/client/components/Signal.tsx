
import axios from "axios";
import React from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Colors
} from 'chart.js';
import { Line } from "react-chartjs-2";
import { useLoaderData } from "react-router-dom";
import { ISignal } from "mt-stats-lib/dist/model/ISignal";
import Annotation from "chartjs-plugin-annotation";
import { ChartService } from "../service/ChartService.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Colors,
    Annotation
);

export const SignalLoader = async ({ params }: any) => {
    return (await axios.get(`/api/signal/${params.gatewayId}`)).data;
};

export const Signal = () => {
    const data = useLoaderData() as ISignal[];
    const expand = ChartService.ExpandData(data);

    const snr = ChartService.GetChartProps(expand, [
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

    const rssi = ChartService.GetChartProps(expand, [
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