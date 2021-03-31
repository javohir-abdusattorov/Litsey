
const studentID = getID()
const elContainer = $(".student")
$(".loading-modal").modal('show')

const createStudentData = (student, group) => {
  $("#fullName").text(student.fullName)
  $("#name").text(student.name)
  $("#surname").text(student.student.surname)
  $("#patronymic").text(student.student.patronymic)
  $("#dateOfBirth").text(convertDate(student.student.dateOfBirth))
  $("#phoneNumber").text(student.student.phoneNumber)
  $("#region").text(student.student.address.region)
  $("#district").text(student.student.address.district)
  $("#exactAdress").text(student.student.address.exactAdress)
  $("#group").text(group.name)
  $("#course").text(`${group.course}-kurs`)
  $("#faculty").text(group.faculty)
  $("#educationLang").text(group.educationLang)
  $("#identitySeries").text(student.student.identity.series)
  $("#identityNumbers").text(student.student.identity.numbers)
  $("#whereLives").text(student.student.whereLives)
  $("#father-name").text(student.student.parents.father.name)
  $("#father-surname").text(student.student.parents.father.surname)
  $("#father-workplace").text(student.student.parents.father.workplace)
  $("#father-phoneNumber").text(student.student.parents.father.phoneNumber)
  $("#mother-name").text(student.student.parents.mother.name)
  $("#mother-surname").text(student.student.parents.mother.surname)
  $("#mother-workplace").text(student.student.parents.mother.workplace)
  $("#mother-phoneNumber").text(student.student.parents.mother.phoneNumber)

  if (student.student.whereLives == "Ijarada") {
    $(".if-lives-rent").show()
    $("#currentAddress-region").text(student.student.currentAddress.region)
    $("#currentAddress-district").text(student.student.currentAddress.district)
    $("#currentAddress-exactAdress").text(student.student.currentAddress.exactAdress)
  }

  if (!student.isActive) $("#status span").text("Aktiv emas").removeClass("text-success").addClass("text-danger")
};

(async () => {
  const [student] = await getUser({ role: "student", _id: studentID })
  const [group] = await getGroup({ _id: student.group })
  console.log(`Student`, student)
  console.log(`Gruppa`, group)
  createStudentData(student, group)
  updateElWidth()
  $(".loading-modal").modal('hide')
})()