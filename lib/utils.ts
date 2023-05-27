export function sortBy(a: any, b: any, columnName: string, desc: boolean) {

    const A = columnName.split('.').reduce((obj, currentKey) => {
        if (obj && typeof obj === 'object' && currentKey in obj) {
        return obj[currentKey];
        }
        return undefined;
    }, a);

    const B = columnName.split('.').reduce((obj, currentKey) => {
        if (obj && typeof obj === 'object' && currentKey in obj) {
            return obj[currentKey];
        }
        return undefined;
    }, b);

    if (A === undefined && B === undefined) {
        return 0;
    }
    if (A === undefined) {
        return (desc ? 1 : -1);
    }
    if (B === undefined) {
        return (desc ? -1 : 1);
    }
    if (A > B) {
        return (desc ? -1 : 1);
    }
    else if (A < B) {
        return (desc ? 1 : -1);
    }
    else {
        return 0;
    }
}