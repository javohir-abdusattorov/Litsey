const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
	name: {
		uz: {
			type: String,
			required: true,
			unique: [true, "Bunday subject bor brat!"]
		},
		ru: {
			type: String,
			required: true,
			unique: [true, "Bunday subject bor brat!"]
		}
	}
}, {
	timestamps: true,
});

module.exports = mongoose.model('Subject', Schema);