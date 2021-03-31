
const userID = getID()
$(".loading-modal").modal('show')

const elUserForm = $(".settings-form")
const createUserData = (user) => {
  elUserForm.find(".user-image").attr("src", user.profile_image)
  elUserForm.find("#full-name").val(user.fullName)
  elUserForm.find("#old-password").val(``)
  elUserForm.find("#new-password").val(``)

  $("h1 span").text(`#${user.fullName}`)
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
    data.append("newPassword", newPsw)
  } else if ((!oldPsw && newPsw) || (!newPsw && oldPsw)) {
    $(".warnings").text(`Agar parollardan biri bo'lib biri bo'lmagan holatda parol yangilanmaydi! Parolni yangilash uchun ikkala parolni kiriting!`)
  }

  $.ajax({
    type: 'PUT',
    url: `${mainUrl}/api/v1/users/edit/${userID}`,
    dataType: 'json',
    contentType: 'application/json',
    data,
    processData: false,
    contentType: false,
    headers: { "Authorization": accessToken },

    success(res) {
      $(".validation-error").removeClass("text-danger").addClass("text-success").text("Foydalanuvchi muvaffaqiyatli saqlandi")
      createUserData(res.data)
      $(".loading-modal").modal('show')
    },

    error(err) {
      console.log(err.responseJSON)
      $(".validation-error").text(err.responseJSON.error)
      $(".loading-modal").modal('show')
    }
  })
});


(async () => {
  const [user] = await getUser({ _id: userID })
  createUserData(user)
})()