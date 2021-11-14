import { BadRequestException } from '@nestjs/common';
import { traverse } from 'object-traversal';
import { getNestedProperty } from './utils';

/**
 * Converts raw object structures into prisma's nested .create/.update syntax
 * Turns  {name: 'hello', friends: [{name: 'rick'}]}
 * into   {name: 'hello', friends: {create: [{name: 'rick'}]}}
 */
export function plainToPrismaNestedQuery(
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
        const pathWithoutDigits = meta.currentPath?.replace(/.\d+./, '.');
        const pathIsWithinAllowedJoins = allowedJoinSet.has(pathWithoutDigits as string);

        // TODO: Refactor, split into named subfunctions at least the main condition blocks
        if (parentIsObject && parentIsNotArray && valueIsObject && keyIsNotKeyword) {
            parent = parent!;
            key = key!;

            if (!pathIsWithinAllowedJoins) {
                throw new BadRequestException(
                    `Provided nested relation is not allowed: ${pathWithoutDigits}`,
                );
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

            // TODO: Refactor, split into named subfunctions at least the main condition blocks
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
            currentPath = currentPath.replace(/\.\d+\./g, '.');
            currentPath = currentPath.replace(/\.\d+$/, '');
        }

        // delete all paths that match blacklistedPropertyPaths
        for (let i = 0; i < blacklistedPropertyPaths!.length; i++) {
            const deniedPath = blacklistedPropertyPaths![i];

            let pathIsBlacklisted = false;
            if (typeof deniedPath === 'string') {
                pathIsBlacklisted = deniedPath === currentPath;
            }
            if (deniedPath instanceof RegExp) {
                pathIsBlacklisted = deniedPath.test(currentPath);
            }

            if (pathIsBlacklisted) {
                delete parent[key];
                break;
            }
        }

        if (whitelistedPropertyPaths?.length) {
            // delete all paths that do not match whitelistedPropertyPaths
            let pathIsWhiteListed = false;
            for (let i = 0; i < whitelistedPropertyPaths!.length; i++) {
                const allowedPath = whitelistedPropertyPaths![i];

                if (typeof allowedPath === 'string') {
                    pathIsWhiteListed = allowedPath.startsWith(currentPath);
                }
                if (allowedPath instanceof RegExp) {
                    pathIsWhiteListed = allowedPath.test(currentPath);
                }

                if (pathIsWhiteListed) {
                    break;
                }
            }
            if (!pathIsWhiteListed) {
                delete parent[key];
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
