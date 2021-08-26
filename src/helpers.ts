import { ForbiddenException } from '@nestjs/common';
import { traverse } from 'object-traversal';
import { getNestedProperty } from './utils';

/**
 * Converts raw json structures into prisma's nested .create syntax
 * Turns  {name: 'hello', friends: [{name: 'rick'}]}
 * into   {name: 'hello', friends: {create: [{name: 'rick'}]}}
 */
export function transformForNestedCreate(
    objectToPersist: any,
    currentPersistedObject: any,
    allowedJoinSet: Set<string>,
    idPropertyName: string,
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
                throw new ForbiddenException();
            }

            if (valueIsArray) {
                const toCreate = value.filter((v: any) => !v[idPropertyName]);
                const toConnect = value
                    .filter((v: any) => !!v[idPropertyName])
                    .map((v: any) => ({ [idPropertyName]: v[idPropertyName] }));
                const idsToDisconnect = getIdsToDisconnect(
                    toConnect,
                    getNestedProperty(currentPersistedObject, meta.currentPath!),
                    idPropertyName,
                );
                parent[key] = {
                    create: toCreate.length ? toCreate : undefined,
                    connect: toConnect.length ? toConnect : undefined,
                    disconnect: idsToDisconnect.length ? idsToDisconnect : undefined,
                };
            }
            // value is object but not array (non many relations eg. one to one)
            else if (value[idPropertyName]) {
                const currentPersistedId = getNestedProperty(
                    currentPersistedObject,
                    `${meta.currentPath}.${idPropertyName}`,
                );
                const idChanged = value[idPropertyName] !== currentPersistedId;

                parent[key] = {
                    connect: idChanged ? { [idPropertyName]: value[idPropertyName] } : undefined,
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

    joins = joins.slice();
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
 * TODO: Make regex more reliable
 */
export function validateNestedWhere(
    whereObject: any,
    allowedJoinsSet: Set<string>,

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
    const leafArrayContentRegex = /\.(in|notIn)\.\d+$/;
    const leafArrayRegex = /\.(in|notIn)$/;

    traverse(whereObject, (context) => {
        const { value, meta } = context;
        const isLeafArrayContent = leafArrayContentRegex.test(meta.currentPath || '');
        const isLeafArray =
            meta.currentPath && value instanceof Array && leafArrayRegex.test(meta.currentPath);
        const isRegularLeafCase =
            !isLeafArrayContent && (typeof value !== 'object' || value === null); // nulls and non-objects are final nodes, except when using 'in' or 'notIn'
        const isLeaf = isLeafArray || isRegularLeafCase;
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
                throw new ForbiddenException(`Join relation not allowed: ${cleanedupString}`);
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

export function deleteObjectProperties(
    object: any,
    blacklistedPropertyPaths?: Array<string | RegExp>,
    whitelistedPropertyPaths?: Array<string | RegExp>,
    ignoreArrayIndexes = false,
) {
    blacklistedPropertyPaths = blacklistedPropertyPaths || [];
    whitelistedPropertyPaths = whitelistedPropertyPaths || [];

    traverse(object, (context) => {
        const { parent, key, meta } = context;
        if (!parent || !key || !meta.currentPath) {
            return;
        }

        let currentPath = meta.currentPath!;
        if (ignoreArrayIndexes) {
            currentPath = currentPath.replace(/\.\d+\./g, '.'); // TODO: improve repeated replaces
            currentPath = currentPath.replace(/\.\d+$/, '');
        }

        // delete all paths that match blacklistedPropertyPaths
        for (let i = 0; i < blacklistedPropertyPaths!.length; i++) {
            const deniedPath = blacklistedPropertyPaths![i];

            let pathMatches = false;
            if (typeof deniedPath === 'string') {
                pathMatches = deniedPath === currentPath;
            }
            if (deniedPath instanceof RegExp) {
                pathMatches = deniedPath.test(currentPath);
            }

            if (pathMatches) {
                delete parent[key];
                break;
            }
        }

        // delete all paths that do not match whitelistedPropertyPaths
        for (let i = 0; i < whitelistedPropertyPaths!.length; i++) {
            const allowedPath = whitelistedPropertyPaths![i];

            let pathMatches = false;
            if (typeof allowedPath === 'string') {
                pathMatches = allowedPath.startsWith(currentPath);
            }
            if (allowedPath instanceof RegExp) {
                pathMatches = allowedPath.test(currentPath);
            }

            if (!pathMatches) {
                delete parent[key];
                break;
            }
        }
    });
}

function getIdsToDisconnect(
    stillConnected: any[],
    originalConnections: any[],
    idPropertyName: string,
) {
    const originalIds = (originalConnections || []).map((v) => v[idPropertyName]);
    const stillConnectedSet = new Set(stillConnected.map((v) => v[idPropertyName]));
    const forDisconnecting = [];
    for (let i = 0; i < originalIds.length; i++) {
        const id = originalIds[i];
        if (!stillConnectedSet.has(id)) {
            forDisconnecting.push(id);
        }
    }

    return forDisconnecting.map((v) => ({ [idPropertyName]: v }));
}
