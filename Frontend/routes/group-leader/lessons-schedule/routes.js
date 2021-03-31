const { Router } = require('express')
const router = Router()
const express = require('express')
const path = require('path')

router.use('/', express.static(path.join(__dirname, './main')))
router.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, 'main/index.html'))
})

module.exports = router