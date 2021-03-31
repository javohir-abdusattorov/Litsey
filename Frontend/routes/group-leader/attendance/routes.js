const { Router } = require('express')
const router = Router()
const express = require('express')
const path = require('path')

router.use('/', express.static(path.join(__dirname, './main')))
router.use('/session', express.static(path.join(__dirname, './session')))

router.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, 'main/index.html'))
})

router.get("/session", (req, res) => {
	res.sendFile(path.join(__dirname, './session/index.html'))
})

module.exports = router