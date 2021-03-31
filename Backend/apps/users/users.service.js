
const bcrypt = require('bcryptjs')

const User = require("./user.model")

const JournalService = require('../journals/journals.service')
const journalService = new JournalService()
const Validation = require('../../utils/validationService')
const validation = new Validation()
const FileService = require('../../utils/fileService')
const fileService = new FileService()
const DateService = require('../../utils/dateService')
const dateService = new DateService()

const regions = JSON.parse(process.env.REGIONS)
const whereLives = ["Ijarada", "Yotoqxona", "Oʻz uyida"]


module.exports = class UsersService {

	getStudentStatistics = (date, studentID, subGroup, attendance, lessons, journal, onlineLessons) => {
    const data = { data: [], weekday: date }
		const todayAttendance = attendance.find(item => dateService.areSameDay(date, item.date))
		if (todayAttendance && todayAttendance.students.find(item => item.student.toString() === studentID)) {
			data.attendance = { hasReason: todayAttendance.students.find(item => item.student.toString() === studentID).hasReason }
		}

    for (const lesson of lessons) {
      const lessonIndex = lessons.indexOf(lesson) + 1
      if (lesson.lessonType == "custom") {
        const score = journalService.getScoreByDate(journal, lesson.custom.subject.subject.toString(), date)
        const onlineLesson = onlineLessons.find(item => (item.group.lessonIndex === lessonIndex) && dateService.areSameDay(item.createdAt, date))

        if (onlineLesson) {
          const studentHw = onlineLesson.homework.homeworks.filter(item => item.student.student.toString() === studentID).last()
          if (studentHw) onlineLesson.homework = studentHw
          else onlineLesson.homework = null
        }

        data.data.push({
          type: "custom",
          subject: lesson.custom.subject.name,
          teacher: lesson.custom.teacher.name,
          score: score ? score : null,
          lesson: onlineLesson
        })
      } else if (lesson.lessonType == "changable") {
        const score = journalService.getScoreByDate(journal, lesson.changable.currentSubject.subject.toString(), date)
        const onlineLesson = onlineLessons.find(item => (item.group.lessonIndex === lessonIndex) && dateService.areSameDay(item.createdAt, date))
        const teacherName = lesson.changable.teachers[lesson.changable.subjects.findIndex(item => item.subject.toString() === lesson.changable.currentSubject.subject.toString())].name

        if (onlineLesson) {
          const studentHw = onlineLesson.homework.homeworks.filter(item => item.student.student.toString() === studentID).last()
          if (studentHw) onlineLesson.homework = studentHw
          else onlineLesson.homework = null
        }

        data.data.push({
          type: "changable",
          subject: lesson.changable.currentSubject.name,
          teacher: teacherName,
          score: score ? score : null,
          lesson: onlineLesson
        })
      } else if (lesson.lessonType == "dividable") {
        const score = journalService.getScoreByDate(journal, lesson.dividable.subjects[subGroup].subject.toString(), date)
        const onlineLesson = onlineLessons.find(item => (item.group.lessonIndex === lessonIndex) && (item.group.subGroup === subGroup + 1) && dateService.areSameDay(item.createdAt, date))

        if (onlineLesson) {
          const studentHw = onlineLesson.homework.homeworks.filter(item => item.student.student.toString() === studentID).last()
          if (studentHw) onlineLesson.homework = studentHw
          else onlineLesson.homework = null
        }

        data.data.push({
          type: "dividable",
          subject: lesson.dividable.subjects[subGroup].name,
          teacher: lesson.dividable.teachers[subGroup].name,
          score: score ? score : null,
          lesson: onlineLesson
        })
      }
    }

		return data
	}

  getLang = (l) => l == "uz" ? "O'zbek" : l == "ru" ? "Rus" : "Ingliz"
  
  setStudentFields = (body) => {
    const result = validation.validateBody(body, [
      { name: "surname", type: "string" },
      { name: "patronymic", type: "string" },
      { name: "phoneNumber", type: "string" },
      { name: "dateOfBirth", type: "string" },
      { name: "whereLives", type: "string" },
      { name: "foreignLanguages", type: "array" },

      { name: "address.region", type: "string" },
      { name: "address.district", type: "string" },
      { name: "address.exactAdress", type: "string" },

      { name: "identity.series", type: "string" },
      { name: "identity.numbers", type: "string" },

      { name: "parents.father.surname", type: "string" },
      { name: "parents.father.name", type: "string" },
      { name: "parents.father.workplace", type: "string" },
      { name: "parents.father.phoneNumber", type: "string" },
      { name: "parents.mother.surname", type: "string" },
      { name: "parents.mother.name", type: "string" },
      { name: "parents.mother.workplace", type: "string" },
      { name: "parents.mother.phoneNumber", type: "string" },
    ])
    if (!result.success) return { error: true, message: result.message }

    const { surname, patronymic, phoneNumber, dateOfBirth, foreignLanguages } = body 
    const studentData = {}

    if (!validation.validatePhoneNumber(phoneNumber)) return { error: true, message: `Xato telefon raqam kiritldi!` }
    if (!validation.validatePhoneNumber(body["parents.father.phoneNumber"])) return { error: true, message: `Xato ota telefon raqam kiritldi!` }
    if (!validation.validatePhoneNumber(body["parents.mother.phoneNumber"])) return { error: true, message: `Xato ona telefon raqam kiritldi!` }

    if (regions.indexOf(body["address.region"]) < 0) return { error: true, message: `Xato hudud kiritldi!` }

    if (!validation.validateDate(new Date(dateOfBirth))) return { error: true, message: `Xato tug'ilgan sana kiritldi!` }

    if (whereLives.indexOf(body.whereLives) < 0) return { error: true, message: `Xato hozirda yashayotgan manzil kiritldi!` }

    if (!foreignLanguages.length) return { error: true, message: `Eng kamida 1ta chet tili bilish majburiy!` }

    if (body.whereLives == "Ijarada") {
      if (!body["currentAddress.region"] || !body["currentAddress.district"] || !body["currentAddress.exactAdress"]) {
        return { error: true, message: `Ijarada yashaydigan talaba uchun ijara manzilini to'liq kiriting` }
      }
      if (regions.indexOf(body["currentAddress.region"]) < 0) return { error: true, message: `Xato ijara hudud kiritldi!` }

      studentData.currentAddress = {
        region: body["currentAddress.region"],
        district: body["currentAddress.district"],
        exactAdress: body["currentAddress.exactAdress"]
      }
    }

    return {
      surname, patronymic, phoneNumber, foreignLanguages,
      whereLives: body.whereLives,
      address: {
        region: body["address.region"],
        district: body["address.district"],
        exactAdress: body["address.exactAdress"],
      },
      identity: {
        series: body["identity.series"],
        numbers: body["identity.numbers"],
      },
      dateOfBirth: new Date(dateOfBirth),
      parents: {
        father: {
          surname: body["parents.father.surname"],
          name: body["parents.father.name"],
          workplace: body["parents.father.workplace"],
          phoneNumber: body["parents.father.phoneNumber"],
        },
        mother: {
          surname: body["parents.mother.surname"],
          name: body["parents.mother.name"],
          workplace: body["parents.mother.workplace"],
          phoneNumber: body["parents.mother.phoneNumber"],
        },
      },
      ...studentData
    }
  }

	editUser = async (user, fields, body, files, next) => {
    if (!body) return { error: true, message: `Xato so'rov yuborildi` }
    if (!user.isActive) return { error: true, message: `Foydalanuvchi hozirda aktiv emas` }

    const updatingObj = {}
    for (const field of fields) if (field in body) updatingObj[field] = body[field]

    if (files && files.profile_image) {
      if (user.profile_image != process.env.USER_DEFAULT_PROFILE_IMAGE)
        fileService.deleteFiles([ user.profile_image.split("&id=")[1] ])

      updatingObj.profile_image = await fileService.uploadUserImage(files.profile_image, next)
    }

    if (body.oldPassword && body.newPassword && body.newPassword !== body.oldPassword) {
      const isMatch = await user.matchPassword(body.oldPassword)
      if (!isMatch) return { error: true, message: `Noto'g'ri parol` }

      const salt = await bcrypt.genSalt(10)
      updatingObj.password = await bcrypt.hash(body.newPassword, salt)
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      updatingObj,
      { new: true, runValidators: true }
    )

    return { error: false, data: updatedUser }
	}
}


Array.prototype.last = function() { return this[this.length - 1] }