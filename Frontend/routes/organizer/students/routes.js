const { Router } = require('express')
const router = Router()
const express = require('express')
const path = require('path')

router.use('/', express.static(path.join(__dirname, 'main')))
router.use('/student/:id', express.static(path.join(__dirname, 'detail')))

router.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, 'main/index.html'))
})

router.get("/student/:id", (req, res) => {
	res.sendFile(path.join(__dirname, 'detail/index.html'))
})

module.exports = router
