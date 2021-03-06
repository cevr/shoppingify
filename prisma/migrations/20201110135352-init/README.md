# Migration `20201110135352-init`

This migration has been generated by cvr at 11/10/2020, 8:53:52 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TYPE "public"."ListStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED')

CREATE TABLE "public"."User" (
"id" SERIAL,
"username" text   NOT NULL ,
"password" text   NOT NULL ,
"activeListId" integer   ,
PRIMARY KEY ("id")
)

CREATE TABLE "public"."List" (
"id" SERIAL,
"name" text   NOT NULL ,
"userId" integer   NOT NULL ,
"status" "ListStatus"  NOT NULL DEFAULT E'ACTIVE',
"createdAt" timestamp(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updatedAt" timestamp(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY ("id")
)

CREATE TABLE "public"."Item" (
"id" SERIAL,
"name" text   NOT NULL ,
"note" text   ,
"image" text   ,
"userId" integer   NOT NULL ,
"categoryId" integer   ,
PRIMARY KEY ("id")
)

CREATE TABLE "public"."ListItem" (
"count" integer   NOT NULL DEFAULT 0,
"complete" boolean   NOT NULL DEFAULT false,
"itemId" integer   NOT NULL ,
"listId" integer   NOT NULL ,
PRIMARY KEY ("itemId","listId")
)

CREATE TABLE "public"."Category" (
"id" SERIAL,
"name" text   NOT NULL ,
"userId" integer   ,
PRIMARY KEY ("id")
)

CREATE UNIQUE INDEX "User.username_unique" ON "public"."User"("username")

ALTER TABLE "public"."List" ADD FOREIGN KEY("userId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."Item" ADD FOREIGN KEY("userId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."Item" ADD FOREIGN KEY("categoryId")REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE

ALTER TABLE "public"."ListItem" ADD FOREIGN KEY("itemId")REFERENCES "public"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."ListItem" ADD FOREIGN KEY("listId")REFERENCES "public"."List"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."Category" ADD FOREIGN KEY("userId")REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration ..20201110135352-init
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,72 @@
+datasource db {
+  provider = "postgresql"
+  url = "***"
+}
+
+generator client {
+  provider        = "prisma-client-js"
+  previewFeatures = ["connectOrCreate"]
+}
+
+model User {
+  id           Int        @id @default(autoincrement())
+  username     String     @unique
+  password     String
+  activeListId Int?
+  /// @onDelete(CASCADE)
+  categories   Category[]
+  /// @onDelete(CASCADE)
+  items        Item[]
+  /// @onDelete(CASCADE)
+  lists        List[]
+}
+
+model List {
+  id        Int        @id @default(autoincrement())
+  name      String
+  user      User       @relation(fields: [userId], references: [id])
+  userId    Int
+  /// @onDelete(CASCADE)
+  items     ListItem[]
+  status    ListStatus @default(ACTIVE)
+  createdAt DateTime   @default(now())
+  updatedAt DateTime   @default(now()) @updatedAt
+}
+
+enum ListStatus {
+  ACTIVE
+  COMPLETED
+  CANCELLED
+}
+
+model Item {
+  id         Int        @id @default(autoincrement())
+  name       String
+  note       String?
+  image      String?
+  user       User       @relation(fields: [userId], references: [id])
+  userId     Int
+  category   Category?  @relation(fields: [categoryId], references: [id])
+  categoryId Int?
+  /// @onDelete(CASCADE)
+  lists      ListItem[]
+}
+
+model ListItem {
+  count    Int     @default(0)
+  complete Boolean @default(false)
+  item     Item    @relation(fields: [itemId], references: [id])
+  itemId   Int
+  list     List    @relation(fields: [listId], references: [id])
+  listId   Int
+
+  @@id([itemId, listId])
+}
+
+model Category {
+  id     Int    @id @default(autoincrement())
+  name   String
+  user   User?  @relation(fields: [userId], references: [id])
+  userId Int?
+  items  Item[]
+}
```


