const BookModel =require('../models/Book')

async function getAllBooks(book) {
    return await BookModel.find(book);
}

async function addBook(book){
    return await BookModel.create(book);
}

async function getBookById(idB){
    return await BookModel.findById(idB)
}

async function updateBook(idB,book){
    return await BookModel.findByIdAndUpdate(idB,book)
}

async function deleteBook(idB) {
    return await BookModel.findByIdAndDelete(idB);
    
}

module.exports = {getAllBooks,addBook,getBookById,updateBook,deleteBook}

