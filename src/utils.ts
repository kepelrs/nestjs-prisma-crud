import { traverse } from 'object-traversal';

/**
 * Converts raw json structures into prisma's nested .create syntax
 * Turns  {name: 'hello', friends: [{name: 'rick'}]}
 * into   {name: 'hello', friends: {create: [{name: 'rick'}]}}
 */
export function transformForNestedCreate(
    objectToPersist: any,
    currentPersistedObject: any,
    allowedJoinSet: Set<string>,
    forbiddenError: any,
) {
    const copy = JSON.parse(JSON.stringify(objectToPersist));
    const keywords = new Set([
        'connectOrCreate',
        'where',
        'create',
        'connect',
        'disconnect',
        'set',
    ]); // TODO: improve .includes or document these words are reserved

    traverse(copy, (context) => {
        let { parent, key } = context;
        const { value, meta } = context;

        const keyIsNotKeyword = !keywords.has(key!);
        const parentIsObject = parent instanceof Object;
        const parentIsNotArray = !(parent instanceof Array);
        const valueIsObject = value instanceof Object;
        const valueIsArray = value instanceof Array;
        const pathIsWithinAllowedJoins = allowedJoinSet.has(
            meta.currentPath?.replace(/.\d+./, '.') as string,
        );

        // TODO: Refactor, split into subfunctions at least the main condition blocks
        if (parentIsObject && parentIsNotArray && valueIsObject && keyIsNotKeyword) {
            parent = parent!;
            key = key!;

            if (!pathIsWithinAllowedJoins) {
                throw forbiddenError;
            }

            if (valueIsArray) {
                const toCreate = value.filter((v: any) => !v.id);
                const toConnect = value.filter((v: any) => !!v.id).map((v: any) => ({ id: v.id }));
                const idsToDisconnect = getIdsToDisconnect(
                    toConnect,
                    getNestedProperty(currentPersistedObject, meta.currentPath!),
                );
                parent[key] = {
                    create: toCreate.length ? toCreate : undefined,
                    connect: toConnect.length ? toConnect : undefined,
                    disconnect: idsToDisconnect.length ? idsToDisconnect : undefined,
                };
            }
            // value is object but not array (non many relations eg. one to one)
            else if (value.id) {
                const currentPersistedId = getNestedProperty(
                    currentPersistedObject,
                    `${meta.currentPath}.id`,
                );
                const idChanged = value.id !== currentPersistedId;

                parent[key] = {
                    connect: idChanged ? { id: value.id } : undefined,
                };
            }
            // value is object without id -> being created!
            else {
                parent[key] = {
                    create: value,
                };
            }
        } else if (parentIsObject && value === null) {
            parent = parent!;
            key = key!;

            // TODO: Refactor, split into subfunctions at least the main condition blocks
            const persistedValue = getNestedProperty(currentPersistedObject, `${meta.currentPath}`);
            const persistedValueIsRelation = persistedValue instanceof Object;
            const persistedValueIsAlreadyNull = persistedValue === null;
            if (persistedValueIsRelation) {
                parent[key] = {
                    disconnect: true,
                };
            } else if (persistedValueIsAlreadyNull) {
                parent[key] = undefined;
            }
        }
    });

    return copy;
}

/**
 * Converts join strings into prisma's .include syntax
 * Turns ['friends', 'friends.friends', 'friends.comments']
 * into  {include: {friends: {include: {friends: true, comments: true}}}}
 */
export function transformJoinsToInclude(joins: string[]) {
    if (!joins.length) {
        return {};
    }

    joins = [...joins];
    joins.sort(function(a, b) {
        // ASC  -> a.length - b.length
        // DESC -> b.length - a.length
        return b.length - a.length;
    });

    const stringToObject: any = {};
    for (let i = 0; i < joins.length; i++) {
        const join = joins[i];
        const fragments = join.split('.');
        let workingNestedObject = stringToObject;
        for (let j = 0; j < fragments.length; j++) {
            const fragment = fragments[j];
            const fragmentAlreadyAdded = !!workingNestedObject[fragment];
            const isLastFragment = j === fragments.length - 1;
            if (!fragmentAlreadyAdded) {
                workingNestedObject[fragment] = isLastFragment || {
                    include: {},
                };
            }
            workingNestedObject = workingNestedObject[fragment].include;
        }
    }

    // console.log(JSON.stringify(stringToObject));
    return { include: stringToObject };
}
// console.log(
//   transformJoinsToInclude([
//     'friends',
//     'friends.friends',
//     'friends.comments',
//     'friends.comments.comments',
//   ])
// );

