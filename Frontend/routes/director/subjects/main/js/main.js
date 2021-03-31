
$(".loading-modal").modal('show')

const elSubjectsContainer = $(".subjects-container")
const createSubjects = (subjects) => {
  elSubjectsContainer.html(``)

  for (const subject of subjects) {
    const subjectHtml = $(`
      <li class="list-group-item shadow d-flex justify-content-between align-items-center" data-subject-id="${subject._id}">
        <p class="mb-0 text-dark" style="cursor: pointer">${subject.name.uz}</p>
        <div class="controls">
          <a href="edit/${subject._id}" class="btn btn-sm btn-outline-info">Tahrirlash</a>
        </div>
      </li>
    `)
    elSubjectsContainer.append(subjectHtml)
  }

  $(".loading-modal").modal('hide')
}

$.ajax({
  type: 'GET',
  url: `${mainUrl}/api/v1/subjects/all`,

  success(res) {
    createSubjects(res.data)
    subjects = res.data
  },

  error(err) {
    console.error(err)
  }
})