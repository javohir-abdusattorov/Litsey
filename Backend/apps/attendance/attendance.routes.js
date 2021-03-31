
const ErrorResponse = require('../../utils/errorResponse')
const asyncHandler = require('../../middleware/async')

const Attendance = require("./attendance.model");
const Group = require('../groups/group.model');

const Validation = require('../../utils/validationService')
const validation = new Validation()
const DateService = require('../../utils/dateService')
const dateService = new DateService()

const Service = require("./attendance.service")
const service = new Service()


module.exports = class AttendanceRoutes {

  // @desc      Do todays attendance
  // @route     POST /api/v1/attendance/create
  // @access    Private (Organizer only)
  createAttendance = asyncHandler(async (req, res, next) => {
  	const result = validation.validateBody(req.body, [
      { name: "students", type: "array" },
    ])
    if (!result.success) return next(new ErrorResponse(result.message, 400))

  	const date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
  	const attendance = await Attendance.findOne()
  	if (date.getDay() == 0) return next(new ErrorResponse(`Yakshanba kuni davomat qilinmaydi!`, 400))

  	const isAlreadyAttendanced = attendance.attendance.filter(obj => dateService.areSameDay(obj.date, date))
  	if (isAlreadyAttendanced.length) return next(new ErrorResponse(`Bugungi davomat allaqachon qilingan!`, 400))

    const { students } = req.body
  	let studentData = []

  	for (const student of students) {
	    const studentResult = await validation.validateUserID(student.student, next)
    	if (!studentResult.success) return next(new ErrorResponse(studentResult.message, 400))

    	const user = studentResult.data
    	const group = await Group.findById(user.group)
    	const groupStudent = group.students.find(obj => obj.student.toString() === student.student)

			await service.editStudentAttendance(groupStudent, group, student.hasReason)
    	studentData.push({
    		name: user.name,
    		student: user._id,
    		hasReason: student.hasReason,
    		group: {
    			name: group.name,
    			group: group._id
    		}
    	})
  	}

  	// Create attendance
  	attendance.attendance.push({
  		date,
  		students: studentData
  	})
  	await attendance.save()

    res.status(200).json({
    	success: true,
    	data: attendance.attendance
    })
  })

}

Array.prototype.last = function() { return this[this.length - 1] }
