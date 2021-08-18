

module.exports.renderUpdateSource = async (req, res) => {
//Must be able to review/approve (as admin) (/review route, post or put to public)
//Must be able to update existing submission (as owner of submission) (update route, put to review)
//Must be able to submit changes to public documents (as anyone) (put to review)
    const { sourceId } = req.params;
    const user = (req.user);
    const getSourceData = () => {
        let sourceData = await Source.publicSource.findOne({ _id: sourceId })
        if (!sourceData) {
            sourceData = await Source.reviewSource.findOne({ _id: sourceId})
        }
        return sourceData;
    }
    const mediaTypes = await Source.publicSource.schema.path('mediaType').enumValues;
    const sourceData = getSourceData();
    res.render('sources/updateSource', { sourceData, mediaTypes })
}