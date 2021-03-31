const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
	courses: {
		"1": {
			sessionStarted: {
				type: Boolean,
				default: false
			},
			startedAt: Date,
			endDate: Date,
			weeks: Number,
			driveID: String
		},
		"2": {
			sessionStarted: {
				type: Boolean,
				default: false
			},
			startedAt: Date,
			weeks: Number,
			driveID: String
		}
	}
})

module.exports = mongoose.model('Config', Schema)
