const Source = require('../models/source');
const ExpressError = require('../utils/expressError');

module.exports.renderNewSource = (req, res) => {
    res.render('sources/sources');
}

module.exports.newSource = async (req, res, next) => {
//TO DO: Handle duplicate errors.
        const source = new Source(req.body);
        //TO DO: Is this the proper way to add something to the object.
        source.state = 'review';


        const sourceSave = await source.save();
        req.flash('info', 'Your new Source has been submitted for approval.')
        res.redirect('/dashboard');
}