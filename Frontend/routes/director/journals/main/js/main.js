
$(".loading-modal").modal('show')
const elStudentsContainer = $(".students-container")
const elFilterContainer = $(".filters-container")
let students = []
let groups = []

const filterStudents = (students, options) => {
  let result = [...students]

  if (options.group !== "all") result = [...result.filter(obj => obj.group.group === options.group)]
  if (options.subgroup !== "all") result = [...result.filter(obj => obj.group.subgroup === +options.subgroup)]
  if (options.course !== "all") result = [...result.filter(obj => obj.group.course === +options.course)]

  if (options.search) {
    const q = new RegExp(options.search, "gi")
    result = [...result.filter(obj => obj.fullName.match(q))]
  }
  return result
}

const createGroups = (groups) => {
  elFilterContainer.find("#filter-groups").html(`<option value="all">Hammasi</option>`)

  for (const group of groups) {
    elFilterContainer.find("#filter-groups").append(`
      <option value="${group._id}">${group.name}</option>
    `)
  }
}

const createStudents = async (students) => {
  elStudentsContainer.html(``)

  for (const student of students) {
    let studentGroup
    const isAviable = groups.find(item => item._id === student.group)

    if (!isAviable) {
      [studentGroup] = await getGroup({ _id: student.group })
      groups.push(studentGroup)
    } else studentGroup = isAviable

    student.group = {
      name: studentGroup.name,
      group: studentGroup._id,
      course: studentGroup.course,
      subgroup: studentGroup.students.find(item => item.student === student._id).subGroup
    }

    const studentHtml = $(`
      <li class="list-group-item shadow d-flex justify-content-between align-items-center">
        <p class="mb-0"><a class="text-dark text-decoration-none" href="journal/${student._id}">
          <span class="text-primary font-weight-500 mr-2">${studentGroup.course}-kurs</span>
          <b class="mr-2">${studentGroup.name}</b> ${student.group.subgroup}. ${student.fullName}</a>
        </p>
      </li>
    `)

    elStudentsContainer.append(studentHtml)
  }
}

const createStudentsByReadyData = (students) => {
  elStudentsContainer.html(``)

  for (const student of students) {
    const studentHtml = $(`
      <li class="list-group-item shadow d-flex justify-content-between align-items-center">
        <p class="mb-0"><a class="text-dark text-decoration-none" href="attendance/${student._id}">
          <span class="text-primary font-weight-500 mr-2">${student.group.course}-kurs</span>
          <b class="mr-2">${student.group.name}</b> ${student.group.subgroup}. ${student.fullName}</a>
        </p>
      </li>
    `)
    elStudentsContainer.append(studentHtml)
  }
}


$(".filter-form").on("submit", async (evt) => {
  evt.preventDefault()
  const filterOptions = {
    group: $("#filter-groups").val().trim(),
    course: $("#filter-course").val().trim(),
    subgroup: $("#filter-subgroup").val().trim(),
    search: $("#student-search").val().trim()
  }
  const filteredStudents = filterStudents(students, filterOptions)
  createStudentsByReadyData(filteredStudents)
});

(async () => {
  students = await getUser({ role: "student" })
  students = students.reverse()
  await createStudents(students)
  createGroups(groups)

  updateElWidth()
  $(".loading-modal").modal('hide')
})()

$(".create-session-form").on("submit", (evt) => {
  evt.preventDefault()
  $(".loading-modal").modal('show')

  const data = {
    course: +$("#create-session-course").val(),
    weeknum: +$("#create-session-weeknum").val(),
  }

  $.ajax({
    type: 'POST',
    url: `${mainUrl}/api/v1/journals/create-session`,
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(data),
    headers: { "Authorization": accessToken },

    success(data) {
      $(".validation-error").removeClass("text-danger").addClass("text-success").text("Semestr muvaffaqiyatli boshlandi")
      $(".loading-modal").modal('hide')
      console.log(data)
      setTimeout(() => $("#create-session-modal").modal('hide'), 3000)
    },

    error(err) {
      console.log(err.responseJSON)
      $(".loading-modal").modal('hide')
      $(".validation-error").text(err.responseJSON.error)
    }
  })
})