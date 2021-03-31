
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis')

const driveAuth = require('../google-drive/google-drive.auth.js')
const drive = google.drive({version: 'v3', auth: driveAuth})

const Config = require('../config/config.model')
const ErrorResponse = require('./errorResponse')
const DateService = require('./dateService')
const dateService = new DateService()


module.exports = class ImageService {

	#uploadFile = async (file, parentID, next) => {
		file.name = `${new Date().getTime() + 3}_${file.md5}${path.parse(file.name).ext}`
		const filePath = `./public/uploads/${file.name}`
		await file.mv(filePath)

	  const media = {
	    mimeType: file.mimetype,
	    body: fs.createReadStream(filePath)
	  }

	  const res = await drive.files.create({
	    resource: {
	    	name: file.name,
	    	parents: [parentID]
	    },
	    media,
	  })

	  const permissionRes = await drive.permissions.create({
	    fileId: res.data.id,
	    resource: {
        value: 'default',
        type: 'anyone',
		    role: "reader"
	    }
	  })

	  fs.unlinkSync(filePath)
	  return `https://drive.google.com/uc?export=get&id=${res.data.id}`
	}

	createSessionFolder = async (startDate, endDate, course) => {
		const folderName = `${course}-kurs [${dateService.convertDate(startDate)} / ${dateService.convertDate(endDate)}]`
		const res = await drive.files.create({
		  resource: {
		  	name: folderName,
		  	mimeType: 'application/vnd.google-apps.folder'
		  },
		  fields: 'id'
		})

		return res.data.id
	}

	uploadUserImage = async (file, next) => {
		const imagePath = await this.#uploadFile(file, process.env.DRIVE_USER_IMAGES_FOLDER_ID, next)
		return imagePath
	}

	uploadLessonMedia = async (file, course, next) => {
		const { courses } = await Config.findOne()
		if (!courses[course].sessionStarted) return next(`Serverda xatolik, iltimos dasturchilar bilan bo'glaning!`)
		const filePath = await this.#uploadFile(file, courses[course].driveID, next)
		return filePath
	}

	deleteFiles = (ids) => {
		for (const fileID of ids) {
		  drive.files.delete({ fileId: fileID }, (err, data) => {
		  	if (err) return new ErrorResponse("Error at deleting file: ", err)
		  })
		}
	}

}
