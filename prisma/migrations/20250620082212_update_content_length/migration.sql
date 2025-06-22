/*
  Warnings:

  - A unique constraint covering the columns `[join_code]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `join_code` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Made the column `content` on table `course_announcement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `content` on table `general_announcement` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `course` ADD COLUMN `code` VARCHAR(191) NOT NULL,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `join_code` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `course_announcement` MODIFY `title` VARCHAR(191) NULL,
    MODIFY `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `general_announcement` MODIFY `title` VARCHAR(191) NULL,
    MODIFY `content` TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Course_join_code_key` ON `Course`(`join_code`);
