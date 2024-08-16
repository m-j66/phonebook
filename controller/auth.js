const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const { createTokenForUser } = require("../service/auth");
const { validateUser } = require("../model/user");
const fs = require("fs").promises;
const path = require("path");

const usersFilePath = path.join(__dirname, "..", "users.json");

async function readFromFile() {
  try {
    const data = await fs.readFile(usersFilePath, "utf-8");
    const jsonData = JSON.parse(data);
    // console.log("Parsed Data:", jsonData); // Debug print
    return jsonData;
  } catch (error) {
    console.error("Error Reading the file:", error);
    return [];
  }
}

async function writeToFile(users) {
  try {
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error Writing to file:", error);
  }
}

const handleSignUp = async (req, res) => {
  if (!req.body.username || !req.body.email || !req.body.password) {
    return res
      .status(400)
      .render("signup", { error: "All fields are required" });
  }
  const { username, email, password } = req.body;

  const userId = uuidv4();
  try {
    const newUser = {
      _id: userId,
      username,
      email,
      password,
    };
    const result = validateUser(newUser);

    if (!result.valid) {
      return res.status(400).render("signup", { error: result.message });
    }

    const users = await readFromFile();

    const existingUser = users.find(
      (user) => user.email === email || user.username === username
    );

    if (existingUser) {
      return res.status(400).render("signup", { error: "User Already Exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    newUser.password = hashedPassword;

    users.push(newUser);
    await writeToFile(users);

    return res
      .status(201)
      .render("login", { message: "User Created Successfully!" });
  } catch (error) {
    console.error("Error during user creation:", error);
    return res.status(500).render("signup", { error: "Internal Server Error" });
  }
};

const handleLogin = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res
      .status(400)
      .render("login", { error: "All Fields are required" });
  }
  const { email, password } = req.body;

  try {
    const users = await readFromFile();
    const user = users.find((user) => user.email === email);

    if (!user) {
      return res.status(400).render("login", { error: "User not found" });
    }

    const matchingPassword = await bcrypt.compare(password, user.password);

    if (!matchingPassword) {
      return res.status(400).render("login", { error: "Invalid Credentials!" });
    }

    const token = createTokenForUser(user);
    console.log(token);

    return res.cookie("token", token).status(200).redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(500).render("login", { error: "Internal Server Error!" });
  }
};

module.exports = {
  handleSignUp,
  handleLogin,
};
