import { IMeshService } from "../if/IMeshService.js";
import { IMessageService } from "../if/IMessageService.js";
import { IStorageService } from "../if/IStorageService.js";
import { IRawMessage } from "../model/IRawMessage.js";
import { MosquittoMessageService } from "./MosquittoMessageService.js";
import { MtMeshService } from "./MtMeshService.js";
import { PostgresStorageService } from "./PostgresStorageService.js";
import { ServiceBase } from "./ServiceBase.js";

export class WrapperService extends ServiceBase {
    messageService: IMessageService = new MosquittoMessageService();
    storageService: IStorageService = new PostgresStorageService();
    meshService: IMeshService = new MtMeshService();

    async processRawMessages() {
        const messages = await this.storageService.GetRawMessages();

        for (const message of messages) {
            const processedMessage = await this.meshService.ProcessRawMessage(message);

            if (!processedMessage) {
                continue;
            }

            await this.storageService.StoreUnpackedMessage(processedMessage);
        }
    }

    async processUnpackedMessages() {
        const messages = await this.storageService.GetUnpackedMessages();

        for (const message of messages) {
            const processedMessage = await this.meshService.ProcessUnpackedMessage(message);

            if (!processedMessage) {
                continue;
            }

            await this.storageService.StoreCompleteMessage(processedMessage);
        }
    }

    processing = false;

    async processAll() {
        if (this.processing) {
            this.Info("processAll", "Already processing");
            return;
        }

        this.processing = true;

        await this.processRawMessages();
        await this.processUnpackedMessages();

        this.processing = false;
    }

    async rawMessageHandler(topic: string, message: IRawMessage) {
        await this.storageService.StoreRawMessage(message);
    }

    async init() {
        await this.storageService.Connect();
        await this.processAll();
        await this.messageService.Connect(this.rawMessageHandler.bind(this));

        setInterval(this.processAll.bind(this), 1000);
    }
}