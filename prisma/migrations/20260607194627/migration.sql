/*
  Warnings:

  - You are about to drop the `team_pokemon` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "team_pokemon" DROP CONSTRAINT "team_pokemon_userId_fkey";

-- DropTable
DROP TABLE "team_pokemon";
