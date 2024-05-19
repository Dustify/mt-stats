import { ICompleteMessage } from "../model/ICompleteMessage";
import { IRawMessage } from "../model/IRawMessage";
import { IUnpackedMessage } from "../model/IUnpackedMessage";

export interface IMeshService {
    ProcessRawMessage(message: IRawMessage): Promise<IUnpackedMessage | undefined>;
    ProcessUnpackedMessage(message: IUnpackedMessage): Promise<ICompleteMessage | undefined>;
}