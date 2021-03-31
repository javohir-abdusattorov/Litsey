
const clock = require('date-events')()
const ErrorResponse = require('../../utils/errorResponse')

const Group = require("./group.model");
const Journal = require("../journals/journal.model");
const Lesson = require("../lessons/lesson.model");
const Config = require("../../config/config.model")

const Validation = require('../../utils/validationService')
const validation = new Validation()
const FileService = require('../../utils/fileService')
const fileService = new FileService()
const DateService = require('../../utils/dateService')
const dateService = new DateService()

const gg = async () => {
}


module.exports = class GroupService {

  getLessonsSchedule = (group, subGroup) => {
    let groupSubjects = []

    for (let day of group.lessonsSchedule) {
      for (let lesson of day) {
        if (lesson.lessonType == "custom") {
          const subject = lesson.custom.subject
          const index = groupSubjects.findIndex(obj => obj.subject.toString() === subject.subject.toString())

          if (index < 0) {
            groupSubjects.push({
              name: subject.name,
              subject: subject.subject,
              inWeek: 1,
            })
          } else {
            groupSubjects[index].inWeek += 1
          }
        } else if (lesson.lessonType == "changable") {
          let [subject1, subject2] = lesson.changable.subjects

          groupSubjects.push({
            name: subject1.name,
            subject: subject1.subject,
            inWeek: 0.5,
            type: "changable"
          })

          groupSubjects.push({
            name: subject2.name,
            subject: subject2.subject,
            inWeek: 0.5,
            type: "changable"
          })
        } else if (lesson.lessonType == "dividable") {
          const subject = lesson.dividable.subjects[subGroup]
          const index = groupSubjects.findIndex(obj => obj.subject.toString() === subject.subject.toString())

          if (index < 0) {
            groupSubjects.push({
              name: subject.name,
              subject: subject.subject,
              inWeek: 1,
            })
          } else {
            groupSubjects[index].inWeek += 1
          }
        }
      }
    }
    return groupSubjects
  }

  getSubjectTeachers = (group, subjectID) => {
    let teachers = []

    for (let day of group.lessonsSchedule) {
      for (let lesson of day) {
        let teacherID = ""
        if (lesson.lessonType == "custom") {
          if (lesson.custom.subject.subject.toString() == subjectID) {
            teacherID = lesson.custom.teacher.teacher.toString()
          }
        } else if (lesson.lessonType == "changable") {
          let lessons = lesson.changable.subjects.filter(obj => obj.subject.toString() === subjectID)
          for (let i = 0; i < lessons.length; i++) {
            teacherID = lesson.teachers[i].teacher.toString()
          }
        } else if (lesson.lessonType == "dividable") {
          let lessons = lesson.dividable.subjects.filter(obj => obj.subject.toString() === subjectID)
          for (let i = 0; i < lessons.length; i++) {
            teacherID = lesson.teachers[i].teacher.toString()
          }
        }
        if (teachers.indexOf(teacherID) < 0) teachers.push(teacherID)
      }
    }

    return teachers
  }

  getTeachersGroups = async (teacher, sessionStarted) => {
    let q = {}
    if (sessionStarted) {
      const config = await Config.findOne().lean()
      const course = []
      for (const [key, value] of Object.entries(config.courses)) value.sessionStarted && course.push(+key)
      q = { course: { $in: course } }
    }
    const allGroups = await Group.find({ isActive: true, ...q }).lean()
    let teacherGroups = []

    for (const group of allGroups) {
      const groupLessonsSchedule = {
        1: this.getLessonsSchedule(group, 0),
        2: this.getLessonsSchedule(group, 1)
      }
      let isTeacherGroup = false
      for (let i = 1; i <= 2; i++) {
        const schedule = groupLessonsSchedule[i]
        let subjectsData = []
        for (let subject of schedule) {
          if (subject.subject.toString() == teacher.subject.subject.toString()) {
            let isAviable = teacherGroups.find(obj => obj._id.toString() === group._id.toString())
            if (!isAviable) {
              group.groupLessonsSchedule = groupLessonsSchedule
              teacherGroups.push(group)
              isTeacherGroup = true
              break;
            }
          }
        }
        if (isTeacherGroup) break;
      }
    }

    return teacherGroups
  }

  getTeachersTodayGroups = async (date, teacher) => {
    const config = await Config.findOne().lean()
    const course = []
    for (const [key, value] of Object.entries(config.courses)) value.sessionStarted && course.push(+key)
    const allGroups = await Group.find({ isActive: true, course: { $in: course } }).lean()
    const weekDay = date.getDay() - 1
    let teacherGroups = []

    for (const group of allGroups) {
      const day = group.lessonsSchedule[weekDay]
      for (const lesson of day) {
        const lessonIndex = day.indexOf(lesson) + 1
        if (lesson.lessonType == "custom") {
          const subjectID = lesson.custom.subject.subject.toString()
          const teacherID = lesson.custom.teacher.teacher.toString()
          if (subjectID === teacher.subject.subject.toString() && teacherID === teacher._id.toString()) {
            const index = teacherGroups.findIndex(obj => obj.group.toString() === group._id.toString())
            if (index > -1) teacherGroups[index].lessons.push({ index: lessonIndex })
            else teacherGroups.push({ name: group.name, group: group._id, lessons: [{ index: lessonIndex }] })
          }
        } else if (lesson.lessonType == "changable") {
          const subjectID = lesson.changable.currentSubject.subject.toString()
          const currentSubjectIndex = lesson.changable.subjects.findIndex(obj => obj.subject.toString() === subjectID)
          const teacherID = lesson.changable.teachers[currentSubjectIndex].teacher.toString()
          if (subjectID === teacher.subject.subject.toString() && teacherID === teacher._id.toString()) {
            teacherGroups.push({ name: group.name, group: group._id, lessons: [{ index: lessonIndex }] })
          }
        } else if (lesson.lessonType == "dividable") {
          for (let i = 1; i <= 2; i++) {
            const subjectID = lesson.dividable.subjects[i - 1].subject.toString()
            const teacherID = lesson.dividable.teachers[i - 1].teacher.toString()
            if (subjectID === teacher.subject.subject.toString() && teacherID === teacher._id.toString()) {
              const index = teacherGroups.findIndex(obj => obj.group.toString() === group._id.toString())
              if (index > -1) teacherGroups[index].lessons.push({ index: lessonIndex, subGroup: i })
              else teacherGroups.push({ name: group.name, group: group._id, lessons: [{ index: lessonIndex, subGroup: i }] })
            }
          }
        }
      }
    }

    return teacherGroups
  }

  getTeachersGroupLessons = async (group, teacher, date) => {
    const teacherID = teacher._id.toString()
    const subjectID = teacher.subject.subject.toString()
    const weekDay = date.getDay() - 1
    const nextDay = dateService.getRangeDate(date, 1)
    const onlineLessons = await Lesson.find({ "group.group": group._id, "teacher.teacher": teacher._id, createdAt: { $gte: date, $lt: nextDay } })

    const lessons = []
    const day = group.lessonsSchedule[weekDay]

    for (const lesson of day) {
      const lessonIndex = day.indexOf(lesson) + 1
      const isLessonAviable = onlineLessons.find(item => item.group.lessonIndex)

      if (lesson.lessonType == "custom") {
        const lessonSubjectID = lesson.custom.subject.subject.toString()
        const lessonTeacherID = lesson.custom.teacher.teacher.toString()

        if (!isLessonAviable && lessonSubjectID === subjectID && lessonTeacherID === teacherID) lessons.push({ index: lessonIndex })
      } else if (lesson.lessonType == "changable") {
        const lessonSubjectID = lesson.changable.currentSubject.subject.toString()
        const currentSubjectIndex = lesson.changable.subjects.findIndex(obj => obj.subject.toString() === lessonSubjectID)
        const lessonTeacherID = lesson.changable.teachers[currentSubjectIndex].teacher.toString()

        if (!isLessonAviable && lessonSubjectID === subjectID && lessonTeacherID === teacherID) lessons.push({ index: lessonIndex })
      } else if (lesson.lessonType == "dividable") {
        for (let i = 1; i <= 2; i++) {
          const lessonSubjectID = lesson.dividable.subjects[i - 1].subject.toString()
          const lessonTeacherID = lesson.dividable.teachers[i - 1].teacher.toString()

          if ((!isLessonAviable || isLessonAviable.group.subGroup !== i) && lessonSubjectID === subjectID && lessonTeacherID === teacherID) lessons.push({ index: lessonIndex, subGroup: i })
        }
      }
    }

    return lessons
  }

  getTeacherGroupLessonsData = async (group, teacher, date, config) => {
    const dates = dateService.getGroupSubjectSessionDates(group, teacher.subject.subject.toString(), config, date)
    const data = []
    for (const date of dates) data.push({ date, lessons: await this.getTeachersGroupLessons(group, teacher, date) })
    return {
      group: { name: group.name, group: group._id },
      data
    }
  }

  getSubjectStatistics = async (group, subjectID) => {
    const students = []

    for (const student of group.students) {
      const journal = await Journal.findOne({ "student.student": student.student }).lean()
      const subject = journal.subjects.find(item => item.subject.toString() === subjectID)

      if (subject && subject.sessions.length) {
        const session = subject.sessions.last()
        const allScores = session.current.averageScore + session.intermediate.averageScore

        students.push({
          student: student,
          subjectScore: (allScores * 100) / 5,
          average: {
            current: session.current.averageScore,
            intermediate: session.intermediate.averageScore
          }
        })
      }
    }

    const subjectScoreAverages = []
    const currentAverages = []
    const intermediateAverages = []

    for (const student of students) {
      subjectScoreAverages.push(student.subjectScore)
      currentAverages.push(student.average.current)
      intermediateAverages.push(student.average.intermediate)
    }

    return {
      subjectScoreAverage: subjectScoreAverages.length ? this.round(subjectScoreAverages.reduce((a, b) => a + b) / students.length, 1) : 0,
      currentAverage: currentAverages.length ? this.round(currentAverages.reduce((a, b) => a + b) / students.length, 1) : 0,
      intermediateAverage: intermediateAverages.length ? this.round(intermediateAverages.reduce((a, b) => a + b) / students.length, 1) : 0,
      students
    }
  }

  createDaySubjects = async (day) => {
    let daySubjects = []

    for (let subject of day) {
      if (subject.type == "custom") {
        const result = await validation.validateWaterfall(
          validation.validateBody(subject, [
            { name: "subject", type: "string" },
            { name: "teacher", type: "string" },
          ]),
          await validation.validateSubjectID(subject.subject),
          await validation.validateUserID(subject.teacher)
        )
        if (!result.success) return { error: true, message: result.message }
        const [subj, teacher] = result.data

        daySubjects.push({
          lessonType: "custom",
          custom: {
            subject: {
              name: subj.name.uz,
              subject: subj._id
            },
            teacher: {
              name: teacher.name,
              teacher: teacher._id
            }
          },
        })
      } else if (subject.type == "changable") {
          const result = await validation.validateWaterfall(
            validation.validateBody(subject, [
              { name: "subjects", type: "array" },
              { name: "teachers", type: "array" },
            ]),
            await validation.validateSubjectID(subject.subjects[0]),
            await validation.validateSubjectID(subject.subjects[1]),
            await validation.validateUserID(subject.teachers[0]),
            await validation.validateUserID(subject.teachers[1])
          )
          if (!result.success) return { error: true, message: result.message }
          const [subj1, subj2, teacher1, teacher2] = result.data

          daySubjects.push({
            lessonType: "changable",
            changable: {
              currentSubject: {
                name: subj1.name.uz,
                subject: subj1._id
              },
              subjects: [{
                name: subj1.name.uz,
                subject: subj1._id
              }, {
                name: subj2.name.uz,
                subject: subj2._id
              }],
              teachers: [{
                name: teacher1.name,
                teacher: teacher1._id
              }, {
                name: teacher2.name,
                teacher: teacher2._id
              }]
            },
          })
      } else if (subject.type == "dividable") {
          const result = await validation.validateWaterfall(
            validation.validateBody(subject, [
              { name: "subjects", type: "array" },
              { name: "teachers", type: "array" },
            ]),
            await validation.validateSubjectID(subject.subjects[0]),
            await validation.validateSubjectID(subject.subjects[1]),
            await validation.validateUserID(subject.teachers[0]),
            await validation.validateUserID(subject.teachers[1])
          )
          if (!result.success) return { error: true, message: result.message }
          const [subj1, subj2, teacher1, teacher2] = result.data

          daySubjects.push({
            lessonType: "dividable",
            dividable: {
              subjects: [{
                name: subj1.name.uz,
                subject: subj1._id
              }, {
                name: subj2.name.uz,
                subject: subj2._id
              }],
              teachers: [{
                name: teacher1.name,
                teacher: teacher1._id
              }, {
                name: teacher2.name,
                teacher: teacher2._id
              }]
            },
          })
      }
    }
    return daySubjects
  }

  round = (value, precision) => {
    const multiplier = Math.pow(10, precision || 0)
    return Math.round(value * multiplier) / multiplier
  }

  getAverage = (array) => this.round(array.reduce((a, b) => a + b) / array.length, 1)

  uploadUserImage = async (files, next) => (files && files.profile_image)
    ? await fileService.uploadUserImage(files.profile_image, next)
    : process.env.USER_DEFAULT_PROFILE_IMAGE
}


clock.on(process.env.SUBJECT_CHANGE_DATE, async (date) => {
  let allGroups = await Group.find({ isActive: true })

  for (let group of allGroups) {
    for (let day of group.lessonsSchedule) {
      let changableLessons = day.filter(obj => obj.lessonType === "changable")
      let dayIndex = group.lessonsSchedule.indexOf(day) + 1

      for (let lesson of changableLessons) {
        let numberOfLessons = dateService.getAllLessonsBetweenDates(new Date(group.updatedAt), null, dayIndex)
        if (numberOfLessons !== 0) {
          let isOdd = numberOfLessons % 2
          lesson.changable.currentSubject = isOdd == 0 ? lesson.changable.subjects[1] : lesson.changable.subjects[0]
        }
      }
    }
    await group.save()
  }
})

Array.prototype.last = function() { return this[this.length - 1] }
