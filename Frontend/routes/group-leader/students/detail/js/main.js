
const userID = getID()
const elContainer = $(".student")
$(".loading-modal").modal('show')

const createStudentData = (data) => {
  const { user, attendance, averageScores } = data
  $("h1 span").text(`#${user.fullName}`)
  $(".user-image").attr("src", user.profile_image)
  $(".full-name span").text(user.fullName)
  $(".name span").text(user.name)
  $(".course span").text(`${user.course}-kurs`)
  if (!user.isActive) $("p.is-active span").text("Aktiv emas").removeClass("text-success").addClass("text-danger")

  $(".all-attendance span").text(attendance.hasReason + attendance.noReason + "ta")
  $(".has-reason span").text(attendance.hasReason + "ta")
  $(".no-reason span").text(attendance.noReason + "ta")

  for (const item of averageScores) {
    $(".subjects").append(`
      <div class="tr py-1 border-top" w=100>
        <div class="td border-0" w=30>
          <p class="m-0">${item.subject.name}</p>
        </div>
        <div class="td border-0" w=70>
          <p class="mb-0 text-right">
            <span
              class="mx-2 bg-primary text-light rounded text-center px-3 py-1"
              style="cursor: pointer; font-size: 18px; font-weight: bold;"
              data-toggle="tooltip" title="O'rtacha joriy"
            >${item.current}</span>
            <span class="mx-2 bg-warning text-dark rounded text-center px-3 py-1"
              style="cursor: pointer; font-size: 18px; font-weight: bold;"
              data-toggle="tooltip" title="O'rtacha oraliq"
            >${item.intermediate}</span>
          </p>
        </div>
      </div>
    `)
  }

  $('[data-toggle="tooltip"]').tooltip()
  updateElWidth()
  $(".loading-modal").modal('hide')
}

$.ajax({
  type: 'GET',
  url: `${mainUrl}/api/v1/users/student-detail/${userID}`,
  headers: { "Authorization": accessToken },

  success(res) {
  	console.log(res);
    createStudentData(res.data)
  },

  error(err) {
    redirect("../../")
  }
})
