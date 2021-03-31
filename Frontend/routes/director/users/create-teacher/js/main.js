
$(".loading-modal").modal('show')
$("form").on("submit", (evt) => {
	evt.preventDefault()

	$(".loading-modal").modal('show')
	$(".validation-error").text(``)

	if (!$(".subjects").val()) return $(".validation-error").text(`Iltimos o'qituvchi uchun fan tanlang!`)

	const data = {
		fullName: $("#fullName").val().trim(),
		name: $("#name").val().trim(),
		password: $("#password").val().trim(),
		subject: $(".subjects").val().trim(),
	}

	$.ajax({
	  type: 'POST',
	  url: `${mainUrl}/api/v1/auth/register-teacher`,
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
});

(async () => {
	const allSubjects = await getAllSubjects()
	$(".subjects-select").append(createSubjectsSelect(allSubjects))
	$(".loading-modal").modal('hide')
})()