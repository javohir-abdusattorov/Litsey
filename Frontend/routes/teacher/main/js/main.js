
$.ajax({
  type: 'GET',
  url: `${mainUrl}/api/v1/auth/me`,
  headers: { "Authorization": accessToken },

  success(data) {
    data.data.role == "teacher" ? redirect("groups") : redirect("/")
  },

  error(err) {
    redirect("/auth/login")
  }
})
