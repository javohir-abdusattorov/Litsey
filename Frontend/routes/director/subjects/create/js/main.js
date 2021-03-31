
$("form").on("submit", (evt) => {
	evt.preventDefault()
	$(".validation-error").text(``)
	$(".loading-modal").modal('show')
	const data = {
		name_uz: $("#name-uz").val().trim(),
		name_ru: $("#name-ru").val().trim(),
	}

	$.ajax({
	  type: 'POST',
	  url: `${mainUrl}/api/v1/subjects/create`,
	  dataType: 'json',
    contentType: 'application/json',
	  data: JSON.stringify(data),
    headers: { "Authorization": accessToken },

	  success(data) {
	  	$(".validation-error").removeClass("text-danger").addClass("text-success").text("Fan muvaffaqiyatli yaratildi")
			$(".loading-modal").modal('hide')
	  	setTimeout(() => redirect("../"), 5000)
	  },

	  error(err) {
	  	console.log(err.responseJSON)
	  	$(".loading-modal").modal('hide')
	  	$(".validation-error").text(err.responseJSON.error)
	  }
	})
})