const express = require("express");
// require('dotenv').config({ path: './config/.env' })

const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const { exec } = require("child_process");
const solanaWeb3 = require("@solana/web3.js");
const splToken = require("@solana/spl-token");

const axios = require("axios");

var aws = require("aws-sdk");
var s3 = new aws.S3({
  accessKeyId: "AKIAWEOB2JURBXFYCHZ2",
  secretAccessKey: "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",
  region: "eu-west-2",
});
const LooserNft = require("./model/looserNft.model");
//initializing the port
const PORT = process.env.PORT || 5005;

//creating the server
const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/rumbel-64", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successful!"))
  .catch((err) => {
    console.log(err);
    console.log("Error connecting DB!");
  });
app.post("/updateNFT", async (req, res) => {
  try {
    // const { nftToken, walletAddress } = req.body;

    const { roundNumber } = req.body;
    // const data = await LooserNft.find();
    // console.log("🚀 ~ file: server.js ~ line 43 ~ app.post ~ data", data);
    const getLooserNfts = await LooserNft.findOne({ roundNumber: roundNumber });
    if(!getLooserNfts) return res.status(200).send({
      status: false,
      code: 500,
      message: "This round has yet to be played.",
      data: {},
    });
    // console.log(getLooserNfts);
    var nftDatas = getLooserNfts.nftData;

    for (const singleNft of nftDatas) {
      // console.log(singleNft.nftNumber.substring(8));
      const upgradeScript = `metaboss update uri \
        --keypair ~/.config/solana/owner.json \
        --account ${singleNft.tokenAddress} \
        --new-uri https://rumble-upgrade-lost.s3.eu-west-2.amazonaws.com/${singleNft.nftNumber.substring(
          8
        )}.json`;
      // https://rumble-upgrade-lost.s3.eu-west-2.amazonaws.com/${singleNft.nftNumber}.json

      // console.log(upgradeScript);
      exec(upgradeScript, (error, stdout, stderr) => {
        console.log(stdout);
        console.log(error);
        if (stdout !== "done" && error !== null) {
          return res.status(200).send({
            status: false,
            code: 400,
            message: "Unable to upgrade NFT.",
            data: { error, stderr },
          });
        }
      });
    }

    return res.status(200).send({
      status: true,
      code: 200,
      message: "NFT upgrade.",
      data: {},
    });
  } catch (e) {
    console.log(e);
    return res.status(200).send({
      status: false,
      code: 500,
      message: "Something went wrong!",
      data: {},
    });
  }
});

app.post("/storeTnxSignature", async (req, res) => {
  try {
    const { destination } = req.body;
    var allTransaction = [];
    // https://little-long-glade.solana-devnet.discover.quiknode.pro/c5d0746570dc7408f03da6989612e4b618dfa22c/

    const endpoint =
      "https://solemn-falling-morning.solana-mainnet.discover.quiknode.pro/e0507b4e27f4ac271fadd720fd20de1101c1461e/";
    const solanaConnection = new solanaWeb3.Connection(endpoint);

    const getTransactions = async (address) => {
      const pubKey = new solanaWeb3.PublicKey(address);
      let transactionList = await solanaConnection.getSignaturesForAddress(
        pubKey
        // {
        //   // limit: 2,
        // },
      );

      for (const transaction of transactionList) {
        console.log(transaction.signature);

        const data = await solanaConnection.getConfirmedTransaction(
          transaction.signature
        );

        allTransaction.push(data);
      }

      return res
        .status(200)
        .send({ data: { transactionList, allTransaction } });
    };

    getTransactions(destination);
  } catch (e) {
    console.log(e);
    return res.status(200).send({
      status: false,
      code: 500,
      message: "Something went wrong!",
      data: {},
    });
  }
});

//default route
app.all("*", (req, res) => {
  return res.status(200).send("URL not found");
});

//listening the server
app.listen(PORT, () => {
  console.log("server is running on port " + PORT);
});
