/*
  Warnings:

  - The primary key for the `favorite_pokemon` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `team_pokemon` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `username` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(15)`.
  - You are about to alter the column `password` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- DropForeignKey
ALTER TABLE "favorite_pokemon" DROP CONSTRAINT "favorite_pokemon_userId_fkey";

-- DropForeignKey
ALTER TABLE "team_pokemon" DROP CONSTRAINT "team_pokemon_userId_fkey";

-- AlterTable
ALTER TABLE "favorite_pokemon" DROP CONSTRAINT "favorite_pokemon_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "favorite_pokemon_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "favorite_pokemon_id_seq";

-- AlterTable
ALTER TABLE "team_pokemon" DROP CONSTRAINT "team_pokemon_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "team_pokemon_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "team_pokemon_id_seq";

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "username" SET DATA TYPE VARCHAR(15),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "users_id_seq";

-- AddForeignKey
ALTER TABLE "favorite_pokemon" ADD CONSTRAINT "favorite_pokemon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_pokemon" ADD CONSTRAINT "team_pokemon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
