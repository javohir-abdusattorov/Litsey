
$(".loading-modal").modal('show')
const elStudentsContainer = $(".students-container")
const elFilterContainer = $(".filters-container")
let students = []
let groups = []
let filteredUsers = []

$(".region-select").html(`<option value="all">Hammasi</option>`)
for (const reg of _regions) $(".region-select").append(`<option value="${reg}">${reg}</option>`)

const exportToExel = () => {
  if (!filteredUsers.length) return;
  $(".loading-modal").modal('show')

  $.ajax({
    type: 'POST',
    url: `${mainUrl}/api/v1/users/exel/filtered-students`,
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify({ students: filteredUsers }),
    headers: { "Authorization": accessToken },

    success(res) {
      openInNewTab(res.path)
      window.open(res.path, '_blank')
      $(".loading-modal").modal('hide')
    },

    error(err) {
      console.log(err)
      $(".loading-modal").modal('hide')
      $(".validation-error").text(err.responseJSON.error)
    }
  })
}

const filterStudents = (students, options) => {
  let result = [...students]

  if (options.group !== "all") result = [...result.filter(obj => obj.group.group === options.group)]
  if (options.subgroup !== "all") result = [...result.filter(obj => obj.group.subgroup === +options.subgroup)]
  if (options.course !== "all") result = [...result.filter(obj => obj.group.course === +options.course)]

  if (options.addressRegion !== "all") result = [...result.filter(obj => obj.student.address.region === options.addressRegion)]
  if (options.whereLives !== "all") result = [...result.filter(obj => obj.student.whereLives === options.whereLives)]
  if (options.faculty !== "all") result = [...result.filter(obj => obj.group.faculty === options.faculty)]
  if (options.educationLang !== "all") result = [...result.filter(obj => obj.group.educationLang === options.educationLang)]

  if (options.phoneNumber) {
    result = [...result.filter(obj => obj.student.phoneNumber.replace(/[+]998/, '').match(new RegExp(options.phoneNumber, "gi")))]
  }
  if (options.fatherPhoneNumber) {
    result = [...result.filter(obj => obj.student.parents.father.phoneNumber.replace(/[+]998/, '').match(new RegExp(options.fatherPhoneNumber, "gi")))]
  }
  if (options.motherPhoneNumber) {
    result = [...result.filter(obj => obj.student.parents.mother.phoneNumber.replace(/[+]998/, '').match(new RegExp(options.motherPhoneNumber, "gi")))]
  }

  if (options.patronymic) {
    result = [...result.filter(obj => obj.student.patronymic.match(new RegExp(options.patronymic, "gi")))]
  }
  if (options.indentitySeries) {
    result = [...result.filter(obj => obj.student.identity.series.match(new RegExp(options.indentitySeries, "gi")))]
  }
  if (options.indentityNumber) {
    result = [...result.filter(obj => obj.student.identity.numbers.match(new RegExp(options.indentityNumber, "gi")))]
  }
  if (options.search) {
    result = [...result.filter(obj => obj.fullName.match(new RegExp(options.search, "gi")))]
  }

  if (options.fatherSurname) {
    result = [...result.filter(obj => obj.student.parents.father.surname.match(new RegExp(options.fatherSurname, "gi")))]
  }
  if (options.fatherName) {
    result = [...result.filter(obj => obj.student.parents.father.name.match(new RegExp(options.fatherName, "gi")))]
  }
  if (options.fatherWorkplace) {
    result = [...result.filter(obj => obj.student.parents.father.workplace.match(new RegExp(options.fatherWorkplace, "gi")))]
  }
  if (options.motherSurname) {
    result = [...result.filter(obj => obj.student.parents.mother.surname.match(new RegExp(options.motherSurname, "gi")))]
  }
  if (options.motherName) {
    result = [...result.filter(obj => obj.student.parents.mother.name.match(new RegExp(options.motherName, "gi")))]
  }
  if (options.motherWorkplace) {
    result = [...result.filter(obj => obj.student.parents.mother.workplace.match(new RegExp(options.motherWorkplace, "gi")))]
  }
  return result
}

