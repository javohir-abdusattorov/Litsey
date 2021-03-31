
$(".login-form").on('submit', (evt) => {
	evt.preventDefault()
	$(".validation-error").text(``)
	if (!$("#login").val() || !$("#password").val()) return $(".validation-error").text(`Login va parolni kiriting`)
	$(".loading-modal").modal('show')

	const loginData = {
		name: $("#login").val().trim(),
		password: $("#password").val().trim()
	}

	$.ajax({
	  type: 'POST',
	  url: `${mainUrl}/api/v1/auth/login`,
	  dataType: 'json',
    contentType: 'application/json',
	  data: JSON.stringify(loginData),

	  success(data) {
	  	const role = data.role
	  	localStorage.setItem("access-token", `Bearer ${data.token}`)
	  	$(".loading-modal").modal('hide')

	  	if (role == "super-admin" || role == "sub-admin") redirect("/litsey/director")
	  	else if (role == "group-leader") redirect("/litsey/group-leader")
	  	else if (role == "organizer") redirect("/litsey/organizer")
	  	else if (role == "student") redirect("/litsey/student")
	  	else if (role == "teacher") redirect("/litsey/teacher")
	  },

	  error(err) {
	  	console.log(err.responseJSON);
	  	$(".loading-modal").modal('hide')
	  	$(".validation-error").text(err.responseJSON.error)
	  }
	})
})

if (accessToken) {
	$.ajax({
	  type: 'GET',
	  url: `${mainUrl}/api/v1/auth/me`,
	  headers: { "Authorization": accessToken },

	  success(res) {
	    const role = res.data.role

	    if (role == "super-admin") redirect("/litsey/director")
	    if (role == "group-leader") redirect("/litsey/group-leader")
	    if (role == "organizer") redirect("/litsey/organizer")
	    if (role == "student") redirect("/litsey/student")
	    if (role == "teacher") redirect("/litsey/teacher")
	  }
	})
}