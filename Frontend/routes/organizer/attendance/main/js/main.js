
$(".loading-modal").modal('show')

const createDayAttendance = (students, container, date) => {
  date = new Date(date)
  const attendanceHtml = $(`
    <div class="tr border-top border-left mb-4 bg-white shadow attendance">
      <div w=20 class="th center">
        <p class="m-0 text-center">${ getWeekday(date.getDay()-1) } <br> ${convertDate(date)} </p>
      </div>
      <div w=80>
      </div>
    </div>
  `)

  const studentsContainer = attendanceHtml.find(`[w=80]`)
  for (const student of students) {
    studentsContainer.append(`
      <div class="tr">
        <div class="td vertical-center" w=70> <b>${student.group.name}</b>. ${student.name} </div>
        ${
          student.hasReason ? `<div class="td value text-success center" w=30>Sababli</div>` :
          `<div class="td value text-danger center" w=30>Sababsiz</div>`
        }
      </div>
    `)
  }
  if (students.length == 0) {
    studentsContainer.append(`
      <div class="tr h-100">
        <div class="th text-success vertical-center" w=100>Dars qoldirgan o'quvchilar yo'q</div>
      </div>
    `)
  }
  if (students.length == 1) studentsContainer.find("> div.tr").addClass("h-100")
  container.append(attendanceHtml)
}


$.ajax({
  type: 'GET',
  url: `${mainUrl}/api/v1/attendance/get`,
  headers: { "Authorization": accessToken },

  success(res) {
    console.log(res.data)
    if (res.data.today) {
      createDayAttendance(res.data.today.students, $(".today-attendance"), res.data.today.date)
    } else {
      $(".today-attendance").append(`
        <div class="text-center"><a href="create" class="btn btn-outline-success">Davomat qilish ${convertDate(new Date())}</a></div>
      `)
    }

    const elAttendanceContainer = $(".attendace-container").html(``)
    for (const day of res.data.week) createDayAttendance(day.students, elAttendanceContainer, day.date)

    updateElWidth()
    centerVertical()
    $(".loading-modal").modal('hide')
  },
  error(err) {
    alert(JSON.stringify(err))
    redirect("../")
  }
})
