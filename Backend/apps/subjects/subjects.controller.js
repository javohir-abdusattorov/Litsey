const { Router } = require('express');
const router = Router();
const Subject = require('./subject.model')
const Routes = require('./subjects.routes')
const routes = new Routes()

const advancedResults = require('../../middleware/advancedResults');
const { protect, authorize } = require('../../middleware/auth');

router.get('/all', advancedResults(Subject), routes.getAllSubject);
router.post('/create', protect, authorize('super-admin', 'sub-admin'), routes.createSubject);
router.put('/edit/:id', protect, authorize('super-admin', 'sub-admin'), routes.editSubject);
router.delete('/delete/:id', protect, authorize('super-admin', 'sub-admin'), routes.removeSubject);

module.exports = router;