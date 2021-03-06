const Router = require("express").Router;
const mongodb = require("mongodb");
const HTTP_STATUS_CODES = require("http-status-codes");
// For storing images we use Decimal128
const db = require("../db");
const { Decimal128, ObjectId } = mongodb;
const router = Router();

// const products = [
//   {
//     _id: "fasdlk1j",
//     name: "Stylish Backpack",
//     description:
//       "A stylish backpack for the modern women or men. It easily fits all your stuff.",
//     price: 79.99,
//     image: "http://localhost:3100/images/product-backpack.jpg"
//   },
//   {
//     _id: "asdgfs1",
//     name: "Lovely Earrings",
//     description:
//       "How could a man resist these lovely earrings? Right - he couldn't.",
//     price: 129.59,
//     image: "http://localhost:3100/images/product-earrings.jpg"
//   },
//   {
//     _id: "askjll13",
//     name: "Working MacBook",
//     description:
//       "Yes, you got that right - this MacBook has the old, working keyboard. Time to get it!",
//     price: 1799,
//     image: "http://localhost:3100/images/product-macbook.jpg"
//   },
//   {
//     _id: "sfhjk1lj21",
//     name: "Red Purse",
//     description: "A red purse. What is special about? It is red!",
//     price: 159.89,
//     image: "http://localhost:3100/images/product-purse.jpg"
//   },
//   {
//     _id: "lkljlkk11",
//     name: "A T-Shirt",
//     description:
//       "Never be naked again! This T-Shirt can soon be yours. If you find that buy button.",
//     price: 39.99,
//     image: "http://localhost:3100/images/product-shirt.jpg"
//   },
//   {
//     _id: "sajlfjal11",
//     name: "Cheap Watch",
//     description: "It actually is not cheap. But a watch!",
//     price: 299.99,
//     image: "http://localhost:3100/images/product-watch.jpg"
//   }
// ];

// Get list of products products
router.get("/", (req, res, next) => {
  // Return a list of dummy products
  // Later, this data will be fetched from MongoDB
  const queryPage = req.query.page;
  const pageSize = 1;
  // let resultProducts = [...products];
  // if (queryPage) {
  //   resultProducts = products.slice(
  //     (queryPage - 1) * pageSize,
  //     queryPage * pageSize
  //   );
  // }

  //for changing the configuration or adding the index 
  //we will do this outside the application 
  // db.products.createIndex({price: -1})
  
  const products = [];
  db.GET_DATABASE()
    .db()
    .collection("products")
    .find({})
    .sort({ price: -1 })
    .skip((queryPage - 1) * pageSize)
    .limit(pageSize)
    .forEach(product => {
      // console.log(product);
      product.price = product.price.toString();
      products.push(product);
    })
    .then(result => {
      console.log(result);
      res.status(HTTP_STATUS_CODES.OK).json(products);
    })
    .catch(err => {
      console.log(err);
      res
        .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: "An error occured" });
    });
});

// Get single product
router.get("/:id", (req, res, next) => {
  // const product = products.find(p => p._id === req.params.id);
  // res.json(product);
  const { id } = req.params;
  db.GET_DATABASE()
    .db()
    .collection("products")
    .findOne({ _id: new ObjectId(id) })
    .then(product => {
      product.price = product.price.toString();
      if (product) {
        res.status(HTTP_STATUS_CODES.OK).json(product);
      }
    })
    .catch(err => {
      console.log(err);
      res
        .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: "An error occured" });
    });
});

// Add new product
// Requires logged in user
router.post("", (req, res, next) => {
  const newProduct = {
    name: req.body.name,
    description: req.body.description,
    price: Decimal128.fromString(req.body.price.toString()), // store this as 128bit decimal in MongoDB
    image: req.body.image
  };
  db.GET_DATABASE()
    .db()
    .collection("products")
    .insertOne(newProduct)
    .then(result => {
      console.log(result);
      res
        .status(HTTP_STATUS_CODES.OK)
        .json({ message: "Product added", productId: result.insertedId });
    })
    .catch(err => {
      console.log(err);
      res
        .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: "An error occured", productId: "DUMMY" });
    });
});
// Edit existing product
// Requires logged in user
router.patch("/:id", (req, res, next) => {
  const updatedProduct = {
    name: req.body.name,
    description: req.body.description,
    price: Decimal128.fromString(req.body.price.toString()), // store this as 128bit decimal in MongoDB
    image: req.body.image
  };
  const { id } = req.params;
  db.GET_DATABASE()
    .db()
    .collection("products")
    .updateOne({ _id: new ObjectId(id) }, { $set: updatedProduct })
    .then(() => {
      res
        .status(HTTP_STATUS_CODES.CREATED)
        .json({ message: "Product updated", productId: id });
    })
    .catch(err => {
      console.log(err);
      res
        .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: "An error occured" });
    });
});

// Delete a product
// Requires logged in user
router.delete("/:id", (req, res, next) => {
  const { id } = req.params;
  db.GET_DATABASE()
    .db()
    .collection("products")
    .deleteOne({ _id: new ObjectId(id) })
    .then(() => {
      res.status(HTTP_STATUS_CODES.OK).json({ message: "Product deleted" });
    })
    .catch(err => {
      console.log(err);
      res
        .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: "An error occured" });
    });
});

module.exports = router;
