const express = require("express");
const { retrieveNftMetadata } = require("../controllers/nftsController.js");

const router = express.Router();

router.get("/metadata", retrieveNftMetadata);

module.exports = router;
