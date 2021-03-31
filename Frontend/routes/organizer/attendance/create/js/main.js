
$(".loading-modal").modal('show')
allGroups = []
allStudents = []

const elStudentsContainer = $(".students")
const addStudentAttendance = () => {
  const studentHtml = $(`
    <div class="border shadow rounded px-3 pb-3 pt-1 mb-4 student" w=100 style="background: #F3FAFF">
      <button type="button" class="close close-btn" aria-label="Close" onclick="$(this).parent().remove()">
        <span aria-hidden="true">&times;</span>
      </button>
      <div class="d-flex align-items-center justify-content-between">
        <div class="form-group px-3 my-2" w=35>
          <label for="groups">Guruh:</label>
          <select class="form-control" id="groups" onchange="changeStudents($(this))"></select>
        </div>
        <div class="form-group px-3 my-2" w=40>
          <label for="students">O'quvchi:</label>
          <select class="form-control" id="students">
            <option disabled selected>Guruh tanlang</option>
          </select>
        </div>
        <div class="form-group px-3 my-2" w=20>
          <label for="reason">Sababli/sababsiz:</label>
          <select class="form-control" id="reason">
            <option value="true">Sababli</option>
            <option value="false" selected>Sababsiz</option>
          </select>
        </div>
      </div>
    </div>
  `)

  createGroups(studentHtml.find("#groups"))
  elStudentsContainer.append(studentHtml)
  updateElWidth()
}

const changeStudents = (self) => {
  const val = self.val().trim()
  const students = allStudents.filter(item => item.group === val)
  createUsers(self.parent().parent().find("#students"), students)
}

const createGroups = (container) => {
  container.html(`<option disabled selected>Tanlang</option>`)
  for (const group of allGroups) container.append(`<option value="${group._id}">${group.name}</option>`)
}

const createUsers = (container, users) => {
  container.html(`<option disabled selected>Tanlang</option>`)
  for (const user of users) container.append(`<option value="${user._id}">${user.name}</option>`)
}

$("form").on("submit", (evt) => {
  evt.preventDefault()
  $(".validation-error").text(``)
  $(".loading-modal").modal('show')

  const students = getStudentsAttendance(elStudentsContainer)
  if (students.error) {
    $(".validation-error").text(`Iltimos o'quvchilar ma'lumotlarini to'liq kiriting!`)
    return $(".loading-modal").modal('hide')
  }

  $.ajax({
    type: 'POST',
    url: `${mainUrl}/api/v1/attendance/create`,
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify({ students }),
    headers: { "Authorization": accessToken },

    success(res) {
      $(".validation-error").removeClass("text-danger").addClass("text-success").text("Davomat muvaffaqiyatli saqlandi!")
      $(".loading-modal").modal('hide')
      setTimeout(() => redirect("../"), 5000)
    },

    error(err) {
      console.log(err.responseJSON)
      $(".loading-modal").modal('hide')
      $(".validation-error").text(err.responseJSON.error)
    }
  })
});

(async () => {
  allGroups = await getGroup({})
  allStudents = await getUser({ role: "student" })

  $("h1 span").text(`#${ convertDate(new Date()) }`)
  $(".loading-modal").modal('hide')
})()
