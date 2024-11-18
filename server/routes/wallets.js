const express = require("express");
const {
  fetchTransactions,
  queryTransactions,
} = require("../controllers/walletsController.js");

const router = express.Router();

router.post("/transactions/fetch", fetchTransactions);
router.get("/transactions/query", queryTransactions);

module.exports = router;
