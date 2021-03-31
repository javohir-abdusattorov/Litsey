const { Router } = require('express')
const router = Router()
const express = require('express')
const path = require('path')

router.use('/', express.static(path.join(__dirname, './main')))
router.use('/create-subadmin', express.static(path.join(__dirname, './create-subadmin')))
router.use('/create-teacher', express.static(path.join(__dirname, './create-teacher')))
router.use('/edit/:id', express.static(path.join(__dirname, './edit')))

router.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, 'main/index.html'))
})

router.get("/create-subadmin", (req, res) => {
	res.sendFile(path.join(__dirname, 'create-subadmin/index.html'))
})

router.get("/create-teacher", (req, res) => {
	res.sendFile(path.join(__dirname, 'create-teacher/index.html'))
})

router.get("/edit/:id", (req, res) => {
	res.sendFile(path.join(__dirname, 'edit/index.html'))
})

module.exports = router