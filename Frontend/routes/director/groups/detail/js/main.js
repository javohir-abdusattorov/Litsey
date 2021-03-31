
$(".loading-modal").modal('show')

const groupID = getID()
const elContainer = $(".group")

const createGroupData = async (group) => {
  elContainer.find("p.name span").text(group.name)
  elContainer.find("p.course span").text(`${group.course}-kurs`)
  elContainer.find("p.faculty span").text(`${group.faculty}`)
  elContainer.find("p.education-lang span").text(`${getLang(group.educationLang)}`)
  if (!group.isActive) elContainer.find("p.is-active span").text("Aktiv emas").removeClass("text-success").addClass("text-danger")
  elContainer.find("p.created-at span").text(convertDate(group.createdAt))

  // Creating group leader
  const [groupLeader] = await getUser({ role: "group-leader", group: group._id })
  elContainer.find(".group-leader img").attr("src", groupLeader.profile_image)
  elContainer.find(".group-leader h6").text(groupLeader.fullName)

  // Creating students
  const elStudentsContainer = elContainer.find(".students").html(``)
  for (const student of group.students) {
    const [studentData] = await getUser({ role: "student", _id: student.student })
    const studentHtml = $(`
      <div class="d-flex align-items-center px-3 py-2 mb-2 bg-light rounded shadow user-account">
        <img src="${studentData.profile_image}" class="border rounded-circle" width="50" height="50">
        <h6 class="mb-0 ml-3">${student.subGroup}. ${studentData.fullName}</h6>
      </div>
    `)
    elStudentsContainer.append(studentHtml)
  }

  // Creating lessons schedule
  const elScheduleContainer = elContainer.find(".lessons-schedule").html(``)
  for (let i = 0; i < group.lessonsSchedule.length; i++) {
    const day = group.lessonsSchedule[i]
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

$.ajax({
  type: 'GET',
  url: `${mainUrl}/api/v1/groups/group/${groupID}`,

  async success(res) {
    await createGroupData(res.data)
    $("h1 span").text(`#${groupID}`)
  },

  error(err) {
    redirect("../../")
  }
})