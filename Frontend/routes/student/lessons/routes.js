const { Router } = require('express')
const router = Router()
const express = require('express')
const path = require('path')

router.use('/', express.static(path.join(__dirname, './main')))
router.use('/post-homework/:id', express.static(path.join(__dirname, './post-homework')))
router.use('/lesson/:id', express.static(path.join(__dirname, './detail')))
router.use('/homework/:id', express.static(path.join(__dirname, './homework')))


router.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, 'main/index.html'))
})

router.get("/post-homework/:id", (req, res) => {
	res.sendFile(path.join(__dirname, './detail/index.html'))
})

router.get("/lesson/:id", (req, res) => {
	res.sendFile(path.join(__dirname, './detail/index.html'))
})

router.get("/homework/:id", (req, res) => {
	res.sendFile(path.join(__dirname, './homework/index.html'))
})

module.exports = router
