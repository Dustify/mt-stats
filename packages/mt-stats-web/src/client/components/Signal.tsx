
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Colors
);

export const SignalLoader = async ({ params }: any) => {
    return (await axios.get(`/api/signal/${params.gatewayId}`)).data;
};

export const Signal = () => {
    const data = useLoaderData() as ISignal[];

    const labels: string[] = [];

    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 7);
    currentDate = new Date(currentDate.toISOString().substring(0, 14) + "00:00.000Z");

    const processedData: ISignal[] = [];

    for (let i = 0; i < 168; i++) {
        const isoTimestamp = currentDate.toISOString();
        const item = data.find(x => x.t === isoTimestamp);

        const timestamp = currentDate.toString().substring(0, 21);

        let result: ISignal = {
            ...item,
            t: timestamp
        };

        labels.push(timestamp);
        processedData.push(result);

        currentDate.setHours(currentDate.getHours() + 1);
    }

    const snr = {
        opts: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top' as const,
                },
                title: {
                    display: true,
                    text: 'SNR',
                },
            }
        },
        data: {
            labels,
            datasets: [
                {
                    label: 'Minimum',
                    data: processedData.map(x => x.snr_min),
                },
                {
                    label: 'Maximum',
                    data: processedData.map(x => x.snr_max),
                },
                {
                    label: 'Average',
                    data: processedData.map(x => x.snr_avg),
                },
                {
                    label: 'Median',
                    data: processedData.map(x => x.snr_med),
                },
            ]
        }
    };

    const rssi = {
        opts: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top' as const,
                },
                title: {
                    display: true,
                    text: 'RSSI',
                },
            }
        },
        data: {
            labels,
            datasets: [
                {
                    label: 'Minimum',
                    data: processedData.map(x => x.rssi_min),
                },
                {
                    label: 'Maximum',
                    data: processedData.map(x => x.rssi_max),
                },
                {
                    label: 'Average',
                    data: processedData.map(x => x.rssi_avg),
                },
                {
                    label: 'Median',
                    data: processedData.map(x => x.rssi_med),
                },
            ]
        }
    };

    return <div className="container">
        <Line options={snr.opts} data={snr.data} />
        <Line options={rssi.opts} data={rssi.data} />
    </div>;
}