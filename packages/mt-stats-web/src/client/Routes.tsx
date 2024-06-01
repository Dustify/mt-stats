import React, { ReactNode } from "react";
import { Signal, SignalLoader } from "./components/Signal.js";
import { Util, UtilLoader } from "./components/Util.js";
import { Packets, PacketsLoader } from "./components/Packets.js";
import { Voltage, VoltageLoader, VoltageLoaderInitial } from "./components/Voltage.js";
import { LoaderFunction } from "react-router-dom";

interface IRoute {
    Key: string;
    Name: string;
    Path: string;
    Element: ReactNode;
    Loader: boolean | LoaderFunction<any> | undefined;
    ShowInHeader: boolean;
}

export const Routes: IRoute[] = [
    {
        Key: "signal",
        Name: "Signal",
        Path: "/:gatewayId/signal",
        Element: <Signal />,
        Loader: SignalLoader,
        ShowInHeader: true
    },
    {
        Key: "util",
        Name: "Utilisation",
        Path: "/:gatewayId/util",
        Element: <Util />,
        Loader: UtilLoader,
        ShowInHeader: true
    },
    {
        Key: "psr",
        Name: "Packets / S+R",
        Path: "/:gatewayId/psr",
        Element: <Packets />,
        Loader: PacketsLoader,
        ShowInHeader: true
    },
    {
        Key: "voltage",
        Name: "Voltage",
        Path: "/:gatewayId/voltage",
        Element: <Voltage />,
        Loader: VoltageLoaderInitial,
        ShowInHeader: true
    },
    {
        Key: "voltage",
        Name: "Voltage",
        Path: "/:gatewayId/voltage/:nodeId",
        Element: <Voltage />,
        Loader: VoltageLoader,
        ShowInHeader: false
    },
];