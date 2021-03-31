
$.ajax({
  type: 'GET',
  url: `${mainUrl}/api/v1/auth/me`,
  headers: { "Authorization": accessToken },

  success(data) {
  	const role = data.data.role
    role == "super-admin" ? redirect("groups") : redirect("/")
  },

  error(err) {
    redirect("/auth/login")
  }
})
