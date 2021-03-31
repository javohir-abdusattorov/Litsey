
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
const DateService = require('../../utils/dateService')
const dateService = new DateService()
const PlaceholderService = require('../../utils/placeholderService')
const placeholderService = new PlaceholderService()
const FileService = require('../../utils/fileService')
const fileService = new FileService()

const whereEnum = ["current", "intermeditate", "last", "session"]


module.exports = class JournalRoutes {

  // @desc      Teacher change date of intermediate
  // @route     POST /api/v1/journals/swap-lessons
  // @access    Private (Teacher only)
  swapLessons = asyncHandler(async (req, res, next) => {
    const result = await validation.validateWaterfall(
      validation.validateBody(req.body, [
        { name: "group", type: "string" },
        { name: "subgroup", type: "number" },
        { name: "intermediate", type: "string" },
        { name: "current", type: "string" },
      ]),
      await validation.validateGroupID(req.body.group),
    )
    if (!result.success) return next(new ErrorResponse(result.message, 400))

    const group = result.data[0]
    const data = await service.swapIntermediate(group, req.body, req.user.subject.subject.toString())

    res.status(200).json({
      success: true,
      data: data
    })
  })

  // @desc      Edit student score
  // @route     PUT /api/v1/journals/edit-score
  // @access    Private (Teacher only)
  editStudentScore = asyncHandler(async (req, res, next) => {
    const result = validation.validateBody(req.body, [
      { name: "scores", type: "array" }
    ])
    if (!result.success) return next(new ErrorResponse(result.message, 400))

    const date = new Date()
    const scores = req.body.scores
    const studentIDs = scores.map((item) => item.student)
    const journals = await Journal.find({ "student.student": { $in: studentIDs } })

    for (const data of scores) {
      const journal = journals.find(item => item.student.student.toString() === data.student)
      const { where, score } = data

      if (whereEnum.indexOf(where) < 0) return next(new ErrorResponse("Invalid data: `where` must be: current, intermeditate, last!", 400))
      if (score < 0 || score > 5) return next(new ErrorResponse("Noto'gri ma'lumot kiritildi. Iltimos baholarni barchasi to'gri ekanligini yana bir marta tekshiring", 400))

      if (journal) {
        const subject = journal.subjects.find(obj => obj.subject.toString() === req.user.subject.subject.toString())
        let session = subject.sessions[subject.sessions.length - 1]
        session = service.editScoreByWhere(data, session, date)
        if (session.error) return next(new ErrorResponse(session.message, 400))
      }
    }

    for (const journal of journals) await journal.save()
    res.status(200).json({ success: true })
  })

  // @desc      Edit student score
  // @route     PUT /api/v1/journals/edit-lesson-score
  // @access    Private (Teacher only)
  editStudentScoreByDate = asyncHandler(async (req, res, next) => {
    const result = validation.validateBody(req.body, [
      { name: "scores", type: "array" } // [{ student, date, score }]
    ])
    if (!result.success) return next(new ErrorResponse(result.message, 400))

    const date = new Date()
    const scores = req.body.scores
    const studentIDs = scores.map((item) => item.student)
    const journals = await Journal.find({ "student.student": { $in: studentIDs } })

    for (const data of scores) {
      const journal = journals.find(item => item.student.student.toString() === data.student)
      const { score } = data

      if (score < 0 || score > 5) return next(new ErrorResponse("Noto'gri ma'lumot kiritildi. Iltimos baholarni barchasi to'gri ekanligini yana bir marta tekshiring", 400))

      if (journal) {
        const subject = journal.subjects.find(obj => obj.subject.toString() === req.user.subject.subject.toString())
        const session = subject.sessions[subject.sessions.length - 1]
        session = service.editScoreByDate(data, session, date)
        if (session.error) return next(new ErrorResponse(session.message, 400))
      }
    }

    for (const journal of journals) await journal.save()
    res.status(200).json({ success: true })
  })

  // @desc      Create new seesion
  // @route     POST /api/v1/journals/create-session
  // @access    Private (Super-admin, sub-admin only)
  createNewSession = asyncHandler(async (req, res, next) => {
    const result = validation.validateBody(req.body, [
      { name: "course", type: "number" },
      { name: "weeknum", type: "number" },
    ])
    if (!result.success) return next(new ErrorResponse(result.message, 400))
    const { course, weeknum } = req.body
    const date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
    const allGroups = await Group.find({ isActive: true, course })
    let data = []

    for (const group of allGroups) {
      let groupJournals = await Journal.find({ isActive: true, "student.group.group": group._id })

      for (let journal of groupJournals) {
        for (let subject of journal.subjects) {
          const subjectType = subject.inWeek < 1 && "changable"
          const scheduleSubject = { type: subjectType, inWeek: subject.inWeek, subject: subject.subject }
          const sessionPlaceholder = placeholderService.createSessionPlaceholder(date, weeknum, scheduleSubject, subject.sessions.length, group, journal.student.group.subGroup)
          subject.sessions.push(sessionPlaceholder)
        }
        data.push(journal)
        await journal.save()
      }
    }

    const endDate = dateService.getRangeDate(date, weeknum * 7)
    const driveFolderID = await fileService.createSessionFolder(date, new Date(endDate), course)
    const config = await Config.findOne()

    config.courses[course] = {
      sessionStarted: true,
      driveID: driveFolderID,
      startedAt: date,
      weeks: weeknum,
      endDate: endDate
    }
    await config.save()

    res.status(200).json({ success: true, data })
  })

  // @desc      Create student journal after creating student
  // @route     Inherit from api/v1/auth/register-student
  // @access    Private (Auth app only)
  createStudentJournal = asyncHandler(async (req, res, next) => {
    const { student, group } = req.body
    const groupStudent = group.students.find(obj => obj.student.toString() === student._id.toString())
    const date = new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate())
    let groupSubjects = groupService.getLessonsSchedule(group, groupStudent.subGroup - 1)
    for (let subject of groupSubjects) subject.sessions = []

    const newJournal = await Journal.create({
      student: {
        name: student.name,
        student: student._id,
        group: {
          name: group.name,
          subGroup: groupStudent.subGroup,
          group: group._id
        }
      },
      subjects: groupSubjects
    })

    res.status(200).json({
      success: true,
      data: {
        student,
        group,
        journal: newJournal,
      }
    })
  })

}
