import { IStorageService } from "../if/IStorageService";
import { ICompleteMessage } from "../model/ICompleteMessage";
import { IRawMessage } from "../model/IRawMessage";
import { IUnpackedMessage } from "../model/IUnpackedMessage";

import {} from "pg";

export class PostgresStorageService implements IStorageService {
    StoreRawMessage(message: IRawMessage): Promise<void> {
        throw new Error("Method not implemented.");
    }

    GetRawMessages(): Promise<IRawMessage[]> {
        throw new Error("Method not implemented.");
    }

    StoreUnpackedMessage(message: IUnpackedMessage): Promise<void> {
        throw new Error("Method not implemented.");
    }

    GetUnpackedMessages(): Promise<IUnpackedMessage[]> {
        throw new Error("Method not implemented.");
    }

    StoreCompleteMessage(message: ICompleteMessage): Promise<void> {
        throw new Error("Method not implemented.");
    }

}