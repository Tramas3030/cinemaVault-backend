const { Router } = require("express");

const notesRoutes = Router();

const NotesController = require("../controllers/NotesController");

const notesController = new NotesController();

notesRoutes.post("/:user_id", notesController.create);
notesRoutes.get("/:id", notesController.showNote);
notesRoutes.get("/", notesController.showAllNotes);
notesRoutes.delete("/:id", notesController.delete);

module.exports = notesRoutes;