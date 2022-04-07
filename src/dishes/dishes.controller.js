const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

const hasValidProperty = (property) => {
  return (req, res, next) => {
    const { data = {} } = req.body;
    if (property === "id") {
      const { dishId } = req.params;
      dishId === data[property] || !data[property] ? next() : next({ status: 400, message: `Dish id does not match: ${data[property]}` });
    }
    if (data[property]) {
      if (property === "price") {
        data[property] > 0 && data[property] === Number(data[property]) ? next() : next({ status: 400, message: "Dish must have a price that is an integer greater than 0" })
      } else {
        data[property].length > 0 ? next() : next({ status: 400, message: `Must include a ${property}` });
      }
    } else {
      next({
        status: 400,
        message: `Dish must include a ${property}`
      })
    }
  }
}

const dishExists = (req, res, next) => {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);

  if (foundDish) {
    res.locals.dish = foundDish;
    next();
  } else {
    next({
      status: 404,
      message: `Dish ID does not exist: ${dishId}`
    })
  }
}

const create = (req, res) => {
  const { data: { name, description, price, image_url } } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url
  }
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

const read = (req, res) => {
  const dish = res.locals.dish;
  res.json({ data: dish })
}

const update = (req, res) => {
  const dish = res.locals.dish;
  const { data: { name, description, price, image_url } } = req.body;
  
  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  res.json({ data: dish })
}

const list = (req, res) => {
  res.json({ data: dishes })
}

module.exports = {
  create: [
    hasValidProperty("name"),
    hasValidProperty("description"),
    hasValidProperty("price"),
    hasValidProperty("image_url"),
    create,
  ],
  read: [dishExists, read],
  update: [
    dishExists,
    hasValidProperty("name"),
    hasValidProperty("description"),
    hasValidProperty("price"),
    hasValidProperty("image_url"),
    hasValidProperty("id"),
    update,
  ],
  list,
};