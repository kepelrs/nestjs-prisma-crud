export function getNestedProperty(obj: any, nestedPath: string) {
    const fragments = nestedPath.split('.');
    let value = obj;
    for (let i = 0; i < fragments.length; i++) {
        const fragment = fragments[i];
        value = value?.[fragment];
        if (!value) {
            break;
        }
    }
    return value;
}

export function createWhereObject(
    fullPath: string,
    targetValue: any,
    prismaOperator: string = 'equals',
    startingObj: any = {},
) {
    // TODO: Improve naming
    // TODO: Document as it is now exported in index.ts
    // TODO: Improve prismaOperator typing: https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#filter-conditions-and-operators
    const fragments = fullPath.split('.');
    const rootObj: any = startingObj;
    let workingWhereObj = rootObj;
    for (let i = 0; i < fragments.length; i++) {
        const fragment = fragments[i];
        const isLastFragment = i === fragments.length - 1;

        workingWhereObj[fragment] = isLastFragment ? { [prismaOperator]: targetValue } : {};
        workingWhereObj = workingWhereObj[fragment];
    }

    return rootObj;
}
