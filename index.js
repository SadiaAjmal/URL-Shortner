const express = require("express");
const path = require('path');
const { connectToMongoDB } = require("./connection");
const cookieParser = require("cookie-parser");
const {
    checkForAuthentication,
    restrictTo,
} = require("./middlewares/auth")
const URL = require("./models/url");

//routes impor
const urlRoute = require("./routes/url");
const StacticRoute = require("./routes/StaticRouters");
const userRoute = require("./routes/user")

const app = express();
const PORT = 8001;


//Connection
connectToMongoDB("mongodb://localhost:27017/short-url");

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthentication);


// set the view engine to ejs
app.set('view engine', 'ejs');

//Routes
app.use("/url", restrictTo(["Normal"]), urlRoute);
app.use("/", StacticRoute);
app.use("/user", userRoute);


app.set("views", path.resolve("./views"));


app.get('/', (req, res) => {
    let id = req.query.id; // Assume `id` comes from user input
    if (id) {
        id = id.replace(/\s+/g, ''); // Remove all whitespace
    }
    res.render('template', { id });
});

app.get('/url/:shortId', async(req, res) => {
    const shortId = req.params.shortId;

    try {
        const entry = await URL.findOneAndUpdate({ shortId }, // Query condition
            {
                $push: {
                    visitHistory: { timestamp: Date.now() }, // Update operation
                },
            }, { new: true } // Option to return the updated document
        );

        // Check if entry exists
        if (!entry) {
            return res.status(404).json({ error: "Short URL not found" });
        }

        // Redirect to the original URL
        res.redirect(entry.redirectURL);
    } catch (error) {
        // Handle unexpected errors
        console.error("Error fetching entry:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



app.listen(PORT, () => console.log(`Server started at PORT ${PORT}`));


{
    /*
app.get('/:shortId', async(req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate({
        shortId
    }, {
        $push: {
            visitHistory: {
                timestamp: Date.now()
            },

        },
    });
    res.redirect(entry.redirectURL);
});



//to display client side view in browser
app.get("/test", async(req, res) => {
    const allUrls = await URL.find({});
    return res.render("home", {
        urls: allUrls,
    });
});

*/
}