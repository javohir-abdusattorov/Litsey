
$(".loading-modal").modal('show')
const elUsersContainer = $(".users-container")

const createUsers = (users) => {
  elUsersContainer.html(``)

  for (const user of users) {
    const userHtml = $(`
      <li class="list-group-item shadow d-flex justify-content-between align-items-center" data-user-id="${user._id}">
        <div class="d-flex align-items-center">
          <img src="${user.profile_image}" class="rounded-circle" width=40 height=40>
          <p class="mb-0 ml-2 text-dark" style="cursor: pointer">
            <b class="text-primary mr-2">${user.role == "student" ? "O'quvchi." : 
                  user.role == "group-leader" ? "Guruh rahbari." :
                  user.role == "sub-admin" ? "Zauch." :
                  user.role == "teacher" ? `Fan o'qutivchisi <span class="text-success">[ ${user.subject.name} ]</span>` :
                  "Ma'naviyat hodimi."
                }</b>
            ${user.name} | <b>${user.fullName}</b></p>
        </div>
        <div class="controls">
          <a href="edit/${user._id}" class="btn btn-sm btn-outline-info">Tahrirlash</a>
        </div>
      </li>
    `)
    elUsersContainer.append(userHtml)
    updateElWidth()
  }

  $(".loading-modal").modal('hide')
}

$.ajax({
  type: 'GET',
  url: `${mainUrl}/api/v1/users/all`,

  success(res) {
    const data = res.data.sort((a, b) => {
      const x = a["role"]; const y = b["role"];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0))
    })
    data.splice( res.data.findIndex(item => item.role === "super-admin"), 1 )
    createUsers(data)
  },

  error(err) {
    console.error(err)
  }
})