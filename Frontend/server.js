const path = require('path')
const express = require('express')
const cors = require('cors')
const app = express()

// Load dev middlewares
if(process.env.NODE_ENV === 'development') app.use(morgan('dev'))

// Enable CORS
app.use(cors())

// Set static folder
// app.use(express.static(path.join(__dirname, 'public')))
app.use('/assets', express.static(path.join(__dirname, 'assets')))

// Registr routes
app.use('/auth', require('./routes/auth/auth.routes'))
app.use('/litsey/settings', require('./routes/settings/settings.routes'))

app.use('/litsey/director', require('./routes/director/director.routes'))
app.use('/litsey/group-leader', require('./routes/group-leader/groupLeader.routes'))
app.use('/litsey/organizer', require('./routes/organizer/organizer.routes'))
app.use('/litsey/student', require('./routes/student/student.routes'))
app.use('/litsey/teacher', require('./routes/teacher/teacher.routes'))

const PORT = process.env.PORT || 8000

const server = app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`)
})
