import express from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import studentRoutes from './modules/users/student/student.routes.js';
import teacherRoutes from './modules/users/teacher/teacher.routes.js';
import adminRoutes from './modules/users/admin/admin.routes.js';
import courseRoutes from './modules/courses/course.routes.js';
import commentRoutes from './modules/comments/comment.routes.js';
import generalAnnouncementRoutes from './modules/announcements/general/general.routes.js';
import courseAnnouncementRoutes from './modules/announcements/course/course.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import pollRoutes from './modules/polls/poll.routes.js';
import healthRoutes from './modules/health/health.routes.js';

const app = express();
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/student', studentRoutes);
app.use('/teacher', teacherRoutes);
app.use('/admin', adminRoutes);
app.use('/courses', courseRoutes);
app.use('/comments', commentRoutes);
app.use('/announcements/general', generalAnnouncementRoutes);
app.use('/announcements/course', courseAnnouncementRoutes);
app.use('/notifications', notificationRoutes);
app.use('/polls', pollRoutes);

export default app;