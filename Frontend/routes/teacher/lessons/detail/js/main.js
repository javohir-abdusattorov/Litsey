
$(".loading-modal").modal('show')

let lesson
let where
let changedScores = []
const lessonID = getID()

const createHomeworks = (students) => {
  const date = new Date()
  let i = 1
  for (const student of students) {
    const hw = lesson.homework.homeworks.filter(item => item.student.student === student._id).last()
    const where = student.score.where
    const dayDate = new Date(student.score.date)
    const wichDeadline = where == "current" ? currentDeadline
                       : where == "intermeditate" ? intermidiateDeadline
                       : lastDeadline
    const deadline = (dayDate.addHours(wichDeadline * 24) - date <= 0) || dayDate > date
    console.log(deadline, dayDate, date)
    let task

    if (!hw) {
      task = `<span class="text-danger">Vazifa topshirilmagan</span>`
    } else {
      if (lesson.homework.homeworkType == "text") {
        task = `<div class="line-height-auto lesson-media" data-homework-id="${hw._id}">${hw.media}</div>`
      } else {
        task = `
          <a target="_blank" href="${hw.media}" class="value lesson-media" data-homework-id="${hw._id}">Media fayl
          <svg class="bi" width="20" height="20" fill="currentColor">
            <use xlink:href="/assets/icons/bootstrap-icons.svg#link-45deg">
          </svg>
          </a>`
      }
    }

    const studentHtml = $(`
      <div class="tr">
        <div class="td text-center center" w=5><b>${i}</b></div>
        <div class="td d-flex align-items-center pl-3 vertical-center" w=19 style="background: #EDFFEF">
          <img src="${student.profile_image}" class="rounded-circle" width=40 height=40>
          <p class="ml-2 mb-0"><b>${student.fullName}</b></p>
        </div>
        <div class="td pl-3 ${hw ? "line-height-auto" : ""} vertical-center task" w=42 style="background: #FFFFDB">
          <p class="mb-0">${task}</p>
        </div>
        <div class="td center px-3" w=27 style="background: #F2FFE1">
          ${
            !hw ? ''
            : hw && hw.check && hw.check.isPassed ? `<p class="text-center text-success font-weight-500 mb-0" data-toggle="tooltip" data-html="<i>Izoh:</i> ${hw.check.message}">Qabul qilingan</p>`
            : hw && hw.check && !hw.check.isPassed ? `<p class="text-center text-danger font-weight-500 mb-0" data-toggle="tooltip" data-html="<i>Izoh:</i> ${hw.check.message}">Qabul qilinmagan</p>`
            : `
            <form id="check-lesson-form" class="py-2" w=100>
              <div class="form-group">
                <textarea class="form-control height-auto" id="message" rows="2" required></textarea>
              </div>
              <p class="text-danger validation-error line-break" style="line-height: 16px"></p>
              <div class="controls d-flex justify-content-between">
                <button class="btn btn-sm btn-outline-success" type="submit" onclick="acceptHomework($(this))" w=45>Qabul qilish</button>
                <button class="btn btn-sm btn-outline-danger" type="submit" onclick="returnHomework($(this))" w=45>Qaytarish</button>
              </div>
            </form>
            `
          }
        </div>
        <div class="td center" w=7 style="background: #FFE7EC">
          ${
            hw ? `
            <input type="number" min=0 max=5 class="pr-0 pl-2 form-control shadow non-focused teacher-score"
            w=75
            ${deadline ? "disabled" : ""} 
            data-student-id="${hw.student.student}"
            data-where="${student.score.where}"
            data-score-id="${student.score.scoreID}"
            value="${student.score.score ? student.score.score : ""}">
            ` : ``
          }
        </div>
      </div>
    `)
    $(".homeworks .table").append(studentHtml)
    i++
  }
}

