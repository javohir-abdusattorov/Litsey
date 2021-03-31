const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: [true, "Bu ism qayd etilgan, iltimos boshqasini bilan urinib ko'ring" ],
    required: [true, 'Iltimos foydalanuvchi ismini kiriting!']
  },
  fullName: {
    type: String,
    required: [true, 'Iltimos ismingizni kiriting!']
  },
  profile_image: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  isLoggedIn: {
    type: Boolean,
    default: false,
  },
  subject: {
    name: String,
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    }
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
  },
  password: {
    type: String,
    required: [true, 'Iltimos parolni kiriting!'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: JSON.parse(process.env.USER_ROLES),
    required: true
  },
  student: {
    surname: String,
    patronymic: String,
    address: {
      region: {
        type: String,
        enum: JSON.parse(process.env.REGIONS)
      },
      district: String,
      exactAdress: String
    },
    phoneNumber: {
      type: String,
      minlength: 13,
      maxlength: 13,
    },
    identity: {
      series: String,
      numbers: String,
    },
    dateOfBirth: Date,
    whereLives: {
      type: String,
      enum: ["Ijarada", "Yotoqxona", "Oʻz uyida"]
    },
    currentAddress: {
      region: {
        type: String,
        enum: JSON.parse(process.env.REGIONS)
      },
      district: String,
      exactAdress: String
    },
    foreignLanguages: {
      type: [{
        language: String,
        level: {
          type: String,
          enum: ["A1", "A2", "B1", "B2", "C1", "C2"]
        }
      }],
      minlength: 1,
      default: undefined
    },
    parents: {
      father: {
        surname: String,
        name: String,
        workplace: String,
        phoneNumber: {
          type: String,
          minlength: 13,
          maxlength: 13,
        }
      },
      mother: {
        surname: String,
        name: String,
        workplace: String,
        phoneNumber: {
          type: String,
          minlength: 13,
          maxlength: 13,
        }
      },
    }
  }
}, {
  timestamps: true
})

// Hashing password with bcrypt
UserSchema.pre('save', async function(next){
  if(!this.isModified('password')) next()

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Sign & Get JWT token
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  })
}

// Match user entered password with hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword){
  return await bcrypt.compare(enteredPassword, this.password)
}

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex')

  // Hash token and set to resetPasswordToken
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  // Set expire
  this.resetPasswordExpire = Date.now() +10 * 60 * 1000

  return resetToken
}

module.exports = mongoose.model('User', UserSchema)