const createGroups = (groups) => {
	elFilterContainer.find("#filter-groups").html(`<option value="all">Hammasi</option>`)

	for (const group of groups) {
		elFilterContainer.find("#filter-groups").append(`
			<option value="${group._id}">${group.name}</option>
		`)
	}
}

const createStudents = async (students) => {
	elStudentsContainer.html(``)

	for (const student of students) {
		let studentGroup
		const isAviable = groups.find(item => item._id === student.group)

		if (!isAviable) {
			[studentGroup] = await getGroup({ _id: student.group })
			groups.push(studentGroup)
		} else studentGroup = isAviable

		student.group = {
			name: studentGroup.name,
			group: studentGroup._id,
			faculty: studentGroup.faculty,
      educationLang: studentGroup.educationLang,
      course: studentGroup.course,
			subgroup: studentGroup.students.find(item => item.student === student._id).subGroup
		}

		const studentHtml = $(`
	    <li class="list-group-item shadow d-flex justify-content-between align-items-center">
	      <p class="mb-0"><a class="text-dark text-decoration-none" href="student/${student._id}">
	      	<span class="text-primary font-weight-500 mr-2">${studentGroup.course}-kurs</span>
	      	<b>${studentGroup.name}</b>. ${student.group.subgroup}.${student.fullName}</a>
	      </p>
	      <div class="controls">
	        <a href="../attendance/student/${student._id}" class="btn btn-sm btn-outline-info">Davomat</a>
	      </div>
	    </li>
		`)

		elStudentsContainer.append(studentHtml)
	}
}

const createStudentsByReadyData = (students) => {
	elStudentsContainer.html(``)

	for (const student of students) {
		const studentHtml = $(`
	    <li class="list-group-item shadow d-flex justify-content-between align-items-center">
	      <p class="mb-0"><a class="text-dark text-decoration-none" href="student/${student._id}">
	      	<span class="text-primary font-weight-500 mr-2">${student.group.course}-kurs</span>
	      	<b>${student.group.name}</b>. ${student.group.subgroup}.${student.fullName}</a>
	      </p>
	      <div class="controls">
	        <a href="../attendance/student/${student._id}" class="btn btn-sm btn-outline-info">Davomat</a>
	      </div>
	    </li>
		`)
		elStudentsContainer.append(studentHtml)
	}
}


$(".filter-form").on("submit", async (evt) => {
  evt.preventDefault()
  const filterOptions = {
    group: $("#filter-groups").val().trim(),
    course: $("#filter-course").val().trim(),
    subgroup: $("#filter-subgroup").val().trim(),
    search: $("#student-search").val().trim(),

    faculty: $("#faculty").val().trim(),
    educationLang: $("#education-lang").val().trim(),

    addressRegion: $("#address-region").val().trim(),
    whereLives: $("#where-lives").val().trim(),

    patronymic: $("#patronymic").val().trim(),
    phoneNumber: $("#phone-number").val().trim(),
    indentitySeries: $("#identity-series").val().trim(),
    indentityNumber: $("#identity-numbers").val().trim(),

    fatherSurname: $("#father-surname").val().trim(),
    fatherName: $("#father-name").val().trim(),
    fatherWorkplace: $("#father-workplace").val().trim(),
    fatherPhoneNumber: $("#father-phone-number").val().trim(),

    motherSurname: $("#mother-surname").val().trim(),
    motherName: $("#mother-name").val().trim(),
    motherWorkplace: $("#mother-workplace").val().trim(),
    motherPhoneNumber: $("#mother-phone-number").val().trim(),
  }

  const filteredStudents = filterStudents(students, filterOptions)
  filteredUsers = filteredStudents.map(item => item._id)
  createStudentsByReadyData(filteredStudents)

  console.log(filteredUsers.length)
  if (filteredUsers.length) $(".export-to-exel-btn").show()
    else $(".export-to-exel-btn").hide()
});

(async () => {
	students = await getUser({ role: "student" })
	students = students.reverse()
	await createStudents(students)
	createGroups(groups)

	updateElWidth()
	$(".loading-modal").modal('hide')
})()
