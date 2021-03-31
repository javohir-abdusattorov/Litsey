const { Router } = require('express')
const router = Router()
const Journal = require('./journal.model')
const Routes = require('./journals.routes')
const routes = new Routes()
const GETRoutes = require('./journals.routes.get')
const GETroutes = new GETRoutes()

const advancedResults = require('../../middleware/advancedResults')
const { protect, authorize } = require('../../middleware/auth')

router.get('/all', advancedResults(Journal), GETroutes.getAllJournals)
router.get('/get-admin', GETroutes.adminGetJournals)
router.get('/get-leader', protect, authorize('group-leader'), GETroutes.leaderGetJournals)
router.get('/get-teacher', protect, authorize('teacher'), GETroutes.teacherGetJournals)
router.get('/get-teacher-group/:id', protect, authorize('teacher'), GETroutes.teacherGetGroupJournal)
router.get('/get-student/:id', protect, GETroutes.studentGetJournals)
router.get('/get-group/:id', protect, authorize('super-admin', 'group-leader'), GETroutes.getGroupJournal)
router.get('/get-lessons', protect, authorize('teacher'), GETroutes.getTeacherLessons)

router.get('/config', GETroutes.getConfig)

router.put('/edit-score', protect, authorize('teacher'), routes.editStudentScore)
router.put('/edit-lesson-score', protect, authorize('teacher'), routes.editStudentScoreByDate)
router.post('/create-session', protect, authorize('super-admin'), routes.createNewSession)
router.post('/swap-lessons', protect, authorize('teacher'), routes.swapLessons)


module.exports = router
