
$(".loading-modal").modal('show')
let groups

$("form").on("submit", (evt) => {
	evt.preventDefault()

	$(".loading-modal").modal('show')
	$(".validation-error").text(``)

	const data = {
		group: $("#group").val().trim(),
		subgroup: $("#sub-group").val().trim(),
		intermediate: $("#intermediate").val().trim(),
		current: $("#current").val().trim()
	}

	for (const [key, value] of Object.entries(data)) if (!value) {
		$(".loading-modal").modal('show')
		$(".validation-error").text(`Iltimos barcha malumotlarni kiritganingizni qaytadan tekshiring`)
		return
	}

	$.ajax({
	  type: 'POST',
	  url: `${mainUrl}/api/v1/journals/swap-lessons`,
	  dataType: 'json',
    contentType: 'application/json',
	  data: JSON.stringify(data),
    headers: { "Authorization": accessToken },

	  success(res) {
	  	console.log(res)
	  	$(".validation-error").removeClass("text-danger").addClass("text-success").text("Darslar muvaffaqiyatli almashtirildi")
			$(".loading-modal").modal('hide')
	  	// setTimeout(() => redirect("../"), 5000)
	  },

	  error(err) {
	  	console.log(err.responseJSON)
			$(".loading-modal").modal('hide')
	  	$(".validation-error").text(err.responseJSON.error)
	  }
	})
})

const createSwapOptions = ({ currents, intermediates }) => {
	$("#current").html(`<option selected disabled>Tanlang</option>`)
	$("#intermediate").html(`<option selected disabled>Tanlang</option>`)

	for (const current of currents) {
		$("#current").append(`<option value="${current.scoreID}">${convertDate(current.date)}, ${getWeekday(new Date(current.date).getDay() - 1)}</option>`)
	}
	for (const intermediate of intermediates) {
		$("#intermediate").append(`<option value="${intermediate.scoreID}">${convertDate(intermediate.date)}, ${getWeekday(new Date(intermediate.date).getDay() - 1)}</option>`)
	}
}

const createSubGroupSwapOptions = (self) => {
	const val = +self.val()
	const group = groups.find(item => item.group.group === $("#group").val().trim())
	createSwapOptions(group.data[val])
}

const showSubgroups = () => {
	$("#sub-group").html(`<option selected disabled>Tanlang</option><option value="1">1-guruh</option><option value="2">2-guruh</option>`)
}

const createGroups = (groups) => {
	$("#group").html(`<option selected disabled>Tanlang</option>`)
	for (const group of groups) $("#group").append(`<option value="${group.group.group}">${group.group.name}</option>`)
};

(async () => {
	const res = await $.ajax({
		type: 'GET',
		url: `${mainUrl}/api/v1/journals/get-lessons`,
		headers: { "Authorization": accessToken },
	})
	groups = res.data
	createGroups(res.data)

	console.log(res)
	$(".loading-modal").modal('hide')
})()