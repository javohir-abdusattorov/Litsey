
let student
const userID = getID()
$(".loading-modal").modal('show')

$(".region-select").html(``)
for (const reg of _regions) {
  $(".region-select").append(`<option value="${reg}">${reg}</option>`)
}

const whereChanged = (self) => {
  const val = self.val().trim()
  if (val == "Ijarada") {
    $(".rent-container").removeClass("d-none")
    $(".rent-container").find("input").attr("required", true)
  } else {
    $(".rent-container").find("[required]").removeAttr("required")
    $(".rent-container").addClass("d-none")
  }
}

const addLesson = (self) => {
  const langs = self.parent().parent().find(".languages")
  if (langs.find(".language").length) {
    if (!langs.find(".language:last #language-name").val()) return;
  }

  self.parent().parent().find(".languages").append(`
    <div class="language bg-white p-3 rounded d-flex justify-content-between position-relative">
      <input type="text" class="form-control" id="language-name" required placeholder="Tilni kiriting" w=70>
      <select class="form-control" id="level" w=20>
        <option value="A1">A1</option>
        <option value="A2">A2</option>
        <option value="B1">B1</option>
        <option value="B2">B2</option>
        <option value="C1">C1</option>
        <option value="C2">C2</option>
      </select>
      <button type="button" class="close close-btn center" aria-label="Close" onclick="$(this).parent().remove()">
        <span aria-hidden="true" class="center">&times;</span>
      </button>
    </div>
  `)
  updateElWidth()
}

const getStudentData = () => {
  const userData = {
    surname: getVal("#surname"),
    fullName: getVal("#full-name"),
    patronymic: getVal("#patronymic"),
    phoneNumber: getVal("#phone-number"),
    dateOfBirth: new Date(getVal("#date-of-birth")).toISOString(),
    whereLives: getVal("#where-lives"),
    foreignLanguages: [],

    "identity.series": getVal("#identity-series"),
    "identity.numbers": getVal("#identity-numbers"),

    "address.region": getVal("#address-region"),
    "address.district": getVal("#address-district"),
    "address.exactAdress": getVal("#address-exact-adress"),

    "parents.father.surname": getVal("#father-surname"),
    "parents.father.name": getVal("#father-name"),
    "parents.father.workplace": getVal("#father-workplace"),
    "parents.father.phoneNumber": getVal("#father-phone-number"),

    "parents.mother.surname": getVal("#mother-surname"),
    "parents.mother.name": getVal("#mother-name"),
    "parents.mother.workplace": getVal("#mother-workplace"),
    "parents.mother.phoneNumber": getVal("#mother-phone-number"),
  }

  if (userData.whereLives == "Ijarada") {
    userData["currentAddress.region"] = getVal("#current-address-region")
    userData["currentAddress.district"] = getVal("#current-address-district")
    userData["currentAddress.exactAdress"] = getVal("#current-exact-adress")
  }

  const langs = $(".languages > div")
  if (!langs.length) return { error: true }

  for (const lang of langs) userData.foreignLanguages.push({
    language: $(lang).find("#language-name").val().trim(),
    level: $(lang).find("#level").val().trim(),
  })

  return userData
}

