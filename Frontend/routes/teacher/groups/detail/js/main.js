
$(".loading-modal").modal('show')

const groupID = getID()
const elContainer = $(".group")

const createGroupData = (group) => {
  elContainer.find(".average-score span").text(`${group.subjectScoreAverage}%`)
  elContainer.find(".average-current span").text(`${group.currentAverage}`)
  elContainer.find(".average-intermediate span").text(`${group.intermediateAverage}`)

  // Creating lessons schedule
  const elScheduleContainer = elContainer.find(".students").html(``)
  for (const student of group.students) {
    const studentHtml = $(`
      <div class="tr py-1 border-top">
        <div class="td border-0">
          <p class="m-0"><span class="font-weight-500">${student.student.subGroup}</span>. ${student.student.name}</p>
        </div>
        <div class="td border-0 ml-auto">
          <div class="mb-0 text-right d-flex">
            <span class="mx-2 bg-success text-light text-center d-block rounded px-3 py-1"
              style="cursor: pointer; font-size: 16px; font-weight: bold"
              data-toggle="tooltip" title="O'rtacha o'zlashtirish">${student.subjectScore}%
            </span>
            <span class="mx-2 bg-primary text-light text-center d-block rounded px-3 py-1"
              style="cursor: pointer; font-size: 16px; font-weight: bold"
              data-toggle="tooltip" title="O'rtacha joriy">${student.average.current}
            </span>
            <span class="mx-2 bg-warning text-center d-block rounded px-3 py-1"
              style="cursor: pointer; font-size: 16px; font-weight: bold"
              data-toggle="tooltip" title="O'rtacha oraliq">${student.average.intermediate}
            </span>
          </div>
        </div>
      </div>
    `)

    elScheduleContainer.append(studentHtml)
  }
  $('[data-toggle="tooltip"]').tooltip()
}

$.ajax({
  type: 'GET',
  url: `${mainUrl}/api/v1/groups/subject-info/${groupID}`,
  headers: { "Authorization": accessToken },

  success(res) {
    console.log(res)
    res.data.students = res.data.students.sort((a, b) => b.subjectScore - a.subjectScore)
    createGroupData(res.data)
    $("h1 span").text(`#${res.data.group.name}`)
    $(".loading-modal").modal('hide')
  },

  error(err) {
    redirect("../../")
  }
})
