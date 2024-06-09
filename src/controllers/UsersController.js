const { hash, compare } = require("bcryptjs");

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

      const hashedPassword = await hash(password, 8);

      await database.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);

      return response.status(201).json();
    } catch (error) {
      return response.status(error.stausCode || 500).json({ message: error.message });
    }
  }
  async update(request, response) {
    try {
      const { name, email, password, old_password } = request.body;
      const { id } = request.params;

      const database = await sqliteConnection();
      const user = await database.get("SELECT * FROM users WHERE id = (?)", [id]);

      if(!user) {
        throw new AppError("Usuário não encontrado");
      }

      const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email]);

      if(userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
        throw new AppError("Este email já está em uso");
      }

      user.name = name;
      user.email = email;

      if(password && !old_password) {
        throw new AppError("Você precisa informar a senha antiga para definir uma nova senha");
      }

      if(password && old_password) {
        const checkOldPassword = await compare(old_password, user.password);

        if(!checkOldPassword) {
          throw new AppError("A senha antiga não confere");
        }
      }

      user.password = await hash(password, 8);

      await database.run(`
        UPDATE users SET 
        name = ?,
        email = ?,
        password = ?,
        updated_at = DATETIME('now')
        WHERE id = ?`,
        [user.name, user.email, user.password, id]
      );

      return response.json();
    } catch (error) {
      return response.status(error.stausCode || 500).json({ message: error.message });
    }
  }
}

module.exports = UsersController;