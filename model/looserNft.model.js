const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment-timezone");
const datelondon = moment.tz(Date.now(), "Europe/London");

const looserNftSchema = new Schema(
  {
    roundNumber: {
      type: Number,
      required: true,
    },
    // nftList: {
    //   type: Array,
    //   default: [],
    // },
    nftData: [
      {
        nftNumber: {
          type: String,
          required: true,
        },
        tokenAddress: {
          type: String,
          required: true,
        },
      },
    ],
    createdAt: { type: Date, default: datelondon },
    updatedAt: { type: Date, default: datelondon },
  },
  { versionKey: false }
);

module.exports = mongoose.model("LooserNft", looserNftSchema);
