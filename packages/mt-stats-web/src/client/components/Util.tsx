
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
import { IUtil } from "mt-stats-lib/dist/model/outputs/IUtil.js";

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

export const UtilLoader = async ({ params }: any) => {
    return (await axios.get(`/api/util/${params.gatewayId}`)).data;
};

export const Util = () => {
    const data = useLoaderData() as IUtil[];
    const expand = ChartService.ExpandData(data);

    const cu = ChartService.GetChartProps(
        "Channel Utilisation",
        expand, [
        {
            label: 'Minimum',
            data: expand.data.map(x => x.cu_min),
        },
        {
            label: 'Maximum',
            data: expand.data.map(x => x.cu_max),
        },
        {
            label: 'Average',
            data: expand.data.map(x => x.cu_avg),
        },
        {
            label: 'Median',
            data: expand.data.map(x => x.cu_med),
        },
    ]);

    const aut = ChartService.GetChartProps(
        "TX Utilisation",
        expand, [
        {
            label: 'Minimum',
            data: expand.data.map(x => x.aut_min),
        },
        {
            label: 'Maximum',
            data: expand.data.map(x => x.aut_max),
        },
        {
            label: 'Average',
            data: expand.data.map(x => x.aut_avg),
        },
        {
            label: 'Median',
            data: expand.data.map(x => x.aut_med),
        },
    ]);

    return <div className="container">
        <Line {...cu} />
        <Line {...aut} />
    </div>;
}