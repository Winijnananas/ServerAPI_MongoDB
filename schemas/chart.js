const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChartSchema = new Schema({
    payment: String,
    price: Number,
  });

const ChartModel = mongoose.model('ChartData', ChartSchema);

module.exports = ChartModel;