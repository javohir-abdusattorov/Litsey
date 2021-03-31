
$(".loading-modal").modal('show')

const createDayAttendance = (students, container, date) => {
  date = new Date(date)
  const attendanceHtml = $(`
    <div class="tr border-top border-left mb-4 bg-white attendance">
      <div w=20 class="th vertical-center">
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
        <div class="td" w=70> ${student.name} </div>
        ${
          student.hasReason ? `<div class="td value text-success text-center" w=30>Sababli</div>` :
          `<div class="td value text-danger text-center" w=30>Sababsiz</div>`
        }
      </div>
    `)
  }
  if (students.length == 0) {
    studentsContainer.append(`
      <div class="tr h-100">
        <div class="th text-success" w=100>Dars qoldirgan o'quvchilar yo'q</div>
      </div>
    `)
  }
  if (students.length == 1) studentsContainer.find("> div.tr").addClass("h-100")
  container.append(attendanceHtml)
}


$.ajax({
  type: 'GET',
  url: `${mainUrl}/api/v1/attendance/group`,
  headers: { "Authorization": accessToken },

  success(res) {
    console.log(res.data)
    const data = res.data.today.data
    createDayAttendance(data, $(".today-attendance"), res.data.today.weekDay)
    const elAttendanceContainer = $(".attendace-container").html(``)

    for (const day of res.data.week) createDayAttendance(day.data, elAttendanceContainer, day.weekDay)

    updateElWidth()
    centerVertical()
    $(".loading-modal").modal('hide')
  },
  error(err) {
    alert(JSON.stringify(err))
    redirect("../")
  }
})
