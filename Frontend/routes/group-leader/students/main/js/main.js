
$(".loading-modal").modal('show')
const elUsersContainer = $(".students-container")

const createUsers = (users) => {
  elUsersContainer.html(``)

  for (const user of users) {
    const userHtml = $(`
      <li class="list-group-item shadow d-flex justify-content-between align-items-center" data-user-id="${user._id}">
        <div class="d-flex align-items-center">
          <img src="${user.profile_image}" class="rounded-circle" width=40 height=40>
          <a href="student/${user._id}" class="mb-0 ml-2 text-dark" style="cursor: pointer">
            <p class="mr-2 mb-0">${user.name} | <b>${user.fullName}</b> </p>
          </a>
        </div>
        <div class="controls">
          <a href="../journals/journal/${user._id}" class="btn btn-sm btn-outline-success">Jurnal</a>
          <a href="edit/${user._id}" class="btn btn-sm btn-outline-info">Tahrirlash</a>
        </div>
      </li>
    `)
    elUsersContainer.append(userHtml)
    updateElWidth()
  }

  $(".loading-modal").modal('hide')
};

(async () => {
  await checkAuthAsync(accessToken)

  $.ajax({
    type: 'GET',
    url: `${mainUrl}/api/v1/users/all?role=student&group=${_user.group}`,

    success(res) {
      console.log(res.data)
      createUsers(res.data)
    },

    error(err) {
      console.error(err)
    }
  })
})()
