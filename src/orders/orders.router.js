const router = require("express").Router();
const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
const { Router } = require("express");

// TODO: Implement the /orders routes needed to make the tests pass
// Router.route("/").all(methodNotAllowed);
// Router.route("/:orderId").all(methodNotAllowed);

module.exports = router;
