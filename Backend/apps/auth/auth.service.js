
const Validation = require('../../utils/validationService')
const validation = new Validation()
const FileService = require('../../utils/fileService')
const fileService = new FileService()


module.exports = class AuthService {

  sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    const role = user.role

    res.status(statusCode).json({
      success: true,
      token,
      role,
      user,
    })
  }

  uploadUserImage = async (files, next) => files && files.profile_image
    ? await fileService.uploadUserImage(files.profile_image, next)
    : process.env.USER_DEFAULT_PROFILE_IMAGE

}