/**
 * TODO!! describe what it does
 * TODO: Throw 400 instead of 500
 * TODO: Make more reliable
 */
export function validateNestedWhere(
    whereObject: any,
    allowedJoinsSet: Set<string>,
    forbiddenError: any,

    // TODO: Document that bellow keywords should be forbidden in all models
    prismaBlacklistKeywords = [
        // https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries
        'some',
        'none',
        'every',
        'is',
        'isNot',

        // https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#filter-conditions-and-operators
        'equals',
        'not',
        'in',
        'notIn',
        'lt',
        'lte',
        'gt',
        'gte',
        'contains',
        'mode',
        'startsWith',
        'endsWith',
        'AND\\.\\d+',
        'AND',
        'OR\\.\\d+',
        'OR',
        'NOT',
    ],
) {
    const blackListedWordsRegex = `(${prismaBlacklistKeywords.join('|')})`;
    const midOperatorsRegex = new RegExp(`\\.${blackListedWordsRegex}\\.`, 'g');
    const endOperatorsRegex = new RegExp(`\\.${blackListedWordsRegex}$`, 'g');
    const startOperatorsRegex = new RegExp(`^${blackListedWordsRegex}(\\.|$)`, 'g');
    const lastFragmentRegex = /\.?[^.]+$/;

    traverse(whereObject, (context) => {
        const { key, value, meta } = context;
        const isLeaf =
            key !== 'in' && key !== 'notIn' && (typeof value !== 'object' || value === null); // nulls and non-objects are final nodes, except when using 'in' or 'notIn'
        if (isLeaf) {
            // leaf paths are the longest
            const leafPath = meta.currentPath!;

            let cleanedupString = leafPath.replace(startOperatorsRegex, '');
            // remove operators from the middle of string
            cleanedupString = cleanedupString.replace(midOperatorsRegex, '.');
            // remove operators from the end of string
            cleanedupString = cleanedupString.replace(endOperatorsRegex, '');
            // remove last fragment, as it is a property (eg. author.firstName)
            cleanedupString = cleanedupString.replace(lastFragmentRegex, '');

            const isAllowed = !cleanedupString || allowedJoinsSet.has(cleanedupString);
            if (!isAllowed) {
                forbiddenError.message = `Join relation not allowed: ${cleanedupString}`; // TODO: Improve messaging
                throw forbiddenError;
            }
        }
    });
}

/**
 * Turns ['user.posts.comments', 'user.profile'] into ['user', 'user.posts', 'user.posts.comments', 'user.profile']
 */
export function getAllJoinSubsets(allowedJoins: string[]): Set<string> {
    const joinSet = new Set<string>();
    for (let i = 0; i < allowedJoins.length; i++) {
        const joinString = allowedJoins[i];
        const fragments = joinString.split('.');
        let chain = fragments[0];
        joinSet.add(chain);
        for (let j = 1; j < fragments.length; j++) {
            chain += `.${fragments[j]}`;
            joinSet.add(chain);
        }
    }
    return joinSet;
}

function getNestedProperty(obj: any, nestedPath: string) {
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

function getIdsToDisconnect(stillConnected: any[], originalConnections: any[]) {
    const originalIds = (originalConnections || []).map((v) => v.id);
    const stillConnectedSet = new Set(stillConnected.map((v) => v.id));
    const forDisconnecting = [];
    for (let i = 0; i < originalIds.length; i++) {
        const id = originalIds[i];
        if (!stillConnectedSet.has(id)) {
            forDisconnecting.push(id);
        }
    }

    return forDisconnecting.map((v) => ({ id: v }));
}
