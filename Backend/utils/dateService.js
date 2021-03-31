
const lessonNumberInCurrent = +process.env.NUMBER_OF_LESSONS_IN_CURRENT
const lessonNumberInChangableCurrent = +process.env.NUMBER_OF_LESSONS_IN_CHANGABLE_CURRENT


module.exports = class DateService {

  dayNumberBetweenDays = (d1, d2) => (new Date(d2) - new Date(d1)) / (1000 * 60 * 60 * 24)

  areSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()

	weeksBetween = (d1, d2) => Math.round((d2 - d1) / (7 * 24 * 60 * 60 * 1000))

  convertDate = (d) => {
    const date = new Date(d)
    let month = date.getMonth() + 1
    if (month < 10) month = `0${month}`

    return `${date.getDate()}.${month}.${date.getFullYear()}`
  }

  getStartAndEndOfWeek = (date) => {
    const d = new Date(date)
    const endD = new Date(date)

    const day = d.getDay()
    const diff = d.getDate() - day + (day == 0 ? -6 : 1)
    const start = d.setDate(diff)

    const lastday = endD.getDate() - (day - 1) + 5
    const end = new Date(endD.setDate(lastday))

    return [start, end]
  }

  getMondayOfWeeek = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day == 0 ? -6 : 1)

    return d.setDate(diff)
  }

  getSaturdayOfWeeek = (date) => {
    const lastday = date.getDate() - (date.getDay() - 1) + 5
    return new Date(date.setDate(lastday))
  }

  getDatesBetweenDates = (d1, d2) => {
    const arr = []
    for(let dt = new Date(d1); dt <= d2; dt.setDate(dt.getDate() + 1)) arr.push(new Date(dt))
    return arr
  }

  getRangeDate = (date, days) => {
    let newDate = new Date(date)
    newDate.setDate(newDate.getDate() + days)
    return newDate
  }

  getLessonsBetweenDates = (d1, d2, schedule) => {
    if (!d2) d2 = new Date()
    d1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate())
    let allLessons = 0
    const dates = this.getDatesBetweenDates(d1, d2)

    if (Array.isArray(schedule)) {
      for (let date of dates) {
        let lessonsInDay = schedule.filter(dayOfWeek => dayOfWeek === date.getDay())
        allLessons += lessonsInDay.length
      }
    } else {
      let { day, index } = schedule
      let bool = (index == 0) ? true : false
      for (let date of dates) {
        if (day == date.getDay()) {
          bool && (allLessons += 1)
          bool = !bool
        }
      }
    }
    return allLessons
  }

  getAllLessonsBetweenDates = (d1, d2, day) => { // Bu yerda xato bor
    if (!d2) d2 = new Date()
    let allLessons = 0
    let dates = this.getDatesBetweenDates(d1, d2)

    for (const date of dates) if (day == date.getDay()) allLessons += 1
    return allLessons
  }

  getScheduleDates = (d, allLessonsNum, schedule) => {
    let date = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    let scheduleDates = []

    while (scheduleDates.length < allLessonsNum) {
      const isAviable = schedule.filter(item => item === date.getDay())
      for (const item of isAviable) scheduleDates.push(new Date(date))
      date.setDate(date.getDate() + 1)
    }
    return scheduleDates
  }

  getChangableScheduleDates = (d, allLessonsNum, schedule) => {
    let date = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    let scheduleDates = []
    let isCurrent = schedule.index == 0 ? true : false

    while (scheduleDates.length < allLessonsNum) {
      if (schedule.day == date.getDay()) {
        if (isCurrent) scheduleDates.push(new Date(date))
        isCurrent = !isCurrent
      }
      date.setDate(date.getDate() + 1)
    }
    return scheduleDates
  }

  getAllLessonDatesInSession = (date, type, data) => {
    if (type == "changable") {
      const { schedule } = data
      const allLessonsNum = lessonNumberInChangableCurrent + 2
      const lessons = this.getChangableScheduleDates(date, allLessonsNum, schedule)
      return this.getLessonDatesBySchedule(lessons, {
        currentsNum: 1,
        lessonNum: lessonNumberInChangableCurrent,
        remainCurrentLessons: 0
      })
    } else {
      const { allLessonsNum, currentsNum, remainCurrentLessons, schedule } = data
      const lessons = this.getScheduleDates(date, allLessonsNum, schedule)
      return this.getLessonDatesBySchedule(lessons, {
        currentsNum,
        lessonNum: lessonNumberInCurrent,
        remainCurrentLessons
      })
    }
  }

  getLessonDatesBySchedule = (lessons, obj) => {
    const { currentsNum, lessonNum, remainCurrentLessons } = obj
    let inCurrent = true
    let inRemain = false
    let inIntermeditate = false
    let inLast = false
    let data = {
      currents: [[]],
      remainCurrents: [],
      intermeditates: [],
      lastScore: undefined
    }

    while (true) {
      const date = lessons[0]
      if (inCurrent) {
        if ((data.currents.length >= currentsNum) && data.currents.last().length >= lessonNum && data.intermeditates.length >= currentsNum) {
          inCurrent = false
          inRemain = true
        } else if (data.currents.last().length >= lessonNum) {
          inCurrent = false
          inIntermeditate = true
        } else {
          data.currents.last().push(date)
          lessons.splice(0, 1)
        }
      } else if (inIntermeditate) {
        data.intermeditates.push(date)
        lessons.splice(0, 1)
        inIntermeditate = false
        inCurrent = true
        if (data.currents.length < currentsNum) data.currents.push([])
      } else if (inRemain) {
        if (data.remainCurrents.length >= remainCurrentLessons) {
          data.lastScore = date
          break
        } else {
          data.remainCurrents.push(date)
          lessons.splice(0, 1)
        }
      } else if (inLast) {
        data.lastScore = date
        break
      }
    }
    return data
  }

  getStudentLessonsSchedule = (group, stundetSubIndex, subjectID) => {
    const schedule = []

    for (const day of group.lessonsSchedule) {
      const dayIndex = group.lessonsSchedule.indexOf(day) + 1

      for (const lesson of day) {
        if (lesson.lessonType == "changable") {
          const index = lesson.changable.subjects.findIndex(obj => obj.subject.toString() === subjectID)
          if (index > -1) return { day: dayIndex, index }
        } else if (lesson.lessonType == "dividable") {
          const isCurrentLesson = lesson.dividable.subjects[stundetSubIndex].subject.toString() == subjectID
          isCurrentLesson && schedule.push(dayIndex)
        } else if (lesson.lessonType == "custom") {
          const isCurrentLesson = lesson.custom.subject.subject.toString() == subjectID
          isCurrentLesson && schedule.push(dayIndex)
        }
      }
    }
    return schedule
  }

  getGroupSubjectSessionDates = (group, subjectID, config, date) => {
    const dates = []
    const courseConfig = config.courses[group.course]
    const sessionEndDate = new Date(courseConfig.endDate)
    let schedule = []
    let isChangable = false

    for (const day of group.lessonsSchedule) {
      const dayIndex = group.lessonsSchedule.indexOf(day) + 1

      for (const lesson of day) {
        if (lesson.lessonType == "changable") {
          const index = lesson.changable.subjects.findIndex(obj => obj.subject.toString() === subjectID)
          if (index >= 0) {
            schedule = { day: dayIndex, index }
            isChangable = true
            break
          }
        } else if (lesson.lessonType == "dividable") {
          const index = lesson.dividable.subjects.findIndex(obj => obj.subject.toString() === subjectID)
          index >= 0 && schedule.push(dayIndex)
        } else if (lesson.lessonType == "custom") {
          const isCurrentLesson = lesson.custom.subject.subject.toString() == subjectID
          isCurrentLesson && schedule.push(dayIndex)
        }
      }
    }
    if (isChangable) {
      let isCurrent = schedule.index == 0 ? true : false
      for(let dt = new Date(date); dt <= sessionEndDate; dt.setDate(dt.getDate() + 1)) {
        const d = new Date(dt)
        if (schedule.day == d.getDay()) {
          if (isCurrent) dates.push(d)
          isCurrent = !isCurrent
        }
      }
    } else {
      for(let dt = new Date(date); dt <= sessionEndDate; dt.setDate(dt.getDate() + 1)) {
        const d = new Date(dt)
        if (schedule.find(i => i === d.getDay())) dates.push(d)
      }
    }

    return dates
  }
}

Array.prototype.last = function() { return this[this.length - 1] }
