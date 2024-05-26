import { LineAnnotationOptions } from "chartjs-plugin-annotation";

type TAnnotations = { [key: string]: LineAnnotationOptions };

interface ITimestamped {
    t: string;
}

interface IExpandedData<T extends ITimestamped> {
    labels: string[];
    annotations: TAnnotations;
    data: T[];
}

export class ChartService {
    static ExpandData<T extends ITimestamped>(data: T[]): IExpandedData<T> {
        const labels: string[] = [];

        let currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 7);
        currentDate = new Date(currentDate.toISOString().substring(0, 14) + "00:00.000Z");

        const processedData: T[] = [];
        const annotations: TAnnotations = {};

        for (let i = 0; i < 168; i++) {
            const isoTimestamp = currentDate.toISOString();
            const item = data.find(x => x.t === isoTimestamp);

            const timestamp = currentDate.toString().substring(0, 21);

            let result = {
                ...item,
                t: timestamp
            };

            labels.push(timestamp);
            processedData.push(<T>result);

            if (timestamp.endsWith("00:00")) {
                annotations[`line-${i}`] = {
                    xMin: i,
                    xMax: i
                };
            }

            currentDate.setHours(currentDate.getHours() + 1);
        }

        return {
            labels,
            annotations,
            data: processedData
        };
    }

    static GetChartProps<T extends ITimestamped>(title: string, expand: IExpandedData<T>, dataSets: any[]) {
        const opts = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top' as const,
                },
                title: {
                    display: true,
                    text: title,
                },
                annotation: {
                    annotations: expand.annotations
                }
            }
        };

        const data = {
            labels: expand.labels,
            datasets: dataSets as any[]
        };

        return {
            type: "line",
            options: opts,
            data: data
        };
    }
}