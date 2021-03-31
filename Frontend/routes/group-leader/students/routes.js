const { Router } = require('express')
const router = Router()
const express = require('express')
const path = require('path')

router.use('/', express.static(path.join(__dirname, './main')))
router.use('/create', express.static(path.join(__dirname, './create')))
router.use('/edit/:id', express.static(path.join(__dirname, './edit')))
router.use('/student/:id', express.static(path.join(__dirname, './detail')))

router.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, 'main/index.html'))
})

router.get("/create", (req, res) => {
	res.sendFile(path.join(__dirname, './create/index.html'))
})

router.get("/edit/:id", (req, res) => {
	res.sendFile(path.join(__dirname, './edit/index.html'))
})

router.get("/student/:id", (req, res) => {
	res.sendFile(path.join(__dirname, './detail/index.html'))
})

module.exports = router