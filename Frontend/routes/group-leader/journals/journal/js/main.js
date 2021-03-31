
$(".loading-modal").modal('show')

const studentID = getID()
const createGroupJournals = (studentSubjects) => {
  $(".table .scores-container").html(``)
  $(".table .scores-container").append(createStudentSubjectScores(studentSubjects))

  $('[data-toggle="tooltip"]').tooltip()
  $(".loading-modal").modal('hide')
  updateElWidth()
}

$.ajax({
  type: 'GET',
  url: `${mainUrl}/api/v1/journals/get-student/${studentID}`,
  headers: { "Authorization": accessToken },

  success(res) {
    console.log(res.data)
    $("h1 span").text("#" + res.data.student.name)
    createGroupJournals(res.data.subjects)
  },

  error(err) {
    alert(JSON.stringify(err.responseJSON))
    redirect("../../")
  }
})