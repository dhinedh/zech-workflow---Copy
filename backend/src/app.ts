import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { tenantContext } from './lib/context.js';
import { tenantMiddleware } from './middleware/tenant.js';
import { authenticate } from './middleware/auth.js';

// Route Imports
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import milestoneRoutes from './routes/milestones.js';
import taskRoutes from './routes/tasks.js';
import dailyReportRoutes from './routes/dailyReports.js';
import userRoutes from './routes/users.js';
import meetingsRoutes from './routes/meetings.js';
import attendanceRoutes from './routes/attendance.js';
import notificationRoutes from './routes/notifications.js';
import messageRoutes from './routes/message.js';

const app = express();

// Middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
    next();
});
app.use(helmet());
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://[IP_ADDRESS]',
    process.env.FRONTEND_URL?.replace(/\/$/, '')
].filter(Boolean) as string[];

console.log('Allowed Origins:', allowedOrigins);

app.use(cors({
    origin: (origin, callback) => {
        // If no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const matched = allowedOrigins.some(ao => ao.replace(/\/$/, '') === origin.replace(/\/$/, ''));

        // Allow local network access in development
        if (matched || (process.env.NODE_ENV === 'development' && origin.startsWith('http://192.168.'))) {
            callback(null, true);
        } else {
            console.error(`CORS Error: Origin ${origin} not allowed. Allowed:`, allowedOrigins);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Global middleware to set user on request if token is present
// Note: We need a "soft" authenticate middleware that doesn't block but just decodes, 
// OR we apply authenticate + tenantMiddleware on specific routes.
// The current `authenticate` likely sends 401. 
// However, the best place for tenantMiddleware is AFTER authenticate.
// We will rely on individual routers applying `authenticate` first.
// But wait! tenantContext.run() needs to wrap the route handler execution.
// So we need a global middleware that checks if `req.user` is populated.
// BUT `req.user` is only populated by `authenticate`.
// Strategy: Modify routes to apply both. But for simplicity in this refactor, let's add a global soft-auth check if possible, or bind it in the route definition.

// Since existing routes use `router.use(authenticate)`, we can add `router.use(tenantMiddleware)` there too.
// Let's create a helper or just modify the app to use a wrapper if we want global 
// automatic isolation.
// FOR THIS STEP: We will assume we update the specific route files to include `tenantMiddleware`.
// Wait, `tenantContext.run(callback)` is Scoped. Standard express middleware `next()` runs inside it?
// Yes, if we call `tenantContext.run(ctx, next)`.

// Let's implement a global middleware that tries to decode but doesn't block, 
// just so we can wrap *everything* in a context if a token exists?
// Actually safest is to inject it into the authenticated routes.

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/daily-reports', dailyReportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meetings', meetingsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

// Health Check
// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('SERVER_ERROR:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
});

app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Zech Workflow API Running' });
});

export default app;
