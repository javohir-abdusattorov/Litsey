
const userID = getID()
const elUserForm = $(".settings-form")

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
    name: getVal("#name"),
    patronymic: getVal("#patronymic"),
    password: getVal("#password"),
    subGroup: +getVal("#subgroup"),
    phoneNumber: getVal("#phone-number"),
    dateOfBirth: new Date(getVal("#date-of-birth")),
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

elUserForm.on("submit", (evt) => {
  evt.preventDefault()
  $(".validation-error").text(``)
  $(".loading-modal").modal('show')

  const result = getStudentData() 
  if (result.error) {
    $(".validation-error").text(`O'quvchi eng kamida 1ta chet tili bilishi talab etiladi`)
    $(".loading-modal").modal('hide')
    return
  }

  $.ajax({
    type: 'POST',
    url: `${mainUrl}/api/v1/auth/register-student`,
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(result),
    headers: { "Authorization": accessToken },

    success(res) {
      console.log(res)
      $(".loading-modal").modal('hide')
      $(".validation-error").removeClass("text-danger").addClass("text-success").text("O'quvchi muvaffaqiyatli qo'shildi")
      setTimeout(() => redirect(`../`), 3000)
    },

    error(err) {
      console.log(err.responseJSON)
      $(".loading-modal").modal('hide')
      $(".validation-error").text(err.responseJSON.error)
    }
  })
})