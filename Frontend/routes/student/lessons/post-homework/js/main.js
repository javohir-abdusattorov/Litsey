
$(".loading-modal").modal('show')

let lesson
let textEditor
const lessonID = getID()

const createLessonInfo = (lesson) => {
  const hwType = lesson.homework.homeworkType
  if (lesson.group.group !== _user.group) return redirect(`../../lesson/${lessonID}`)

  const now = new Date()
  const deadline = new Date(lesson.createdAt).addHours(homeworkDeadline) - now <= 0
  const hw = lesson.homework.homeworks.filter(item => item.student.student == _user._id).last()
  const notAllowed = deadline || new Date(lesson.createdAt) > now || (hw && !hw.check) || (hw && hw.check && hw.check.isPassed)

  if (notAllowed) return redirect(`../../lesson/${lessonID}`)
  if (hw && hw.check && !hw.check.isPassed) {
    $("h2").html(`Dars <span class="text-primary" style="cursor: pointer">#${lesson._id}</span>'ga qayta vazifa topshirish`)
  } else {
    $("h2 span").text("#" + lesson._id)
  }

  if (hwType == "image") {
    $(".lesson-hwtype span").text("Rasm")
    $("#homework-form .media").append(`
      <div class="custom-file homework-media">
        <input type="file" accept="image/*" class="custom-file-input" id="media">
        <label class="custom-file-label" for="media">Vazifani yuklash (JPEG/JFIF, PNG, WebP, TIFF, BMP...)</label>
      </div>
    `)
  } else if (hwType == "video") {
    $(".lesson-hwtype span").text("Video")
    $("#homework-form .media").append(`
      <div class="custom-file homework-media">
      <input type="file" accept="video/mp4,video/x-m4v,video/*" class="custom-file-input" id="media">
      <label class="custom-file-label" for="media">Vazifani yuklash (WEBM, FLV, OGG, GIF, AVI, MP4...)</label>
      </div>
    `)
  } else if (hwType == "pdf") {
    $(".lesson-hwtype span").text("PDF Fayl")
    $("#homework-form .media").append(`
      <div class="custom-file homework-media">
      <input type="file" accept=".pptx,.txt,.pdf" class="custom-file-input" id="media">
      <label class="custom-file-label" for="media">Vazifani yuklash (PDF)</label>
      </div>
    `)
  } else if (hwType == "exel") {
    $(".lesson-hwtype span").text("Excel elektron jadvali")
    $("#homework-form .media").append(`
      <div class="custom-file homework-media">
      <input type="file" accept=".xlsx,.xls" class="custom-file-input" id="media">
      <label class="custom-file-label" for="media">Vazifani yuklash (XLSX, XLS)</label>
      </div>
    `)
  } else if (hwType == "word") {
    $(".lesson-hwtype span").text("WORD Hujjat")
    $("#homework-form .media").append(`
      <div class="custom-file homework-media">
      <input type="file" accept=".doc, .docx" class="custom-file-input" id="media">
      <label class="custom-file-label" for="media">Vazifani yuklash (DOC, DOCX)</label>
      </div>
    `)
  } else if (hwType == "power-point") {
    $(".lesson-hwtype span").text("Power point ko'rgazma")
    $("#homework-form .media").append(`
      <div class="custom-file homework-media">
      <input type="file" accept=".ppt, .pptx" class="custom-file-input" id="media">
      <label class="custom-file-label" for="media">Vazifani yuklash (PPT, PPTX)</label>
      </div>
    `)
  } else if (hwType == "archive") {
    $(".lesson-hwtype span").text("Arxiv fayl")
    $("#homework-form .media").append(`
      <div class="custom-file homework-media">
      <input type="file" accept=".7z, .rar, .tar.gz, .tgz, .zip, .zipx" class="custom-file-input" id="media">
      <label class="custom-file-label" for="media">Vazifani yuklash (7z, RAR, TAR.GZ, TGZ, ZIP)</label>
      </div>
    `)
  } else {
    $(".lesson-hwtype span").text("Tekst")
    $("#homework-form .media").append(`
      <div class="text-editor">
        <div id="toolbar" class="rounded-top"></div>
        <div id="editor" class="rounded-bottom"></div>
      </div>
    `)
    textEditor = new Quill('#editor', {
      modules: { toolbar: toolbarOptions },
      placeholder: 'Matn kiriting',
      theme: 'snow'
    })
    $(".ql-toolbar").addClass("rounded-top")
  }
}

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ 'header': 1 }, { 'header': 2 }],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'script': 'sub'}, { 'script': 'super' }],
  [{ 'indent': '-1'}, { 'indent': '+1' }],
  [{ 'size': ['small', false, 'large', 'huge'] }],
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'font': [] }],
  [{ 'align': [] }],
  ['clean']
];

(async () => {
  await checkAuthAsync(accessToken);
  [lesson] = await getLesson({ _id: lessonID })
  createLessonInfo(lesson)
  $(".loading-modal").modal('hide')
  $("input[type='file']").on("change", (evt) => $(evt.target).parent().find("label").text($(evt.target).val().split('\\').last()))
})()

$("#homework-form").on("submit", (evt) => {
  evt.preventDefault()
  $(".validation-error").text(``)
  $(".loading-modal").modal('show')

  const data = new FormData()
  const hwType = lesson.homework.homeworkType

  if (hwType == "text") {
    const val = $(".text-editor #editor .ql-editor").html()
    if (!val) return $(".validation-error").text(`Iltimos tekstni to'ldiring`)
    data.append("media", val)
  } else {
    if (!$(".homework-media #media").val()) return $(".validation-error").text(`Iltimos media faylni yuklang`)
    data.append("media", $('.homework-media #media')[0].files[0])
  }
  if (!getVal("#description")) return $(".validation-error").text(`Iltimos vazifaga tavsif kiriting`)
  data.append("description", getVal("#description"))

  $.ajax({
    type: 'POST',
    url: `${mainUrl}/api/v1/lessons/post-homework/${lesson._id}`,
    dataType: 'json',
    contentType: 'application/json',
    data,
    processData: false,
    contentType: false,
    headers: { "Authorization": accessToken },

    success(res) {
      $(".validation-error").removeClass("text-danger").addClass("text-success").text("Vazifa muvaffiqiyatli ustozga jo'natildi")
      $(".loading-modal").modal('hide')
	  	setTimeout(() => redirect(`../../lesson/${lessonID}`), 5000)
      console.log(res)
    },

    error(err) {
      console.log(err.responseJSON)
      $(".loading-modal").modal('hide')
      $(".validation-error").text(err.responseJSON.error)
    }
  })
})
