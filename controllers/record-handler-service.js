const duplicateChecker = require('../utils/duplicateChecker') //pull in duplicatechecker functions
const { ImageHandler } = require('../utils/cloudinary') //pull in imagehandler class
const mongoose = require('mongoose');
const ReviewMaster = require('../models/review');



class RecordHandler {
    constructor(req, res, recordProps, template) {
        this.req = req //request data including body from express
        this.res = res //response data from express
        this.recordProps = recordProps //recordProps are sent it from the controller which pulls them from the related DB collection.
        this.template = template || null //the EJS template that will be used to render the related request
        this.redirectUrl = '/dashboard' //redirecturl for issues that redirect the user.
    }

    //method to lookup data when given a recordId or slug
    async dataLookup() { //parameter determines if we are looking in the review or public collection
        const { slug, recordId } = this.req.params //pulls out the slug OR recordId from the req object
        let data
        if (slug) { //if there is a slug, query by that to find the record and provide the author and last approver usernames.
            data = await mongoose.model(this.recordProps.public).findOne({ slug })
                .populate('author', 'username') //TODO: What is username here?!
                .populate('lastApprover', 'username')
        } else { //if there is a recordId, query by that and find the record and provide the author and last approver usernames.
            data = await mongoose.model(this.recordProps.review).findById(recordId)
                .populate('author', 'username')
                .populate('lastApprover', 'username')
        }
        return data
    }

    //method for publishing a record from the review queue to the public queue
    async publishReviewRecord() {
        const { recordId } = this.req.params
        let reviewData = await this.dataLookup()
        let publicData = await mongoose.model(this.recordProps.public).findById(reviewData.publicId) //queries to see if there is a public record already associated with the review record (in the case of an updated record rather than a new one)
        if (!publicData) {
            publicData = new mongoose.model(this.recordProps.public)(this.req.body) //if no record exists, create a new object based on the collection model
        } else {
            publicData.set({ ...this.req.body }) //if one does exist, set the properties to the request body
        }
        const duplicateCheck = await duplicateChecker.publishRecord(publicData.recordProps, recordId) //send appropriate data to the publishrecord duplicaterecord checker
        if (duplicateCheck) return this.duplicateError() //if there is a duplicate record, error out the submission.  This is redundant of the front end functionality just in case.
        if (reviewData.author[0].equals(this.req.user._id)) { //checks to ensure an admin isn't publishing their own record.
            this.req.flash('error', "You can't approve your own article you weirdo. How did you even get here?")
            return this.res.redirect(this.redirectUrl)
        }
        if (this.req.file) { //checks if a new image got uploaded DURING the publish process
            const image = new ImageHandler(this.req.file, publicData, this.recordProps) //instantiates a new imagehandler class. Sends the NEW file data through if uploaded during the approval.
            await image.publishImage() //uses the publishimage method to update the record
        } else {
            const image = new ImageHandler(reviewData.images, publicData, this.recordProps) //instantiates a new imagehandler class.  If no new file was upload during the approval process, sends the image data that already exists in the review record
            await image.publishImage() //uses the publish image method to update the record
        }
        publicData.state = 'published' //update the other public data properties
        publicData.lastApprover = this.req.user._id
        publicData.checkedOut = false
        publicData.adminNotes = ''
        this.updateAuthor(publicData, reviewData.author[0]) //calls the updateAuthor method to add a new author in the right spot
        await publicData.save()
        reviewData.adminNotes = this.req.body.adminNotes //update the other review data properties
        reviewData.lastApprover = this.req.user._id
        reviewData.state = 'approved'
        await reviewData.save()
        this.res.redirect(this.template+publicData.slug) //redirects to the newly published record
    }

    //method that updates a review record if a user makes changes after intial submission
    async editReviewRecord() {
        const reviewData = await this.dataLookup() //lookup the review record
        reviewData.set({ ...this.req.body }) //sets all the properties in the review record to match the request body
        if (this.req.file) { //checks if a new image was uploaded during this edit
            const image = new ImageHandler(this.req.file, reviewData, this.recordProps) //instantiates a new imagehandler class and sends the new image data to it
            await image.updateReviewImage() //uses the updatereviewimage method to update the record
        }
        const duplicateCheck = await duplicateChecker.editReview(reviewData.recordProps)  //sends data to the editreview duplicatechecker function
        if (duplicateCheck) return this.duplicateError() //if there is a duplicate record, error out the submission.  This is redundant of the front end functionality just in case.
        reviewData.checkedOut = false
        await reviewData.save()
        this.req.flash('info', 'Your changes have been saved successfully.')
        this.res.redirect(this.redirectUrl)
    }