const elUserForm = $(".student-form")
const createUserData = (user) => {
  $("input[type='tel']").val(`+998774445566`)
  elUserForm.find(".user-image").attr("src", user.profile_image)
  elUserForm.find("#full-name").val(user.fullName)
  if (!user.student) {
    updateElWidth()
    $("h1 span").text(`#${user.fullName}`)
    $(".loading-modal").modal('hide')
    return;
  }
  const dateBirth = convertDate(user.student.dateOfBirth).split('.')

  elUserForm.find("#surname").val(user.student.surname)
  elUserForm.find("#patronymic").val(user.student.patronymic)
  elUserForm.find(`#address-region option[value='${user.student.address.region}']`).attr('selected', true)
  elUserForm.find("#address-district").val(user.student.address.district)
  elUserForm.find("#address-exact-adress").val(user.student.address.exactAdress)
  elUserForm.find("#phone-number").val(user.student.phoneNumber)

  elUserForm.find("#identity-series").val(user.student.identity.series)
  elUserForm.find("#identity-numbers").val(user.student.identity.numbers)

  elUserForm.find("#date-of-birth").attr("value", `${dateBirth.last()}-${dateBirth[1]}-${dateBirth[0]}`)
  elUserForm.find(`#where-lives option[value='${user.student.whereLives}']`).attr('selected', true)

  elUserForm.find("#father-surname").val(user.student.parents.father.surname)
  elUserForm.find("#father-name").val(user.student.parents.father.name)
  elUserForm.find("#father-workplace").val(user.student.parents.father.workplace)
  elUserForm.find("#father-phone-number").val(user.student.parents.father.phoneNumber)

  elUserForm.find("#mother-surname").val(user.student.parents.mother.surname)
  elUserForm.find("#mother-name").val(user.student.parents.mother.name)
  elUserForm.find("#mother-workplace").val(user.student.parents.mother.workplace)
  elUserForm.find("#mother-phone-number").val(user.student.parents.mother.phoneNumber)

  if (user.student.whereLives == "Ijarada") {
    $(".rent-container").removeClass("d-none")
    $(".rent-container").find("input").attr("required", true)
    $(`.rent-container #current-address-region option[value='${user.student.currentAddress.region}']`).attr('selected', true)
    $(`.rent-container #current-address-district`).val(user.student.currentAddress.district)
    $(`.rent-container #current-exact-adress`).val(user.student.currentAddress.exactAdress)
  } else {
    $(".rent-container").find("[required]").removeAttr("required")
    $(".rent-container").addClass("d-none")
  }

  $(".languages").html(``)
  for (const lang of user.student.foreignLanguages) {
    const langHtml = $(`
      <div class="language bg-white p-3 rounded d-flex justify-content-between position-relative">
        <input type="text" value="${lang.language}" class="form-control" id="language-name" required placeholder="Tilni kiriting" w=70>
        <select class="form-control" id="level" w=20>
          <option value="A1">A1</option>
          <option value="A2">A2</option>
          <option value="B1">B1</option>
          <option value="B2">B2</option>
          <option value="C1">C1</option>
          <option value="C2">C2</option>
        </select>
        <button type="button" class="close close-btn center" aria-label="Close" onclick="$(this).parent().remove()">
          <span aria-hidden="true" class="center">×</span>
        </button>
      </div>
    `)
    langHtml.find(`select option[value='${lang.level}']`).attr('selected', true)
    $(".languages").append(langHtml)
  }

  updateElWidth()
  $("h1 span").text(`#${user.fullName}`)
  $("input[type='tel']").val(`+998774445566`)
  $(".loading-modal").modal('hide')
}

elUserForm.on("submit", (evt) => {
  evt.preventDefault()
  $(".loading-modal").modal('show')
  $(".validation-error").text(``)

  const data = new FormData()
  if ($("#user-image").val()) data.append("profile_image", $('#user-image')[0].files[0])

  const result = getStudentData()
  if (result.error) {
    $(".validation-error").text(`O'quvchi eng kamida 1ta chet tili bilishi talab etiladi`)
    $(".loading-modal").modal('hide')
    return
  }

  data.append("student", JSON.stringify(result))

  $.ajax({
    type: 'PUT',
    url: `${mainUrl}/api/v1/users/edit-student/${userID}`,
    dataType: 'json',
    contentType: 'application/json',
    data,
    processData: false,
    contentType: false,
    headers: { "Authorization": accessToken },

    success(res) {
      console.log(res)
      $(".validation-error").removeClass("text-danger").addClass("text-success").text("Foydalanuvchi muvaffaqiyatli saqlandi")
      createUserData(res.data)
      $(".loading-modal").modal('hide')
    },

    error(err) {
      console.log(err.responseJSON)
      $(".validation-error").text(err.responseJSON.error)
      $(".loading-modal").modal('hide')
    }
  })
});


(async () => {
  const [user] = await getUser({ _id: userID })
  student = user
  createUserData(user)
})()