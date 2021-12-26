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
            "string.max": "Your username must be no more than 10 characters",
            "string.empty":"A username is required to register."
                }),
    password: Joi.string()
        .required()
        .escapeHTML(),
    email: Joi.string()
        .email({ tlds: {allow: false} })
        .required()
        .escapeHTML()
        .messages({
            "string.email": 'You must enter a valid email address.',
            "string.empty": 'You must enter an email address.'
        })
}).unknown()

//regex string for all text input boxes
const regex = /^\w+[a-zA-Z0-9!#&()\-:;,.? ]+$/i

const stringRulesMax = Joi.string().escapeHTML().pattern(regex).min(3).max(80)

const stringRulesNoMax = Joi.string().escapeHTML().pattern(regex).min(3)

const customStringErrors = {
    'string.pattern.base': '{{#label}} contains one or more illegal characters.',
    'string.min': '{{#label}} must be at least {{#limit}} characters.',
    'string.max': '{{#label}} must be less than {{#limit}} charaters.',
    'any.required': '{{#label}} is a required field.',
    'array.unique': '{{#label}} is a duplicate entry.'
}

//TODO:  Remove fields not in form and test if this still works
module.exports.sourceSchema = Joi.object({
    title: stringRulesNoMax
        .required()
        .max(100)
        .label('Title')
        .messages(customStringErrors),
    slug: Joi.string(),
    mediaType: Joi.string()
        .required()
        .valid('Movie', 'TV Show', 'Book', 'Comic', 'Video Game')
        .escapeHTML()
        .messages({
            'any.only': 'Please choose a Media Type.'
        }),
    state: Joi.string()
        .valid('new', 'update', 'approved', 'published', 'rejected'),
    author: Joi.array()
        .items(Joi.object())
        .max(5)
        .unique(),
    lastApprover: Joi.string()
        .escapeHTML(),
    adminNotes: stringRulesNoMax
        .max(500)
        .label('Admin Notes')
        .messages(customStringErrors),
    book: Joi.object({
        author: Joi.array()
            .items(
                stringRulesMax
                .label('Author')
                .messages(customStringErrors)
            )
            .max(4)
            .unique(),
        publisher: stringRulesMax
            .label('Publisher')
            .messages(customStringErrors),
        series: stringRulesMax
            .label('Book Series')
            .messages(customStringErrors),
        releaseDate: Joi.date()
            .less('now')
            .iso(),
        isbn10: stringRulesNoMax
            .max(50)
            .label('ISBN')
            .messages(customStringErrors)
    }),
    movie: Joi.object({
        director: Joi.array()
            .items(
                stringRulesMax
                .label('Director')
                .messages(customStringErrors)
            )
            .max(2)
            .unique(),
        writer: Joi.array()
            .items(
                stringRulesMax
                .label('Writer')
                .messages(customStringErrors)
            )
            .max(4)
            .unique(),
        releaseDate: Joi.date()
            .less('now')
            .iso(),
    }),
    comic: Joi.object({
        writer: stringRulesMax
            .label('Writer')
            .messages(customStringErrors),
        artist: Joi.array()
            .items(
                stringRulesMax
                .label('Art Contributor')
                .messages(customStringErrors)
            )
            .max(4)
            .unique(),
        series: stringRulesMax
            .label('Comic Series')
            .messages(customStringErrors),
        issueNum: Joi.number()
            .integer()
            .max(101)
            .positive(),
        releaseDate: Joi.date()
            .less('now')
            .iso(),
    }),
    tv: Joi.object({
        series: stringRulesMax
            .label("TV Series")
            .messages(customStringErrors),
        season: Joi.number()
            .integer()
            .max(20)
            .positive(),
        episode: Joi.number()
            .integer()
            .max(50)
            .positive(),
        releaseDate: Joi.date()
            .less('now')
            .iso(),
    }),
    videoGame: Joi.object({
        studio: stringRulesMax
            .label('Production Studio')
            .messages(customStringErrors),
        publisher: stringRulesMax
            .label('Publisher')
            .messages(customStringErrors),
        releaseDate: Joi.date()
            .less('now')
            .iso(),
    })
})



