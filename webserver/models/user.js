const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uid: String,
    owner: String
});

module.exports = mongoose.model("User", userSchema);