import { IMeshService } from "../if/IMeshService";
import { IMessageService } from "../if/IMessageService";
import { IStorageService } from "../if/IStorageService";
import { IRawMessage } from "../model/IRawMessage";
import { MosquittoMessageService } from "./MosquittoMessageService";
import { MtMeshService } from "./MtMeshService";
import { PostgresStorageService } from "./PostgresStorageService";
import { ServiceBase } from "./ServiceBase";

export class WrapperService extends ServiceBase {
    messageService: IMessageService = new MosquittoMessageService();
    storageService: IStorageService = new PostgresStorageService();
    meshService: IMeshService = new MtMeshService();

    async processRawMessages() {
        const messages = await this.storageService.GetRawMessages();

        for (const message of messages) {
            const processedMessage = await this.meshService.ProcessRawMessage(message);
            await this.storageService.StoreUnpackedMessage(processedMessage);
        }
    }

    async processUnpackedMessages() {
        const messages = await this.storageService.GetUnpackedMessages();

        for (const message of messages) {
            const processedMessage = await this.meshService.ProcessUnpackedMessage(message);
            await this.storageService.StoreCompleteMessage(processedMessage);
        }
    }

    async processAll() {
        await this.processRawMessages();
        await this.processUnpackedMessages();
    }

    async rawMessageHandler(topic: string, message: IRawMessage) {
        await this.storageService.StoreRawMessage(message);
        await this.processAll();
    }

    async init() {
        await this.storageService.Connect();
        await this.processAll();
        await this.messageService.Connect(this.rawMessageHandler);
    }
}