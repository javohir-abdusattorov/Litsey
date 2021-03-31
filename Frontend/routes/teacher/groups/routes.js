const { Router } = require('express')
const router = Router()
const express = require('express')
const path = require('path')

router.use('/', express.static(path.join(__dirname, './main')))
router.use('/journal/:id', express.static(path.join(__dirname, './journal')))
router.use('/group/:id', express.static(path.join(__dirname, './detail')))
// router.use('/create', express.static(path.join(__dirname, './create')))


router.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, 'main/index.html'))
})

router.get("/journal/:id", (req, res) => {
	res.sendFile(path.join(__dirname, './journal/index.html'))
})

router.get("/group/:id", (req, res) => {
	res.sendFile(path.join(__dirname, './detail/index.html'))
})

//
// router.get("/create", (req, res) => {
// 	res.sendFile(path.join(__dirname, './create/index.html'))
// })

module.exports = router
