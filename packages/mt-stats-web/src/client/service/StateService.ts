import axios from "axios";
import { IGateway } from "mt-stats-lib";

export class StateService {
    static Gateways: IGateway[];
    
    public static async init(): Promise<void> {
        const gateways: IGateway[] = (await axios.get("/api/gateways")).data;

        this.Gateways = gateways;
    }
};