    //method that creates a review record if someone submits an update to a public record
    async editPublicRecord() {
        const publicData = await this.dataLookup() //look up the current public record
        const reviewData = new mongoose.model(this.recordProps.review)(this.req.body) //creates a new object for the review queue based on the request body.
        const duplicateCheck = await duplicateChecker.editPublic(reviewData.recordProps, publicData._id) //sends data to the editpublic duplicate checker
        if (duplicateCheck) { //if there is a duplicate record, error out the submission.  This is redundant of the front end functionality just in case.
            this.req.flash('error', 'This record already exists.')
            return this.res.redirect(this.template+publicData.slug)  //sends user back to the original public record
        }
        if (this.req.file) { //checks if a new image was added
            reviewData.images = { path: this.req.file.path, filename: this.req.file.filename} //if so, updates the review record data with the new image data
        } else {
            reviewData.images.path = publicData.images.path //if not, carries over the original public image data to the review record
            reviewData.images.filename = publicData.images.filename
        }
        reviewData.author.unshift(this.req.user._id) //updates other review record data, including adding the new author to that record (but not the public)
        reviewData.publicId = publicData._id;
        reviewData.state = 'update';
        await reviewData.save()
        publicData.checkedOut = true;
        await publicData.save()
        this.req.flash('info', 'Your update request has been submitted')
        this.res.redirect(this.redirectUrl)
    }

    //method that allows an admin to delete a public record
    async deletePublicRecord() {
        const publicData = await this.dataLookup() //lookup the public record requested
        await publicData.remove() //delete the record
        this.res.redirect(this.redirectUrl) //redirect user to default url
    }

    //method that allows a user to delete a record in thier review queue
    async deleteReviewRecord() {
        const reviewData = await this.dataLookup() //lookup the review record data
        await reviewData.remove()        

        if (reviewData.publicId) { //checks to see if the review record is related to existing public record
            const publicData = await mongoose.model(this.recordProps.public).findById(reviewData.publicId) //if so, finds the public record
            publicData.checkedOut = false //sets the checkout flag to false on the public record
            publicData.save()
        }

        await ReviewMaster.findOneAndRemove({ reviewRecord: reviewData._id }) //this line deletes the master review record used for rendering the dashboard.

        this.req.flash('info', 'Your submission was successfully deleted.')
        this.res.redirect(this.redirectUrl)
    }

    //method that allows a new record to be published to the review queue
    async createNewRecord() {
        const reviewData = new mongoose.model(this.recordProps.review)(this.req.body) //creates a new review record object with the data from the request body
        const duplicateCheck = await duplicateChecker.submitNew(reviewData.recordProps) //runs the data through submitnew duplicate checker
        if (duplicateCheck) return this.duplicateError() //if there is a duplicate record, error out the submission.  This is redundant of the front end functionality just in case.
        if(this.req.file) { //checks if there is an image uploaded
            const image = new ImageHandler(this.req.file, reviewData, this.recordProps) //if so, instantiates a new instance of the imagehandler class with the new file
            image.newReviewImage() //runs the newreviewimage method to add the file information to the new review record
        }
        reviewData.author.unshift(this.req.user._id)
        reviewData.state = 'new' //sets new review record status
        await reviewData.save()
        this.req.flash('info', `Your new ${reviewData.recordType} has been submitted for approval.`)
        return this.res.redirect(this.redirectUrl);
    }

    //can be called to create an error when there is a duplicate record (not for submitting changes to a public record since there is a different redirect)
    duplicateError() {
        this.req.flash('error', 'This record already exists.')
        this.res.redirect(this.redirectUrl)
    }

    //method to render any EJS template
    async renderPage(data, staticFields) { //parameters accepted are the data needing to be rendered (either review or public) and any static fields that pull their values from the database model
        console.log(staticFields, 'here')
        // const staticFieldOptions = new Object() //creates a new object to store static values
 
        // if (staticFields) { //checks if there are static values
        //     for (let field of staticFields) { //if so, loops through each field that can be a static value and collects them into the object.
                
        //         staticFieldOptions[field] = await mongoose.model(this.recordProps.review).schema.path(field).enumValues  //Each key is the field name with an an associated array of options pulled from database model
        //     }
        // }

        // //this works
        // function deepen(obj) {
        //     const result = {};
          
        //     // For each object path (property key) in the object
        //     for (const objectPath in obj) {
        //       // Split path into component parts
        //       const parts = objectPath.split('.');
          
        //       // Create sub-objects along path as needed
        //       let target = result;
        //       while (parts.length > 1) {
        //         const part = parts.shift();
        //         target = target[part] = target[part] || {};
        //       }
          
        //       // Set value at end of path
        //       target[parts[0]] = obj[objectPath]
        //     }
          
        //     return result;
        //   }

        // //   console.log(deepen(staticFieldOptions), 'test')

        //   const staticFieldOptions2 = deepen(staticFieldOptions)
        //   console.log(staticFieldOptions2, 'test')
        // const staticFieldOptions2 = DataObjectParser.transpose(staticFieldOptions)
        // console.log(staticFieldOptions2, 'here2')
        console.log(data.mediaType, 'data')
        return this.res.render(this.template, {data, staticFields})
        //TODO: Replicate this for sources!
        // return this.res.render(this.template, { data, staticFieldOptions2 }) //renders the page with the data and the options for their static fields
    }

    //method that updates the author of a public record
    updateAuthor(data, newAuthor) { //accepts the parameters of the existing record object and the id of the new author
        data.author = data.author.filter(previousAuthor => !previousAuthor.equals(newAuthor._id)) //updates the array to only include authors who are not the author being added (effectively removing the new author from the array first).  .equals() is from mongoose.
        data.author.unshift(newAuthor) //adds the new author to the beginning of the array
        if (data.author.length > 5) { //if the array length is greater than 5, cuts it down to 5, removing the oldest contributors
            data.author.splice(5)
        }
    }
}

module.exports = {
    RecordHandler
}