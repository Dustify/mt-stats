import { ICompleteMessage } from "../model/ICompleteMessage";
import { IRawMessage } from "../model/IRawMessage";
import { IUnpackedMessage } from "../model/IUnpackedMessage";

export interface IStorageService {
    StoreRawMessage(message: IRawMessage): Promise<void>;
    GetRawMessages(): Promise<IRawMessage[]>;

    StoreUnpackedMessage(message: IUnpackedMessage): Promise<void>;
    GetUnpackedMessages(): Promise<IUnpackedMessage>;
    
    StoreCompleteMessage(message: ICompleteMessage): Promise<void>;
}