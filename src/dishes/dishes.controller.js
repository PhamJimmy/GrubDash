const { json } = require("express/lib/response");
const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

const hasProperty = (property) => {
  return (req, res, next) => {
    const { data = { property } } = req.body;
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

const list = (req, res) => {
  res.json({ data: dishes })
}

module.exports = {
  create: [
    hasProperty("name"),
    hasProperty("description"),
    hasProperty("price"),
    hasProperty("image_url"),
    create
  ],
  read: [dishExists, read],
  list
}