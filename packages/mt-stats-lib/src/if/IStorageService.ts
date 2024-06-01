import { ICompleteMessage } from "../model/ICompleteMessage";
import { IGateway } from "../model/IGateway";
import { IRawMessage } from "../model/IRawMessage";
import { ISignal } from "../model/outputs/ISignal";
import { IUnpackedMessage } from "../model/IUnpackedMessage";
import { IUtil } from "../model/outputs/IUtil";
import { IPackets } from "../model/outputs/IPackets";
import { INode } from "../model/outputs/INode";
import { IVoltage } from "../model/outputs/IVoltage";

export interface IStorageService {
    Connect(): Promise<void>;

    StoreRawMessage(message: IRawMessage): Promise<void>;
    GetRawMessages(): Promise<IRawMessage[]>;

    StoreUnpackedMessage(message: IUnpackedMessage): Promise<void>;
    GetUnpackedMessages(): Promise<IUnpackedMessage[]>;

    StoreCompleteMessage(message: ICompleteMessage): Promise<void>;

    GetGateways(): Promise<IGateway[]>;

    GetSignal(gatewayId: string): Promise<ISignal[]>;
    GetUtil(gatewayId: string): Promise<IUtil[]>;
    GetPackets(gatewayId: string): Promise<IPackets[]>;
    GetNodes(gatewayId: string): Promise<INode[]>;
    GetVoltage(gatewayId: string, nodeId: number): Promise<IVoltage[]>;

    GetSenders(gatewayId: string): Promise<any[]>;
}