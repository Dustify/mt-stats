
import axios from "axios";
import React from "react";

import { Line } from "react-chartjs-2";
import { useLoaderData } from "react-router-dom";

import { ChartService } from "../service/ChartService.js";
import { IUtil } from "mt-stats-lib";

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

    return <>
        <Line {...cu} />
        <Line {...aut} />
    </>;
}