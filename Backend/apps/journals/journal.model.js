const mongoose = require('mongoose')

const scoreType = {
	scoreID: { type: String, required: true },
	score: {
		type: Number,
		min: 0,
		max: 5,
	},
	attendance: {
		attendance: Boolean,
		hasReason: Boolean
	},
	date: {
		type: Date,
		required: true
	}
}

const Schema = new mongoose.Schema({
	student: {
		name: { type: String, required: true },
		student: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'User',
	    required: true,
		},
		group: {
			name: { type: String, required: true },
			subGroup: { type: Number, required: true },
			group: {
		    type: mongoose.Schema.Types.ObjectId,
		    ref: 'Group',
		    required: true,
			}
		},
	},
	isActive: {
		type: Boolean,
		default: true
	},
	subjects: [{
		name: { type: String, required: true },
		subject: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'Subject',
	    required: true
		},
		inWeek: { type: Number, required: true },
		sessions: [{
			sessionID: { type: String, required: true },
			sessionScore: { type: Number, min: 0, max: 5 },
			lastScore: scoreType,
			intermediate: {
				averageScore: { type: Number, min: 0, max: 5, default: 0 },
				scores: [scoreType]
			},
			current: {
				averageScore: { type: Number, min: 0, max: 5, default: 0 },
				currents: [[scoreType]]
			},
			startedAt: {
				type: Date,
				required: true
			}
		}],
	}],
}, {
	timestamps: true,
})

module.exports = mongoose.model('Journal', Schema);