const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
	teacher: {
		name: { type: String, required: true },
		teacher: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'User',
		}
	},
	group: {
		name: { type: String, required: true },
		subGroup: Number,
		lessonIndex: { type: Number, required: true },
		group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group'}
	},
	media: String,
	description: {
		type: String,
		required: true
	},
	homework: {
		description: {
			type: String,
			required: true
		},
		homeworkType: {
			type: String,
    	enum: JSON.parse(process.env.HOMEWORK_TYPES),
    	required: true
		},
		homeworks: [{
			student: {
				name: String,
				student: mongoose.Schema.Types.ObjectId
			},
			description: String,
			media: String,
			repost: Boolean,
			check: {
				isPassed: Boolean,
				message: String
			}
		}]
	}
}, {
	timestamps: true,
})

module.exports = mongoose.model('Lesson', Schema)
