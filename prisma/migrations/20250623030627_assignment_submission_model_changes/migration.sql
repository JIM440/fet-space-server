/*
  Warnings:

  - The values [doc] on the enum `Attachment_file_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `assignment_submission` ADD COLUMN `comment` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `attachment` MODIFY `file_type` ENUM('pdf', 'docx', 'img', 'ppt', 'video') NOT NULL;
