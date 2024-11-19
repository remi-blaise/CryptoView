const mongoose = require("mongoose");
const { Schema } = mongoose;

const IpfsFilesSchema = new Schema({
  hash: { type: String, required: true },
});

module.exports = mongoose.model("IpfsFiles", IpfsFilesSchema);
