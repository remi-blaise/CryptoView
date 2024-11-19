const axios = require("axios");
const IpfsFilesSchema = require("../models/ipfsFilesModel.js");
const FormData = require("form-data");

const store = async (req, res) => {
  try {
    const PINATA_API_KEY = process.env.PINATA_API_KEY;
    const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

    if (!PINATA_API_KEY) {
      return res.status(500).json({ error: "PINATA_API_KEY is not set" });
    }

    if (!PINATA_API_SECRET) {
      return res.status(500).json({ error: "PINATA_API_SECRET is not set" });
    }

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const formData = new FormData();
    formData.append("file", text);

    const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      pinataContent: text,
    }, {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
    });

    const hash = response.data.IpfsHash;

    const data = new IpfsFilesSchema({ hash });
    await data.save();

    res.status(201).json({ hash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const get = async (req, res) => {
  try {
    const PINATA_API_KEY = process.env.PINATA_API_KEY;
    const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

    if (!PINATA_API_KEY) {
      return res.status(500).json({ error: "PINATA_API_KEY is not set" });
    }

    if (!PINATA_API_SECRET) {
      return res.status(500).json({ error: "PINATA_API_SECRET is not set" });
    }

    const { hash } = req.query;

    if (!hash) {
      return res.status(400).json({ error: "Hash is required" });
    }

    const file = await IpfsFilesSchema.findOne({ hash });

    if (!file) {
      return res.status(404).json({ error: "File not registered" });
    }

    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${hash}`, {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
    });

    const text = response.data

    res.status(200).json(text);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { store, get };
