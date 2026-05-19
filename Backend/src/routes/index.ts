import { Router } from 'express';
import { authRouter } from './auth.js';
import { healthRouter } from './health.js';
import { leadsRouter } from './leads.js';
import { dashboardRouter } from './dashboard.js';
import { notificationsRouter } from './notifications.js';
import { activitiesRouter } from './activities.js';
import { contactsRouter } from './contacts.js';
import { teamRouter } from './team.js';

const api = Router();

api.use('/health', healthRouter);
api.use('/auth', authRouter);
api.use('/leads', leadsRouter);
api.use('/dashboard', dashboardRouter);
api.use('/notifications', notificationsRouter);
api.use('/activities', activitiesRouter);
api.use('/contacts', contactsRouter);
api.use('/team', teamRouter);

export { api };
