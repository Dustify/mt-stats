import { IMeshService } from "./if/IMeshService";
import { IMessageService } from "./if/IMessageService";
import { IStorageService } from "./if/IStorageService";
import { IRawMessage } from "./model/IRawMessage";
import { IUnpackedMessage } from "./model/IUnpackedMessage";
import { MosquittoMessageService } from "./service/MosquittoMessageService";
import { MtMeshService } from "./service/MtMeshService";
import { PostgresStorageService } from "./service/PostgresStorageService";

const messageService: IMessageService = new MosquittoMessageService();
const storageService: IStorageService = new PostgresStorageService();
const meshService: IMeshService = new MtMeshService();

const process = async () => {
    const rawMessages = await storageService.GetRawMessages();
    const unpackedMessages: IUnpackedMessage[] = [];

    for (const rawMessage of rawMessages) {
        const unpackedMessage = await meshService.ProcessRawMessage(rawMessage);

        unpackedMessages.push(unpackedMessage)
    }
};

const rawMessageHandler = async (message: IRawMessage) => {
    await storageService.StoreRawMessage(message);
    await process();
};

messageService.OnReceived(rawMessageHandler);

process();