import { IMeshService } from "../if/IMeshService";
import { ICompleteMessage } from "../model/ICompleteMessage";
import { IRawMessage } from "../model/IRawMessage";
import { IUnpackedMessage } from "../model/IUnpackedMessage";
import { ServiceBase } from "./ServiceBase";

import mqtt_pb from "@buf/meshtastic_protobufs.bufbuild_es/meshtastic/mqtt_pb";

export class MtMeshService extends ServiceBase implements IMeshService {
    async ProcessRawMessage(message: IRawMessage): Promise<IUnpackedMessage> {
        this.Info("ProcessRawMessage start");

        const serviceEnvelope = mqtt_pb.ServiceEnvelope.fromBinary(message.data);



        const result: IUnpackedMessage = { ...message };



        this.Info("ProcessRawMessage end");

        return result;
    }

    ProcessUnpackedMessage(message: IUnpackedMessage): Promise<ICompleteMessage> {
        throw new Error("Method not implemented.");
    }
}