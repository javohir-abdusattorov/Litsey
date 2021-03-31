
const subjectID = getID()
$(".loading-modal").modal('show')

$("form").on("submit", (evt) => {
	evt.preventDefault()
	$(".validation-error").text(``)
	$(".loading-modal").modal('show')
	const data = {
		uz: $("#name-uz").val().trim(),
		ru: $("#name-ru").val().trim(),
	}

	$.ajax({
	  type: 'PUT',
	  url: `${mainUrl}/api/v1/subjects/edit/${subjectID}`,
	  dataType: 'json',
    contentType: 'application/json',
	  data: JSON.stringify(data),
    headers: { "Authorization": accessToken },

	  success(data) {
	  	$(".validation-error").removeClass("text-danger").addClass("text-success").text("Fan muvaffaqiyatli o'zgartirildi")
	  	$(".loading-modal").modal('hide')
	  	setTimeout(() => redirect("../../"), 5000)
	  },

	  error(err) {
	  	console.log(err.responseJSON)
	  	$(".loading-modal").modal('hide')
	  	$(".validation-error").text(err.responseJSON.error)
	  }
	})
});

(async () => {
	const subject = await getSubject(subjectID)
	$("#name-uz").val(subject.name.uz)
	$("#name-ru").val(subject.name.ru)
	$("h1 span").text(`#${subject._id}`)
	$(".loading-modal").modal('hide')
})()