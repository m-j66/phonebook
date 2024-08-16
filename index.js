const express = require("express");
require("dotenv").config();
const path = require("path");
const userRouter = require("./routes/auth");
const contactRouter = require("./routes/contacts");
const cookieParser = require("cookie-parser");
const { checkForAuthenticationCookie } = require("./middleware/auth");
const app = express();

const port = 3000 || process.env.PORT;

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.get("/", (req, res) => {
  res.render("home", {
    user: req.user,
  });
});

app.use("/api/auth", userRouter);
app.use("/api/contacts", contactRouter);
app.listen(port, (err) => {
  if (err) {
    console.log(`Error starting the server at port ${port}`);
  } else {
    console.log(`Server started at port ${port}`);
  }
});
