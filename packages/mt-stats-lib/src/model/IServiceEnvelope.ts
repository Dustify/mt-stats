export interface IServiceEnvelope {
    "packet"?: {
        "from": number;
        "to": number;
        "decoded"?:
        {
            "portnum": string;
            "payload": string;
        },
        "id": number;
        "rxTime": number;
        "rxSnr": number;
        "hopLimit": number;
        "rxRssi": number;
        "hopStart": number;
    },
    "channelId": string;
    "gatewayId": string;
}