
$(".loading-modal").modal('show')

const createDayAttendance = (student, container, date) => {
  date = new Date(date)
  const attendanceHtml = $(`
    <div class="tr bg-white attendance">
      <div w=30 class="th d-flex align-items-center justify-content-center">
        <p class="m-0 py-1 text-center">${ getWeekday(date.getDay()-1) }, ${convertDate(date)} </p>
      </div>
      <div w=70>
      </div>
    </div>
  `)

  const studentsContainer = attendanceHtml.find("[w=70]")
  if (student) {
    studentsContainer.append(`
      <div class="tr" h=100>
        <div class="td text-danger d-flex justify-content-center align-items-center" w=70><p class="font-weight-500 mb-0">Dars qoldirilgan</p></div>
        ${
          student.hasReason ? `<div class="td value text-success text-center d-flex align-items-center justify-content-center" w=30>Sababli</div>` :
          `<div class="td value text-danger text-center d-flex align-items-center justify-content-center" w=30>Sababsiz</div>`
        }
      </div>
    `)
  } else {
    studentsContainer.append(`

      <div class="tr" h=100>
        <div class="td text-success d-flex justify-content-center align-items-center border-right-0" w=70><p class="font-weight-500 mb-0">Dars qoldirilmagan!</p></div>
        <div class="border-bottom border-right" h-100 w=30></div>
      </div>
    `)
  }

  container.append(attendanceHtml)
}


$.ajax({
  type: 'GET',
  url: `${mainUrl}/api/v1/attendance/student`,
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
