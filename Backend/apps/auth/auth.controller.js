const { Router } = require('express')
const router = Router()
const User = require('../users/user.model')
const Routes = require('./auth.routes')
const routes = new Routes()
const JournalRoutes = require('../journals/journals.routes')
const journalRoutes = new JournalRoutes()

const advancedResults = require('../../middleware/advancedResults')
const { protect, authorize } = require('../../middleware/auth')

router.get('/me', protect, routes.getMe)

router.post('/login', routes.login)
router.post('/register-subadmin', protect, authorize('super-admin'), routes.registerSubAdmin)
router.post('/register-teacher', protect, authorize('super-admin', 'sub-admin'), routes.registerTeacher)
router.post('/register-student', protect, authorize('group-leader'), routes.registerStudent, journalRoutes.createStudentJournal)
router.post('/logout', protect, routes.logoutUser)

module.exports = router
