"use strict";

const moment = require("moment");
const crypto = require("crypto");
const User = use("App/Models/User");
const Mail = use("Mail");

class ForgotPasswordController {
  async store({ request, response }) {
    try {
      /**
       * Pegar o email que foi passado na requisicao
       * Buscar esse email no banco de dados
       */
      const email = request.input("email");
      const user = await User.findByOrFail("email", email);

      /**
       * Apos busca-lo necessario usar o crypto para o token
       * Salvar o token e o created no banco
       */
      user.token = crypto.randomBytes(10).toString("hex");
      user.token_created_at = new Date();

      /**
       * Salvar as informacoes
       */
      await user.save();

      /**
       * Enviar email
       */
      await Mail.send(
        ["emails.forgot_password"],
        {
          email,
          token: user.token,
          link: `${request.input("redirect_url")}?token=${user.token}`
        },
        message => {
          message
            .to(user.email)
            .from("pablomelo@gmail.com", "Pablo | DevRun")
            .subject("Recuperacao de senha");
        }
      );
    } catch (err) {
      return response.status(err.status).send({
        error: { message: "Algo nao deu certo, esse e-mail existe?" }
      });
    }
  }

  async update({ request, response }) {
    try {
      const { token, password } = request.all();

      const user = await User.findByOrFail("token", token);

      const tokenExpired = moment()
        .subtract("2", "days")
        .isAfter(user.token_created_at);

      if (tokenExpired) {
        return response.status(401).send({
          error: { message: "O token de recuperacao de senha esta expirado" }
        });
      }

      user.token = null;
      user.token_created_at = null;
      user.password = password;

      await user.save();
    } catch (err) {
      return response.status(err.status).send({
        error: { message: "Algo nao deu ao resetar sua senha" }
      });
    }
  }
}

module.exports = ForgotPasswordController;
