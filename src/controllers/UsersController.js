const sqliteConnection = require("../database/sqlite");
const AppError = require("../utils/AppError");

class UsersController {
  async create(request, response) {
    try {
      const { name, email, password } = request.body;

      const database = await sqliteConnection();

      const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email]);

      if(checkUserExists) {
        throw new AppError("Este email já está em uso");
      }

      await database.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, password]);

      return response.status(201).json();
    } catch (error) {
      return response.status(error.stausCode || 500).json({ message: error.message });
    }
  }
}

module.exports = UsersController;