const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = new Schema({
  urluser:String,
  fname:String,
  email: String,
  password: String,




}, { timestamps: true, versionKey: false });

const UsersModel = mongoose.model('Users', usersSchema);

module.exports = UsersModel;