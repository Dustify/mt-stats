import mqtt from "mqtt";
import { IMessageService } from "../if/IMessageService";
import { IRawMessage } from "../model/IRawMessage";
import { ServiceBase } from "./ServiceBase";

export class MosquittoMessageService extends ServiceBase implements IMessageService {
    private Client: mqtt.MqttClient | null = null;

    public async Connect(handler: (topic: string, message: IRawMessage) => Promise<void>): Promise<void> {
        this.Info("Connect start");

        const address = process.env["MQTT_ADDRESS"] || "";
        const clientId = process.env["MQTT_CLIENTID"];

        this.Client = mqtt.connect(
            address,
            {
                clean: false,
                clientId: clientId
            }
        );

        this.Client.on("error", (error) => {
            this.Error("Connect, error", error);
        });

        this.Client.on("connect", () => {
            if (!this.Client) {
                this.Error("Connect, connect", "Client not initialised!")

                return;
            }

            this.Info("Connect, connect");

            this.Client.subscribe("#", (error) => {
                this.Info("Connect, connect, subscribe", error);
            });

            this.Client.on("message", (topic, message) => {
                this.Info("Connect, connect, message")

                const rawMessage: IRawMessage = {
                    data: message
                };

                if (topic.indexOf("/c/") > -1) {
                    this.Info("Connect, connect, message", "/c/", topic);
                    handler(topic, rawMessage);
                    return;
                }

                if (topic.indexOf("/e/") > -1) {
                    this.Info("Connect, connect, message", "/e/", topic);
                    handler(topic, rawMessage);
                    return;
                }

                if (topic.indexOf("/2/") > -1) {
                    this.Info("Connect, connect, message", "/2/", topic, message.toString());
                    return;
                }

                this.Warn(`Connect, connect, message - "${topic}" unhandled `);
            });
        });

        this.Info("Connect end");
    }
}