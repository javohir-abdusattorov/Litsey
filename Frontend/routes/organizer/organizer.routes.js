const { Router } = require('express')
const router = Router()
const express = require('express')
const path = require('path')

router.use('/attendance', require("./attendance/routes"))
router.use('/students', require("./students/routes"))
router.use('/news', require("./news/routes"))

router.use('/', express.static(path.join(__dirname, 'main')))
router.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, 'main/index.html'))
})


module.exports = router
