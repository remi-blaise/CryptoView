const mongoose = require("mongoose");
const { Schema } = mongoose;

const NftMetadataSchema = new Schema({
  contractAddress: {
    type: String,
    required: true,
  },
  tokenId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("NftMetadata", NftMetadataSchema);
