
$(".loading-modal").modal('show')

const createWeeklyLessons = (days) => {
  $(".days-container").html(``)

  for (const day of days) {
    const dayHtml = $(`
      <div class="day pb-5">
        <p class="font-weight-500 mb-3 text-center date">${getWeekday(new Date(day.weekday).getDay()-1)}, ${convertDate(new Date(day.weekday))}</p>
        <div class="border-top border-left shadow lessons-container">
          <div class="tr">
            <div class="th text-center" w=6>#</div>
            <div class="th" w=22>Fan</div>
            <div class="th" w=26>Ustoz</div>
            <div class="th" w=30>Online dars</div>
            <div class="th text-center" w=16>Baho</div>
          </div>
        </div>
      </div>
    `)

    if (day.attendance) {
      dayHtml.find("p.date").append(`<span class="text-danger ml-2">(Siz bu kunda ${day.attendance.hasReason ? `sababli` : `sababsiz`} dars qoldirgansiz)</span>`)
    }

    for (let i = 0; i < day.data.length; i++) {
      const lesson = day.data[i]
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

      dayHtml.find(".lessons-container").append(lessonHtml)
    }

    $(".days-container").append(dayHtml)
  }
  $('[data-toggle="tooltip"]').tooltip()
}

$.ajax({
  type: 'GET',
  url: `${mainUrl}/api/v1/users/week-statistics`,
  headers: { "Authorization": accessToken },

  success(res) {
    console.log(res.data);
    createWeeklyLessons(res.data)
    $(".loading-modal").modal('hide')
    updateElWidth()
  },

  error(err) {
    console.error(err)
  }
})
