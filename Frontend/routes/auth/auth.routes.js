const { Router } = require('express')
const router = Router()
const express = require('express')
const path = require('path')

router.use('/login', express.static(path.join(__dirname, 'login')))

router.get("/login", (req, res) => {
	res.sendFile(path.join(__dirname, 'login/index.html'))
})

module.exports = router