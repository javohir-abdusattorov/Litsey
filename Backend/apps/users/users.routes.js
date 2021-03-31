
const ErrorResponse = require('../../utils/errorResponse')
const asyncHandler = require('../../middleware/async')

const User = require("./user.model")
const Group = require("../groups/group.model");
const Lesson = require("../lessons/lesson.model");
const Journal = require("../journals/journal.model");
const Attendance = require("../attendance/attendance.model")

const AttendanceService = require('../attendance/attendance.service')
const attendancService = new AttendanceService()
const JournalService = require('../journals/journals.service')
const journalService = new JournalService()
const GroupsService = require('../groups/groups.service')
const groupService = new GroupsService()
const Validation = require('../../utils/validationService')
const validation = new Validation()
const DateService = require('../../utils/dateService')
const dateService = new DateService()
const FileService = require('../../utils/fileService')
const fileService = new FileService()
const ExelService= require('../../utils/exelService')
const exelService = new ExelService()

const Service = require("./users.service")
const service = new Service()

const gg = async () => {
  let hh = await User.create({
    name: "GG TEST",
    fullName: "GFGF",
    password: "1234567",
    role: "sub-admin"
  })
  console.log(hh)

  await User.deleteOne({ _id: hh._id })
  console.log(`D E L E T E D`);
}


