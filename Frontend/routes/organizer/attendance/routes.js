const { Router } = require('express')
const router = Router()
const express = require('express')
const path = require('path')

router.use('/', express.static(path.join(__dirname, 'main')))
router.use('/create', express.static(path.join(__dirname, 'create')))
router.use('/session', express.static(path.join(__dirname, 'session')))
router.use('/groups', express.static(path.join(__dirname, 'groups')))
router.use('/student/:id', express.static(path.join(__dirname, 'student')))

router.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, 'main/index.html'))
})

router.get("/create", (req, res) => {
	res.sendFile(path.join(__dirname, 'create/index.html'))
})

router.get("/session", (req, res) => {
	res.sendFile(path.join(__dirname, 'session/index.html'))
})

router.get("/groups", (req, res) => {
	res.sendFile(path.join(__dirname, 'groups/index.html'))
})

router.get("/student/:id", (req, res) => {
	res.sendFile(path.join(__dirname, 'student/index.html'))
})


module.exports = router
