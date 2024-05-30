export interface IPackets {
    t: string;
    packet_count?: number;

    packet_timed?: number;
    packet_nodeinfo_direct?: number;
    packet_tr_req?: number;
    packet_tr_res?: number;
    packet_routing?: number;
    packet_pos_req?: number;
    packet_pos_direct?: number;

    senders?: number;
    receivers?: number;
}