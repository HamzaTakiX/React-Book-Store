const express = require("express")
const router = express.Router();
const bookController= require("../controllers/book_controller")
router.route("/").get(bookController.getAllBooks)
                       .post(bookController.addBook)

router.route("/:id").patch(bookController.updateBook)
                            .delete(bookController.deleteBook)
                              .get(bookController.getBookById)
                        




module.exports = router