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
        .email()
        .required()
        .escapeHTML()
        .messages({
            "string.email": 'You must enter a valid email address.',
            "string.empty": 'You must enter an email address.'
        })
}).unknown()

//regex string for all text input boxes
const regex = /^\w+[a-zA-Z0-9!#&()\-:;,.? ]+$/i

module.exports.sourceSchema = Joi.object({
    title: Joi.string()
        .required()
        .escapeHTML()
        .pattern(regex)
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
        .escapeHTML(),
    adminNotes: Joi.string()
        .escapeHTML()
        .pattern(regex)
        .max(500),
    book: Joi.object({
        author: Joi.array()
            .items(Joi.string()
                .max(80)
                .escapeHTML()
                .pattern(regex) 
            )
            .max(4)
            .unique(),
        publisher: Joi.string()
            .escapeHTML()
            .pattern(regex)
            .max(80),
        series: Joi.string()
            .escapeHTML()
            .pattern(regex)
            .max(80),
        releaseDate: Joi.date()
            .less('now')
            .iso(),
        isbn10: Joi.string()
            .escapeHTML()
            .pattern(regex)
            .max(50)
    }),
    movie: Joi.object({
        director: Joi.array()
            .items(Joi.string()
                .max(80)
                .escapeHTML()
                .pattern(regex)
            )
            .max(2)
            .unique(),
        writer: Joi.array()
            .items(Joi.string()
                .max(80)
                .escapeHTML()
                .pattern(regex)
            )
            .max(4)
            .unique(),
        releaseDate: Joi.date()
            .less('now')
            .iso(),
    }),
    comic: Joi.object({
        writer: Joi.string()
            .escapeHTML()
            .pattern(regex)
            .max(80),
        artist: Joi.array()
            .items(Joi.string()
                .max(80)
                .escapeHTML()
                .pattern(regex)
            )
            .max(4)
            .unique(),
        series: Joi.string()
            .escapeHTML()
            .pattern(regex)
            .max(80),
        issueNum: Joi.number()
            .integer()
            .max(101)
            .positive(),
        releaseDate: Joi.date()
            .less('now')
            .iso(),
    }),
    tv: Joi.object({
        series: Joi.string()
            .escapeHTML()
            .pattern(regex)
            .max(80),
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
        studio: Joi.string()
            .escapeHTML()
            .pattern(regex)
            .max(80),
        publisher: Joi.string()
            .escapeHTML()
            .pattern(regex)
            .max(80),
        releaseDate: Joi.date()
            .less('now')
            .iso(),
    })
})



