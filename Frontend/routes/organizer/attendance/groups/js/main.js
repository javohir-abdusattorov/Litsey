
$(".loading-modal").modal('show')

const createGroupInfo = (groups) => {
  $(".table .groups").html(``)

  for (const group of groups) {
    const groupHtml = $(`
      <div class="tr">
        <div class="td" w=40>${group.course}. ${group.name}</div>
        <div class="td text-center" w=20>${group.averageAttendance}%</div>
        <div class="td text-center" w=20><span class="font-weight-bold text-success">${group.hasReason.num}</span>ta - ${group.hasReason.per}%</div>
        <div class="td text-center" w=20><span class="font-weight-bold text-danger">${group.noReason.num}</span>ta - ${group.noReason.per}%</div>
      </div>
    `)
    $(".table .groups").append(groupHtml)
  }

  $('[data-toggle="tooltip"]').tooltip()
  $(".loading-modal").modal('hide')
  updateElWidth()
}

$.ajax({
  type: 'GET',
  url: `${mainUrl}/api/v1/attendance/group-statistics`,
  headers: { "Authorization": accessToken },

  success(res) {
    console.log(res.data)
    const data = res.data.sort((a, b) => b.averageAttendance - a.averageAttendance)
    createGroupInfo(data)
  },

  error(err) {
    alert(JSON.stringify(err.responseJSON))
    redirect("../../")
  }
})
