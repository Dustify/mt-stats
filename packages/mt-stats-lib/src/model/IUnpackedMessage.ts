import { IRawMessage } from "./IRawMessage";

export interface IUnpackedMessage extends IRawMessage {
    "packet_from": number;
    "packet_to": number;
    "packet_decoded_portnum": string;
    "packet_decoded_payload": string;
    "packet_id": number;
    "packet_rxTime": number;
    "packet_rxSnr": number;
    "packet_hopLimit": number;
    "packet_rxRssi": number;
    "packet_hopStart": number;
    "channelId": string;
    "gatewayId": string;
    "expanded": boolean;
    "timestamp": string;
}