
$(".loading-modal").modal('show')

let lesson
let textEditor
const lessonID = getID()
const elHomeworkStatus = $(`.homework-status`)

const createLessonInfo = (lesson) => {
  const hwType = lesson.homework.homeworkType
  if (lesson.group.group !== _user.group) return redirect(`../../lesson/${lessonID}`)

  const deadline = new Date(lesson.createdAt).addHours(homeworkDeadline) - new Date() <= 0
  const hw = lesson.homework.homeworks.filter(item => item.student.student == _user._id).last()

  if (!hw) return redirect(`../../lesson/${lessonID}`)
  $("h1 span").text("#" + lesson._id)

  if (hw.check) {
    if (hw.check.isPassed) elHomeworkStatus.text("Vazifa o'qituvchi tomonidan qabul qilingan!").addClass(`text-success`)
    else elHomeworkStatus.html(`Vazifa qabul qilinmagan! <a href='../../post-homework/${lesson._id}'>Qayta topshirish</a>`).addClass(`text-danger`)
    $(".block").append(`
      <p class="mt-3 ml-2">O'qituvchi xabari: <br> <span class="value pl-2">${hw.check.message}</span></p>`)
  } else {
    elHomeworkStatus.text("Vazifa o'qituvchi tomonidan tekshirilishi kutilmoqda...").addClass(`text-info`)
  }

  $(".lesson-description span").text(hw.description)

  if (hwType == "text") {
    $(".media").append(`
      <div class="rounded my-3 shadow-sm border mx-auto p-3" w=95>${hw.media}</div>
    `)
  } else {
    $(".media").append(`
      <p class="mt-3 ml-2">
        <a href="${hw.media}" target="_blank" class="value">Media fayl
          <svg class="bi" width="20" height="20" fill="currentColor">
            <use xlink:href="/assets/icons/bootstrap-icons.svg#link-45deg"/>
          </svg>
        </a>
      </p>
    `)
  }

  if (hwType == "image") {
    $(".lesson-hwtype span").text("Rasm")
  } else if (hwType == "video") {
    $(".lesson-hwtype span").text("Video")
  } else if (hwType == "pdf") {
    $(".lesson-hwtype span").text("PDF Fayl")
  } else if (hwType == "exel") {
    $(".lesson-hwtype span").text("Excel elektron jadvali")
  } else if (hwType == "word") {
    $(".lesson-hwtype span").text("WORD Hujjat")
  } else if (hwType == "power-point") {
    $(".lesson-hwtype span").text("Power point ko'rgazma")
  } else if (hwType == "archive") {
    $(".lesson-hwtype span").text("Arxiv fayl")
  } else {
    $(".lesson-hwtype span").text("Tekst")
  }
  updateElWidth()
}

(async () => {
  await checkAuthAsync(accessToken);
  [lesson] = await getLesson({ _id: lessonID })
  createLessonInfo(lesson)
  $(".loading-modal").modal('hide')
})()
