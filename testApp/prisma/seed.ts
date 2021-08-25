import { Post, PrismaClient, User, Comment, Country, Profile } from '@prisma/client';
const prisma = new PrismaClient();

export const NUMBER_OF_TEST_USER_SEEDS = 2;
/** seedEntityIds are used as db record ids and as some of their string properties as well */
export const seedEntityIds = [];
/** Alias for seedEntityIds */
export const needleStrings = seedEntityIds;

export type TestSeed = User & {
    posts: (Post & {
        comments: Comment[];
    })[];
    profile: Profile;
    country: Country;
};

const prismaCreateObjects = [];
for (let i = 0; i < NUMBER_OF_TEST_USER_SEEDS; i++) {
    const uniqueNeedleString = `${Math.random()}${i}`;

    seedEntityIds.push(uniqueNeedleString);

    prismaCreateObjects.push({
        id: uniqueNeedleString,
        email: uniqueNeedleString,
        name: uniqueNeedleString,
        password: 'some hashed password',
        posts: {
            create: [
                {
                    id: uniqueNeedleString,
                    title: uniqueNeedleString,
                    content: uniqueNeedleString,
                    published: false,
                    comments: {
                        create: [
                            {
                                id: uniqueNeedleString,
                                published: false,
                                title: uniqueNeedleString,
                                content: uniqueNeedleString,
                                exampleForbiddenProperty:
                                    'some property that will not be present in responses',
                            },
                        ],
                    },
                },
            ],
        },
        profile: {
            create: {
                id: uniqueNeedleString,
                fullName: uniqueNeedleString,
            },
        },
        country: {
            create: {
                id: uniqueNeedleString,
                name: `country${i}`,
                someNullableValue: `someNullableValue${i}`,
            },
        },
        entitiesWithIntId: {
            create: [
                {
                    exampleDifferentIdName: i + 1,
                    exampleProperty: uniqueNeedleString,
                },
            ],
        },
    });
}

export async function seed(deleteAll = false) {
    if (deleteAll === true) {
        await prisma.$queryRaw(`Delete from Category`);
        await prisma.$queryRaw(`Delete from Comment`);
        await prisma.$queryRaw(`Delete from Country`);
        await prisma.$queryRaw(`Delete from Post`);
        await prisma.$queryRaw(`Delete from Profile`);
        await prisma.$queryRaw(`Delete from User`);
        await prisma.$queryRaw(`Delete from EntityWithIntId`);
    }

    const userSeeds: TestSeed[] = [];
    for (const prismaCreateObject of prismaCreateObjects) {
        await prisma.user
            .create({
                data: prismaCreateObject,
                include: {
                    posts: {
                        include: {
                            comments: true,
                        },
                    },
                    profile: true,
                    country: true,
                    entitiesWithIntId: true,
                },
            })
            .then((v) => userSeeds.push(v))
            .catch((e) => {
                console.log(e);
            });
    }

    await prisma.$disconnect();

    return userSeeds;
}
