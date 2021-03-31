const { Router } = require('express')
const router = Router()
const express = require('express')
const path = require('path')

router.use('/groups', require("./groups/routes"))
router.use('/journals', require("./journals/routes"))
router.use('/subjects', require("./subjects/routes"))
router.use('/users', require("./users/routes"))

router.use('/', express.static(path.join(__dirname, 'main')))
router.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, 'main/index.html'))
})


module.exports = router