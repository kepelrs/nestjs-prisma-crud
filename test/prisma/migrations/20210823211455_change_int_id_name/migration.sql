/*
  Warnings:

  - The primary key for the `EntityWithIntId` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `EntityWithIntId` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EntityWithIntId" (
    "exampleDifferentIdName" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "exampleProperty" TEXT NOT NULL
);
INSERT INTO "new_EntityWithIntId" ("exampleProperty") SELECT "exampleProperty" FROM "EntityWithIntId";
DROP TABLE "EntityWithIntId";
ALTER TABLE "new_EntityWithIntId" RENAME TO "EntityWithIntId";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
