const BookService = require('../services/bookServices');

// Récupérer tous les livres
async function getAllBooks(req, res) { 
    const books = await BookService.getAllBooks();
    res.json(books);
}

// Récupérer un livre par son ID
async function getBookById(req, res) {
    const book = await BookService.getBookById(req.params.id);
    res.json({"book": book});
}

// Ajouter un nouveau livre
async function addBook(req, res) {
    const book = await BookService.addBook(req.body);
    res.json(book);
}

// Supprimer un livre
async function deleteBook(req, res) {
    const delbook = await BookService.deleteBook(req.params.id);
    res.json(delbook)
}

// Mettre à jour un livre
async function updateBook(req, res) {
    const updatedBook = await BookService.updateBook(req.params.id, req.body);
    res.json(updatedBook);
}

module.exports = { getBookById, addBook, getAllBooks, updateBook, deleteBook };
