import axios from "axios";
import { IGateway } from "mt-stats-lib";
import { ISignal } from "mt-stats-lib/dist/model/ISignal";

export class StateService {
    static gatewayId: string;

    static async SetGateway(gatewayId: string) {
        this.gatewayId = gatewayId;

        this.Signals = (await axios.get(`/api/signal/${gatewayId}`)).data;
    }

    static Gateways: IGateway[];

    private static Signals: ISignal[];

    public static async init(): Promise<void> {
        const gateways: IGateway[] = (await axios.get("/api/gateways")).data;

        this.Gateways = gateways;
    }
};