const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
})

const Joi = BaseJoi.extend(extension)

module.exports.userSchema = Joi.object({
    username: Joi.string()
        .required()
        .alphanum()
        .min(5)
        .max(10)
        .escapeHTML()
        .messages({
            "string.alphanum": 'Your username may only contain letters and numbers.',
            "string.min": "Your username must be at least 5 characters.",
            "string.max": "Your username must be no more than 10 charaters",
            "string.empty":"A username is required to register."
                }),
    password: Joi.string()
        .required()
        .escapeHTML(),
    email: Joi.string()
        .email()
        .required()
        .escapeHTML()
        .messages({
            "string.email": 'You must enter a valid email address.',
            "string.empty": 'You must enter an email address.'
        })
}).unknown()

module.exports.sourceSchema = Joi.object({
    title: Joi.string()
        .required()
        //add a regex pattern to match against
        //.pattern()
        .escapeHTML()
        .min(3)
        .max(100),
    slug: Joi.string(),
    mediaType: Joi.string()
        .required()
        .valid('Movie', 'TV Show', 'Book', 'Comic', 'Video Game')
        .escapeHTML(),
    state: Joi.string()
        .valid('new', 'update', 'approved', 'published', 'rejected'),
    author: Joi.array()
        .items(Joi.object())
        .max(5)
        .unique(),
    lastApprover: Joi.string()
        .alphanum()
        .escapeHTML(),
    //TODO: Can validate date?
    // updateDate: Joi.date(),
    //     .greater('now')
    //     .iso(),
    adminNotes: Joi.string()
        .alphanum()
        .escapeHTML()
        .max(500)
}).unknown()