const mongoose = require("mongoose");


async function connectToMongoDB(url) {
    return (
        mongoose.connect(url)
        .then(() => console.log("MogoDB connected"))
        .catch(() => console.log("Error while connecting to MongoDB")))
}

module.exports = { connectToMongoDB }