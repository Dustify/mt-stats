import { Position, RouteDiscovery, Routing, User } from "@buf/meshtastic_protobufs.bufbuild_es/meshtastic/mesh_pb.js";
import { IMeshService } from "../if/IMeshService.js";
import { ICompleteMessage } from "../model/ICompleteMessage.js";
import { IRawMessage } from "../model/IRawMessage.js";
import { IServiceEnvelope } from "../model/IServiceEnvelope.js";
import { IUnpackedMessage } from "../model/IUnpackedMessage.js";
import { Flatten } from "../util/Flatten.js";
import { ServiceBase } from "./ServiceBase.js";

import { ServiceEnvelope } from "@buf/meshtastic_protobufs.bufbuild_es/meshtastic/mqtt_pb.js";
import { Telemetry } from "@buf/meshtastic_protobufs.bufbuild_es/meshtastic/telemetry_pb.js";

import { AdminMessage } from "@buf/meshtastic_protobufs.bufbuild_es/meshtastic/admin_pb.js";
import { StoreAndForward } from "@buf/meshtastic_protobufs.bufbuild_es/meshtastic/storeforward_pb.js";

export class MtMeshService extends ServiceBase implements IMeshService {
    async ProcessRawMessage(message: IRawMessage): Promise<IUnpackedMessage | undefined> {
        this.Info("ProcessRawMessage start");

        const serviceEnvelope: IServiceEnvelope = ServiceEnvelope.fromBinary(message.data).toJson() as unknown as IServiceEnvelope; // ugh

        if (!serviceEnvelope.packet) {
            this.Warn("ProcessRawMessage", "No packet");

            return;
        }

        const packet = serviceEnvelope.packet;

        if (!packet.decoded) {
            this.Warn("ProcessRawMessage", "No decode");

            return;
        }

        const flat = Flatten(serviceEnvelope);

        const result: IUnpackedMessage = {
            ...flat,
            id: message.id,
            expanded: true
        };

        this.Info("ProcessRawMessage end");

        return result;
    }

    private ProtoBufMap: { [key: string]: any } = {
        "NODEINFO_APP": User,
        "TRACEROUTE_APP": RouteDiscovery,
        "POSITION_APP": Position,
        "TELEMETRY_APP": Telemetry,
        "ROUTING_APP": Routing,
        "TEXT_MESSAGE_APP": { fromBinary: (s: string) => s.toString() },
        "ADMIN_APP": AdminMessage,
        "RANGE_TEST_APP": { fromBinary: (s: string) => s.toString() },
        "STORE_FORWARD_APP": StoreAndForward
    };

    async ProcessUnpackedMessage(message: IUnpackedMessage): Promise<ICompleteMessage | undefined> {
        this.Info("ProcessUnpackedMessage start");

        const type = message.packet_decoded_portnum;
        const pbType = this.ProtoBufMap[type];

        if (!pbType) {
            this.Warn("ProcessUnpackedMessage", `Unhandled extract ${type}`);
            return;
        }

        let decode: any = null;

        if (message.packet_decoded_payload) {
            const payload = Buffer.from(message.packet_decoded_payload, "base64");

            decode = pbType.fromBinary(payload);
        }

        let result: ICompleteMessage = {
            ...message,
            extracted: true
        };

        if (decode) {
            const variant = decode["variant"];

            if (variant) {
                const vCase = variant.case;
                const vValue = variant.value;

                delete decode.variant;

                decode[vCase] = vValue;
            }

            if (type === "NODEINFO_APP") {
                if (decode.macaddr instanceof Buffer) {
                    decode.macaddr = decode.macaddr.toString("base64");
                }
            }

            if (type === "TRACEROUTE_APP") {
                decode.route = JSON.stringify(decode.route);
            }

            if (type === "TELEMETRY_APP") {
                if (decode.deviceMetrics?.airUtilTx && decode.deviceMetrics.airUtilTx > 100) {
                    decode.deviceMetrics.airUtilTx = null;
                }
            }

            if (decode instanceof Object) {
                const flattened = Flatten(decode, `${type}_`);

                result = {
                    ...result,
                    ...flattened
                };
            } else {
                (<any>result)[`${type}_value`] = decode;
            }
        }

        this.Info("ProcessUnpackedMessage end");

        return result;
    }
}