import express, { json } from "express";
import * as fs from "fs";
import tf from "@tensorflow/tfjs-node";
import nsfw from "nsfwjs";
const app = express();

app.use(json());

const PORT = 8956;

app.get("/checkIsNSFWImage", checkNSFW);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

async function checkNSFW(req, res) {
  try {
    const imageUrl = req.query.imageUrl;
    const response = await fetch(imageUrl);
    const imageBuffer = await response.arrayBuffer();
    const img_buf = Buffer.from(imageBuffer);
    fs.writeFileSync("temp.png", img_buf, (e) => {
      console.log(e);
    });
    const imageBufferFromFile = fs.readFileSync("temp.png");
    const tfImage = tf.node.decodeImage(imageBufferFromFile, 3);
    const model = await nsfw.load();

    const predictions = await model.classify(tfImage);

    const isNSFW = checkPredections(predictions[0].className);

    res.json({ isNSFW });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the image" });
  } finally {
    fs.unlinkSync("temp.png");
  }
}

function checkPredections(predictedClassName) {
  if (
    predictedClassName === "Explicit" ||
    predictedClassName === "Sexy" ||
    predictedClassName === "Hentai" ||
    predictedClassName === "Porn"
  ) {
    return true;
  }
  return false;
}
