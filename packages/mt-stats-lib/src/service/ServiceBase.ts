enum ELogType {
    info,
    warn,
    error
}

export abstract class ServiceBase {

    private Log(type: ELogType, ...data: any) {

        const now = new Date();

        const stampedMessage = [
            `[${now.toISOString()}]`,
            `[${this.constructor.name}]`,
            ...data
        ];

        switch (type) {
            case ELogType.info:
                console.info(...stampedMessage);
                break;
            case ELogType.warn:
                console.warn(...stampedMessage);
                break;
            case ELogType.error:
                console.error(...stampedMessage);
                break;
        }
    }

    protected Info(...data: any) {
        this.Log(ELogType.info, data);
    }

    protected Warn(...data: any) {
        this.Log(ELogType.warn, data);
    }

    protected Error(...data: any) {
        this.Log(ELogType.error, data);
    }
}