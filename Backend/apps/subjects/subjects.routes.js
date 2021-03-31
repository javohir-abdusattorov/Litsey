
const ErrorResponse = require('../../utils/errorResponse')
const asyncHandler = require('../../middleware/async')

const Subject = require("./subject.model");

const Validation = require('../../utils/validationService')
const validation = new Validation()
const Service = require("./subjects.service")
const service = new Service()


module.exports = class SubjectsRoutes {

  // @desc      Get all subjects
  // @route     GET /api/v1/subjects/all
  // @access    Public
  getAllSubject = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults)
  })

  // @desc      Create subject
  // @route     POST /api/v1/subjects/create
  // @access    Private (Super-admin, sub-admin only)
  createSubject = asyncHandler(async (req, res, next) => {
    const result = validation.validateBody(req.body, [
      { name: "name_uz", type: "string" },
      { name: "name_ru", type: "string" },
    ])
    if (!result.success) return next(new ErrorResponse(result.message, 400))

    const { name_uz, name_ru } = req.body;
    const newSubject = await Subject.create({
    	name: {
    		uz: name_uz,
    		ru: name_ru
    	}
    })

    res.status(200).json({
      success: true,
      subject: newSubject,
    })
  })

  // @desc      Edit subject
  // @route     PUT /api/v1/subjects/edit/:id
  // @access    Private (Super-admin, sub-admin only)
  editSubject = asyncHandler(async (req, res, next) => {
    const result = await validation.validateSubjectID(req.params.id, next)
		if (!result.success) return next(new ErrorResponse(result.message, 404))
		let subject = result.data
  	const subjectField = ['uz', 'ru']

	  for (let field of subjectField) {
	    if (field in req.body) {
	      subject.name[field] = req.body[field]
	    }
	  }

	  await subject.save()

    res.status(200).json({
      success: true,
      subject: subject,
    })
  })

  // @desc      Remove subject
  // @route     DELETE /api/v1/subjects/delete/:id
  // @access    Private (Super-admin, sub-admin only)
  removeSubject = asyncHandler(async (req, res, next) => {
    let result = await validation.validateSubjectID(req.params.id, next)
		if (!result.success) return next(new ErrorResponse(result.message, 404))

	  await Subject.deleteOne({ _id: req.params.id })

    res.status(200).json({
      success: true,
    })
  })

}