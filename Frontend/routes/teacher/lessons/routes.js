const { Router } = require('express')
const router = Router()
const express = require('express')
const path = require('path')

router.use('/', express.static(path.join(__dirname, './main')))
router.use('/create', express.static(path.join(__dirname, './create')))
router.use('/lesson/:id', express.static(path.join(__dirname, './detail')))
router.use('/swap', express.static(path.join(__dirname, './swap')))


router.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, 'main/index.html'))
})

router.get("/create", (req, res) => {
	res.sendFile(path.join(__dirname, './create/index.html'))
})

router.get("/lesson/:id", (req, res) => {
	res.sendFile(path.join(__dirname, './detail/index.html'))
})

router.get("/swap", (req, res) => {
	res.sendFile(path.join(__dirname, './swap/index.html'))
})

module.exports = router
