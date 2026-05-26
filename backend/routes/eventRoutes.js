import express from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getOrganizerEvents
} from '../controllers/eventController.js';
import { verifyToken, isOrganizer } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllEvents);
router.get('/organizer/my-events', isOrganizer, getOrganizerEvents);
router.get('/:id', getEventById);
router.post('/', isOrganizer, createEvent);
router.put('/:id', isOrganizer, updateEvent);
router.delete('/:id', isOrganizer, deleteEvent);

export default router;
