export interface ISignal {
    timestamp: Date;
    snr_min: number;
    snr_max: number;
    snr_med: number;
    snr_avg: number;

    rssi_min: number;
    rssi_max: number;
    rssi_med: number;
    rssi_avg: number;
}