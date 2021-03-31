
$(".loading-modal").modal('show')

const createWeeklyLessons = (days) => {
  $(".days-container").html(``)

  for (const day of days) {
    const dayHtml = $(`
      <div class="day pb-5">
        <p class="font-weight-500 mb-3 text-center date">${getWeekday(new Date(day.weekday).getDay()-1)}, ${convertDate(new Date(day.weekday))}</p>
        <div class="border-top border-left shadow">
          <div class="tr">
            <div class="th text-center" w=6>#</div>
            <div class="th" w=20>Guruh</div>
            <div class="th text-center" w=16>Kichik guruh</div>
            <div class="th" w=44>Topshirilgan vazifalar</div>
            <div class="th text-center" w=14>O'rtacha baho</div>
          </div>
          <div class="lessons-container"></div>
        </div>
      </div>
    `)

    const elLessonsContainer = dayHtml.find(".lessons-container")
    for (let i = 0; i < day.data.length; i++) {
      const lesson = day.data[i]
      const lessonHtml = $(`
        <div class="tr">
          <div class="td center" w=6><a data-toggle="tooltip" title="Dars haqida to'liq ma'lumot" href="lesson/${lesson._id}" class="font-weight-bold">${lesson.group.lessonIndex}</a></div>
          <div class="td center" w=20>${lesson.group.name}</div>
          <div class="td center" w=16>${lesson.group.subGroup ? lesson.group.subGroup : "Hammasi"}</div>
          <div class="td p-0 homeworks" w=44><p class="text-secondary center font-weight-500 mb-0 mt-2">Vazifalar mavjud emas</p></div>
          <div class="td center average-score" w=14>0</div>
        </div>
      `)

      if (lesson.homework.homeworks.length) {
        lessonHtml.find(".homeworks").html(`
          <div class="tr">
            <div class="th border-right-0" w=40>O'quvchi</div>
            <div class="th border-right-0" w=40></div>
            <div class="th" w=20>Baho</div>
          </div>
          <ul class="list-group list-group-flush overflow-y" style="max-height: 123px"></ul>
        `).addClass("border-right-0")
        const container = lessonHtml.find(".homeworks ul")

        const [dups, homeworks] = [{}, [], lesson.homework.homeworks]
        for (const item of lesson.homework.homeworks.reverse()) if (!dups[item.student.student]) {
          homeworks.push(item)
          dups[item.student.student] = true
        }

        let sumOfScore = 0
        for (const hw of homeworks) {
          const homeworkHtml = $(`
            <li class="list-group-item tr p-0 border-bottom-0">
              <div class="td" w=40>
                <a class="text-secondary font-weight-500" href="#">${hw.student.name}</a>
              </div>
              ${
                !hw.check ? '<div class="td text-secondary font-weight-500" w=40>Tekshirilmagan</div>'
                : !hw.check.isPassed ? '<div class="td text-danger font-weight-500" w=40>Qabul qilinmagan</div>'
                : '<div class="td text-success font-weight-500" w=40>Qabul qilingan</div>'
              }
              <div class="td text-center" w=20>${hw.score ? hw.score : "Yo'q"}</div>
            </li>
          `)
          container.append(homeworkHtml)

          if (hw.score) sumOfScore += hw.score
        }
        lessonHtml.find(".average-score").text(round(sumOfScore / homeworks.length, 1))
      }
      elLessonsContainer.append(lessonHtml)
    }

    $(".days-container").append(dayHtml)
  }
}

$.ajax({
  type: 'GET',
  url: `${mainUrl}/api/v1/lessons/weekly`,
  headers: { "Authorization": accessToken },

  success(res) {
    console.log(res.data)
    createWeeklyLessons(res.data)
    updateElWidth()
    $('[data-toggle="tooltip"]').tooltip()
    $(".loading-modal").modal('hide')
  },

  error(err) {
    $(".loading-modal").modal('hide')
    console.error(err)
  }
})
