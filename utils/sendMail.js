const nodemailer = require('nodemailer');
//nodemailer origin

let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

module.exports.sendVerifyMail = (email, verifyLink) => {
        
    //nodemailer message
    const message = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Please confirm your email address',
        text: 'Hey it worked',
        html: `<a href="http://localhost:3000/verify/${verifyLink}">Click here to verify your account</a>.  If you do not verify your account within 24 hours, you will have to start the registration process over.`
    }
        //calling nodemailer to send the message when the user is registered
        transporter.sendMail(message);
}

module.exports.sendResetMail = (email, verifyLink) => {
        
    //nodemailer message
    console.log(process.env.EMAIL_USER);
    const message = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        text: 'Hey it worked',
        html: `<a href="http://localhost:3000/forgotpassword/${verifyLink}">Click here to reset your password.</a>  If you did not request this, you may ignore this email or alert an admin.`
    }
            //calling nodemailer to send the message when the user is registered
        transporter.sendMail(message);
}