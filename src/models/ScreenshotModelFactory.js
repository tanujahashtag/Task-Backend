const mongoose = require("mongoose");

const modelCache = {};

const getScreenshotModel = (userId) => {
  const modelName = `${userId}_screenshot`;
  if (modelCache[modelName]) return modelCache[modelName];

  const schema = new mongoose.Schema({
    filename: String,
    path: String,
    uploadedAt: { type: Date, default: Date.now },
  });

  modelCache[modelName] =
    mongoose.models[modelName] || mongoose.model(modelName, schema);
  return modelCache[modelName];
};

exports.getScreenshotModel = getScreenshotModel;
