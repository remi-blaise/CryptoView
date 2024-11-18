const { Web3 } = require("web3");
const mongoose = require("mongoose");
const NftMetadataSchema = require("../models/nftMetadataModel.js");
const IERC721Metadata = require("../abis/IERC721Metadata.json");

const retrieveNftMetadata = async (req, res) => {
  try {
    const { contractAddress, tokenId } = req.query;

    if (!contractAddress) {
      return res.status(400).json({ error: "contractAddress is required" });
    }

    if (!tokenId) {
      return res.status(400).json({ error: "tokenId is required" });
    }

    const web3HttpProvider = process.env.WEB3_HTTP_PROVIDER;

    if (!web3HttpProvider) {
      return res.status(500).json({ error: "WEB3_HTTP_PROVIDER is not set" });
    }

    const web3 = new Web3(
      new Web3.providers.HttpProvider(web3HttpProvider)
    );

    const contract = new web3.eth.Contract(IERC721Metadata, contractAddress);
    console.log("Calling tokenURI");

    const tokenURI = await contract.methods.tokenURI(tokenId).call();

    if (!tokenURI) {
      return res.status(404).json({ error: "tokenURI not found" });
    }

    if (!tokenURI.startsWith("http") && !tokenURI.startsWith("ipfs")) {
      return res.status(500).json({
        error: "The token URI is not supported. We support only http and ipfs.",
      });
    }

    console.log("tokenURI", tokenURI);

    const httpURI = tokenURI.startsWith("http")
      ? tokenURI
      : `https://ipfs.io/ipfs/${tokenURI.slice("ipfs://".length)}`;

    console.log("httpURI", httpURI);

    const response = await fetch(httpURI);
    const metadata = await response.json();

    console.log(metadata);

    const nftMetadata = new NftMetadataSchema({
      contractAddress,
      tokenId,
      name: metadata.name || "",
      description: metadata.description || "",
      image: metadata.image || "",
    });

    await nftMetadata.save();

    res.json(nftMetadata);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { retrieveNftMetadata };
