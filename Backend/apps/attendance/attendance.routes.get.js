
const ErrorResponse = require('../../utils/errorResponse')
const asyncHandler = require('../../middleware/async')

const Attendance = require("./attendance.model");
const Group = require('../groups/group.model');
const Journal = require("../journals/journal.model");
const Config = require("../../config/config.model")

const Validation = require('../../utils/validationService')
const validation = new Validation()
const DateService = require('../../utils/dateService')
const dateService = new DateService()

const Service = require("./attendance.service")
const service = new Service()


module.exports = class AttendanceGETRoutes {

  // @desc      Get attendance
  // @route     GET /api/v1/attendance/all
  // @access    Private
  getAttendance = asyncHandler(async (req, res, next) => {
  	const { attendance } = await Attendance.findOne()
    res.status(200).json({
    	success: true,
    	data: attendance
    })
  })

  // @desc      Get current session attendance
  // @route     GET /api/v1/attendance/session
  // @access    Private
  getSessionAttendance = asyncHandler(async (req, res, next) => {
    const { attendance } = await Attendance.findOne().lean()
    const course1 = await Group.findOne({ course: 1 })
    const course2 = await Group.findOne({ course: 2 })
    const course1Journal = await Journal.findOne({ "student.group.group": course1._id })
    const course2Journal = await Journal.findOne({ "student.group.group": course2._id })
    const { courses } = await Config.findOne().lean()

    let date = attendance.length ? attendance[0].date : new Date()

    if (course1Journal && courses[1].sessionStarted) {
      const sessionDate = course1Journal.subjects[0].sessions.last().startedAt
      if (sessionDate > date) date = sessionDate
    }

    if (course2Journal && courses[2].sessionStarted) {
      const sessionDate = course2Journal.subjects[0].sessions.last().startedAt
      if (sessionDate > date) date = sessionDate
    }

    res.status(200).json({
      success: true,
      data: attendance.filter(item => new Date(item.date) >= date)
    })
  })

  // @desc      Get group attendance
  // @route     GET /api/v1/attendance/group-statistics
  // @access    Private
  getGroupAttendanceStatistics = asyncHandler(async (req, res, next) => {
    const date = new Date()
    const { attendance } = await Attendance.findOne().lean().lean()

    const allGroups = await Group.find().lean()
    const course1 = allGroups.find(group => group.course === 1)
    const course2 = allGroups.find(group => group.course === 2)
    const course1Journal = await Journal.findOne({ "student.group.group": course1._id })
    const course2Journal = await Journal.findOne({ "student.group.group": course2._id })
    const { courses } = await Config.findOne().lean()

    const dates = {
      1: attendance.length ? attendance[0].date : new Date(),
      2: attendance.length ? attendance[0].date : new Date()
    }

    if (course1Journal && courses[1].sessionStarted) {
      const sessionDate = course1Journal.subjects[0].sessions.last().startedAt
      if (sessionDate > dates[1]) dates[1] = sessionDate
    }

    if (course2Journal && courses[2].sessionStarted) {
      const sessionDate = course2Journal.subjects[0].sessions.last().startedAt
      if (sessionDate > dates[2]) dates[2] = sessionDate
    }
    const data = []

    for (const group of allGroups) {
      data.push({
        name: group.name,
        course: group.course,
        ...service.getGroupAttendanceStatistics(group, attendance, dates[group.course], date)
      })
    }

    res.status(200).json({
      success: true,
      data
    })
  })

  // @desc      Get attendance
  // @route     GET /api/v1/attendance/get
  // @access    Private (Organizer only)
  getAttendanceStatistics = asyncHandler(async (req, res, next) => {
    const d = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
    const date = d.getDay() == 0 ? new Date(d.setDate(d.getDate() - 1)) : d
    const mondayOfWeek = dateService.getMondayOfWeeek(date)
    const { attendance } = await Attendance.findOne()
    const data = { week: [] }

    const todaysAttendance = attendance.find(item => dateService.areSameDay(item.date, date))
    const weekAttendance = attendance.filter(item => item.date >= mondayOfWeek && !dateService.areSameDay(item.date, date))
    if (todaysAttendance) data.today = todaysAttendance

    for (const day of weekAttendance) data.week.push(day)

    res.status(200).json({
      success: true,
      data
    })
  })

  // @desc      Get group attendance
  // @route     GET /api/v1/attendance/group
  // @access    Private (Group-leader only)
  getGroupWeekAttendance = asyncHandler(async (req, res, next) => {
    const d = new Date()
    const date = d.getDay() == 0 ? new Date(d.setDate(d.getDate() - 1)) : new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const mondayOfWeek = dateService.getMondayOfWeeek(date)

    const data = { week: [] }
    const groupID = req.user.group.toString()
    let { attendance } = await Attendance.findOne().lean()
    attendance = attendance.filter(item => (item.date <= date) && (item.date >= mondayOfWeek))

    const todaysAttendance = attendance.find(item => dateService.areSameDay(item.date, date))
    data.today = {
      weekDay: new Date(date),
      data: todaysAttendance ? todaysAttendance.students.filter(student => student.group.group.toString() === groupID).map(item => ({ name: item.name, hasReason: item.hasReason })) : []
    }

    const weekDays = dateService.getDatesBetweenDates(mondayOfWeek, date)
    for (const day of weekDays) {
      const dayAttendance = attendance.find(item => dateService.areSameDay(item.date, day))
      data.week.push({
        weekDay: day,
        data: dayAttendance ? dayAttendance.students.filter(student => student.group.group.toString() === groupID).map(item => ({ name: item.name, hasReason: item.hasReason })) : []
      })
    }

    res.status(200).json({ success: true, data })
  })

  // @desc      Get group from session start date attendance
  // @route     GET /api/v1/attendance/group-session
  // @access    Private (Group-leader only)
  getGroupSessionAttendance = asyncHandler(async (req, res, next) => {
    const date = new Date()
    const { attendance } = await Attendance.findOne().lean()
    const { subjects } = await Journal.findOne({ "student.group.group": req.user.group })
    const { courses } = await Config.findOne().lean()
    const leaderGroup = await Group.findById(req.user.group)

    if (!courses[leaderGroup.course].sessionStarted) return res.status(200).json({
      success: true,
      data: {
        average: 100,
        attendances: []
      }
    })

    const startDate = new Date(subjects[0].sessions.last().startedAt)
    const attendanceFromSession = attendance.filter(item => (item.date <= date) && (item.date >= startDate))
    const statitics = service.getGroupAttendanceStatistics(leaderGroup, [...attendanceFromSession], startDate, date)
    const data = {
      average: statitics.averageAttendance,
      attendances: []
    }

    const weekDays = dateService.getDatesBetweenDates(startDate, date)
    for (const day of weekDays) {
      if (day.getDay() !== 0) {
        const dayAttendance = attendanceFromSession.find(item => dateService.areSameDay(item.date, day))
        data.attendances.push({
          weekDay: day,
          data: dayAttendance ? dayAttendance.students.filter(student => student.group.group.toString() === req.user.group.toString()).map(item => ({ name: item.name, hasReason: item.hasReason })) : []
        })
      }
    }

    data.attendances = data.attendances.sort((a, b) => new Date(b.weekDay) - new Date(a.weekDay))

    res.status(200).json({
      success: true,
      data
    })
  })

  // @desc      Get student weekly attendance
  // @route     GET /api/v1/attendance/student
  // @access    Private (Student only)
  getStudentWeeklyAttendance = asyncHandler(async (req, res, next) => {
    const d = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
    const date = d.getDay() == 0 ? new Date(d.setDate(d.getDate() - 1)) : d
    const mondayOfWeek = dateService.getMondayOfWeeek(date)
    const data = { week: [] }
    const studentID = req.user._id.toString()
    let { attendance } = await Attendance.findOne().lean()
    attendance = attendance.filter(item => (item.date <= date) && (item.date >= mondayOfWeek))

    const todaysAttendance = attendance.find(item => dateService.areSameDay(item.date, date))
    data.today = {
      weekDay: new Date(date),
      data: todaysAttendance ? todaysAttendance.students.find(student => student.student.toString() === studentID) : null
    }

    const weekDays = dateService.getDatesBetweenDates(mondayOfWeek, date.setDate(date.getDate() - 1))
    for (const day of weekDays) {
      const dayAttendance = attendance.find(item => dateService.areSameDay(item.date, day))
      data.week.push({
        weekDay: day,
        data: dayAttendance ? dayAttendance.students.find(student => student.student.toString() === studentID) : null
      })
    }
    data.week = data.week.sort((a, b) => new Date(b.weekDay) - new Date(a.weekDay))
    data.statistics = service.getStudentAttendanceStatistics(studentID, [...attendance], mondayOfWeek, date)

    res.status(200).json({
      success: true,
      data
    })
  })

  // @desc      Get student attendace from session start date attendance
  // @route     GET /api/v1/attendance/student-session
  // @access    Private (Student only)
  getStudentSessionAttendance = asyncHandler(async (req, res, next) => {
    const date = new Date()
    const { attendance } = await Attendance.findOne().lean()
    const { courses } = await Config.findOne().lean()
    const studentGroup = await Group.findById(req.user.group)

    if (!courses[studentGroup.course].sessionStarted) return res.status(200).json({
      success: true,
      data: {
        average: 100,
        attendances: []
      }
    })

    const studentID = req.user._id.toString()
    const startDate = new Date(courses[studentGroup.course].startedAt)
    const attendanceFromSession = attendance.filter(item => (item.date <= date) && (item.date >= startDate))
    const statitics = service.getStudentAttendanceStatistics(studentID, [...attendanceFromSession], startDate, date)
    const data = {
      average: statitics.averageAttendance,
      attendances: []
    }

    const weekDays = dateService.getDatesBetweenDates(startDate, date)
    for (const day of weekDays) {
      if (day.getDay() !== 0) {
        const dayAttendance = attendanceFromSession.find(item => dateService.areSameDay(item.date, day))
        data.attendances.push({
          weekDay: day,
          data: dayAttendance ? dayAttendance.students.find(student => student.student.toString() === studentID) : null
        })
      }
    }
    data.attendances = data.attendances.sort((a, b) => new Date(b.weekDay) - new Date(a.weekDay))

    res.status(200).json({
      success: true,
      data
    })
  })

  // @desc      Get student attendace
  // @route     GET /api/v1/attendance/student-all/:id
  // @access    Private (Organizer only)
  getStudentAllAttendance = asyncHandler(async (req, res, next) => {
    const result = await validation.validateUserID(req.params.id, next)
    if (!result.success) return next(new ErrorResponse(result.message, 400))

    const { attendance } = await Attendance.findOne().lean()
    const student = result.data
    const data = []

    for (const day of attendance) {
      const dayStudent = day.students.find(item => item.student.toString() === student._id.toString())
      if (dayStudent) data.push({ weekDay: day.date, data: dayStudent })
    }

    res.status(200).json({
      success: true,
      student,
      data
    })
  })

}
