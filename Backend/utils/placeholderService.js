
const crypto = require("crypto")

const lessonNumberInCurrent = +process.env.NUMBER_OF_LESSONS_IN_CURRENT
const lessonNumberInChangableCurrent = +process.env.NUMBER_OF_LESSONS_IN_CHANGABLE_CURRENT

const DateService = require('./dateService')
const dateService = new DateService()


module.exports = class PlaceholderService {

  createSessionPlaceholder = (date, weeknum, subject, sessionIndex, group, subGroup) => {
    const randomStr = crypto.randomBytes(20).toString('hex').slice(0, 20)
    const schedule = dateService.getStudentLessonsSchedule(group, subGroup - 1, subject.subject.toString())

    if (subject.type == "changable") {
      const dates = dateService.getAllLessonDatesInSession(date, "changable", { schedule })

      return {
        sessionID: `${randomStr}${sessionIndex + 1}`,
        lastScore: { scoreID: crypto.randomBytes(20).toString('hex').slice(0, 19), date: dates.lastScore },
        intermediate: { scores: this.createScorePlaceholder(0, 1, dates.intermeditates) },
        current: { currents: this.createCurrentPlaceholder(1, lessonNumberInChangableCurrent, dates.currents) },
        startedAt: date
      }
    } else {
      const allLessonsNum = weeknum * subject.inWeek
      const remainCurrentLessons = (allLessonsNum - 1) % (lessonNumberInCurrent + 1)
      const currentsNum = ((allLessonsNum - 1) - remainCurrentLessons) / (lessonNumberInCurrent + 1)
      const dates = dateService.getAllLessonDatesInSession(date, "custom", {
        allLessonsNum,
        currentsNum,
        remainCurrentLessons,
        schedule
      })
      const currents = this.createCurrentPlaceholder(currentsNum, lessonNumberInCurrent, dates.currents)
      const remainCurrents = this.createCurrentPlaceholder(1, remainCurrentLessons, [dates.remainCurrents])

      return {
        sessionID: `${randomStr}${sessionIndex + 1}`,
        lastScore: { scoreID: crypto.randomBytes(20).toString('hex').slice(0, 19), date: dates.lastScore },
        intermediate: { scores: this.createScorePlaceholder(0, currentsNum, dates.intermeditates) },
        current: { currents: [ ...currents, ...remainCurrents ] },
        startedAt: date
      }
    }
  }

  createCurrentPlaceholder = (numberOfCurrent, numberOfLessons, dates) => {
    if (!numberOfLessons) return []
    let placeholder = []
    for (let i = 0; i < numberOfCurrent; i++) {
      placeholder.push( this.createScorePlaceholder(i, numberOfLessons, dates[i]) )
    }
    return placeholder
  }

  createScorePlaceholder = (parentNum, numberOfLessons, dates) => {
    let placeholder = []
    for (let i = 0; i < numberOfLessons; i++) {
      const randomStr = crypto.randomBytes(20).toString('hex').slice(0, 20)
      placeholder.push({ scoreID: `${parentNum}-${randomStr}${i}`, date: dates[i] })
    }
    return placeholder
  }

}