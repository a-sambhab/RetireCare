//index.js file

////////////////////////////////////////////////////////////////////////////////////////////////////
// In this section, we set the user authentication, user and app ID, model details, and the URL
// of the text we want as an input. Change these strings to run your own example.
/////////////////////////////////////////////////////////////////////////////////////////////////////

// Your PAT (Personal Access Token) can be found in the portal under Authentification
// Specify the correct user_id/app_id pairings
// Since you're making inferences outside your app's scope
const USER_ID = "meta";
const APP_ID = "Llama-2";
// Change these to whatever model and text URL you want to use
const MODEL_ID = "llama2-70b-chat";
const MODEL_VERSION_ID = "acba9c1995f8462390d7cb77d482810b";
const RAW_TEXT =
  "<s>[INST]<<SYS>>You are a helpful retirement planning assistant who will help people in planning their retirement within the age they want to retire. People will provide you with their current age, current income, vocation, their place of stay, and other lifestyle information. They will also provide the age they want to retire by, the place they want to move to after retirement, any health concerns, and their lifestyle after retirement. Provide them with a plan to save and invest such as to have a comfortable retirement. Take into account Purchase Power Parity, inflation, growth in career, and their lifestyle choices. Give a retirement plan only mentioning what needs to be done and mentioning what percent of my income needs to be saved and how much needs to be invested in each type of mix. Take major focus on suggesting health insurance plans from different companies that the person can use. Be more statistical about this and mention amounts and numbers whereever you can. Write the response in markdown<</SYS>>";
// To use a hosted text file, assign the url variable
// const TEXT_URL = 'https://samples.clarifai.com/negative_sentence_12.txt';
// Or, to use a local text file, assign the url variable
// const TEXT_FILE_LOCATION = 'YOUR_TEXT_FILE_LOCATION_HERE';

///////////////////////////////////////////////////////////////////////////////////
// YOU DO NOT NEED TO CHANGE ANYTHING BELOW THIS LINE TO RUN THIS EXAMPLE
///////////////////////////////////////////////////////////////////////////////////

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors")
dotenv.config();
const app = express();
const PAT = process.env.API_KEY;
const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");

const stub = ClarifaiStub.grpc();

// This will be used by every Clarifai endpoint call
const metadata = new grpc.Metadata();
metadata.set("authorization", "Key " + PAT);

// To use a local text file, uncomment the following lines
// const fs = require("fs");
// const fileBytes = fs.readFileSync(TEXT_FILE_LOCATION);


const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(port, async () => {
  console.log(`Server is running at port ${port}`);
});

app.post("/getPlan", function (req, res) {
  const prompt = req.body.prompt;
  // console.log(prompt);
  stub.PostModelOutputs(
    {
      user_app_id: {
        user_id: USER_ID,
        app_id: APP_ID,
      },
      model_id: MODEL_ID,
      version_id: MODEL_VERSION_ID, // This is optional. Defaults to the latest model version.
      inputs: [
        {
          data: {
            text: {
              raw: `${RAW_TEXT} ${prompt} [/INST]`,
              // url: TEXT_URL, allow_duplicate_url: true
              // raw: fileBytes
            },
          },
        },
      ],
    },
    metadata,
    (err, response) => {
      if (err) {
        throw new Error(err);
      }

      if (response.status.code !== 10000) {
        console.log(response);
        throw new Error(
          "Post model outputs failed, status: " + response.status.description
        );
      }

      // Since we have one input, one output will exist here.
      const output = response.outputs[0];

      console.log("Completion:\n");
      res.json({"plan": output.data.text.raw});
    }
  );
});
