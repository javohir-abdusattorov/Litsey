
const Attendance = require("./attendance.model");
const Journal = require("../journals/journal.model")
const Group = require("../groups/group.model")

const DateService = require('../../utils/dateService')
const dateService = new DateService()


module.exports = class AttendanceService {

  getStudentAttendance = async (userID, fromDate) => {
    const date = new Date(fromDate)
    const attendance = await Attendance.findOne()
    const days = attendance.attendance.filter(item => new Date(item.date) > date)
    const result = []

    for (const day of days) {
      const index = day.students.findIndex(item => item.student.toString() === userID.toString())
      index >= 0 && result.push({ date: day.date, hasReason: day.students[index].hasReason })
    }

    return result
  }

  getGroupAttendanceStatistics = (group, attendances, startDate, endDate) => {
    attendances = attendances.filter(item => new Date(item.date) >= startDate)

    let hasReasons = 0
    let noReasons = 0
    let total = 0
    const dayPer = 100 / dateService.dayNumberBetweenDays(startDate, endDate)
    const allStudent = []

    for (const student of group.students) {
      let allAttendances = 100

      for (const day of attendances) {
        const isAttented = day.students.find(item => item.student.toString() === student.student.toString())
        if (isAttented) {
          isAttented.hasReason ? hasReasons++ : noReasons++
          total++
          allAttendances -= dayPer
        }
      }

      allStudent.push(allAttendances)
    }

    return {
      averageAttendance: this.round(allStudent.reduce((a, b) => a + b) / allStudent.length, 1),
      hasReason: {
        num: hasReasons,
        per: total ? this.round((hasReasons * 100) / total, 1) : 0
      },
      noReason: {
        num: noReasons,
        per: total ? this.round((noReasons * 100) / total, 1) : 0
      }
    }
  }

  getStudentAttendanceStatistics = (studentID, attendances, startDate, endDate) => {
    attendances = attendances.filter(item => new Date(item.date) >= startDate)

    const dayPer = 100 / dateService.dayNumberBetweenDays(startDate, endDate)
    let hasReasons = 0
    let noReasons = 0
    let allAttendances = 100

    for (const day of attendances) {
      const isAttented = day.students.find(item => item.student.toString() === studentID)
      if (isAttented) {
        isAttented.hasReason ? hasReasons++ : noReasons++
        allAttendances -= dayPer
      }
    }

    const total = hasReasons + noReasons
    return {
      averageAttendance: this.round(allAttendances, 1),
      hasReason: {
        num: hasReasons,
        per: total ? this.round((hasReasons * 100) / total, 1) : 0
      },
      noReason: {
        num: noReasons,
        per: total ? this.round((noReasons * 100) / total, 1) : 0
      }
    }
  }

  calculateStudentAttendance = (data) => {
    return {
      hasReason: data.filter(item => item.hasReason).length,
      noReason: data.filter(item => !item.hasReason).length,
    }
  }

  editSubjectAttedance = (session, date, hasReason) => {
    let currents = session.current.currents
    let intermediates = session.intermediate.scores

    for (let current of currents) {
      for (let lesson of current) {
        if (dateService.areSameDay(lesson.date, date)) {
          lesson.attendance = { attendance: true, hasReason }
          return session
        }
      }
    }

    for (let lesson of intermediates) {
      if (dateService.areSameDay(lesson.date, date)) {
        lesson.attendance = { attendance: true, hasReason }
        return session
      }
    }

    if (dateService.areSameDay(session.lastScore.date, date)) {
      session.lastScore.attendance = { attendance: true, hasReason }
      return session
    }
  }

  editStudentAttendance = async (student, group, hasReason) => {
    let journal = await Journal.findOne({ "student.student": student.student })
    let todaySubject = []
    const date = new Date()
    const day = group.lessonsSchedule[date.getDay() - 1]

    for (const lesson of day) {
      if (lesson.lessonType == "custom") todaySubject.push(lesson.custom.subject.subject)
      else if (lesson.lessonType == "changable") todaySubject.push(lesson.changable.currentSubject.subject)
      else if (lesson.lessonType == "dividable") todaySubject.push(lesson.dividable.subjects[student.subGroup-1].subject)
    }

    for (const subjectID of todaySubject) {
      const i = journal.subjects.findIndex(obj => obj.subject.toString() === subjectID.toString())
      const journalSubject = journal.subjects[i]

      if (journalSubject.sessions.length) {
        const currentSession = journalSubject.sessions[journalSubject.sessions.length - 1]
        const session = this.editSubjectAttedance(currentSession, date, hasReason)
      }
    }
    await journal.save()
  }

  round = (value, precision) => {
    const multiplier = Math.pow(10, precision || 0)
    return Math.round(value * multiplier) / multiplier
  }

}
