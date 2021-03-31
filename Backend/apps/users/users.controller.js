const { Router } = require('express')
const router = Router()
const User = require('./user.model')
const Routes = require('./users.routes')
const routes = new Routes()

const advancedResults = require('../../middleware/advancedResults')
const { protect, authorize } = require('../../middleware/auth')

router.get('/all', advancedResults(User), routes.getAllUsers)
router.get('/student-detail/:id', routes.getStudentDetailData)
router.get('/student-statistics', protect, authorize('student'), routes.getStudentStatistics)
router.get('/week-statistics', protect, authorize('student'), routes.getWeeklyStudentStatistics)

router.post('/exel/:type', routes.exportUsersDataToExel)
router.put('/edit', protect, routes.editUser)
router.put('/edit/:id', protect, authorize('super-admin'), routes.editUserByAdmin)
router.put('/edit-student/:id', protect, authorize('group-leader'), routes.editStudent)

router.put('/activate/:id', protect, authorize('super-admin'), routes.activateUser)
router.put('/disable/:id', protect, authorize('super-admin'), routes.disableUser)

module.exports = router
