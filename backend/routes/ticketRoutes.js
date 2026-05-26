import express from 'express';
import { getMyTickets, getTicketById, validateTicket } from '../controllers/ticketController.js';
import { verifyToken, isOrganizer } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-tickets', verifyToken, getMyTickets);
router.get('/:id', verifyToken, getTicketById);
router.post('/validate/:ticket_code', isOrganizer, validateTicket);

export default router;
