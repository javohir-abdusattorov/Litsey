
$(".loading-modal").modal('show')
let attendances = []
const studentID = getID()
const elAttendanceContainer = $(".attendace-container")

const createStatistics = (info) => {
  const data = getAttendanceStatistics(info)

  $("#total-attendance-num").text(`${data.hasReason.num + data.noReason.num}ta`)
  $("#total-attendance-per").text(`${data.averageAttendance}%`)

  $("#hasreason-attendance-num").text(`${data.hasReason.num}ta`)
  $("#hasreason-attendance-per").text(`${data.hasReason.per}%`)
  $("#noreason-attendance-num").text(`${data.noReason.num}ta`)
  $("#noreason-attendance-per").text(`${data.noReason.per}%`)
}

const createAttendances = (data) => {
  elAttendanceContainer.html(``)
  createStatistics(data)

  for (const day of data) {
    elAttendanceContainer.append(`
      <div class="tr border-top border-left bg-white attendance">
        <div w=30 class="th center">
          <p class="m-0 text-center">${convertDate(day.weekDay) }, ${ getWeekday(new Date(day.weekDay).getDay()-1) }</p>
        </div>
        <div w=70>
          <div class="tr" h=100>
            <div class="td text-danger d-flex justify-content-center align-items-center" w=70><p class="font-weight-500 mb-0">Dars qoldirilgan</p></div>
            ${ day.data.hasReason ? 
              `<div class="td value text-success text-center d-flex align-items-center justify-content-center" w=30>Sababli</div>` :
              `<div class="td value text-danger text-center d-flex align-items-center justify-content-center" w=30>Sababsiz</div>`
            }
          </div>
        </div>
      </div>
    `)
  }
}

$(".filter-form").on("submit", (evt) => {
  evt.preventDefault()
  const startDate = new Date($("#start-date").val())
  const endDate = new Date($("#end-date").val())

  if (startDate >= endDate) {
    $('#start-date').val('')
    $('#end-date').val('')
    return alert("Iltimos to'gri ma'lumot kiriting")
  }

  const filtered = attendances.filter(item => (new Date(item.weekDay) >= startDate) && (new Date(item.weekDay) <= endDate))
  createAttendances(filtered)
  updateElWidth()
})

$.ajax({
  type: 'GET',
  url: `${mainUrl}/api/v1/attendance/student-all/${studentID}`,
  headers: { "Authorization": accessToken },

  success(res) {
    console.log(res)
    attendances = res.data.reverse()
    createAttendances(attendances)
    $("h1 span").text(`#${res.student.name}`)

    updateElWidth()
    $(".loading-modal").modal('hide')
  },
  error(err) {
    alert(JSON.stringify(err))
    redirect("../")
  }
})
