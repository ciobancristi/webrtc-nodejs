const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    username: String,
    password: String,
    name: String,
    securityCoEmail: String,
    admin: Boolean
});

User.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', User);