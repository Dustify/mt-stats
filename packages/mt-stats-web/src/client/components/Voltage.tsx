
import axios from "axios";
import React, { ChangeEvent } from "react";
import { Line } from "react-chartjs-2";
import { Navigate, useLoaderData, useNavigate, useParams } from "react-router-dom";
import { ChartService } from "../service/ChartService.js";
import { INode, IVoltage } from "mt-stats-lib";

interface IVoltageData {
    nodes: INode[];
    voltage?: IVoltage[];
}

export const VoltageLoaderInitial = async ({ params }: any) => {
    const gatewayId = params.gatewayId;

    let nodes: INode[] = (await axios.get(`/api/nodes/${gatewayId}`)).data;
    nodes = nodes.sort((a, b) => a.short > b.short ? 1 : -1);

    const result: IVoltageData = {
        nodes
    };

    return result;
};

export const VoltageLoader = async ({ params }: any) => {
    const gatewayId = params.gatewayId;
    const nodeId = params.nodeId;

    const nodes: INode[] = (await axios.get(`/api/nodes/${gatewayId}`)).data;
    const voltage: IVoltage[] = (await axios.get(`/api/voltage/${gatewayId}/${nodeId}`)).data;

    const result: IVoltageData = {
        nodes,
        voltage
    };

    return result;
};

export const Voltage = () => {
    const params = useParams();
    const data = useLoaderData() as IVoltageData;

    if (!params.gatewayId) {
        return <>Blorg</>;
    }

    if (!data.voltage) {
        const nodeId = Number("0x" + params.gatewayId.substring(1))
        const route = `/${params.gatewayId}/voltage/${nodeId}`;

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

    const navigate = useNavigate();

    const changeNode = (event: ChangeEvent<HTMLSelectElement>) => {
        const nodeId = event.target.value;

        navigate(`/${params.gatewayId}/voltage/${nodeId}`);
    };

    const nodes = data.nodes.sort((a, b) => a.short > b.short ? 1 : -1);

    return <>
        <select
            className="form-select me-2"
            onChange={changeNode}
            value={params.nodeId}>
            {
                nodes.map((x, i) =>
                    <option key={i} value={x.id}>({x.short}) {x.long}</option>
                )
            }
        </select>
        <Line {...v} />
    </>;
}