import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const NUMBER_OF_USER_SEEDS = 2;

function generateSeeds(n: number) {
    const userSeeds = [];
    const random = Math.random();
    for (let i = 0; i < n; i++) {
        const unique = `${random}${i}`;
        userSeeds.push({
            id: unique,
            email: unique,
            name: unique,
            posts: {
                create: [
                    {
                        title: unique,
                        content: unique,
                        published: false,
                        comments: {
                            create: [
                                {
                                    published: false,
                                    title: unique,
                                    content: unique,
                                },
                            ],
                        },
                    },
                ],
            },
            profile: {
                create: {
                    fullName: unique,
                },
            },
        });
    }

    return userSeeds;
}

const userSeeds: any[] = generateSeeds(NUMBER_OF_USER_SEEDS);

export const dummySeedFullObj = userSeeds[0];
export const dummySeedValueString = dummySeedFullObj.id;

export async function seed(deleteFirst = false) {
    if (deleteFirst === true) {
        await prisma.$queryRaw(`Delete from User`);
    }

    for (const userSeed of userSeeds) {
        await prisma.user
            .create({
                data: userSeed,
            })
            .catch((e) => {
                console.log(e);
            });
    }
    await prisma.$disconnect();
}
