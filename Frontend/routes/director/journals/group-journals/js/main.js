
$(".loading-modal").modal('show')

const groupID = getID()
const createGroupJournals = (journalData) => {
  $("main").html(``)

  for (let i = 1; i <= 2; i++) {
    const tableHtml = $(`
      <div class="table mb-5 bg-white w-100">
        <div class="tr">
          <div class="th text-center" w=5>${i}</div>
          <div class="th" w=95>O'quvchining ismi</div>
        </div>
        <div class="students"></div>
      </div>
    `)

    const studentsContainer = tableHtml.find(".students")
    for (const student of journalData[i]) {
      const studentHtml = $(`
        <div class="tr student">
          <div class="td" w=5>
            <div class="d-flex h-100 align-items-center justify-content-center">
              <svg class="bi" width="20" height="20" fill="currentColor" onclick="toggleSubjects($(this))" style="cursor: pointer">
                <use xlink:href="/assets/icons/bootstrap-icons.svg#plus-square">
              </svg>
            </div>
          </div>
          <div class="td" w=95>${student.student.name}</div>
          <div class="subjects tr" w=100 style="display: none">
            <div class="th" w=5></div>
            <div w=95>
              <div class="tr">
                <div class="th" w=20>Fan</div>
                <div class="th" w=80>Baholar</div>
              </div>
            </div>
          </div>
        </div>
      `)
      studentHtml.find(".subjects > div[w=95]").append(createStudentSubjectScores(student.subjects))
      studentsContainer.append(studentHtml)
    }

    $("main").append(tableHtml)
  }

  updateElWidth()
  $('[data-toggle="tooltip"]').tooltip()
  $(".loading-modal").modal('hide')
}

const toggleSubjects = (self) => {
  const elSubjects = self.parent().parent().parent().find(".subjects")
  const icon = self.find("use").attr("xlink:href").toString().split("#")[0]
  if (elSubjects.is(':visible')) {
    elSubjects.hide(500)
    self.find("use").attr("xlink:href", `${icon}#plus-square`)
  }
  else {
    elSubjects.show(500)
    self.find("use").attr("xlink:href", `${icon}#dash-square`)
  }
}

$.ajax({
  type: 'GET',
  url: `${mainUrl}/api/v1/groups/group/${groupID}`,

  async success(res) {
    $("h1 span").text(`#${res.data.name}`)
  },

  error(err) {
    alert(err.responseJSON)
    redirect("../../")
  }
})

$.ajax({
  type: 'GET',
  url: `${mainUrl}/api/v1/journals/get-group/${groupID}`,
  headers: { "Authorization": accessToken },

  async success(res) {
    console.log(res.data)
    createGroupJournals(res.data)
  },
  error(err) {
    alert(err.responseJSON)
    redirect("../../")
  }
})