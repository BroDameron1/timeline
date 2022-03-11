const BaseJoi = require('joi'); //pull in Joi library
const sanitizeHtml = require('sanitize-html'); //pull in santizeHTML library 

const extension = (joi) => ({  //this function creates a custom rule for Joi that errors out submissions that include HTML by leveraging the sanitizeHTML library to identify it.  I did not write this, no idea how it works.
//More here: https://joi.dev/api/?v=17.5.0#anycustommethod-description
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

const Joi = BaseJoi.extend(extension) //adds the previously defined rule to a new object

module.exports.userSchema = Joi.object({ //schema validation for user data.  TODO: Check if the password regex is checked elsewhere.
    //TODO: Can we now leverage this on the front end.
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
}).unknown() //allows for information not defined in the schema to be added to the DB and not validated. TODO: Should we just check all fields.

//regex string for all text input boxes.  Must star with a letter and includes any number of the defined characters after that.
const regex = /^\w+[a-zA-Z0-9!#&()\-:;,.'? ]*$/i

const stringRulesMax = Joi.string().escapeHTML().pattern(regex).min(3).max(80) //defines the validations for a string with a max length.  Checks against regex.

const stringRulesNoMax = Joi.string().escapeHTML().pattern(regex).min(3) //defines the validations for a string with no max length. Checks against regex.

const customStringErrors = { //Defines the custom errors that will appear to the user.
    'string.pattern.base': '{{#label}} contains one or more illegal characters.',
    'string.min': '{{#label}} must be at least {{#limit}} characters.',
    'string.max': '{{#label}} must be less than {{#limit}} charaters.',
    'any.required': '{{#label}} is a required field.',
    'array.unique': '{{#label}} is a duplicate entry.'
}

//schema for validating the Source form entries.
module.exports.sourceSchema = Joi.object({
    title: stringRulesNoMax
        .required()
        .max(100)
        .label('Title') //labels are for the error message.
        .messages(customStringErrors),
    mediaType: Joi.string()
        .required()
        .valid('Movie', 'TV Show', 'Book', 'Comic', 'Video Game')
        .escapeHTML()
        .messages({
            'any.only': 'Please choose a Media Type.'
        }),
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
            .unique()
            .label('Author')
            .messages(customStringErrors),
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
            .unique()
            .label('Director')
            .messages(customStringErrors),
        writer: Joi.array()
            .items(
                stringRulesMax
                .label('Writer')
                .messages(customStringErrors)
            )
            .max(4)
            .unique()
            .label('Writer')
            .messages(customStringErrors),
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
            .unique()
            .label('Writer')
            .messages(customStringErrors),
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

module.exports.eventSchema = Joi.object({
    title: stringRulesNoMax
        .required()
        .max(100)
        .label('Title') //labels are for the error message.
        .messages(customStringErrors),
    adminNotes: stringRulesNoMax
        .max(500)
        .label('Admin Notes')
        .messages(customStringErrors),
    eventDate: Joi.object({
        year: Joi.number()
            .label('Year')
            .allow(0)
            .required(),
        notation: Joi.string()
            .required()
            .valid('BBY', 'BBY/ABY', 'ABY')
            .escapeHTML()
            .messages({
                'any.only': 'Please choose a Notation.'
        }),
    })
})

