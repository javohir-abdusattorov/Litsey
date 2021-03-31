
const ErrorResponse = require('../../utils/errorResponse')
const asyncHandler = require('../../middleware/async')

const User = require("../users/user.model");
const Group = require('../groups/group.model');
const Journal = require('../journals/journal.model');

const UserService = require('../users/users.service')
const usersService = new UserService()
const Validation = require('../../utils/validationService')
const validation = new Validation()

const Service = require("./auth.service")
const service = new Service()

const update = async () => {
  let gg = await User.updateMany(
    {},
    { isLoggedIn: false }
  )
  console.log(gg);
}
// update()


module.exports = class AuthRoutes {

  // @desc      Register sub admin
  // @route     POST /api/v1/auth/register-subadmin
  // @access    Private ( Super-admin only )
  registerSubAdmin = asyncHandler(async (req, res, next) => {
    const result = validation.validateBody(req.body, [
      { name: "name", type: "string" },
      { name: "fullName", type: "string" },
      { name: "password", type: "string" }
    ])
    if (!result.success) return next(new ErrorResponse(result.message, 400))

    const { name, fullName, password } = req.body;
    const profile_image = await service.uploadUserImage(req.files, next)
    const user = await User.create({
      name,
      fullName,
      profile_image,
      password,
      role: "sub-admin"
    })

    res.status(200).json({
      success: true,
      user,
    })
  })

  // @desc      Register teacher
  // @route     POST /api/v1/auth/register-teacher
  // @access    Private ( Super-admin, sub-admin only )
  registerTeacher = asyncHandler(async (req, res, next) => {
    const result = await validation.validateWaterfall(
      validation.validateBody(req.body, [
        { name: "name", type: "string" },
        { name: "fullName", type: "string" },
        { name: "password", type: "string" },
        { name: "subject", type: "string" }
      ]),
      await validation.validateSubjectID(req.body.subject, next),
    )
    if (!result.success) return next(new ErrorResponse(result.message, 404))

    const { name, password, fullName } = req.body;
    const profile_image = await service.uploadUserImage(req.files, next)
    const subject = result.data[0]
    const user = await User.create({
      name,
      fullName,
      profile_image,
      password,
      subject: {
        name: subject.name.uz,
        subject: subject._id
      },
      role: "teacher"
    })

    res.status(200).json({
      success: true,
      user,
    })
  })

  // @desc      Register student
  // @route     POST /api/v1/auth/register-student
  // @access    Private ( Group-leader only )
  registerStudent = asyncHandler(async (req, res, next) => {
    const result = validation.validateBody(req.body, [
      { name: "name", type: "string" },
      { name: "fullName", type: "string" },
      { name: "password", type: "string" },
      { name: "subGroup", type: "number" },
    ])
    if (!result.success) return next(new ErrorResponse(result.message, 400))

    const group = await Group.findById(req.user.group)
    if (!group) return next(new ErrorResponse(`Bu guruh hozirda activ emas, ya'ni bitiruvchilar!`, 400))

    const { name, fullName, password, subGroup } = req.body;
    const studentFields = usersService.setStudentFields(req.body)
    if (studentFields.error) return next(new ErrorResponse(studentFields.message, 400))

    const profile_image = await service.uploadUserImage(req.files, next)
    const user = await User.create({
      name,
      fullName,
      profile_image,
      password,
      group: group._id,
      role: "student",
      student: { ...studentFields }
    })

    group.students.push({
      name: user.name,
      subGroup,
      student: user._id
    })
    await group.save()

    req.body = { student: user, group }
    next()
  })

  // @desc      Login user
  // @route     POST /api/v1/auth/login
  // @access    Public
  login = asyncHandler(async (req, res, next) => {
    let result = validation.validateBody(req.body, [
      { name: "name", type: "string" },
      { name: "password", type: "string" },
    ])

    if (!result.success) return next(new ErrorResponse(result.message, 400))
    const { name, password } = req.body;

    //Check for the user
    let user = await User.findOne({ name }).select("+password")
    if (!user) return next(new ErrorResponse(`Bunday foydalanuvchi topilmadi!`, 401))

    // Check passwords
    const isMatch = await user.matchPassword(password)
    if (!isMatch) return next(new ErrorResponse("Noto'g'ri parol", 401))

    if (!user.isActive) {
      let errMsg = ""
      if (user.role == "teacher" || user.role == "sub-admin" || user.role == "Group-leader") errMsg = "Ishdan bo'shatilgansiz!"
      else if (user.role == "student") errMsg = "Bitiruvchilar kira olmaydi!"
      return next(new ErrorResponse(errMsg, 401))
    }

    if (user.role == "teacher") {
      if (user.isLoggedIn) return next(new ErrorResponse(`Bu o'qituvchi hozirda boshqa qurilmadan kirgan. Bitta o'qituvchi bir vaqtda 2ta qurilmadan kira olmaydi!`))
      user.isLoggedIn = true
      await user.save()
    }

    service.sendTokenResponse(user, 200, res)
  })

  // @desc      Get authorized user
  // @route     GET /api/v1/auth/me
  // @access    Private
  getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  })

  // @desc      Logout user
  // @route     POST /api/v1/auth/logout
  // @access    Private
  logoutUser = asyncHandler(async (req, res, next) => {
    const logoutedUser = await User.findByIdAndUpdate(req.user._id, {
      isLoggedIn: false
    }, { new: true })

    res.status(200).json({
      success: true,
      data: logoutedUser,
    })
  })

}
