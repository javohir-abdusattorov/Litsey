const { Router } = require('express')
const router = Router()
const express = require('express')
const path = require('path')

router.use('/', express.static(path.join(__dirname, './main')))
router.use('/journal/:id', express.static(path.join(__dirname, './journal')))
router.use('/group/:id', express.static(path.join(__dirname, './group-journals')))

router.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, 'main/index.html'))
})

router.get("/group/:id", (req, res) => {
	res.sendFile(path.join(__dirname, './group-journals/index.html'))
})

router.get("/journal/:id", (req, res) => {
	res.sendFile(path.join(__dirname, './journal/index.html'))
})

module.exports = router