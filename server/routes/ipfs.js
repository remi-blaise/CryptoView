const express = require("express");
const { store, get } = require("../controllers/ipfsController.js");

const router = express.Router();

router.post("/store", store);
router.get("/get", get);

module.exports = router;
