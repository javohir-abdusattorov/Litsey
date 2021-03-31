
const ErrorResponse = require('../../utils/errorResponse')
const asyncHandler = require('../../middleware/async')

const Journal = require("./journal.model")
const Group = require("../groups/group.model");
const Config = require("../../config/config.model")

const Service = require("./journals.service")
const service = new Service()

const GroupsService = require('../groups/groups.service')
const groupService = new GroupsService()
const Validation = require('../../utils/validationService')
const validation = new Validation()


module.exports = class JournalGETRoutes {

  // @desc      Get config
  // @route     GET /api/v1/journals/config
  // @access    Public
  getConfig = asyncHandler(async (req, res, next) => {
    const config = await Config.findOne()
    res.status(200).json(config)
  })

  // @desc      Get all journals
  // @route     GET /api/v1/journals/all
  // @access    Public
  getAllJournals = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults)
  })

  // @desc      Super admins groups journals
  // @route     GET /api/v1/journals/get-admin
  // @access    Private (Super-admin, sub-admin only)
  adminGetJournals = asyncHandler(async (req, res, next) => {
    const allGroups = await Group.find()
    let allData = []

    for (const group of allGroups) {
      const groupData = await service.getGroupStudentsJournal(group)
      allData.push({ group: { group: group._id, name: group.name }, groupData: groupData })
    }
    res.status(200).json({
      success: true,
      data: allData
    })
  })

  // @desc      Get leaders group journal
  // @route     GET /api/v1/journals/get-leader
  // @access    Private (Group-leader only)
  leaderGetJournals = asyncHandler(async (req, res, next) => {
    const leaderGroup = await Group.findOne({ _id: req.user.group, isActive: true })
    const groupData = await service.getGroupStudentsJournal(leaderGroup)

    res.status(200).json({
      success: true,
      data: groupData
    })
  })

  // @desc      Get all groups teacher subject journal
  // @route     GET /api/v1/journals/get-teacher
  // @access    Private (Teacher only)
  teacherGetJournals = asyncHandler(async (req, res, next) => {
    const allGroups = await groupService.getTeachersGroups(req.user)
    const allData = []

    for (const group of allGroups) {
      const groupData = await service.getStudensSubjectJournal(group, req.user.subject.subject.toString())
      allData.push({ group: { group: group._id, name: group.name }, groupData: groupData })
    }

    res.status(200).json({
      success: true,
      data: allData
    })
  })

  // @desc      Get one group teacher subject journal
  // @route     GET /api/v1/journals/get-teacher-group/:id
  // @access    Private (Teacher only)
  teacherGetGroupJournal = asyncHandler(async (req, res, next) => {
    const result = await validation.validateGroupID(req.params.id)
    if (!result.success) return next(new ErrorResponse(result.message, 400))

    const group = result.data
    const groupData = await service.getStudensSubjectJournal(group, req.user.subject.subject.toString())

    res.status(200).json({
      success: true,
      data: {
        group: {
          group: group._id,
          name: group.name
        },
        groupData
      }
    })
  })

  // @desc      Get students group journal
  // @route     GET /api/v1/journals/get-student/:id
  // @access    Private (Student only)
  studentGetJournals = asyncHandler(async (req, res, next) => {
    const result = await validation.validateUserID(req.params.id)
    if (!result.success) return next(new ErrorResponse(result.message, 400))

    const student = result.data
    const group = await Group.findOne({ _id: student.group, isActive: true })
    const groupStudent = group.students.find(obj => obj.student.toString() === student._id.toString())
    const lessonsSchedule = groupService.getLessonsSchedule(group, groupStudent.subGroup - 1)
    const data = await service.getStudentJournal(group, lessonsSchedule, groupStudent)

    res.status(200).json({
      success: true,
      data: {
        student: {
          name: student.name,
          student: req.user._id
        },
        subjects: data
      }
    })
  })

  // @desc      Get group journal
  // @route     GET /api/v1/journals/get-group/:id
  // @access    Private
  getGroupJournal = asyncHandler(async (req, res, next) => {
    const leaderGroup = await Group.findOne({ _id: req.params.id, isActive: true })
    const groupData = await service.getGroupStudentsJournal(leaderGroup)

    res.status(200).json({
      success: true,
      data: groupData
    })
  })

  // @desc      Get teacher future lessons for change intermediate date
  // @route     GET /api/v1/journals/get-lessons
  // @access    Private (Teacher only)
  getTeacherLessons = asyncHandler(async (req, res, next) => {
    const teacherGroups = await groupService.getTeachersGroups(req.user, true)
    const date = new Date()
    const subjectID = req.user.subject.subject.toString()
    const data = []

    for (const group of teacherGroups) {
      const groupData = {}
      for (let i = 1; i <= 2; i++) {
        const journal = await Journal.findOne({ "student.group.group": group._id, "student.group.subGroup": i }).lean()
        const subject = journal.subjects.find(obj => obj.subject.toString() === subjectID)
        if (subject) {
          groupData[i] = await service.getSessionLessonsByDate(subject.sessions.last(), date)
        }
      }
      data.push({
        group: {
          name: group.name,
          group: group._id,
        },
        data: groupData
      })
    }

    res.status(200).json({
      success: true,
      data
    })
  })
}
