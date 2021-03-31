
let teacherGroups = []

$(".loading-modal").modal('show')
$("form").on("submit", (evt) => {
	evt.preventDefault()

	if (!getVal("#group") || !getVal("#date") || !$("#lesson").val()) {
		return $(".validation-error").text(`Iltimos barcha ma'lumotlarni kiritganingizni yana bir bor tekshiring!`)
	}

	$(".loading-modal").modal('show')
	$(".validation-error").text(``)

	const lesson = $("#lesson :selected")
	const group = {
		group: $("#group").val(),
		lessonIndex: +lesson.data("lessonIndex"),
	}
	if (lesson.data("subgroup")) group.subGroup = +lesson.data("subgroup")

	const jsonData = {
		group,
		date: $("#date").val(),
		homeworkType: $("#homework-type").val(),
		description: $("#description").val(),
		homeworkDescription: $("#homework-description").val(),
	}

	const data = createFormData(jsonData)
  if ($("#media").val()) data.append("media", $('#media')[0].files[0])

	$.ajax({
	  type: 'POST',
	  url: `${mainUrl}/api/v1/lessons/create`,
    dataType: 'json',
    contentType: 'application/json',
    data,
    processData: false,
    contentType: false,
    headers: { "Authorization": accessToken },

	  success(data) {
	  	$(".validation-error").removeClass("text-danger").addClass("text-success").text("Dars muvaffaqiyatli qo'shildi")
			$(".loading-modal").modal('hide')
	  	setTimeout(() => redirect("../"), 5000)
	  },

	  error(err) {
	  	console.log(err.responseJSON)
			$(".loading-modal").modal('hide')
	  	$(".validation-error").text(err.responseJSON.error)
	  }
	})
})

const createDates = (dates) => {
	$("#date").html(`<option disabled selected>Tanlang</option>`)
	for (const date of dates) {
		$("#date").append(`<option value="${date.date}">${convertDate(date.date)} ${getWeekday(new Date(date.date).getDay() - 1)}</option>`)
	}
}

const createLessons = (lessons) => {
	$("#lesson").html(`<option disabled selected>Tanlang</option>`)
	for (const lesson of lessons) {
		$("#lesson").append(`
			<option data-lesson-index="${lesson.index}" data-subgroup="${lesson.subGroup && lesson.subGroup}">
				${lesson.index}-para | ${lesson.subGroup ? `${lesson.subGroup}-guruh` : "To'liq guruh"}
			</option>
		`)
	}
}

const changeLesson = (self) => {
	const group = teacherGroups.find(item => item.group.group === $("#group").val())
	const date = self.val()
	const data = group.data.find(item => item.date == date)
	createLessons(data.lessons)
}

const prepareForCreate = ({ groups, homeworkTypes }) => {
	teacherGroups = groups

	for (const group of teacherGroups) $("#group").append(`<option value="${group.group.group}">${group.group.name}</option>`)
	for (const type of homeworkTypes) $("#homework-type").append(`<option value="${type}" ${type == "power-point" && "selected"}>${getHomeworkType(type)}</option>`)
}

const chaneDates = (self) => {
	const val = self.val()
	const group = teacherGroups.find(item => item.group.group === val)
	createDates(group.data)
}

$.ajax({
  type: 'GET',
  url: `${mainUrl}/api/v1/lessons/create-data`,
  headers: { "Authorization": accessToken },

  success(res) {
    console.log(res.data);
		prepareForCreate(res.data)
		$(".loading-modal").modal('hide')
  },

  error(err) {
    $(".loading-modal").modal('hide')
    console.error(err)
  }
})
