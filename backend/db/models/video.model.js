const { default: mongoose } = require("mongoose");

module.exports = mongoose => {
    const Video = mongoose.model("videos", mongoose.Schema({
        filename: String,
        videoFile: File
    }))
}