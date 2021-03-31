const { Router } = require('express')
const router = Router()
const Lesson = require('./lesson.model')
const Routes = require('./lessons.routes')
const routes = new Routes()

const advancedResults = require('../../middleware/advancedResults')
const { protect, authorize } = require('../../middleware/auth')

router.get('/all', advancedResults(Lesson), routes.getAllLessons)
router.get('/create-data', protect, authorize('teacher'), routes.getDataForCreate)
router.get('/weekly', protect, authorize('teacher'), routes.getWeeklyLessons)
router.get('/lesson/:id', protect, authorize('teacher'), routes.getLessonDetail)

router.post('/create', protect, authorize('teacher'), routes.createLesson)
router.post('/post-homework/:id', protect, authorize('student'), routes.postHomework)
router.post('/check-homework/:id', protect, authorize('teacher'), routes.checkStudentHomework)

module.exports = router
