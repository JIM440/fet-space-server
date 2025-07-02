/*
  Warnings:

  - The values [SuperAdmin] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `admin` ADD COLUMN `is_super_admin` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `course_announcement` MODIFY `content` TEXT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('Student', 'Teacher', 'Admin') NOT NULL,
    MODIFY `refreshToken` TEXT NULL;
