import { IRawMessage } from "../model/IRawMessage";

export interface IMessageService {
    Connect(handler: (topic: string, message: IRawMessage) => Promise<void>): Promise<void>;
}