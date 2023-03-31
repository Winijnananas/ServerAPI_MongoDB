const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InvestSchema = new Schema({
  investment:String,
  roundNumber:Number,
  cost:Number,
  type: String,
  status:String,




}, { timestamps: true, versionKey: false });

const InvestsModel = mongoose.model('Investments', InvestSchema);

module.exports = InvestsModel;