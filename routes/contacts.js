const { Router } = require("express");
const router = Router();
const { authenticate } = require("../middleware/auth");
const {
  handlegetContactById,
  handleAddContact,
  handleUpdateContact,
  handleDeleteContact,
  handleUpdatePageRender,
} = require("../controller/contacts");

router.get("/addContact", authenticate, (req, res) => {
  return res.render("addContact", {
    user: req.user,
  });
});

router.get("/updateContact/:id", authenticate, handleUpdatePageRender);

router.get("/:id", authenticate, handlegetContactById);

router.post("/", authenticate, handleAddContact);

router.put("/:id", authenticate, handleUpdateContact);

router.delete("/:id", authenticate, handleDeleteContact);

module.exports = router;
