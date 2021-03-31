
$(".loading-modal").modal('show')
let changedScores = []
const groupID = getID()

const createGroupJournals = (studentSubjects) => {
  for (let i = 1; i <= 2; i++) {
    const tableHtml = $(`
      <div class="table bg-white mb-5">
        <div class="tr">
          <div class="th" w=20>${i}. O'quvchi</div>
          <div class="th" w=80>Baholar</div>
        </div>
        <div class="scores-container"></div>
      </div>
    `)
    tableHtml.find(".scores-container").append(createSubjectScores(studentSubjects[i]))
    $("main").append(tableHtml)
  }

  for (const score of $(".score")) {
    $(score).on("change", (evt) => {
      const self = $(score)
      const val = +self.val()
      if (!val && score.defaultValue) return self.val(score.defaultValue)
      const data = {
        student: self.parent().parent().data("studentId"),
        where: self.data("scoreType"),
        scoreID: self.data("scoreId"),
      }
      const isAviable = changedScores.findIndex(item => (item.student == data.student) && (item.where == data.where) && (item.scoreID == data.scoreID))

      if (isAviable >= 0) {
        changedScores[isAviable].score = val
      } else {
        changedScores.push({
          student: self.parent().parent().data("studentId"),
          where: self.data("scoreType"),
          scoreID: self.data("scoreId"),
          score: val
        })
      }
    })
  }

  $("[type='number']").keypress((evt) => evt.preventDefault())
  $('[data-toggle="tooltip"]').tooltip()
  $(".loading-modal").modal('hide')
  updateElWidth()
}

const editScores = () => {
  if (!changedScores.length) return;
  $(".validation-error").text(``)
  $(".loading-modal").modal('show')

	$.ajax({
	  type: 'PUT',
	  url: `${mainUrl}/api/v1/journals/edit-score`,
	  dataType: 'json',
    contentType: 'application/json',
	  data: JSON.stringify({ scores: changedScores }),
    headers: { "Authorization": accessToken },

	  success(res) {
      console.log(res);
      changedScores = []
			$(".loading-modal").modal('hide')
	  },

	  error(err) {
	  	console.log(err.responseJSON)
			$(".loading-modal").modal('hide')
	  	$(".validation-error").text(err.responseJSON.error)
	  }
	})
}

$.ajax({
  type: 'GET',
  url: `${mainUrl}/api/v1/journals/get-teacher-group/${groupID}`,
  headers: { "Authorization": accessToken },

  success(res) {
    console.log(res.data)
    $("h1 span").text(`#${res.data.group.name}`)
    createGroupJournals(res.data.groupData)
  },

  error(err) {
    alert(JSON.stringify(err.responseJSON))
    redirect("../../")
  }
})
