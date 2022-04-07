const path = require("path");
const { splice } = require("../data/dishes-data");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

const hasValidProperty = (property) => {
  return (req, res, next) => {
    const { data = {} } = req.body;
    // Validates id property
    if (property === "id") {
      const { orderId } = req.params;
      data[property] === orderId || !data[property]
        ? next()
        : next({
            status: 400,
            message: `Order id does not match route id. Order: ${data[property]}, Route: ${orderId}.`,
          });
    }
    // Validates status property
    if (property === "status") {
      const status = data[property];
      if (!status || status === "invalid") {
        next({ status: 400, message: `Order must have a status of pending, preparing, out-for-delivery, delivered` });
      } else if (status === "delivered") {
        next({ status: 400, message: "A delivered order cannot be changed" });
      }
      next();
    }
    // Checks if property exists
    if (data[property]) {
      // Validates dishes property
      if (property === "dishes") {
        const dishes = data[property];
        if (dishes.length > 0 && Array.isArray(dishes)) {
          dishes.map((dish, index) => {
              if (
                !dish.quantity ||
                dish.quantity <= 0 ||
                dish.quantity !== Number(dish.quantity)
              ) {
                next({
                  status: 400,
                  message: `Dish ${index} must have a quantity that is an integer greater than 0`
                });
              }
          })
        } else {
          next({
            status: 400,
            message: `Order must include at least one dish`,
          });
        }
      }
      next();
    } else {
      next({
        status: 400,
        message: `Order must include a ${property}`,
      });
    }
  };
};

const deleteValidator = (req, res, next) => {
  const { status } = res.locals.order;
  if (status) {
    if (status !== 'pending') next({
      status: 400,
      message: `An order cannot be deleted unless it is pending`,
    });
  } 
  next();
}

const orderExists = (req, res, next) => {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);

  if (foundOrder) {
    res.locals.order = foundOrder;
    next();
  } else {
    next({
      status: 404,
      message: `Order id not found: ${orderId}`,
    });
  }
};

const create = (req, res) => {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
};

const read = (req, res) => {
  const order = res.locals.order;
  res.json({ data: order });
};

const update = (req, res) => {
  const order = res.locals.order;
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  order.id = req.params.orderId;
  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes;

  res.json({ data: order });
};

const destroy = (req, res) => {
  const order = res.locals.order;
  const index = orders.findIndex((orderEl) => orderEl.id === order.id);

  orders.splice(index, 1);
  res.sendStatus(204);
};

const list = (req, res) => {
  res.json({ data: orders });
};

// id, deliverTo, mobileNumber, status, dishes
module.exports = {
  create: [
    hasValidProperty("deliverTo"),
    hasValidProperty("mobileNumber"),
    hasValidProperty("dishes"),
    create,
  ],
  read: [orderExists, read],
  update: [
    orderExists,
    hasValidProperty("deliverTo"),
    hasValidProperty("mobileNumber"),
    hasValidProperty("dishes"),
    hasValidProperty("id"),
    hasValidProperty("status"),
    update,
  ],
  delete: [orderExists, deleteValidator, destroy],
  list,
};
