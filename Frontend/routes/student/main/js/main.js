
$(".loading-modal").modal('show')

const createAverageScores = (averageScores) => {
  $(".subjects").html(``)
  for (const item of averageScores) {
    $(".subjects").append(`
      <div class="tr py-1 border-top" w=100>
        <div class="td border-0" w=30>
          <p class="m-0">${item.subject.name}</p>
        </div>
        <div class="td border-0" w=70>
          <p class="mb-0 text-right">
            <span
              class="mx-2 bg-primary text-light rounded px-3 py-1"
              style="cursor: pointer; font-size: 18px; font-weight: bold;"
              data-toggle="tooltip" title="O'rtacha joriy"
            >${item.current}</span>
            <span class="mx-2 bg-warning text-dark rounded px-3 py-1"
              style="cursor: pointer; font-size: 18px; font-weight: bold;"
              data-toggle="tooltip" title="O'rtacha oraliq"
            >${item.intermediate}</span>
          </p>
        </div>
      </div>
    `)
  }
}

const createTodayLessons = ({ data, attendance }) => {
  if (attendance) {
    $(".title").append(`<span class="text-danger ml-2">(Siz bu kunda ${attendance.hasReason ? `sababli` : `sababsiz`} dars qoldirgansiz)</span>`)
  }

  for (let i = 0; i < data.length; i++) {
    const lesson = data[i]
    let onlineLessonAction

    if (!lesson.lesson) {
      onlineLessonAction = `<a class="value text-secondary">O'tilmagan</a>`
    } else if (new Date(lesson.lesson.createdAt).addHours(homeworkDeadline) - new Date() <= 0) {
      onlineLessonAction = `<a class="value text-danger">Vaqt tugagan</a>`
    } else if (!lesson.lesson.homework) {
      onlineLessonAction = `<a href="/litsey/student/lessons/post-homework/${lesson.lesson._id}" class="value text-success">Vazifa topshirish</a>`
    } else if (!lesson.lesson.homework.check) {
      onlineLessonAction = `<a href="/litsey/student/lessons/homework/${lesson.lesson._id}" class="value text-info">Vazifa topshirilgan</a>`
    } else if (lesson.lesson.homework.check.isPassed) {
      onlineLessonAction = `<a data-toggle="tooltip" data-html="true" title="<i>O'qituvchi izohi</i><br> ${lesson.lesson.homework.check.message}" class="value text-success">Vazifa qabul qilingan</a>`
    } else if (!lesson.lesson.homework.check.isPassed) {
      onlineLessonAction = `<a data-toggle="tooltip" data-html="true" title="<i>O'qituvchi izohi</i><br> ${lesson.lesson.homework.check.message}" href="/litsey/student/lessons/post-homework/${lesson.lesson._id}" class="value text-success">Qayta topshirish</a>`
    }

    const lessonHtml = $(`
      <div class="tr">
        <div class="td text-center" w=6 style="background: ${lesson.type == "custom" ? "#B1EDB1" : lesson.type == "changable" ? "#EDCCD1" : "#9AEDED"}"><b>${i+1}</b></div>
        <div class="td" w=22>${lesson.subject}</div>
        <div class="td" w=26>${lesson.teacher}</div>
        <div class="td" w=30>
          <a href="${lesson.lesson ? `/litsey/student/lessons/lesson/${lesson.lesson._id}` : "#"}" class="text-dark">Online dars</a> -
          ${onlineLessonAction}
        </div>
        <div class="td text-center" w=16>${lesson.score ? lesson.score : "Yo'q"}</div>
      </div>
    `)
    $(".lessons-schedule").append(lessonHtml)
  }

};

(async () => {
  await checkAuthAsync(accessToken)
  let todayLessons
  let studentStatistics

  try {
    todayLessons = await $.ajax({
      type: 'GET',
      url: `${mainUrl}/api/v1/users/student-statistics`,
      headers: { "Authorization": accessToken },
    })
  } catch (error) {
    console.error(error)
  }

  try {
    studentStatistics = await $.ajax({
      type: 'GET',
      url: `${mainUrl}/api/v1/users/student-detail/${_user._id}`,
      headers: { "Authorization": accessToken },
    })
  } catch (error) {
    console.error(error)
  }
  createTodayLessons(todayLessons.data)
  createAverageScores(studentStatistics.data.averageScores)

  const date = new Date(todayLessons.data.weekday)
  if (date.getDay() == 0) date.setDate(date.getDate() - 1)
  $("h1").text(`${getWeekday(date.getDay() - 1)}, ${convertDate(date)}`)

  updateElWidth()
  $('[data-toggle="tooltip"]').tooltip()
  $(".loading-modal").modal('hide')
})()
