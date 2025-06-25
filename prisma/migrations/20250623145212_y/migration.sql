-- AlterTable
ALTER TABLE `attachment` MODIFY `file_type` ENUM('pdf', 'docx', 'doc', 'img', 'ppt', 'video') NOT NULL;
