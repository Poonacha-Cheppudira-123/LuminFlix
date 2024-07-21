// Import the necessary libraries
import express from "express";
import ffmpeg from "fluent-ffmpeg"; // `fluent-ffmpeg` == wrapper around `ffmpeg` command line tool

// Create an express app
const app = express();
// Allows our express app to use the `json`for requests
app.use(express.json());

// Post Request on the `/process-video` directory: takes in a request and sends a response
app.post("/process-video", (req, res) => {
    // Get path of the input video file from the request body
    const inputVideoFilePath = req.body.inputVideoFilePath;
    // Get the path of the output video file from the request body
    // This is the path to where we want to save the video
    const outputVideoFilePath = req.body.outputVideoFilePath;

    // Check if either file paths from the request's body exist
    // If not, send a `400` status response for the bad request
    if (!inputVideoFilePath || !outputVideoFilePath) {
        res.status(400).send("Bad request: Missing file path.");
    }

    // Call the ffmpeg CLI function which takes in the input video's file path
    ffmpeg(inputVideoFilePath)
        // Convert the input video file into a `360p` version
        .outputOptions("-vf", "scale=-1:360")
        // Once the `.outputOptions()` function finishes executing, we know the input video has processed
        // If successful, send a `200` status code + message
        .on("end", () => {
            res.status(200).send("Processing finished successfully.");
        })
        // Check if there was an error when the input video was being processed
        // If so, print an error message and send a `500` status code + message
        .on("error", (err) => {
            console.log(`An error occurred: ${err.message}`);
            res.status(500).send(`Internal Server Error: ${err.message}`);
        })
        // If successful, save the new, processed video to the output video file path
        .save(outputVideoFilePath);
});

// Specify the port in which app will run
// If the value for the `PORT` environment variable is undefined, default to `3000`
const port = process.env.PORT || 3000;
// Have the express app run on the `PORT` value and listen for any requests
// Print out a `server running` message
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
