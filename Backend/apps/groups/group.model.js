const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: [true, "Ikkita bir xil nomi guruh yaratib bo'lmaydi!"]
	},
	course: {
		type: Number,
		enum: [1, 2],
		required: true,
	},
	faculty: {
		type: String,
		enum: JSON.parse(process.env.FACULTIES)
	},
	educationLang: {
		type: String,
		enum: ["uz", "ru", "en"]
	},
	isActive: {
		type: Boolean,
		default: true
	},
	leader: {
		type: String,
		required: true
	},
	lessonsSchedule: {
		type: [
			[{
				lessonType: {
					type: String,
					required: true,
					enum: ["custom", "changable", "dividable"]
				},
				custom: {
					subject: {
						name: String,
						subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }
					},
					teacher: {
						name: String,
						teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
					},
				},
				dividable: {
					subjects: {
						type: [{
							name: String,
							subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }
						}],
          	default: undefined
					},
					teachers: {
						type: [{
							name: String,
							teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
						}],
          	default: undefined
					},
				},
				changable: {
					currentSubject: {
						name: String,
						subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }
					},
					subjects: {
						type: [{
							name: String,
							subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }
						}],
          	default: undefined
					},
					teachers: {
						type: [{
							name: String,
							teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
						}],
          	default: undefined
					},
				}
			}]
		],
		minlength: 4,
		maxlength: 6,
	},
	students: [{
		name: String,
		subGroup: {
			type: Number,
			enum: [1, 2]
		},
		student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
	}],
}, {
	timestamps: true,
});

module.exports = mongoose.model('Group', Schema);