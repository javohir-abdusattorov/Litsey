
$(".loading-modal").modal('show')
const elScheduleContainer = $(".lessons-schedule").html(``)
const createLessonSchedule = (schedule) => {

  for (let i = 0; i < schedule.length; i++) {
    const day = schedule[i]
    const weekDay = getWeekday(i)
    const scheduleHtml = $(`
      <div class="day col-md-4 mb-4">
        <div class="rounded shadow">
          <div class="card-header bg-warning value">${weekDay}</div>
          <ul class="list-group rounded lessons"></ul>
        </div>
      </div>
    `)

    let lessons = scheduleHtml.find(".lessons")
    lessons = createDayLessons(day, lessons)
    elScheduleContainer.append(scheduleHtml)
  }

  $(".loading-modal").modal('hide')
}

(async () => {
  await checkAuthAsync(accessToken)

  $.ajax({
    type: 'GET',
    url: `${mainUrl}/api/v1/groups/all?_id=${_user.group}`,
    headers: { "Authorization": accessToken },

    success(res) {
      console.log(res.data[0])
      createLessonSchedule(res.data[0].lessonsSchedule)
    },
    error(err) {
      alert(JSON.stringify(err))
      redirect("../")
    }
  })
})()
