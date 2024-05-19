import { ICompleteMessage } from "../model/ICompleteMessage";
import { IGateway } from "../model/IGateway";
import { IRawMessage } from "../model/IRawMessage";
import { IUnpackedMessage } from "../model/IUnpackedMessage";

export interface IStorageService {
    Connect(): Promise<void>;

    StoreRawMessage(message: IRawMessage): Promise<void>;
    GetRawMessages(): Promise<IRawMessage[]>;

    StoreUnpackedMessage(message: IUnpackedMessage): Promise<void>;
    GetUnpackedMessages(): Promise<IUnpackedMessage[]>;

    StoreCompleteMessage(message: ICompleteMessage): Promise<void>;

    GetGateways(): Promise<IGateway[]>;
}