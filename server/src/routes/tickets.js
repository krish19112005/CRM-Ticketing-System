import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const filter = req.user.role === 'CUSTOMER' ? { customerId: req.user.id } : {};
    const tickets = await prisma.ticket.findMany({
      where: filter,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        agent: { select: { id: true, name: true, email: true } },
        comments: {
          include: { user: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authorize(['CUSTOMER', 'ADMIN']), async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        customerId: req.user.id
      },
      include: {
        customer: { select: { id: true, name: true, email: true } }
      }
    });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', authorize(['AGENT', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, agentId } = req.body;

    const dataToUpdate = {};
    if (status) dataToUpdate.status = status;
    if (agentId !== undefined) dataToUpdate.agentId = agentId;

    const updated = await prisma.ticket.update({
      where: { id },
      data: dataToUpdate,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        agent: { select: { id: true, name: true, email: true } }
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const comment = await prisma.comment.create({
      data: {
        message,
        ticketId: id,
        userId: req.user.id
      },
      include: {
        user: { select: { id: true, name: true, role: true } }
      }
    });

    await prisma.ticket.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;