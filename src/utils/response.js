/**
 * Response utility helpers
 *
 * Keeps controller code clean by centralising how we
 * shape every HTTP response sent from the API.
 */

/**
 * Send a successful response.
 * @param {import('express').Response} res
 * @param {*}      data    - payload to send
 * @param {string} message - human-readable description
 * @param {number} status  - HTTP status code (default 200)
 */
const sendSuccess = (res, data, message = "Success", status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {string} message - human-readable error description
 * @param {number} status  - HTTP status code (default 400)
 * @param {*}      errors  - optional validation / detail errors
 */
const sendError = (res, message = "Something went wrong", status = 400, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(status).json(body);
};

module.exports = { sendSuccess, sendError };
