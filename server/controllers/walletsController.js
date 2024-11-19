const axios = require("axios");
const WalletTransactionsSchema = require("../models/walletTransactionsModel.js");

const fetchTransactions = async (req, res) => {
  try {
    const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

    if (!ETHERSCAN_API_KEY) {
      return res.status(500).json({ error: "ETHERSCAN_API_KEY is not set" });
    }

    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ error: "address is required" });
    }

    const isValidEthAddress = /^0x[a-fA-F0-9]{40}$/.test(address);

    if (!isValidEthAddress) {
      return res
        .status(400)
        .json({ error: "address should be a valid Ethereum address" });
    }

    const response = await axios.get(`https://api.etherscan.io/api`, {
      params: {
        module: "account",
        action: "txlist",
        address,
        startblock: 0,
        endblock: 99999999,
        sort: "desc",
        apikey: ETHERSCAN_API_KEY,
      },
    });

    const transactions = response.data.result
      .slice(0, 5)
      .map((tx) => ({ ...tx, walletAddress: address }));

    await WalletTransactionsSchema.insertMany(transactions);

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const queryTransactions = async (req, res) => {
  try {
    const { address, start, end } = req.query;

    if (!address) {
      return res.status(400).json({ error: "address is required" });
    }

    const isValidEthAddress = /^0x[a-fA-F0-9]{40}$/.test(address);

    if (!isValidEthAddress) {
      return res
        .status(400)
        .json({ error: "address should be a valid Ethereum address" });
    }

    if (!start) {
      return res.status(400).json({ error: "start is required" });
    }

    if (!end) {
      return res.status(400).json({ error: "end is required" });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate)) {
      return res.status(400).json({ error: "start should be a valid date" });
    }

    if (isNaN(endDate)) {
      return res.status(400).json({ error: "end should be a valid date" });
    }

    const query = {
      walletAddress: address,
      timeStamp: {
        $gte: startDate.getTime() / 1000,
        $lte: endDate.getTime() / 1000,
      },
    };

    const transactions = await WalletTransactionsSchema.find(query);

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { fetchTransactions, queryTransactions };
