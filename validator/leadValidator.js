const joi = require("joi");
const statusCode = require('../utils/statusCode')

const leadCreation = joi.object({
	FirstName:joi.string().required(),
	LastName: joi.string().required(),
    Email: joi.string().required(),
    Phone: joi.string().required(),
	ProductId:joi.number().integer().required(),
    LeadLocation:joi.string().required(),
    IPAddress:joi.string().required(),
    Source:joi.string().allow(null,''),
    ReferredBy:joi.string().allow(null,''),
    Notes:joi.string().allow(null,'')
});

const leadCreationValidation = async (req, res, next) => {
	const payload = {
		FirstName: req.body.FirstName,
		LastName: req.body.LastName,
		Email: req.body.Email,
		Phone: req.body.Phone,
		ProductId: req.body.ProductId,
		LeadLocation: req.body.LeadLocation,
		IPAddress: req.body.IPAddress,
		Source: req.body.Source,
		ReferredBy: req.body.ReferredBy,
		Notes: req.body.Notes
	};

	const { error } = leadCreation.validate(payload);
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