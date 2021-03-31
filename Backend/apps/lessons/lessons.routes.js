
const ErrorResponse = require('../../utils/errorResponse')
const asyncHandler = require('../../middleware/async')

const Lesson = require("./lesson.model");
const User = require("../users/user.model");
const Group = require("../groups/group.model")
const Journal = require("../journals/journal.model");
const Config = require("../../config/config.model")

const GroupsService = require('../groups/groups.service')
const groupService = new GroupsService()
const JournalService = require('../journals/journals.service')
const journalService = new JournalService()
const Validation = require('../../utils/validationService')
const validation = new Validation()
const FileService = require('../../utils/fileService')
const fileService = new FileService()
const DateService = require('../../utils/dateService')
const dateService = new DateService()

const Service = require("./lessons.service")
const service = new Service()

const homeworkTypes = JSON.parse(process.env.HOMEWORK_TYPES)
const homeworkDeadline = +process.env.HOMEWORK_DEADLINE


module.exports = class LessonsRoutes {

  // @desc      Get all lessons
  // @route     GET /api/v1/lessons/all
  // @access    Public
  getAllLessons = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults)
  })

  // @desc      Get one lesson detail data
  // @route     GET /api/v1/lessons/lesson/:id
  // @access    Private (Teacher only)
  getLessonDetail = asyncHandler(async (req, res, next) => {
    const result = await validation.validateLessonID(req.params.id)
    if (!result.success) return next(new ErrorResponse(result.message, 400))

    const lesson = result.data
    if (lesson.teacher.teacher.toString() !== req.user._id.toString()) return next(new ErrorResponse(`Bu dars sizga tegishli emas`, 400))
    const group = await Group.findById(lesson.group.group).lean()
    const students = []

    for (const student of group.students) {
      const user = await User.findById(student.student).lean()
      const journal = await Journal.findOne({ "student.student": user._id }).lean()
      user.score = journalService.getScoreInfoByDate(journal, req.user.subject.subject.toString(), new Date(lesson.createdAt))
      students.push(user)
    }

    res.status(200).json({
      success: true,
      data: {
        students,
        lesson
      }
    })
  })

  // @desc      Get data for create lesson
  // @route     GET /api/v1/lessons/create-data
  // @access    Private (Teacher only)
  getDataForCreate = asyncHandler(async (req, res, next) => {
    const date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
    const teacherGroups = await groupService.getTeachersGroups(req.user, true)
    const config = await Config.findOne().lean()
    const data = { groups: [], homeworkTypes }

    for (const group of teacherGroups) {
      const groupData = await groupService.getTeacherGroupLessonsData(group, req.user, date, config)
      data.groups.push(groupData)
    }

    res.status(200).json({ success: true, data })
  })

  // @desc      Get teachers weekly lessons
  // @route     GET /api/v1/lessons/weekly
  // @access    Private (Teacher only)
  getWeeklyLessons = asyncHandler(async (req, res, next) => {
    const date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
    if (date.getDay() == 0) date.setDate(date.getDate() - 1)

    const [ mondayOfWeek, endOfWeek ] = dateService.getStartAndEndOfWeek(new Date(date))
    const dates = dateService.getDatesBetweenDates(mondayOfWeek, endOfWeek)
    const journals = []
    let data = []

    for (let i = 0; i < dates.length; i++) {
      const tommorrow = new Date(new Date(dates[i]).setDate(dates[i].getDate() + 1))
      const q = { $gte: dates[i], $lt: tommorrow }
      const lessons = await Lesson.find({ "teacher.teacher": req.user._id, createdAt: q }).lean()
      for (let lesson of lessons) lesson = await journalService.getLessonScores(lesson, req.user.subject.subject.toString(), journals)

      data.push({
        weekday: dates[i],
        data: lessons
      })
    }

    data = data.sort((a, b) => new Date(b.weekday) - new Date(a.weekday))
    res.status(200).json({ success: true, data })
  })

  // @desc      Create lesson
  // @route     POST /api/v1/lessons/create
  // @access    Private (Teacher only)
  createLesson = asyncHandler(async (req, res, next) => {
    const result = await validation.validateWaterfall(
      validation.validateBody(req.body, [
        { name: "group", type: "object" },
        { name: "date", type: "string" },
        { name: "description", type: "string" },
        { name: "homeworkDescription", type: "string" },
        { name: "homeworkType", type: "string" },
      ]),
      await validation.validateGroupID(req.body.group.group),
    )
    if (!result.success) return next(new ErrorResponse(result.message, 400))

    const { group, description, homeworkDescription, homeworkType } = req.body
    const d = new Date(req.body.date)
    const date = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const lessonGroup = result.data[0]
    const media = (req.files && req.files.media) && await fileService.uploadLessonMedia(req.files.media, lessonGroup.course, next)

    const newLesson = await Lesson.create({
      teacher: {
        name: req.user.name,
        teacher: req.user._id
      },
      group: {
        name: lessonGroup.name,
        subGroup: group.subGroup,
        lessonIndex: group.lessonIndex,
        group: lessonGroup._id
      },
      media,
      description,
      homework: {
        description: homeworkDescription,
        homeworkType
      },
      createdAt: date
    })

    res.status(200).json({
      success: true,
      data: newLesson
    })
  })

  // @desc      Post homework to lesson
  // @route     POST /api/v1/lessons/post-homework/:id
  // @access    Private (Student only)
  postHomework = asyncHandler(async (req, res, next) => {
    const result = await validation.validateLessonID(req.params.id)
    if (!result.success) return next(new ErrorResponse(result.message, 400))

    const date = new Date()
    const studentID = req.user._id.toString()
    const lesson = result.data
    const homeworkType = lesson.homework.homeworkType
    const group = await Group.findById(req.user.group)
    const student = group.students.find(item => item.student.toString() === studentID)

    if (group._id.toString() !== lesson.group.group.toString()) return next(new ErrorResponse(`Siz dars o'tilgan guruh tarkibida yo'qsiz`, 400))
    if (lesson.group.subGroup && student.subGroup !== lesson.group.subGroup) return next(new ErrorResponse(`Siz dars o'tilgan subgroup tarkibida yo'qsiz`, 400))

    if (lesson.createdAt > date) return next(new ErrorResponse(`Uy ishi topshirish vaqti hali boshlanmagan`, 400))
    if ((Math.abs(date - lesson.createdAt) / 36e5) > homeworkDeadline) return next(new ErrorResponse(`Uy ishi topshirish vaqti tugagan`, 400))

    const [isAllowed, repost, message] = service.isHomeworkRepost(lesson, studentID)
    if (!isAllowed) return next(new ErrorResponse(message, 400))

    let media
    if (homeworkType == "text") {
      if (!req.body || !req.body.media) return next(new ErrorResponse(`Iltimos textni yuboring!`, 400))
      media = req.body.media
    } else {
      if (!req.files || !req.files.media) return next(new ErrorResponse(`Iltimos faylni yuboring!`, 400))
      const isValidFile = service.checkFileType(req.files.media, homeworkType)
      if (!isValidFile) return next(new ErrorResponse(`Iltimos faylni belgilangan formatda yuboring!`, 400))
      if (repost) {
        const lastHW = lesson.homework.homeworks.find(item => item.student.student.toString() === studentID)
        lastHW && await fileService.deleteFiles([ lastHW.media.split("&id=")[1] ])
      }
      media = await fileService.uploadLessonMedia(req.files.media, group.course, next)
    }

    lesson.homework.homeworks.push({
      student: { name: req.user.name, student: studentID },
      description: req.body.description,
      media,
      repost
    })
    await lesson.save()

    res.status(200).json({
      success: true,
      data: { lesson }
    })
  })

  // @desc      Teacher check student homework
  // @route     POST /api/v1/lessons/check-homework/:id
  // @access    Private (Teacher only)
  checkStudentHomework = asyncHandler(async (req, res, next) => {
    const result = await validation.validateWaterfall(
      validation.validateBody(req.body, [
        { name: "homework", type: "string" },
        { name: "isPassed", type: "boolean" },
        { name: "message", type: "string" },
      ]),
      await validation.validateLessonID(req.params.id),
    )
    if (!result.success) return next(new ErrorResponse(result.message, 400))

    const { isPassed, homework, message } = req.body
    const lesson = result.data[0]
    const index = lesson.homework.homeworks.findIndex(item => item._id.toString() === homework)

    if (index < 0) return next(new ErrorResponse(`Bunday uy ishi topilmadi!`, 400))
    lesson.homework.homeworks[index].check = { isPassed, message }
    await lesson.save()

    res.status(200).json({
      success: true,
      data: { lesson }
    })
  })
}
