
$(".loading-modal").modal('show')
let groups = []
const elGroupsContainer = $(".groups-container")

const createGroups = (groups) => {
  elGroupsContainer.html(``)

  for (const group of groups) {
    const groupHtml = $(`
      <li class="list-group-item shadow d-flex justify-content-between align-items-center" data-group-id="${group._id}">
        <p class="mb-0" style="cursor: pointer"><a class="text-dark" href="group/${group._id}">${group.course}. ${group.name}</a></p>
        <div class="controls">
          <a href="journal/${group._id}" class="btn btn-sm btn-outline-info">Jurnal</a>
        </div>
      </li>
    `)
    elGroupsContainer.append(groupHtml)
  }
}

const filterGroups = (groups, options) => {
  let result = [...groups]
  if (!isNaN(options.course)) result = [...result.filter(obj => obj.course === options.course)]
  if (options.search) {
    const q = new RegExp(options.search, "gi")
    result = [...result.filter(obj => obj.name.match(q))]
  }

  return result
}

$(".filter-form").on("submit", (evt) => {
  evt.preventDefault()
  const filterOptions = {
    course: +$("#filter-course").val().trim(),
    search: $("#group-search").val().trim()
  }
  const filteredGroups = filterGroups(groups, filterOptions)
  console.log(filteredGroups)
  createGroups(filteredGroups)
})

$.ajax({
  type: 'GET',
  url: `${mainUrl}/api/v1/groups/teacher`,
  headers: { "Authorization": accessToken },

  success(res) {
    console.log(res)
    const data = res.data.sort((a, b) => a.course - b.course)
    createGroups(data)
    groups = data
    $(".loading-modal").modal('hide')
  },

  error(err) {
    console.error(err)
  }
})
