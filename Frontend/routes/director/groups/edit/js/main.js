
Array.prototype.last = function() { return this[this.length - 1] }

const groupID = getID()
let allSubjects
let allTeachers

if (!accessToken) redirect('/auth/login')
$(".loading-modal").modal('show')
$("#sidebar-placeholder").load("/assets/utils/sidebar.html")


const addLesson = (self) => {
	const container = self.parent().parent().find(".lessons")
	if (container.find("li.list-group-item").length) {
		const last = container.find("li.list-group-item").last()
		if (!isValidLesson(last)) return
	}

	self.parent().parent().find(".lessons").append(`
    <li class="list-group-item rounded-0 py-3 px-2 pt-4 position-relative">
    	<button type="button" class="close close-btn" aria-label="Close" onclick="$(this).parent().remove()">
			  <span aria-hidden="true">&times;</span>
			</button>
      <select class="form-control lesson-type" onchange="changeLessonType($(this))">
	      <option disabled selected>Tanlang</option>
	      <option value="custom">Oddiy</option>
	      <option value="changable">O\`zgaruvchan</option>
	      <option value="dividable">Bo\`linadigan</option>
	    </select>
	    <div class="lesson-settings pt-3">
	    </div>
    </li>
	`)
}

const changeTeachers = (self) => {
	const teachersSelectParent = self.parent().parent().parent().find(`.teachers-container`)
	const subjectTeachers = allTeachers.filter(obj => obj.subject.subject === self.val())
	teachersSelectParent.html(createTeachersSelect(subjectTeachers))
}

const changeLessonType = (self) => {
	const elParent = self.parent()
	const elLessonSettings = elParent.find(".lesson-settings").html(``)
	let lessonForm

	if (self.val() == "custom") {
		elParent.css("background", "#D8FFD3")
		lessonForm = $(`
			<div class="lesson">
			  <div class="form-group d-flex">
	        <label class="col col-form-label pl-1" for="leader-name">Fan</label>
	        <div class="subjects-container" style="width: 87%;"></div>
	      </div>
	      <div class="form-group d-flex">
	        <label class="col col-form-label pl-1" for="leader-name">Ustoz</label>
	        <div class="teachers-container" style="width: 87%;"></div>
	      </div>
			</div>
		`)
	} else if (self.val() == "changable") {
		elParent.css("background", "#FFE1FA")
		lessonForm = $(`
			<div class="lesson">
        <div class="form-group d-flex">
          <label class="col col-form-label pl-1" for="leader-name">1. Fan</label>
        	<div class="subjects-container" style="width: 80%;"></div>
        </div>
        <div class="form-group d-flex">
          <label class="col col-form-label pl-1" for="leader-name">1. Ustoz</label>
        	<div class="teachers-container" style="width: 80%;"></div>
        </div>
			</div>
			<div class="lesson">
        <div class="form-group d-flex">
          <label class="col col-form-label pl-1" for="leader-name">2. Fan</label>
        	<div class="subjects-container" style="width: 80%;"></div>
        </div>
        <div class="form-group d-flex">
          <label class="col col-form-label pl-1" for="leader-name">2. Ustoz</label>
        	<div class="teachers-container" style="width: 80%;"></div>
        </div>
			</div>
		`)
	} else if (self.val() == "dividable") {
		elParent.css("background", "#ECE4FF")
		lessonForm = $(`
			<div class="lesson">
        <div class="form-group d-flex">
          <label class="col col-form-label pl-1" for="leader-name">1. Fan</label>
        	<div class="subjects-container" style="width: 80%;"></div>
        </div>
        <div class="form-group d-flex">
          <label class="col col-form-label pl-1" for="leader-name">1. Ustoz</label>
        	<div class="teachers-container" style="width: 80%;"></div>
        </div>
			</div>
			<div class="lesson">
        <div class="form-group d-flex">
          <label class="col col-form-label pl-1" for="leader-name">2. Fan</label>
        	<div class="subjects-container" style="width: 80%;"></div>
        </div>
        <div class="form-group d-flex">
          <label class="col col-form-label pl-1" for="leader-name">2. Ustoz</label>
        	<div class="teachers-container" style="width: 80%;"></div>
        </div>
			</div>
		`)
	}

	lessonForm.find("div.subjects-container").append(createSubjectsSelect(allSubjects))
	lessonForm.find("div.teachers-container").append(createTeachersSelect([]))
	elLessonSettings.append(lessonForm)
}

const createGroupData = async (group) => {
	$("#group-name").val(group.name)
  const [groupLeader] = await getUser({ role: "group-leader", group: group._id })
  $("#leader-fullName").val(groupLeader.fullName)
  $("#leader-name").val(groupLeader.name)
  $("#leader-password").val(groupLeader.password)
}

checkAuth(accessToken)

$.ajax({
  type: 'GET',
  url: `${mainUrl}/api/v1/groups/group/${groupID}`,

  async success(res) {
    $("h1 span").text(`#${groupID}`)
    await createGroupData(res.data)
  },

  error(err) {
    redirect("../../")
  }
});

(async () => {
	allSubjects = await getAllSubjects()
	allTeachers = await getUser({ role: "teacher", isActive: "true" })
	createDayPlaceholder($(`.lessons-schedule`))
	$(".loading-modal").modal('hide')
})()

$("form").on("submit", (evt) => {
	evt.preventDefault()

	$(".validation-error").text(``)
	const result = getLessonSchedule($(`.lessons-schedule`))
	if (result.error) return $(".validation-error").text("Dars jadvalida xato bor! Iltimos barcha darslarni to'liq to'ldirganingizni tekshiring")

	const data = {
		name: $("#group-name").val().trim(),
		leader: {
			fullName: $("#leader-fullName").val().trim(),
			name: $("#leader-name").val().trim(),
			password: $("#leader-password").val().trim()
		},
		lessonsSchedule: result
	}

	// $.ajax({
	//   type: 'POST',
	//   url: `${mainUrl}/api/v1/groups/create`,
	//   dataType: 'json',
 //    contentType: 'application/json',
	//   data: JSON.stringify(data),
 //    headers: { "Authorization": accessToken },

	//   success(data) {
	//   	console.log(data);
	//   },

	//   error(err) {
	//   	console.log(err.responseJSON);
	//   	$(".validation-error").text(err.responseJSON.error)
	//   }
	// })
})