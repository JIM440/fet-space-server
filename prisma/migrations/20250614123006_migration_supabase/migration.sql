-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Student', 'Teacher', 'Admin', 'SuperAdmin');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('pdf', 'doc', 'img');

-- CreateEnum
CREATE TYPE "PollType" AS ENUM ('general', 'course');

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone_number" TEXT,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Student" (
    "user_id" INTEGER NOT NULL,
    "matricule_number" TEXT NOT NULL,
    "nationality" TEXT,
    "level" TEXT NOT NULL,
    "institutional_email" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Course" (
    "course_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "teacher_id" INTEGER NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("course_id")
);

-- CreateTable
CREATE TABLE "Course_Teacher" (
    "course_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,

    CONSTRAINT "Course_Teacher_pkey" PRIMARY KEY ("course_id","teacher_id")
);

-- CreateTable
CREATE TABLE "Course_Student" (
    "course_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,

    CONSTRAINT "Course_Student_pkey" PRIMARY KEY ("course_id","student_id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "assignment_id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "teacher_id" INTEGER NOT NULL,
    "due_date" TIMESTAMP(3),

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("assignment_id")
);

-- CreateTable
CREATE TABLE "Assignment_Submission" (
    "submission_id" SERIAL NOT NULL,
    "assignment_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assignment_Submission_pkey" PRIMARY KEY ("submission_id")
);

-- CreateTable
CREATE TABLE "Course_Content" (
    "content_id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Course_Content_pkey" PRIMARY KEY ("content_id")
);

-- CreateTable
CREATE TABLE "Revision_Question" (
    "question_id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "file_url" TEXT,

    CONSTRAINT "Revision_Question_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "Course_Announcement" (
    "announcement_id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "is_poll" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Course_Announcement_pkey" PRIMARY KEY ("announcement_id")
);

-- CreateTable
CREATE TABLE "General_Announcement" (
    "announcement_id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "is_poll" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "General_Announcement_pkey" PRIMARY KEY ("announcement_id")
);

-- CreateTable
CREATE TABLE "Poll" (
    "poll_id" SERIAL NOT NULL,
    "general_announcement_id" INTEGER,
    "course_announcement_id" INTEGER,
    "allow_multiple_answers" BOOLEAN NOT NULL,
    "type" "PollType" NOT NULL,

    CONSTRAINT "Poll_pkey" PRIMARY KEY ("poll_id")
);

-- CreateTable
CREATE TABLE "Poll_Option" (
    "option_id" SERIAL NOT NULL,
    "poll_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Poll_Option_pkey" PRIMARY KEY ("option_id")
);

-- CreateTable
CREATE TABLE "Poll_Response" (
    "response_id" SERIAL NOT NULL,
    "poll_id" INTEGER NOT NULL,
    "poll_option_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "responded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Poll_Response_pkey" PRIMARY KEY ("response_id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "comment_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "assignment_id" INTEGER,
    "general_announcement_id" INTEGER,
    "course_announcement_id" INTEGER,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "attachment_id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "file_type" "FileType" NOT NULL,
    "course_content_id" INTEGER,
    "assignment_id" INTEGER,
    "assignment_submission_id" INTEGER,
    "general_announcement_id" INTEGER,
    "course_announcement_id" INTEGER,
    "revision_questions_id" INTEGER,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("attachment_id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "notification_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT NOT NULL,
    "assignment_id" INTEGER,
    "course_content_id" INTEGER,
    "course_announcement_id" INTEGER,
    "general_announcement_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_matricule_number_key" ON "Student"("matricule_number");

-- CreateIndex
CREATE UNIQUE INDEX "Student_institutional_email_key" ON "Student"("institutional_email");

-- CreateIndex
CREATE UNIQUE INDEX "Poll_general_announcement_id_key" ON "Poll"("general_announcement_id");

-- CreateIndex
CREATE UNIQUE INDEX "Poll_course_announcement_id_key" ON "Poll"("course_announcement_id");

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course_Teacher" ADD CONSTRAINT "Course_Teacher_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course_Teacher" ADD CONSTRAINT "Course_Teacher_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course_Student" ADD CONSTRAINT "Course_Student_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course_Student" ADD CONSTRAINT "Course_Student_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment_Submission" ADD CONSTRAINT "Assignment_Submission_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "Assignment"("assignment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment_Submission" ADD CONSTRAINT "Assignment_Submission_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course_Content" ADD CONSTRAINT "Course_Content_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revision_Question" ADD CONSTRAINT "Revision_Question_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course_Announcement" ADD CONSTRAINT "Course_Announcement_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course_Announcement" ADD CONSTRAINT "Course_Announcement_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "General_Announcement" ADD CONSTRAINT "General_Announcement_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_general_announcement_id_fkey" FOREIGN KEY ("general_announcement_id") REFERENCES "General_Announcement"("announcement_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_course_announcement_id_fkey" FOREIGN KEY ("course_announcement_id") REFERENCES "Course_Announcement"("announcement_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poll_Option" ADD CONSTRAINT "Poll_Option_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "Poll"("poll_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poll_Response" ADD CONSTRAINT "Poll_Response_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "Poll"("poll_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poll_Response" ADD CONSTRAINT "Poll_Response_poll_option_id_fkey" FOREIGN KEY ("poll_option_id") REFERENCES "Poll_Option"("option_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poll_Response" ADD CONSTRAINT "Poll_Response_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "Assignment"("assignment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_general_announcement_id_fkey" FOREIGN KEY ("general_announcement_id") REFERENCES "General_Announcement"("announcement_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_course_announcement_id_fkey" FOREIGN KEY ("course_announcement_id") REFERENCES "Course_Announcement"("announcement_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_course_content_id_fkey" FOREIGN KEY ("course_content_id") REFERENCES "Course_Content"("content_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "Assignment"("assignment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_assignment_submission_id_fkey" FOREIGN KEY ("assignment_submission_id") REFERENCES "Assignment_Submission"("submission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_general_announcement_id_fkey" FOREIGN KEY ("general_announcement_id") REFERENCES "General_Announcement"("announcement_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_course_announcement_id_fkey" FOREIGN KEY ("course_announcement_id") REFERENCES "Course_Announcement"("announcement_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_revision_questions_id_fkey" FOREIGN KEY ("revision_questions_id") REFERENCES "Revision_Question"("question_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "Assignment"("assignment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_course_content_id_fkey" FOREIGN KEY ("course_content_id") REFERENCES "Course_Content"("content_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_course_announcement_id_fkey" FOREIGN KEY ("course_announcement_id") REFERENCES "Course_Announcement"("announcement_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_general_announcement_id_fkey" FOREIGN KEY ("general_announcement_id") REFERENCES "General_Announcement"("announcement_id") ON DELETE CASCADE ON UPDATE CASCADE;
