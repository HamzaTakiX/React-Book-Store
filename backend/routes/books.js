import express from 'express';
import Book from '../models/Book.js';

const router = express.Router();

// Get all books
router.get('/', async (req, res) => {
    try {
        const books = await Book.find().sort({ date_publication: -1 });
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a new book
router.post('/', async (req, res) => {
    try {
        if (!req.body.cover) {
            return res.status(400).json({ message: 'Cover image is required' });
        }

        const book = new Book({
            title: req.body.title,
            author: req.body.author,
            price: req.body.price,
            date_publication: req.body.date_publication,
            cover: req.body.cover,
            description: req.body.description
        });

        const newBook = await book.save();
        res.status(201).json(newBook);
    } catch (error) {
        console.error('Create error:', error);
        res.status(400).json({ message: error.message || 'Error creating book' });
    }
});

// Update a book
router.put('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Create update data with all fields
        const updateData = {
            title: req.body.title,
            author: req.body.author,
            price: req.body.price,
            description: req.body.description,
            date_publication: req.body.date_publication,
            cover: req.body.cover || book.cover // Keep existing cover if no new one provided
        };

        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json(updatedBook);
    } catch (error) {
        console.error('Update error:', error);
        res.status(400).json({ message: error.message || 'Error updating book' });
    }
});

// Delete a book
router.delete('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        await Book.findByIdAndDelete(req.params.id);
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
