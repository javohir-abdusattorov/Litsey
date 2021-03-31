
const Journal = require("./journal.model")
const Group = require("../groups/group.model")
const Attendance = require("../attendance/attendance.model")

const AttendanceService = require('../attendance/attendance.service')
const attendancService = new AttendanceService()
const GroupsService = require('../groups/groups.service')
const groupService = new GroupsService()
const DateService = require('../../utils/dateService')
const dateService = new DateService()

const currentDeadline = +process.env.CURRENT_DEADLINE
const intermeditateDeadline = +process.env.INTERMEDITATE_DEADLINE
const lastDeadline = +process.env.LAST_DEADLINE
const intermediateChangeDay = +process.env.INTERMEDIATE_CHANGE_DAY


module.exports = class JournalService {

  getStudentCurrentSession = async (date, session, userID) => {
    const data = []
    const attendanceData = {
      hasReason: 0,
      noReason: 0,
    }
    if (!session) return { data, attendanceData }

    const userAttendance = await attendancService.getStudentAttendance(userID, session.startedAt)
    const currents = session.current.currents
    const intermediates = session.intermediate.scores
    const lessons = [
      ...intermediates.map(item => ({ ...item, type: "intermeditate" })),
      { ...session.lastScore, type: "last" }
    ]
    for (const current of currents) for (const day of current) lessons.push({ ...day, type: "current" })

    while (true) {
      if (!lessons.length) break
      const lesson = lessons.reduce((a, b) => a.date < b.date ? a : b)
      if (lesson.date > date) break

      const i = lessons.indexOf(lesson)
      const index = userAttendance.findIndex(item => dateService.areSameDay(item.date, lesson.date))

      if (index >= 0) {
        if (userAttendance[index].hasReason) attendanceData.hasReason += 1
        else attendanceData.noReason += 1
      }

      if (data.length && data.last().type == "current" && lesson.type == "current") {
        data.last().data.push(lesson)
      } else {
        if (lesson.type == "current") {
          data.push({ type: "current", data: [lesson] })
        } else if (lesson.type == "last") {
          data.push({ type: "last", data: lesson })
          data.push({
            type: "session",
            data: session.sessionScore ? session.sessionScore : null
          })
          break
        } else {
          data.push({ type: lesson.type, data: lesson })
        }
      }
      lessons.splice(i, 1)
    }

    return { data, attendanceData }
  }

  getGroupStudentsJournal = async (group) => {
    const groupLessonsSchedule = {
      1: groupService.getLessonsSchedule(group, 0),
      2: groupService.getLessonsSchedule(group, 1)
    }
    return {
      1: await this.getGroupJournals(group, groupLessonsSchedule[1], 1),
      2: await this.getGroupJournals(group, groupLessonsSchedule[2], 2)
    }
  }

  getGroupJournals = async (group, schedule, subGroup) => {
    const date = new Date(2021, 5, 15)
    let journalsData = []
    let journals = subGroup
      ? await Journal.find({ isActive: true, "student.group.group": group._id, "student.group.subGroup": subGroup }).lean()
      : await Journal.find({ isActive: true, "student.group.group": group._id }).lean()

    for (let journal of journals) {
      const studentData = { student: { name: journal.student.name, student: journal.student.student }, subjects: [] }
      for (let subject of schedule) {
        const i = journal.subjects.findIndex(obj => obj.subject.toString() === subject.subject.toString())
        const journalSubject = journal.subjects[i]
        const currentSession = journalSubject.sessions[journalSubject.sessions.length - 1]
        const { data, attendanceData } = await this.getStudentCurrentSession(date, currentSession, journal.student.student)

        studentData.subjects.push({
          subject: subject.name,
          subjectData: data,
          attendace: attendanceData,
          currentAverage: currentSession ? currentSession.current.averageScore : 0,
          intermeditateAverage: currentSession ? currentSession.intermediate.averageScore : 0,
        })
      }
      journalsData.push(studentData)
    }
    return journalsData
  }

  getStudensSubjectJournal = async (group, subjectID) => {
    const groupLessonsSchedule = group.groupLessonsSchedule
    const date = new Date(2021, 5, 15)
    let groupData = { 1: [], 2: [] }
    const students = {
      1: group.students.filter(obj => obj.subGroup === 1),
      2: group.students.filter(obj => obj.subGroup === 2)
    }

    for (let i = 1; i <= 2; i++) {
      for (let student of students[i]) {
        let journal = await Journal.findOne({ "student.student": student.student }).lean()
        const journalSubject = journal.subjects.find(obj => obj.subject.toString() === subjectID)
        if (journalSubject) {
          const currentSession = journalSubject.sessions[journalSubject.sessions.length - 1]
          const { data, attendanceData } = await this.getStudentCurrentSession(date, currentSession, journal.student.student)

          groupData[i].push({
            student: { name: journal.student.name, student: journal.student.student },
            subjectData: data,
            attendace: attendanceData,
            currentAverage: currentSession ? currentSession.current.averageScore : 0,
            intermeditateAverage: currentSession ? currentSession.intermediate.averageScore : 0,
          })
        } else {
          groupData[i].push(null)
        }
      }
    }
    return groupData
  }

  getStudentJournal = async (group, schedule, student) => {
    const journal = await Journal.findOne({ isActive: true, "student.student": student.student }).lean()
    const date = new Date(2021, 5, 25)
    let subjects = []

    for (let subject of schedule) {
      const i = journal.subjects.findIndex(obj => obj.subject.toString() === subject.subject.toString())
      const journalSubject = journal.subjects[i]
      const currentSession = journalSubject.sessions[journalSubject.sessions.length - 1]
      const { data, attendanceData } = await this.getStudentCurrentSession(date, currentSession, journal.student.student)

      subjects.push({
        subject: subject.name,
        subjectData: data,
        attendace: attendanceData,
        currentAverage: currentSession ? currentSession.current.averageScore : 0,
        intermeditateAverage: currentSession ? currentSession.intermediate.averageScore : 0,
      })
    }
    return subjects
  }

  getStudentAverageScores = async (userID) => {
    const journal = await Journal.findOne({ "student.student": userID }).lean()
    const data = []

    for (const subject of journal.subjects) {
      data.push({
        subject: {
          name: subject.name,
          subject: subject.subject,
        },
        current: subject.sessions.length ? subject.sessions.last().current.averageScore : 0,
        intermediate: subject.sessions.length ? subject.sessions.last().intermediate.averageScore : 0
      })
    }

    return data
  }

  getSessionLessonsByDate = async (session, date) => {
    const data = {
      intermediates: [],
      currents: []
    }
    if (!session) return data

    const intermediateDate = date.addDays(intermediateChangeDay)
    const currents = session.current.currents
    const intermediates = session.intermediate.scores

    data.intermediates = intermediates.filter(item => new Date(item.date) >= intermediateDate)
    for (const current of currents) {
      data.currents = [...data.currents, ...current.filter(item => new Date(item.date) >= intermediateDate)]
    }

    return data
  }

  getTeacherLessons = async (group, subjectID, date) => {
    const data = {}
    for (let i = 1; i <= 2; i++) {
      const journal = await Journal.findOne({ "student.group.group": group._id, "student.group.subGroup": i }).lean()
      const subject = journal.subjects.find(obj => obj.subject.toString() === subjectID.toString())
      data[i] = await this.getSessionLessonsByDate(subject.sessions.last(), date)
    }
    return data
  }

  getScoreByDate = (journal, subjectID, date) => {
    const latestSession = journal.subjects.find(item => item.subject.toString() === subjectID).sessions.last()
    if (!latestSession) return null

    for (const current of latestSession.current.currents) for (const day of current) {
      if (dateService.areSameDay(day.date, date)) return day.score
    }

    for (const day of latestSession.intermediate.scores) if (dateService.areSameDay(day.date, date)) return day.score

    if (dateService.areSameDay(latestSession.lastScore.date, date)) return latestSession.lastScore.score

    return null
  }

  getScoreInfoByDate = (journal, subjectID, date) => {
    const latestSession = journal.subjects.find(item => item.subject.toString() === subjectID).sessions.last()
    if (!latestSession) return null

    for (const current of latestSession.current.currents) for (const day of current) {
      if (dateService.areSameDay(day.date, date)) return { ...day, where: "current" }
    }

    for (const day of latestSession.intermediate.scores) if (dateService.areSameDay(day.date, date)) return { ...day, where: "intermeditate" }

    if (dateService.areSameDay(latestSession.lastScore.date, date)) return { ...latestSession.lastScore, where: "last" }

    return null
  }

  getLessonScores = async (lesson, subjectID, journals) => {
    for (const hw of lesson.homework.homeworks) {
      let journal
      const j = journals.find(item => item.student.student.toString() === hw.student.student.toString())
      if (j) journal = i
      else journal = await Journal.findOne({ "student.student": hw.student.student })
      const score = this.getScoreByDate(journal, subjectID, new Date(lesson.createdAt))
      hw.score = score ? score : null
    }
    return lesson
  }

  updateLessonsLocation = (session, currents, intermediates) => {
    const allLessons = [
      ...currents.map(item => ({ type: "current", lesson: item })),
      ...intermediates.map(item => ({ type: "intermeditate", lesson: item })),
    ]
    const realCurrents = []
    const realIntermediates = []
    let isBreak = true
    let currentIndex = 0

    while (true) {
      if (!allLessons.length) break
      const item = allLessons.reduce((a, b) => a.lesson.date < b.lesson.date ? a : b)
      const i = allLessons.indexOf(item)
      const type = item.type
      const lesson = item.lesson

      if (type == "current") {
        lesson.scoreID = `${currentIndex}-${lesson.scoreID.split('-').last()}`

        if (isBreak) {
          realCurrents.push([lesson])
          isBreak = false
        } else {
          realCurrents.last().push(lesson)
        }
      } else {
        realIntermediates.push(lesson)
        isBreak = true
        currentIndex++
      }

      allLessons.splice(i, 1)
    }

    session.intermediate.scores = realIntermediates
    session.current.currents = realCurrents
    return session
  }

  swapLessonsInSession = (session, intermediateIndex, currentIndexes) => {
    let intermediate = session.intermediate.scores[intermediateIndex]
    let current = session.current.currents[currentIndexes[0]][currentIndexes[1]]

    const intermediateDate = new Date(intermediate.date)
    intermediate.date = new Date(current.date)
    current.date = intermediateDate

    session.intermediate.scores.splice(intermediateIndex, 1)
    const newIntermediateIndex = session.intermediate.scores.findIndex(item => new Date(item.date) > intermediate.date)
    session.intermediate.scores.insert(newIntermediateIndex, intermediate)

    const currents = []
    for (const curr of session.current.currents) currents.push(...curr)

    currents.splice( (currentIndexes[0] + 1) * currentIndexes[1], 1)
    const newCurrentIndex = currents.findIndex(item => new Date(item.date) > current.date)
    currents.insert(newCurrentIndex, current)

    session = this.updateLessonsLocation(session, currents, session.intermediate.scores)
    return session
  }

  swapIntermediate = async (group, data, subjectID) => {
    const { subgroup, intermediate, current } = data
    const journals = await Journal.find({ "student.group.group": group._id, "student.group.subGroup": subgroup })
    const mainData = []

    const firstSubject = journals[0].subjects.find(obj => obj.subject.toString() === subjectID)
    const firstSession = firstSubject.sessions.last()
    const intermediateIndex = firstSession.intermediate.scores.findIndex(item => item.scoreID === intermediate)
    const i = +current.split('-')[0]
    const currentIndex = [i, firstSession.current.currents[i].findIndex(item => item.scoreID === current)]

    for (const journal of journals) {
      const subject = journal.subjects.find(obj => obj.subject.toString() === subjectID)
      let session = subject.sessions.last()

      session = this.swapLessonsInSession(session, intermediateIndex, currentIndex)
      mainData.push(session)
      await journal.save()
    }
    return mainData
  }

  editScoreByWhere = (data, session, date) => {
    let { scoreID, where, score } = data
    score = Math.round(score)

    if (where == "current") {
      for (let current of session.current.currents) {
        for (let lesson of current) {
          if (lesson.scoreID == scoreID) {
            if (this.isObjEmpty(lesson.attendance)) {
              const days = dateService.dayNumberBetweenDays(lesson.date, date)
              if (days >= 0 && days <= currentDeadline) {
                lesson.score = score
                session = this.calculateSessionAverage(session)
                return session
              } else return { error: true, message: `Darsga baho qoyish vaqti tugagan! Yoki hali boshlanmagan.` }
            } else return { error: true, message: `Bu kunda o'quvchi darsga qatnashmagan` }
          }
        }
      }
      return { error: true, message: `Noto'g'ri malumot, bunday joriy dars topilmadi!` }
    } else if (where == "intermeditate") {
      for (let lesson of session.intermediate.scores) {
        if (lesson.scoreID == scoreID) {
          const days = dateService.dayNumberBetweenDays(lesson.date, date)
          if (days <= intermeditateDeadline) {
            lesson.score = score
            session = this.calculateSessionAverage(session)
            return session
          } else return { error: true, message: `Darsga baho qoyish vaqti tugagan!` }
        }
      }
      return { error: true, message: `Noto'g'ri malumot, bunday oraliq dars topilmadi!` }
    } else if (where == "last") {
      const days = dateService.dayNumberBetweenDays(session.lastScore, date)
      if (days <= lastDeadline) {
        session.lastScore.score = score
        session = this.calculateSessionAverage(session)
        return session
      } else return { error: true, message: `Darsga baho qoyish vaqti tugagan!` }
    } else if (where == "session") {
      session.sessionScore = score
      return session
    }
  }

  editScoreByDate = (data, session, date) => {
    const lessonDate = new Date(data.date)
    const score = Math.round(data.score)

    for (const current of session.current.currents) for (const day of current) {
      if (dateService.areSameDay(day.date, lessonDate)) {
        if (this.isObjEmpty(day.attendance)) {
          const days = dateService.dayNumberBetweenDays(day.date, date)
          if (days >= 0 && days <= currentDeadline) {
            day.score = score
            session = this.calculateSessionAverage(session)
            return session
          } else return { error: true, message: `Darsga baho qoyish vaqti tugagan! Yoki hali boshlanmagan.` }
        } else return { error: true, message: `Bu kunda o'quvchi darsga qatnashmagan` }
      }
    }

    for (const day of session.intermediate.scores) {
      if (dateService.areSameDay(day.date, lessonDate)) {
        const days = dateService.dayNumberBetweenDays(day.date, date)
        if (days <= intermeditateDeadline) {
          day.score = score
          session = this.calculateSessionAverage(session)
          return session
        } else return { error: true, message: `Darsga baho qoyish vaqti tugagan!` }
      }
    }

    if (dateService.areSameDay(session.lastScore.date, lessonDate)) {
      const days = dateService.dayNumberBetweenDays(session.lastScore, date)
      if (days <= lastDeadline) {
        session.lastScore.score = score
        session = this.calculateSessionAverage(session)
        return session
      } else return { error: true, message: `Darsga baho qoyish vaqti tugagan!` }
    }
  }

  calculateSessionAverage = (session) => {
    let currents = []
    let intermediates = []

    for (const current of session.current.currents) for (const day of current) day.score && currents.push(day.score)
    for (const score of session.intermediate.scores) score.score && intermediates.push(score.score)

    const currentAverage = currents.length ? this.getAverage(currents) : 0
    const intermediateAverage = intermediates.length ? this.getAverage(intermediates) : 0

    session.current.averageScore = currentAverage
    session.intermediate.averageScore = intermediateAverage

    return session
  }

  round = (value, precision) => {
    const multiplier = Math.pow(10, precision || 0)
    return Math.round(value * multiplier) / multiplier
  }

  getAverage = (array) => this.round(array.reduce((a, b) => a + b) / array.length, 1)

  isObjEmpty = (obj) => JSON.stringify(obj) === '{}'
}


Array.prototype.last = function() { return this[this.length - 1] }

Array.prototype.insert = function (index, item) { this.splice(index, 0, item) }

Date.prototype.addDays = function(days) {
  const date = new Date(this.valueOf())
  date.setDate(date.getDate() + days)
  return date
}
