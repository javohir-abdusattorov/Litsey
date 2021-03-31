const { Router } = require('express')
const router = Router()
const Group = require('./group.model')
const Routes = require('./groups.routes')
const routes = new Routes()

const advancedResults = require('../../middleware/advancedResults')
const { protect, authorize } = require('../../middleware/auth')

router.get('/all', advancedResults(Group), routes.getAllGroups)
router.get('/group/:id', routes.getOneGroup)
router.get('/teacher',  protect, authorize('teacher'), routes.getTeacherGroups)
router.get('/subject-info/:id',  protect, authorize('teacher'), routes.getGroupSubjectStatistics)
router.post('/create', protect, authorize('super-admin', 'sub-admin'), routes.createGroup)

router.put('/transfer-student', protect, authorize('super-admin', 'sub-admin'), routes.transferStudent)
router.put('/activate/:id', protect, authorize('super-admin', 'sub-admin'), routes.activateGroup)
router.put('/disable/:id', protect, authorize('super-admin', 'sub-admin'), routes.disableGroup)

module.exports = router
