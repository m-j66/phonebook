const fs = require("fs").promises;
const { v4: uuidv4 } = require("uuid");
const { validateContact } = require("../model/contacts");
const path = require("path");
const upload = require("../service/fileupload");
const contactsFilePath = path.join(__dirname, "..", "contacts.json");

async function writeToFile(contacts) {
  try {
    await fs.writeFile(contactsFilePath, JSON.stringify(contacts, null, 2));
  } catch (error) {
    console.log(error);
  }
}

async function readFromFile() {
  try {
    const data = await fs.readFile(contactsFilePath, "utf-8");
    const jsonData = JSON.parse(data);
    // console.log(jsonData);
    return jsonData;
  } catch (error) {
    console.log(error);
    return [];
  }
}

const handlegetContactById = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(404).render("contacts", { error: "404 Not Found" });
  }
  try {
    const contacts = await readFromFile();
    const currentContacts = contacts.filter((contact) => contact.userId === id);

    if (currentContacts.length === 0) {
      return res.render("contacts", { user: req.user, contacts: [] });
    }

    return res
      .status(200)
      .render("contacts", { user: req.user, contacts: currentContacts });
  } catch (error) {
    return res
      .status(500)
      .render("contacts", { error: "Internal Server Error" });
  }
};

const handleAddContact = async (req, res) => {
  upload.single("photo")(req, res, async function (err) {
    if (err) {
      return res
        .status(400)
        .render("addContact", { error: "File upload failed", user: req.user });
    }

    if (!req.body.name || !req.body.email || !req.body.phoneNumber) {
      return res.status(400).render("addContact", {
        error: "All fields are required",
        user: req.user,
      });
    }

    const { name, email, phoneNumber } = req.body;

    const photo = req.file
      ? `/uploads/${req.file.filename}`
      : "/uploads/default.png";
    const id = uuidv4();
    const newContact = {
      id,
      name,
      email,
      phoneNumber,
      photo,
    };

    const result = validateContact(newContact);
    if (!result.valid) {
      return res
        .status(400)
        .render("addContact", { error: result.message, user: req.user });
    }

    try {
      const contacts = await readFromFile();

      newContact.userId = req.user.id;
      const existingContact = contacts.find(
        (contact) =>
          contact.email === email ||
          (contact.name === name && contact.userId === req.user.id)
      );

      if (existingContact) {
        return res.status(400).render("addContact", {
          error: "Contact already exists",
          user: req.user,
        });
      }

      contacts.push(newContact);
      await writeToFile(contacts);

      return res.status(201).render("contacts", {
        message: "Contact added successfully",
        contacts,
        user: req.user,
      });
    } catch (error) {
      console.error("Error saving contact:", error);
      return res.status(500).render("addContact", {
        error: "Internal Server Error",
        user: req.user,
      });
    }
  });
};

const handleUpdateContact = async (req, res) => {
  const allContacts = await readFromFile();
  const contact = allContacts.filter((contact) => contact.id === req.params.id);

  upload.single("photo")(req, res, async function (err) {
    if (err) {
      return res.status(400).render("signup", {
        error: "File upload failed",
        user: req.user,
        contact,
      });
    }

    const contactId = req.params.id;
    const { name, email, phoneNumber } = req.body;

    try {
      const contacts = await readFromFile();

      const contactIndex = contacts.findIndex(
        (contact) => contact.id === contactId
      );

      if (contactIndex === -1) {
        return res.status(404).render("login", {
          error: "Contact not found",
          user: req.user,
          contact,
        });
      }

      const photo = req.file
        ? `/uploads/${req.file.filename}`
        : contacts[contactIndex].photo;

      const updatedData = {
        id: req.params.id,
        name: name || contacts[contactIndex].name,
        email: email || contacts[contactIndex].email,
        phoneNumber: phoneNumber || contacts[contactIndex].phoneNumber,
        photo: photo || contacts[contactIndex].photo,
      };

      const result = validateContact(updatedData);

      console.log(result.message);
      if (!result.valid) {
        return res.status(400).render("updateContact", {
          error: result.message,
          user: req.user,
          contact: { ...contacts[contactIndex], ...updatedData },
        });
      }

      const updatedContact = {
        ...contacts[contactIndex],
        ...updatedData,
      };

      // console.log(updatedContact);
      contacts[contactIndex] = updatedContact;

      await writeToFile(contacts);

      return res.status(200).render("contacts", {
        message: "Contact updated successfully",
        contacts,
        user: req.user,
      });
    } catch (error) {
      console.log("Error updating contact:", error);
      return res.status(500).render("updateContact", {
        error: "Internal Server Error",
        user: req.user,
        contact,
      });
    }
  });
};

const handleDeleteContact = async (req, res) => {
  const contactId = req.params.id;

  // console.log(contactId);
  if (!contactId) {
    return res
      .status(400)
      .render("contacts", { error: "Invalid contact ID provided." });
  }

  try {
    const contacts = await readFromFile();
    //console.log(contacts);
    const contactIndexInOriginalList = contacts.findIndex((contact) => {
      //console.log("contact.id:", contact.id);
      //console.log("contactId:", contactId);
      //console.log("contact.id length:", contact.id.length);
      //console.log("contactId length:", contactId.length);
      //console.log("Comparing:", contact.id === contactId);

      return contact.id == contactId;
    });
    console.log(contactIndexInOriginalList);

    if (contactIndexInOriginalList === -1) {
      return res.status(404).render("contacts", {
        error: "Contact not found",
        contacts: contacts,
      });
    }

    contacts.splice(contactIndexInOriginalList, 1);

    await writeToFile(contacts);

    return res.status(200).render("home", {
      message: "Contact deleted successfully",
      contacts: contacts,
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return res.status(500).render("contacts", {
      error: "Internal Server Error",
      contacts: contacts,
    });
  }
};

const handleUpdatePageRender = async (req, res) => {
  const contactId = req.params.id;
  try {
    const contacts = await readFromFile();

    const contact = contacts.find((contact) => contact.id === contactId);

    if (contact) {
      res.render("updateContact", { contact: contact, user: req.user });
    } else {
      res
        .status(404)
        .render("contacts", { error: "Contact not found", user: req.user });
    }
  } catch (error) {
    console.error("Error fetching contact:", error);

    res
      .status(500)
      .render("contacts", { error: "Internal Server Error", user: req.user });
  }
};

module.exports = {
  handlegetContactById,
  handleAddContact,
  handleUpdateContact,
  handleDeleteContact,
  handleUpdatePageRender,
};
