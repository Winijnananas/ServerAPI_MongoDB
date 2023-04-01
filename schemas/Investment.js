const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InvestSchema = new Schema({
  investment: String,
  roundNumber: Number,
  cost: Number,
  type: String,
  status: String,
  startdate: { type: Date, default: Date.now },
  enddate: { type: Date }
}, { timestamps: true, versionKey: false });

const InvestsModel = mongoose.model('Investments', InvestSchema);

module.exports = InvestsModel;