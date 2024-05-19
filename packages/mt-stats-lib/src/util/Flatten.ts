export const Flatten = (source: any, prefix: string = ""): any => {
    const result: any = {};

    for (const prop in source) {
        const value = source[prop];

        if (value instanceof Object) {
            const child = Flatten(value, `${prefix}${prop}_`);

            for (const cprop in child) {
                result[cprop] = child[cprop];
            }


        } else {
            result[`${prefix}${prop}`] = value;
        }
    }

    return result;
};