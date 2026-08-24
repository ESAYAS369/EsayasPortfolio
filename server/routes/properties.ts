import { Router } from 'express';
import * as propertyController from '../controllers/propertyController';

const router = Router();

// Public routes
router.get('/', propertyController.getProperties);
router.post('/inquiries', propertyController.addInquiry);

// Admin routes
router.post('/', propertyController.addProperty);
router.put('/:id', propertyController.updateProperty);
router.delete('/:id', propertyController.deleteProperty);
router.get('/inquiries', propertyController.getInquiries);
router.delete('/inquiries/:id', propertyController.deleteInquiry);

export default router;
