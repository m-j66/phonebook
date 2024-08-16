const { Router } = require("express");
const router = Router();
const { handleSignUp, handleLogin } = require("../controller/auth");

router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.get("/login", (req, res) => {
  return res.render("login");
});

router.get("/signout", (req, res) => {
  return res.clearCookie("token").redirect("/");
});

router.post("/signup", handleSignUp);

router.post("/login", handleLogin);

module.exports = router;
