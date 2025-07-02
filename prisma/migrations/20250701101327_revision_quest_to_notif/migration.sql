-- AlterTable
ALTER TABLE `notification` ADD COLUMN `revision_questions_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_revision_questions_id_fkey` FOREIGN KEY (`revision_questions_id`) REFERENCES `Revision_Question`(`question_id`) ON DELETE CASCADE ON UPDATE CASCADE;