module.exports = class UserRoutes {

  // @desc      Get all users
  // @route     GET /api/v1/users/all
  // @access    Public
  getAllUsers = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults)
  })

  // @desc      Get student detail data
  // @route     GET /api/v1/users/student-detail/:id
  // @access    Private (Group-leader only)
  getStudentDetailData = asyncHandler(async (req, res, next) => {
    const result = await validation.validateUserID(req.params.id, next)
    if (!result.success) return next(new ErrorResponse(result.message, 400))

    const user = result.data.toJSON()
    const group = await Group.findById(user.group).lean()
    user.course = group.students.find(item => item.student.toString() === req.params.id).subGroup
    const userAttendance = await attendancService.getStudentAttendance(user._id, new Date(2019, 0, 1))
    const averageScores = await journalService.getStudentAverageScores(user._id)

    res.status(200).json({
      success: true,
      data: {
        user, averageScores,
        attendance: attendancService.calculateStudentAttendance(userAttendance),
      }
    })
  })

  // @desc      Get today student statistics
  // @route     GET /api/v1/users/student-statistics
  // @access    Private (Student only)
  getStudentStatistics = asyncHandler(async (req, res, next) => {
    const date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
    if (date.getDay() == 0) date.setDate(date.getDate() - 1)

    const studentID = req.user._id.toString()
    const studentGroup = await Group.findById(req.user.group).lean()
    const groupLessons = await Lesson.find({ "group.group": req.user.group, createdAt: { $gte: date } }).lean()
    const studentJournal = await Journal.findOne({ "student.student": req.user._id }).lean()
    const {attendance} = await Attendance.findOne()
    const studentSubGroup = studentGroup.students.find(student => student.student.toString() === studentID).subGroup - 1
    const lessons = studentGroup.lessonsSchedule[date.getDay()-1]
    const data = service.getStudentStatistics(date, studentID, studentSubGroup, attendance, lessons, studentJournal, groupLessons)

    res.status(200).json({
      success: true,
      data
    })
  })

  // @desc      Get weekly student statistics
  // @route     GET /api/v1/users/week-statistics
  // @access    Private (Student only)
  getWeeklyStudentStatistics = asyncHandler(async (req, res, next) => {
    const date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
    if (date.getDay() == 0) date.setDate(date.getDate() - 1)
    const [ mondayOfWeek, endOfWeek ] = dateService.getStartAndEndOfWeek(new Date(date))

    const studentID = req.user._id.toString()
    const studentGroup = await Group.findById(req.user.group).lean()
    const studentJournal = await Journal.findOne({ "student.student": studentID }).lean()
    const {attendance} = await Attendance.findOne()
    const studentSubGroup = studentGroup.students.find(student => student.student.toString() === studentID).subGroup - 1
    const lessons = studentGroup.lessonsSchedule.slice(0, date.getDay() - 1)
    const dates = dateService.getDatesBetweenDates(mondayOfWeek, endOfWeek)

    let data = []
    for (let i = 0; i < dates.length; i++) {
      const tommorrow = new Date(new Date(dates[i]).setDate(dates[i].getDate() + 1))
      const q = { $gte: dates[i], $lt: tommorrow }
      const groupLessons = await Lesson.find({
        "group.group": req.user.group,
        createdAt: q
      }).lean()
      const lessons = studentGroup.lessonsSchedule[i]
      data.push(service.getStudentStatistics(dates[i], studentID, studentSubGroup, attendance, lessons, studentJournal, groupLessons))
    }

    data = data.sort((a, b) => new Date(b.weekday) - new Date(a.weekday))

    res.status(200).json({
      success: true,
      data
    })
  })

  // @desc      Get filtered students export to exel file
  // @route     POST /api/v1/users/exel/:type
  // @access    Public
  exportUsersDataToExel = asyncHandler(async (req, res, next) => {
    const type = req.params.type
    const allServices = ["filtered-students"]
    if (!allServices.indexOf(type) < 0) return next(new ErrorResponse(`Xato so'rov`, 401));

    if (type == "filtered-students") {
      const { students } = req.body
      const data = []
      const headers = [
        { name: "Ismi", key: "name" },
        { name: "Familyasi", key: "surname" },
        { name: "Otasi ismi", key: "patronymic" },
        { name: "Tug'ilgan sanasi", key: "dateOfBirth" },
        { name: "Telefon raqam", key: "phoneNumber" },
        { name: "Guruh", key: "group" },
        { name: "Kurs", key: "course" },
        { name: "Yo'nalish", key: "faculty" },
        { name: "Yo'nalish", key: "educationLang" },
        { name: "Hudud", key: "address.region" },
        { name: "Tuman / shahar", key: "address.district" },
        { name: "Aniq manzil", key: "address.exactAdress" },
        { name: "Hozirda qayerda yashayapti", key: "whereLives" },
        { name: "Guvohnoma/Passport/ID karta seriyasi", key: "identity.series" },
        { name: "Guvohnoma/Passport/ID karta raqami", key: "identity.numbers" },
        { name: "Otasi ismi", key: "father.name" },
        { name: "Otasi familyasi", key: "father.surname" },
        { name: "Otasi ish joyi", key: "father.workplace" },
        { name: "Otasi telefon raqami", key: "father.phoneNumber" },
        { name: "Onasi ismi", key: "mother.name" },
        { name: "Onasi familyasi", key: "mother.surname" },
        { name: "Onasi ish joyi", key: "mother.workplace" },
        { name: "Onasi telefon raqami", key: "mother.phoneNumber" },
      ]

      for (const id of students) {
        const student = await User.findOne({ role: "student", _id: id }).lean()
        const studentGroup = await Group.findById(student.group).lean()
        
        data.push({
          "name": student.fullName, surname: student.student.surname, patronymic: student.student.patronymic,
          "dateOfBirth": dateService.convertDate(student.student.dateOfBirth),
          "phoneNumber": student.student.phoneNumber,
          "group": studentGroup.name,
          "course": `${studentGroup.course}-kurs`,
          "faculty": studentGroup.faculty,
          "educationLang": service.getLang(studentGroup.educationLang),
          "address.region": student.student.address.region,
          "address.district": student.student.address.district,
          "address.exactAdress": student.student.address.exactAdress,
          "whereLives": student.student.whereLives,
          "identity.series": student.student.identity.series,
          "identity.numbers": student.student.identity.numbers,
          "father.name": student.student.parents.father.name,
          "father.surname": student.student.parents.father.surname,
          "father.workplace": student.student.parents.father.workplace,
          "father.phoneNumber": student.student.parents.father.phoneNumber,
          "mother.name": student.student.parents.mother.name,
          "mother.surname": student.student.parents.mother.surname,
          "mother.workplace": student.student.parents.mother.workplace,
          "mother.phoneNumber": student.student.parents.mother.phoneNumber,
        })
      }

      const filePath = await exelService.exportToExel(data, headers, req, "O'quvchilar")
      res.status(200).json({ path: filePath })
    }
  })

  // @desc      Edit user
  // @route     PUT /api/v1/users/edit
  // @access    Private
  editUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).select("+password")
    const result = await service.editUser(user, ["fullName"], req.body, req.files, next)
    if (result.error) return next(new ErrorResponse(result.message, 401))

    res.status(200).json({
      success: true,
      data: result.data
    })
  })

  // @desc      Edit user by admin
  // @route     PUT /api/v1/users/edit/:id
  // @access    Private (Super-admin only)
  editUserByAdmin = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id).select("+password")
    const result = await service.editUser(user, ["fullName"], req.body, req.files, next)
    if (result.error) return next(new ErrorResponse(result.message, 401))

    res.status(200).json({
      success: true,
      data: result.data
    })
  })

  // @desc      Edit student
  // @route     PUT /api/v1/users/edit-student/:id
  // @access    Private (Group-leader only)
  editStudent = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ group: req.user.group, role: "student", _id: req.params.id }).select("+password")
    if (!req.body) return { error: true, message: `Xato so'rov yuborildi` }
    if (!user.isActive) return { error: true, message: `Foydalanuvchi hozirda aktiv emas` }

    const updatingObj = {}
    if ("fullName" in req.body) updatingObj["fullName"] = req.body["fullName"]

    const studentFields = service.setStudentFields(JSON.parse(req.body.student))
    if (studentFields.error) return next(new ErrorResponse(studentFields.message, 400))
    updatingObj.student = { ...studentFields }

    if (req.files && req.files.profile_image) {
      if (user.profile_image != process.env.USER_DEFAULT_PROFILE_IMAGE)
        fileService.deleteFiles([ user.profile_image.split("&id=")[1] ])

      updatingObj.profile_image = await fileService.uploadUserImage(req.files.profile_image, next)
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      updatingObj,
      { new: true, runValidators: true }
    )

    res.status(200).json({
      success: true,
      data: updatedUser
    })
  })

  // @desc      Disable user
  // @route     PUT /api/v1/users/disable/:id
  // @access    Private (Super-admin only)
  disableUser = asyncHandler(async (req, res, next) => {
    const result = await validation.validateUserID(req.params.id, next)
    if (!result.success) return next(new ErrorResponse(result.message, 400))

    let user = result.data
    if (user.role != "teacher" && user.role != "sub-admin") return next(new ErrorResponse(`Faqat ustoz yoki zauchlarni ishdan olish mumkin`, 401))
    if (user.role == "teacher") {
      const teacherGroups = await groupService.getTeachersGroups(user)
      if (teacherGroups.length) return next(new ErrorResponse(`Bu ustoz hozirda guruhlarga dars otmoqda!`, 400))
    }

    user.isActive = false
    await user.save()

    res.status(200).json({
      success: true,
      data: user,
    })
  })

  // @desc      Activate user
  // @route     PUT /api/v1/users/activate/:id
  // @access    Private (Super-admin only)
  activateUser = asyncHandler(async (req, res, next) => {
    const result = await validation.validateUserID(req.params.id, next)
    if (!result.success) return next(new ErrorResponse(result.message, 400))

    let user = result.data
    if (user.role != "teacher" || user.role != "sub-admin") return next(new ErrorResponse(`Faqat ustoz yoki zauchlarni qaytarish mumkin`, 401))
    user.isActive = true
    await user.save()

    res.status(200).json({
      success: true,
      data: user,
    })
  })

}
