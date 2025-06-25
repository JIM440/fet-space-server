/*
  Warnings:

  - Made the column `description` on table `assignment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `course` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `assignment` MODIFY `description` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `course` MODIFY `description` TEXT NOT NULL;
