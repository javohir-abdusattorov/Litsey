
$(".loading-modal").modal('show')

const elGroupsContainer = $(".groups-container")
const createGroups = (groups) => {
  elGroupsContainer.html(``)

  for (const group of groups) {
    const groupHtml = $(`
      <li class="list-group-item shadow d-flex justify-content-between align-items-center" data-group-id="${group._id}">
        <p class="mb-0" style="cursor: pointer"><a class="text-dark" href="group/${group._id}">${group.course}. ${group.name}</a></p>
        <div class="controls">
          <a href="edit/${group._id}" class="btn btn-sm btn-outline-success">Tahrirlash</a>
          <a href="/litsey/director/journals/group/${group._id}" class="btn btn-sm btn-outline-info">Jurnal</a>
          <a class="btn btn-sm btn-outline-danger">Disable</a>
        </div>
      </li>
    `)
    elGroupsContainer.append(groupHtml)
  }

  $(".loading-modal").modal('hide')
}

$.ajax({
  type: 'GET',
  url: `${mainUrl}/api/v1/groups/all`,

  success(res) {
    const data = res.data.sort((a, b) => a.course - b.course)
    createGroups(data)
  },

  error(err) {
    console.error(err)
  }
})
