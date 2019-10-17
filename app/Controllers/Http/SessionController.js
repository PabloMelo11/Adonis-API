"use strict";

class SessionController {
  async store({ request, response, auth }) {
    /**
     * buscar email e password na requisicao
     */
    const { email, password } = request.all();

    /**
     * Gerar um novo token validando as credencias do user
     * auth.attempt = tentavida de login usar as uid e password
     */
    const token = await auth.attempt(email, password);

    return token;
  }
}

module.exports = SessionController;
