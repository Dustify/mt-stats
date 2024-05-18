import { IMeshService } from "./if/IMeshService";
import { IMessageService } from "./if/IMessageService";
import { IStorageService } from "./if/IStorageService";
import { IRawMessage } from "./model/IRawMessage";
import { MosquittoMessageService } from "./service/MosquittoMessageService";
import { MtMeshService } from "./service/MtMeshService";
import { PostgresStorageService } from "./service/PostgresStorageService";

const messageService: IMessageService = new MosquittoMessageService();
const storageService: IStorageService = new PostgresStorageService();
const meshService: IMeshService = new MtMeshService();

const processRawMessages = async () => {
    const messages = await storageService.GetRawMessages();

    for (const message of messages) {
        const processedMessage = await meshService.ProcessRawMessage(message);
        await storageService.StoreUnpackedMessage(processedMessage);
    }
};

const processUnpackedMessages = async () => {
    const messages = await storageService.GetUnpackedMessages();

    for (const message of messages) {
        const processedMessage = await meshService.ProcessUnpackedMessage(message);
        await storageService.StoreCompleteMessage(processedMessage);
    }
};

const processAll = async () => {
    await processRawMessages();
    await processUnpackedMessages();
};

const rawMessageHandler = async (message: IRawMessage) => {
    await storageService.StoreRawMessage(message);
    await processAll();
};

(async () => {
    await processAll();
    messageService.OnReceived(rawMessageHandler);
})();