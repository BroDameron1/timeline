const Source = require('../models/source');
const ExpressError = require('../utils/expressError');

module.exports.renderNewSource = (req, res) => {
    res.render('sources/sources');
}

module.exports.newSource = async (req, res, next) => {
//TO DO: Handle duplicate errors without leaving the page?
//TO DO: Update duplicate error to pass custom message
//TO DO: Duplicate should only trigger on same TITLE and MEDIA TYPE
        const source = new Source.sourceReview(req.body);
        source.state = 'new';
        source.author = req.user._id;
        await source.save((err, doc) => {
            if (err) return next(err);
            req.flash('info', 'Your new Source has been submitted for approval.')
            res.redirect('/dashboard');
        });
}