
$(".loading-modal").modal('show')

const createGroupJournals = (studentSubjects) => {
  $(".table .scores-container").html(``)
  $(".table .scores-container").append(createStudentSubjectScores(studentSubjects))

  $('[data-toggle="tooltip"]').tooltip()
  $(".loading-modal").modal('hide')
  updateElWidth()
};

(async () => {
  await checkAuthAsync(accessToken)

  $.ajax({
    type: 'GET',
    url: `${mainUrl}/api/v1/journals/get-student/${_user._id}`,
    headers: { "Authorization": accessToken },

    success(res) {
      console.log(res.data)
      createGroupJournals(res.data.subjects)
    },

    error(err) {
      alert(JSON.stringify(err.responseJSON))
      redirect("../../")
    }
  })
})()
