import { Router } from 'express';
import * as testimonialController from '../controllers/testimonialController';

const router = Router();

// Public routes
router.get('/', testimonialController.getTestimonials);

// Admin routes
router.post('/', testimonialController.addTestimonial);
router.put('/:id', testimonialController.updateTestimonial);
router.delete('/:id', testimonialController.deleteTestimonial);

export default router;
