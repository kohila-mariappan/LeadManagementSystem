const joi = require("joi");
const statusCode = require('../utils.js/statusCode')

const userCreation = joi.object({
	FirstName:joi.string().required(),
	LastName: joi.string().required(),
    Email: joi.string().required(),
    Phone: joi.string().required(),
    Code: joi.string().required(),
	ProductId:joi.number().integer().required(),
    LeadLocation:joi.string().required(),
    IPAddress:joi.string().required(),
    Source:joi.string().allow(null),
    ReferredBy:joi.string().allow(null),
    Notes:joi.string().allow(null),
	loginUser: joi.number().integer().required()
});

const leadCreationValidation = async (req, res, next) => {
	const payload = {
		FirstName: req.body.FirstName,
		LastName: req.body.LastName,
		Email: req.body.Email,
		Phone: req.body.Phone,
        Code: req.body.Code,
		ProductId: req.body.ProductId,
		LeadLocation: req.body.LeadLocation,
		IPAddress: req.body.IPAddress,
		Source: req.body.Source,
		ReferredBy: req.body.ReferredBy,
		Notes: req.body.Notes,
        loginUser: req.body.loginUser
	};

	const { error } = userCreation.validate(payload);
	if (error) {
		const message = `Error in Request Data : ${error.message}`
        statusCode.successResponse(res,message)
	} else {
		next();
	}
};

module.exports = {
    leadCreationValidation
}