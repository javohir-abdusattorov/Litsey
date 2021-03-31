
module.exports = class LessonsService {

  isHomeworkRepost = (lesson, studentID) => {
    const homework = lesson.homework.homeworks.find(item => item.student.student.toString() === studentID)
    if (!homework) return [true, false]
    if (!homework.check) return [false, null, `Siz uy vazifa topshirgansiz va uy vazifangiz hali ustoz tomonidan tekshirilmagan`]
    if (homework.check.isPassed) return [false, null, `Uy vazifangiz ustoz tekshiruvidan muvaffiqiyatli o'tgan`]
    if (!homework.check.isPassed) return [true, true]
  }

  checkFileType = (file, type) => {
    const fileMimeType = file.mimetype.split('/')[0]
    const fileFormat = file.name.split('.').last()

    const pdfTypes = ["pdf"]
    const exelTypes = ["xlsx", "xlsm", "xlsb", "xltx", "xltm", "xls", "xlt", "csv"]
    const wordTypes = ["doc", "docm", "docx", "dot", "dotm", "dotx"]
    const powerpointTypes = ["potm", "pot", "potx", "ppa", "ppam", "pps", "ppsm", "ppsx", "ppt", "pptx"]
    const archiveTypes = ["7z", "rar", "tar.gz", "tgz", "zip", "zipx"]

    if (type == "image" && fileMimeType == "image") return true
    else if (type == "video" && fileMimeType == "video") return true
    else if (type == "pdf" && pdfTypes.includes(fileFormat)) return true
    else if (type == "exel" && exelTypes.includes(fileFormat)) return true
    else if (type == "word" && wordTypes.includes(fileFormat)) return true
    else if (type == "power-point" && powerpointTypes.includes(fileFormat)) return true
    else if (type == "archive" && archiveTypes.includes(fileFormat)) return true

    return false
  }

}

Array.prototype.last = function() { return this[this.length - 1] }
