import { IRawMessage } from "../model/IRawMessage";

export interface IMessageService {
    OnReceived(handler: (message: IRawMessage) => Promise<void>): void;
}