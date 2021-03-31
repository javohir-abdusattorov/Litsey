const { Router } = require('express')
const router = Router()
const express = require('express')
const path = require('path')

router.use('/groups', require("./groups/routes"))
router.use('/lessons', require("./lessons/routes"))

router.use('/', express.static(path.join(__dirname, 'main')))
router.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, 'main/index.html'))
})

module.exports = router
