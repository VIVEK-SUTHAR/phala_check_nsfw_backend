import express, { json } from "express";
import nsfw from "nsfwjs";
import { spawn } from "child_process";
const app = express();
const port = 3000;
app.use(json());
const PORT = 8956;
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/checkIsnsfwImage", async (req, res) => {
  try {
    const imageUrl = req.query.imageUrl;

    if (!imageUrl) {
      return res.status(400).json({ error: "ImageURl not provided" });
    }

    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

    const imageBuffer = Buffer.from(response.data);

    const model = await nsfw.load();
    const predictions = await model.classify(imageBuffer);

    const isNSFW = checkPredections(predictions[0].className);

    res.json({ isNSFW });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the image" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${port}`);
});

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
