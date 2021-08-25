-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EntityWithIntId" (
    "exampleDifferentIdName" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "exampleProperty" TEXT NOT NULL,
    "userId" TEXT,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_EntityWithIntId" ("exampleDifferentIdName", "exampleProperty") SELECT "exampleDifferentIdName", "exampleProperty" FROM "EntityWithIntId";
DROP TABLE "EntityWithIntId";
ALTER TABLE "new_EntityWithIntId" RENAME TO "EntityWithIntId";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
