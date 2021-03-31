
$(".loading-modal").modal('show')

let lesson
let textEditor
const lessonID = getID()

const createLessonInfo = (lesson) => {
  const hwType = lesson.homework.homeworkType
  if (lesson.group.group !== _user.group) return redirect("../../")
  if (lesson.media) $(".lesson-media a").attr("href", lesson.media)
  else $(".lesson-media").remove()

  $("h1 span").text("#" + lesson._id)
  $(".lesson-description span").text(lesson.description)
  $(".lesson-hwdescription span").text(lesson.homework.description)
  $(".lesson-date span").text(convertDate(lesson.createdAt))

  const now = new Date()
  const lessonDate = new Date(lesson.createdAt)
  const deadline = lessonDate.addHours(homeworkDeadline) - now <= 0
  const hw = lesson.homework.homeworks.filter(item => item.student.student == _user._id).last()

  if (deadline) $(".lesson-deadline span").text(`Vaqt tugagan`).addClass("text-danger")
  else {
    const diff = round(Math.abs(lessonDate.addHours(homeworkDeadline) - now) / 36e5)
    if (lessonDate > now) {
      $(".lesson-deadline").html(`Vazifa topshirish boshlanadi: <span class="value">${diff}soatda</span>`)
    } else {
      $(".lesson-deadline span").html(`${diff}soatda`)
    }
  }

  if (deadline) {
    $(".lesson-status span").text(`Vazifa topshirish vaqti tugagan`).addClass("text-primary")
  } else if (lessonDate > now) {
    $(".lesson-status span").text(`Vazifa topshirish boshlanmagan`).addClass("text-primary")
  } else if (!hw) {
    $(".lesson-status span").append(`<a href='../../post-homework/${lesson._id}'>Vazifa topshirish</a>`)
  } else if (!hw.check) {
    $(".lesson-status span").text(`Vazifa ustoz tomonidan tekshirilishi kutilmoqda...`)
  } else if (hw.check.isPassed) {
    $(".lesson-status span").html(`<span class="text-success" data-toggle="tooltip" title="${hw.check.message}">Vazifa qabul qilingan</span>`)
  } else if (!hw.check.isPassed) {
    $(".lesson-status span").append(`<a href='../../post-homework/${lesson._id}' data-toggle="tooltip" title="${hw.check.message}">Vazifani qayta topshirish</a>`)
  }

  $(".lesson-hwtype span").text(getHomeworkType(hwType))
  $('[data-toggle="tooltip"]').tooltip()
  console.log(lesson)
}

(async () => {
  await checkAuthAsync(accessToken);
  [lesson] = await getLesson({ _id: lessonID })
  createLessonInfo(lesson)
  $(".loading-modal").modal('hide')
})()
