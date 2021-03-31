const { Router } = require('express')
const router = Router()
const express = require('express')
const path = require('path')

router.use('/students', require("./students/routes"))
router.use('/journals', require("./journals/routes"))
router.use('/attendance', require("./attendance/routes"))
router.use('/lessons-schedule', require("./lessons-schedule/routes"))

router.use('/', express.static(path.join(__dirname, 'main')))
router.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, 'main/index.html'))
})


module.exports = router