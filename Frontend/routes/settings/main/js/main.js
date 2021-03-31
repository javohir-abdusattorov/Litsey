
$(".loading-modal").modal('show')

$.ajax({
  type: 'GET',
  url: `${mainUrl}/api/v1/auth/me`,
  headers: { "Authorization": accessToken },

  success(res) {
    createUserData(res.data)
  },

  error(err) {
    console.error(err)
  }
})

const elUserForm = $(".settings-form")
const createUserData = (user) => {
  elUserForm.find(".user-image").attr("src", user.profile_image)
  elUserForm.find("#full-name").val(user.fullName)
  elUserForm.find("#old-password").val(``)
  elUserForm.find("#new-password").val(``)
  $("nav .user-account img").attr("src", user.profile_image)
  $("nav .user-account h6").text(user.fullName)

  _user = user
  $(".loading-modal").modal('hide')
}

elUserForm.on("submit", (evt) => {
  evt.preventDefault()
  $(".validation-error").text(``)

  $(".loading-modal").modal('show')
  const oldPsw = getVal(`#old-password`)
  const newPsw = getVal(`#new-password`)
  const data = new FormData()

  if (getVal(`#full-name`) != _user.fullName) data.append("fullName", getVal(`#full-name`))
  if ($("#user-image").val()) data.append("profile_image", $('#user-image')[0].files[0])

  if (oldPsw && newPsw) {
    data.append("oldPassword", oldPsw)
    data.appqend("newPassword", newPsw)
  } else if ((!oldPsw && newPsw) || (!newPsw && oldPsw)) {
    $(".warnings").text(`Agar parollardan biri bo'lib biri bo'lmagan holatda parol yangilanmaydi! Parolni yangilash uchun ikkala parolni kiriting!`)
  }

  $.ajax({
    type: 'PUT',
    url: `${mainUrl}/api/v1/users/edit`,
    dataType: 'json',
    contentType: 'application/json',
    data,
    processData: false,
    contentType: false,
    headers: { "Authorization": accessToken },

    success(res) {
      $(".validation-error").removeClass("text-danger").addClass("text-success").text("Sozlamalar muvaffaqiyatli saqlandi")
      createUserData(res.data)
      $(".loading-modal").modal('hide')
    },

    error(err) {
      console.log(err.responseJSON)
      $(".loading-modal").modal('hide')
      $(".validation-error").text(err.responseJSON.error)
    }
  })
})