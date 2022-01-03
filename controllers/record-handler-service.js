

class RecordHandler {
    constructor(req, res, source, template) {
        this.req = req
        this.res = res
        this.source = source
        this.template = template
    }

    // get renderSourceTest() {
    //     console.log('test3')
    //     return this.renderSource()
    // }

    async publicDataLookup() {
        const { slug } = this.req.params
        const publicData = await this.source.findOne({ slug })
            .populate('author', 'username')
            .populate('lastApprover', 'username')
        this.checkData(publicData)
        return publicData
    }

    async reviewDataLookup() {
        const { sourceId } = this.req.params
        const reviewData = await this.source.findById(sourceId)
            .populate('author', 'username')
            .populate('lastApprove', 'username')
        this.checkData(reviewData)
    }

    checkData(data) {
        if (!data) {
            this.req.flash('error', 'This record does not exist.')
            return this.res.redirect('/dashboard')
        }
    }
}

module.exports = {
    RecordHandler
}