import { BadRequestException } from '@nestjs/common';
import * as Joi from 'joi';
import { traverse } from 'object-traversal';
import { CrudQueryFull } from './types';

/**
 * Takes an arbitrarily deep nested `whereObject` and compares if the path to the deepest nested object (excluding its properties)
 * is present in the provided `allowedJoinsSet`.
 */
export function validateNestedWhere(
    whereObject: any,
    allowedJoinsSet: Set<string>,

    // TODO: Document that below keywords should be forbidden in all models
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
        'search',
        'AND\\.\\d+',
        'AND',
        'OR\\.\\d+',
        'OR',
        'NOT',
    ],
) {
    const blackListedWordsRegex = new RegExp(
        `(^|\\.)${`(${prismaBlacklistKeywords.join('|')})`}*(?=\\.|$)`,
        'g',
    );
    const trimDotsRegex = /(^\.+)|(\.+$)/g;
    const repeatedDotsRegex = /\.+/g;
    const lastFragmentRegex = /\.?[^.]+$/;
    const leafArrayContentRegex = /\.(in|notIn)\.\d+$/;
    const leafArrayRegex = /\.(in|notIn)$/;

    traverse(whereObject, (context) => {
        const { value, meta } = context;
        const isLeafArrayContent = leafArrayContentRegex.test(meta.nodePath || '');
        const isLeafArray =
            meta.nodePath && value instanceof Array && leafArrayRegex.test(meta.nodePath);
        const isLeafNonArray = !isLeafArrayContent && !(value instanceof Object); // when value is non-objects it means parent are final nodes (except when isLeafArrayContent)
        const isLeaf = isLeafArray || isLeafNonArray;
        if (isLeaf) {
            const withoutBlacklistedWords = meta.nodePath!.replace(blackListedWordsRegex, '.');
            const withoutRepeatedDots = withoutBlacklistedWords.replace(repeatedDotsRegex, '.');
            const withoutLeadingAndTrailingDots = withoutRepeatedDots.replace(trimDotsRegex, '');
            const cleanedupString = withoutLeadingAndTrailingDots.replace(lastFragmentRegex, '');

            const isAllowed = !cleanedupString || allowedJoinsSet.has(cleanedupString);
            if (!isAllowed) {
                throw new BadRequestException(`Join relation not allowed: ${cleanedupString}`);
            }
        }
    });
}

export function validateJoins(requestedJoins: string[], allowedJoinsSet: Set<string>) {
    for (let i = 0; i < requestedJoins.length; i++) {
        const reqInclude = requestedJoins[i];
        if (!allowedJoinsSet.has(reqInclude)) {
            throw new BadRequestException(`Join relation not allowed: ${reqInclude}`);
        }
    }
}

/**
 * Takes an array of arbitrarily deep nested `orderByObjects` and compares if the path to the deepest nested objects (excluding their properties)
 * are present in the provided `allowedJoinsSet`.
 */
export function validateNestedOrderBy(orderByObjects: any[], allowedJoinsSet: Set<string>) {
    const lastFragmentRegex = /\.?[^.]+$/;
    for (let i = 0; i < orderByObjects.length; i++) {
        traverse(orderByObjects[i], (context) => {
            const { value, meta } = context;
            const isLeaf = !(value instanceof Object); // nulls and non-objects are final nodes, except when using 'in' or 'notIn'
            if (isLeaf) {
                // leaf paths are the longest
                const leafPath = meta.nodePath!;
                const pathWithoutLastFragment = leafPath.replace(lastFragmentRegex, '');

                const isAllowed =
                    !pathWithoutLastFragment || allowedJoinsSet.has(pathWithoutLastFragment);
                if (!isAllowed) {
                    throw new BadRequestException(
                        `Join relation not allowed: ${pathWithoutLastFragment}`,
                    );
                }
            }
        });
    }
}

const crudQueryFullSchema = Joi.object({
    where: Joi.object().required(),
    joins: Joi.array()
        .items(Joi.string())
        .required(),
    select: Joi.object({
        only: Joi.array().items(Joi.string()),
        except: Joi.array().items(Joi.string()),
    }).required(),
    orderBy: Joi.array()
        .items(Joi.object())
        .required(),
    page: Joi.number()
        .integer()
        .min(1)
        .required(),
    pageSize: Joi.number()
        .integer()
        .min(1)
        .required(),
});
export function validateCrudQueryFull(fullCrudQuery: CrudQueryFull) {
    const { error } = crudQueryFullSchema.validate(fullCrudQuery);
    if (error) {
        throw new BadRequestException(`fullCrudQuery did not match schema: \n${error}`);
    }
}
