
$("form").on("submit", (evt) => {
	evt.preventDefault()

	$(".loading-modal").modal('show')
	$(".validation-error").text(``)

	const data = {
		fullName: $("#fullName").val().trim(),
		name: $("#name").val().trim(),
		password: $("#password").val().trim()
	}

	$.ajax({
	  type: 'POST',
	  url: `${mainUrl}/api/v1/auth/register-subadmin`,
	  dataType: 'json',
    contentType: 'application/json',
	  data: JSON.stringify(data),
    headers: { "Authorization": accessToken },

	  success(data) {
	  	$(".validation-error").removeClass("text-danger").addClass("text-success").text("Foydalanuvchi muvaffaqiyatli yaratildi")
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