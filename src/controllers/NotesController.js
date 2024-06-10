const knex = require("../database/knex");

class NotesController {
  async create(request, response) {
    const { title, description, rating, tags } = request.body;
    const { user_id } = request.params;

    const [note_id] = await knex("movieNotes").insert({
      title,
      description,
      rating,
      user_id
    });

    const tagsInsert = tags.map(name => {
      return {
        note_id,
        name,
        user_id
      }
    });

    await knex("movieTags").insert(tagsInsert);

    response.json();
  } 

  async showNote(request, response) {
    const { id } = request.params;

    const note = await knex("movieNotes").where({ id }).first();
    const tags = await knex("movieTags").where({ note_id: id }).orderBy("name");

    return response.json({
      ...note,
      tags
    });
  }

  async showAllNotes(request, response) {
    const { user_id, title, tags } = request.query;

    let notes;
    let notesWithoutDuplicates;
    let titleMap = {};

    if(tags) {
      const filterTags = tags.split(',').map(tag => tag.trim());
      
      notes = await knex("movieTags")
      .select([
        "movieNotes.id",
        "movieNotes.title",
        "movieNotes.rating",
        "movieNotes.user_id",
      ])
      .where("movieNotes.user_id", user_id)
      .whereLike("movieNotes.title", `%${title}%`)
      .whereIn("name", filterTags)
      .innerJoin("movieNotes", "movieNotes.id", "movieTags.note_id")
      .orderBy("movieNotes.title");

      notesWithoutDuplicates = notes.filter((obj) => {
        if(!titleMap[obj.title]) {
          titleMap[obj.title] = true;
          return true
        }
        return false;
      });

      console.log(notesWithoutDuplicates);
    }
    else {
      notes = await knex("movieNotes").where({ user_id }).whereLike("title", `%${title}%`).orderBy("title");
    }

    const userTags = await knex("movieTags").where({ user_id });
    const notesWithTags = notesWithoutDuplicates.map(note => {
      const noteTags = userTags.filter(tag => tag.note_id === note.id);

      return {
        ...note,
        tags: noteTags
      }
    });

    return response.json(notesWithTags);
  }

  async delete(request, response) {
    const { id } = request.params;

    await knex("movieNotes").where({ id }).delete();

    return response.json();
  }
}

module.exports = NotesController;