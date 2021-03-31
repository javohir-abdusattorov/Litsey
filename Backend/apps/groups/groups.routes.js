
const ErrorResponse = require('../../utils/errorResponse')
const asyncHandler = require('../../middleware/async')

const Group = require("./group.model");
const User = require("../users/user.model");
const Journal = require("../journals/journal.model");

const Validation = require('../../utils/validationService')
const validation = new Validation()

const Service = require("./groups.service")
const service = new Service()


module.exports = class GroupRoutes {

  // @desc      Get all groups
  // @route     GET /api/v1/groups/all
  // @access    Public
  getAllGroups = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults)
  })

  // @desc      Get all groups
  // @route     GET /api/v1/groups/group/:id
  // @access    Public
  getOneGroup = asyncHandler(async (req, res, next) => {
    const result = await validation.validateGroupID(req.params.id, next)
    if (!result.success) return next(new ErrorResponse(result.message, 400))

    res.status(200).json({
      success: true,
      data: result.data
    })
  })

  // @desc      Get all teacher groups
  // @route     GET /api/v1/groups/teacher
  // @access    Private (Teacher only)
  getTeacherGroups = asyncHandler(async (req, res, next) => {
    const groups = await service.getTeachersGroups(req.user)
    res.status(200).json({
      success: true,
      data: groups
    })
  })

  // @desc      Get group subject statistics
  // @route     GET /api/v1/groups/subject-info/:id
  // @access    Private (Teacher only)
  getGroupSubjectStatistics = asyncHandler(async (req, res, next) => {
    const result = await validation.validateGroupID(req.params.id, next)
    if (!result.success) return next(new ErrorResponse(result.message, 400))

    const group = result.data
    const subjectID = req.user.subject.subject.toString()
    const data = await service.getSubjectStatistics(group, subjectID)

    res.status(200).json({
      success: true,
      data: {
        group: { name: group.name, group: group._id },
        ...data
      }
    })
  })

  // @desc      Create group
  // @route     POST /api/v1/groups/create
  // @access    Private (Super-admin, sub-admin only)
  createGroup = asyncHandler(async (req, res, next) => {
    const result = validation.validateBody(req.body, [
      { name: "name", type: "string" },
      { name: "course", type: "number" },
      { name: "lessonsSchedule", type: "array" },
      { name: "leader", type: "object" },
      { name: "faculty", type: "string" },
      { name: "educationLang", type: "string" },
    ])
    if (!result.success) return next(new ErrorResponse(result.message, 400))

    const { name, course, lessonsSchedule, leader, faculty, educationLang } = req.body
    const profile_image = await service.uploadUserImage(req.files, next)
    const schedule = []

    if (lessonsSchedule.length != 6) return next(new ErrorResponse(`Dars jadvali 6 kunlik bo'lishi kerak!`, 400))
    if (!lessonsSchedule.every(obj => obj.length)) return next(new ErrorResponse(`Har bir kun uchun kamida 1tadan dars bo'lishi kerak!`, 400))

    for (const day of lessonsSchedule) {
      const daySubjects = await service.createDaySubjects(day, next)
      if (daySubjects.error) return next(new ErrorResponse(daySubjects.message, 400))
      schedule.push(daySubjects)
    }

    const newGroup = await Group.create({
      name,
      course,
      faculty,
      lessonsSchedule: schedule,
      leader: leader.name,
      students: [],
    })

    const groupLeader = await User.create({
      fullName: leader.fullName,
      name: leader.name,
      password: leader.password,
      group: newGroup._id,
      role: "group-leader",
      profile_image,
    })

    res.status(200).json({
      success: true,
      data: {
        group: newGroup,
        leader: groupLeader,
      }
    })
  })

  // @desc      Edit subject
  // @route     PUT /api/v1/groups/transfer-student
  // @access    Private (Super-admin, sub-admin only)
  transferStudent = asyncHandler(async (req, res, next) => {
    const result = await validation.validateWaterfall(
      validation.validateBody(req.body, [
        { name: "student", type: "string" },
        { name: "toGroup", type: "string" },
      ]),
      await validation.validateUserID(req.body.student),
      await validation.validateGroupID(req.body.toGroup),
    )
    if (!result.success) return next(new ErrorResponse(result.message, 400))

    let student = result.data[0]
    let toGroup = result.data[1]
    let fromGroup = await Group.findById(student.group)

    if (!toGroup.isActive || !fromGroup.isActive) return next(new ErrorResponse(`Bu guruhlardan biri hozirda activ emas, ya'ni bitiruvchilar!`, 400))
    if (fromGroup._id.toString() === toGroup._id.toString()) return next(new ErrorResponse(`Noto'g'ri so'riv yuborildi!`))

    const studentObj = { name: student.name, student: student._id }
    let studentIndex = fromGroup.students.findIndex(obj => obj.student.toString() === student._id.toString())

    if (studentIndex < 0) return next(new ErrorResponse(`Something went wrong in server, please try again!`))

    fromGroup.students.splice(studentIndex, 1)
    toGroup.students.push(studentObj)
    student.group = toGroup._id

    const updatedStundetJournal = await Journal.findOneAndUpdate(
      { "student.student": student._id },
      { "student.group.name": toGroup.name, "student.group.group": toGroup._id },
      { new: true }
    )

    await fromGroup.save()
    await toGroup.save()
    await student.save()

    res.status(200).json({
      success: true,
      data: {
        student,
        fromGroup,
        toGroup,
        journal: updatedStundetJournal
      }
    })
  })

  // @desc      Disable group
  // @route     PUT /api/v1/groups/disable/:id
  // @access    Private (Super-admin only)
  disableGroup = asyncHandler(async (req, res, next) => {
    const result = await validation.validateGroupID(req.params.id, next)
    if (!result.success) return next(new ErrorResponse(result.message, 400))

    let group = result.data
    group.isActive = false

    await group.save()
    await User.findOneAndUpdate({ group: group._id }, { isActive: false }, { new: true })

    for (const student of group.students) {
      await User.findOneAndUpdate({ _id: student.student }, { isActive: false }, { new: true })
      await Journal.findOneAndUpdate({ "student.student": student.student }, { isActive: false }, { new: true })
    }

    res.status(200).json({ success: true })
  })

  // @desc      Activate group
  // @route     PUT /api/v1/groups/activate/:id
  // @access    Private (Super-admin only)
  activateGroup = asyncHandler(async (req, res, next) => {
    const result = await validation.validateGroupID(req.params.id, next)
    if (!result.success) return next(new ErrorResponse(result.message, 400))

    let group = result.data
    group.isActive = true

    await group.save()
    await User.findOneAndUpdate({ group: group._id }, { isActive: false }, { new: true })

    for (const student of group.students) {
      await User.findOneAndUpdate({ _id: student.student }, { isActive: false }, { new: true })
      await Journal.findOneAndUpdate({ "student.student": student.student }, { isActive: false }, { new: true })
    }

    res.status(200).json({ success: true })
  })
}
