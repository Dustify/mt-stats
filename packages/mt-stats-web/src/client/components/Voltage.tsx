
import axios from "axios";
import React, { useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Navigate, useLoaderData, useNavigate } from "react-router-dom";
import { ISignal } from "mt-stats-lib/dist/model/ISignal";
import { ChartService } from "../service/ChartService.js";
import { INode, IVoltage } from "mt-stats-lib";

interface IVoltageData {
    gatewayId: string;
    nodes: INode[];
    voltage?: IVoltage[];
}

export const VoltageLoaderInitial = async ({ params }: any) => {
    const gatewayId = params.gatewayId;

    const result: IVoltageData = {
        gatewayId: gatewayId,
        nodes: (await axios.get(`/api/nodes/${gatewayId}`)).data
    };

    return result;
};

export const VoltageLoader = async ({ params }: any) => {
    const gatewayId = params.gatewayId;
    const nodeId = params.nodeId;

    const nodes: INode[] = (await axios.get(`/api/nodes/${gatewayId}`)).data;
    const voltage: IVoltage[] = (await axios.get(`/api/voltage/${gatewayId}/${nodeId}`)).data;

    const result: IVoltageData = {
        gatewayId: gatewayId,
        nodes,
        voltage
    };

    if (!params.nodeId) {
        const navigate = useNavigate();
        navigate(`/${gatewayId}/voltageId/${result.nodes[0].id}`);
        return;
    }

    return result;
};

export const Voltage = () => {
    const data = useLoaderData() as IVoltageData;

    if (!data.voltage) {
        const route = `/${data.gatewayId}/voltage/${data.nodes[0].id}`;

        return <Navigate to={route} />;
    }

    const expand = ChartService.ExpandData(data.voltage);

    const v = ChartService.GetChartProps(
        "Voltage",
        expand, [
        {
            label: 'Minimum',
            data: expand.data.map(x => x.v_min),
        },
        {
            label: 'Maximum',
            data: expand.data.map(x => x.v_max),
        },
        {
            label: 'Average',
            data: expand.data.map(x => x.v_avg),
        },
        {
            label: 'Median',
            data: expand.data.map(x => x.v_med),
        },
    ]);

    return <div className="container">
        <Line {...v} />
    </div>;
}