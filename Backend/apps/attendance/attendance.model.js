const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
	attendance: [{
		date: Date,
		students: [{
			name: String,
			hasReason: Boolean,
			student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
			group: {
				name: String,
				group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }
			}
		}]
	}]
})

module.exports = mongoose.model('Attendance', Schema);