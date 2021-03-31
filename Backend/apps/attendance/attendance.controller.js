const { Router } = require('express')
const router = Router()
const Routes = require('./attendance.routes')
const routes = new Routes()
const GETRoutes = require('./attendance.routes.get')
const GETroutes = new GETRoutes()

const advancedResults = require('../../middleware/advancedResults')
const { protect, authorize } = require('../../middleware/auth')

router.get('/all', GETroutes.getAttendance)
router.get('/get', GETroutes.getAttendanceStatistics)
router.get('/session', GETroutes.getSessionAttendance)
router.get('/group-statistics', GETroutes.getGroupAttendanceStatistics)

router.get('/group', protect, authorize('group-leader'), GETroutes.getGroupWeekAttendance)
router.get('/group-session', protect, authorize('group-leader'), GETroutes.getGroupSessionAttendance)

router.get('/student', protect, authorize('student'), GETroutes.getStudentWeeklyAttendance)
router.get('/student-session', protect, authorize('student'), GETroutes.getStudentSessionAttendance)
router.get('/student-all/:id', protect, authorize('organizer'), GETroutes.getStudentAllAttendance)

router.post('/create', protect, authorize('organizer'), routes.createAttendance)

module.exports = router