const createLessonInfo = (lesson) => {
  const hwType = lesson.homework.homeworkType
  if (lesson.teacher.teacher !== _user._id) return redirect("../../")
  if (lesson.media) $(".lesson-media a").attr("href", lesson.media)
  else {
    $(".lesson-media a").addClass("text-danger").html("Media fayl yo'q")
  }

  $("h1 span").text("#" + lesson._id)
  $(".lesson-description span").text(lesson.description)
  $(".lesson-hwdescription span").text(lesson.homework.description)
  $(".lesson-date span").text(convertDate(lesson.createdAt))

  const now = new Date()
  const lessonDate = new Date(lesson.createdAt)
  const deadline = lessonDate.addHours(homeworkDeadline) - now <= 0

  if (deadline) {
    $(".lesson-deadline span").text(`Vaqt tugagan`).addClass("text-danger")
    $(".lesson-status span").text(`Vazifa topshirish vaqti tugagan`).addClass("text-primary")
  } else {
    const diff = round(Math.abs(lessonDate.addHours(homeworkDeadline) - now) / 36e5)
    if (lessonDate > now) {
      $(".lesson-deadline").html(`Vazifa topshirish boshlanadi: <span class="value">${diff}soatda</span>`)
    } else {
      $(".lesson-deadline span").html(`${diff}soatda`)
    }
  }

  $(".lesson-hwtype span").text(getHomeworkType(hwType))
  console.log(lesson)
}

const acceptHomework = (self) => {
  const data = {
    homework: self.parent().parent().parent().parent().find(".task .lesson-media").data("homeworkId"),
    message: self.parent().parent().find("textarea").val(),
    isPassed: true
  }
  sendCheckRequest(data, (res) => {
    console.log(res)
    self.parent().parent().parent().html(`<p class="text-center text-success font-weight-500">Qabul qilingan</p>`)
  })
}

const returnHomework = (self) => {
  const data = {
    homework: self.parent().parent().parent().parent().find(".task .lesson-media").data("homeworkId"),
    message: self.parent().parent().find("textarea").val(),
    isPassed: false
  }
  sendCheckRequest(data, (res) => {
    self.parent().parent().parent().html(`<p class="text-center text-danger font-weight-500">Qabul qilinmagan</p>`)
  })
}

const sendCheckRequest = (data, callback) => {
  $.ajax({
    type: 'POST',
    url: `${mainUrl}/api/v1/lessons/check-homework/${lessonID}`,
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(data),
    headers: { "Authorization": accessToken },

    success(res) { callback(res) },
    error(err) {
      $("form .validation-error").text(err.responseJSON.error)
    }
  })
}

const editScores = () => {
  if (!changedScores.length) return;
  $(".score-validation-error").text(``)
  $(".loading-modal").modal('show')

  $.ajax({
    type: 'PUT',
    url: `${mainUrl}/api/v1/journals/edit-score`,
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify({ scores: changedScores }),
    headers: { "Authorization": accessToken },

    success(res) {
      console.log(res);
      changedScores = []
      $(".loading-modal").modal('hide')
    },

    error(err) {
      console.log(err.responseJSON)
      $(".loading-modal").modal('hide')
      $(".score-validation-error").text(err.responseJSON.error)
    }
  })
}

const updateChangedScores = () => {
  for (const score of $(".teacher-score")) {
    $(score).on("change", (evt) => {
      const self = $(score)
      const val = +self.val()
      if (!val && score.defaultValue) return self.val(score.defaultValue)

      const data = {
        student: self.data("studentId"),
        where: self.data("where"),
        scoreID: self.data("scoreId"),
      }
      const isAviable = changedScores.findIndex(item => (item.student == data.student) && (item.where == data.where) && (item.scoreID == data.scoreID))

      if (isAviable >= 0) changedScores[isAviable].score = val
      else changedScores.push({ ...data, score: val })
    })
  }
};

(async () => {
  let res
  try {
    res = await $.ajax({
      type: 'GET',
      url: `${mainUrl}/api/v1/lessons/lesson/${lessonID}`,
      headers: { "Authorization": accessToken },
    })
  } catch (error) {
    console.error(error)
    alert(error.responseJSON.error)
    redirect("/litsey/teacher/groups")
  }
  console.log(res.data)
  lesson = res.data.lesson

  createLessonInfo(res.data.lesson)
  createHomeworks(res.data.students)
  updateElWidth()
  updateChangedScores()

  // for (const td of $(".td:not(.line-height-auto)")) $(td).css("line-height", `${$(td).height()}px`)
  $("#check-lesson-form").on("submit", (evt) => evt.preventDefault())
  $('[data-toggle="tooltip"]').tooltip()
  $(".loading-modal").modal('hide')

})()

//  <br> <span class="small"><i>Izoh</i>: ${hw.check.message}</span>
 // <br> <span class="small"><i>Izoh</i>: ${hw.check.message}</span>