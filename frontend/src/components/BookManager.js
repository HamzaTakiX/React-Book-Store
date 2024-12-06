import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './BookManager.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TextField, IconButton, Paper, Box, Menu, MenuItem, InputAdornment, Button, Fade } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import ClearIcon from '@mui/icons-material/Clear';

const API_BASE_URL = 'http://localhost:9090/api';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const BookManager = () => {
    const [books, setBooks] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        price: '',
        date_publication: '',
        cover: '',
        description: ''
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [showEmptySearch, setShowEmptySearch] = useState(false);
    const [sortAnchor, setSortAnchor] = useState(null);
    const [sortOrder, setSortOrder] = useState('desc');
    const [sortField, setSortField] = useState('date');
    const [showAddForm, setShowAddForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toastConfig = {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        rtl: false,
        pauseOnFocusLoss: false,
        draggable: false,
        pauseOnHover: true,
        theme: "light"
    };

    const showToast = (type, message) => {
        const id = toast[type](message, {
            ...toastConfig,
            onOpen: () => {
                setTimeout(() => {
                    toast.dismiss(id);
                }, toastConfig.autoClose);
            }
        });
    };

    const fetchBooks = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/books`);
            setBooks(response.data);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch books!';
            setError(errorMessage);
            showToast('error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredBooks([...books].sort(sortBooks));
            setShowEmptySearch(false);
            return;
        }

        const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
        const filtered = books.filter(book => 
            searchTerms.every(term =>
                book.title.toLowerCase().includes(term) ||
                book.author.toLowerCase().includes(term)
            )
        ).sort(sortBooks);

        setFilteredBooks(filtered);
        setShowEmptySearch(filtered.length === 0);
    }, [searchQuery, books, sortField, sortOrder]);

    const sortBooks = (a, b) => {
        const multiplier = sortOrder === 'asc' ? 1 : -1;
        
        switch(sortField) {
            case 'date':
                return multiplier * (new Date(a.publishDate) - new Date(b.publishDate));
            case 'price':
                return multiplier * (parseFloat(a.price) - parseFloat(b.price));
            default:
                return multiplier * a[sortField].localeCompare(b[sortField]);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date) 
            ? date.toISOString().split('T')[0]
            : '';
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast('error', 'Image size should be less than 5MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                showToast('error', 'Please upload an image file');
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result;
                setFormData(prev => ({
                    ...prev,
                    cover: base64String
                }));
                setPreviewImage(base64String);
            };
            reader.onerror = () => {
                console.error('FileReader error:', reader.error);
                showToast('error', 'Error reading image file');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const checkServerConnection = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/books`);
            return response.status === 200;
        } catch (error) {
            console.error('Server connection check failed:', error.message);
            return false;
        }
    };

    const handleEdit = (book) => {
        if (!book || !book._id) {
            showToast('error', 'Invalid book data');
            return;
        }

        setEditingId(book._id);
        setFormData({
            title: book.title || '',
            author: book.author || '',
            price: book.price || '',
            description: book.description || '',
            cover: book.cover || '',
            date_publication: formatDate(book.date_publication)
        });
        setPreviewImage(book.cover || null);
        showToast('info', 'Editing book...');
        
        // Scroll to form
        window.scrollTo({ 
            top: document.querySelector('.book-form').offsetTop - 20, 
            behavior: 'smooth' 
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (!formData.title || !formData.author || !formData.price || !formData.description) {
                showToast('error', 'Please fill in all required fields');
                return;
            }

            setIsSubmitting(true);
            setIsLoading(true);
            setError(null);

            // Always include cover in the request
            const bookData = {
                title: formData.title.trim(),
                author: formData.author.trim(),
                price: Number(formData.price),
                description: formData.description.trim(),
                publishDate: formatDate(formData.date_publication),
                cover: formData.cover || ''  // Always send cover, even if empty
            };

            // Require cover for new books
            if (!editingId && !bookData.cover) {
                showToast('error', 'Please add a cover image');
                setIsSubmitting(false);
                setIsLoading(false);
                return;
            }

            const config = {
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };

            let response;
            if (editingId) {
                response = await axios.put(`${API_BASE_URL}/books/${editingId}`, bookData, config);
            } else {
                response = await axios.post(`${API_BASE_URL}/books`, bookData, config);
            }

            if (response.data) {
                showToast('success', `Book ${editingId ? 'updated' : 'added'} successfully!`);
                setFormData({
                    title: '',
                    author: '',
                    price: '',
                    date_publication: '',
                    cover: '',
                    description: ''
                });
                setPreviewImage(null);
                setEditingId(null);
                await fetchBooks();
            }
        } catch (error) {
            console.error('Error:', error.response?.data || error);
            const errorMessage = error.response?.data?.message || 'Error saving book';
            setError(errorMessage);
            showToast('error', errorMessage);
        } finally {
            setIsSubmitting(false);
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!bookToDelete) return;

        try {
            const response = await axios.delete(`${API_BASE_URL}/books/${bookToDelete._id}`);
            if (response.status === 200) {
                // Update books list and close dialog first
                setBooks(books.filter(book => book._id !== bookToDelete._id));
                setBookToDelete(null);
                setDeleteDialogOpen(false);
                
                // Clear existing toasts and show new one
                toast.dismiss();
                setTimeout(() => {
                    toast.success('Book deleted successfully', {
                        position: "top-center",
                        autoClose: 1000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: false
                    });
                    // Force dismiss after 1 second
                    setTimeout(() => toast.dismiss(), 1000);
                }, 100);
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            toast.dismiss();
            toast.error('Failed to delete book. Please try again', {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false
            });
            setTimeout(() => toast.dismiss(), 1000);
        }
    };

    const handleDeleteClick = (book) => {
        setBookToDelete(book);
        setDeleteDialogOpen(true);
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setBookToDelete(null);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSortClick = (event) => {
        setSortAnchor(event.currentTarget);
    };

    const handleSortClose = () => {
        setSortAnchor(null);
    };

    const handleSort = (field) => {
        if (field === sortField) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
        handleSortClose();
    };

    return (
        <div className="book-manager">
            <ToastContainer
                position="top-center"
                autoClose={1000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable={false}
                pauseOnHover={false}
                theme="light"
                limit={1}
            />
            
            <div className="book-manager-content">
                <div className="unified-container">
                    {!isLoading && (
                        <>
                            <div className="section-header">
                                <h2>Book Collection</h2>
                                <button
                                    className={`add-book-button ${showAddForm ? 'active' : ''}`}
                                    onClick={() => setShowAddForm(!showAddForm)}
                                >
                                    <span className="button-icon">
                                        {showAddForm ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        )}
                                    </span>
                                    <span className="button-text">
                                        {showAddForm ? 'Hide Form' : 'Add New Book'}
                                    </span>
                                </button>
                            </div>

                            {showAddForm && (
                                <div className="add-book-section">
                                    <div className="section-content">
                                        <form onSubmit={handleSubmit} className="add-book-form">
                                            <div className="form-layout">
                                                <div className="form-left">
                                                    <div className="cover-upload">
                                                        <div className="cover-preview" 
                                                             style={{ 
                                                                 backgroundImage: previewImage ? `url(${previewImage})` : 'none',
                                                                 backgroundSize: 'cover',
                                                                 backgroundPosition: 'center'
                                                             }}>
                                                            {!previewImage && (
                                                                <div className="upload-placeholder">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 2.828L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                    <p>Click to upload cover</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleImageChange}
                                                            className="cover-input"
                                                            id="cover-input"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-right">
                                                    <div className="form-group">
                                                        <label htmlFor="title">Title</label>
                                                        <input
                                                            type="text"
                                                            id="title"
                                                            name="title"
                                                            value={formData.title}
                                                            onChange={handleInputChange}
                                                            required
                                                            placeholder="Enter book title"
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="author">Author</label>
                                                        <input
                                                            type="text"
                                                            id="author"
                                                            name="author"
                                                            value={formData.author}
                                                            onChange={handleInputChange}
                                                            required
                                                            placeholder="Enter author name"
                                                        />
                                                    </div>
                                                    <div className="form-row">
                                                        <div className="form-group">
                                                            <label htmlFor="price">Price</label>
                                                            <input
                                                                type="number"
                                                                id="price"
                                                                name="price"
                                                                value={formData.price}
                                                                onChange={handleInputChange}
                                                                required
                                                                placeholder="Enter price"
                                                                step="0.01"
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="date_publication">Publication Date</label>
                                                            <input
                                                                type="date"
                                                                id="date_publication"
                                                                name="date_publication"
                                                                value={formData.date_publication}
                                                                onChange={handleInputChange}
                                                                max={new Date().toISOString().split('T')[0]}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="form-group description-group">
                                                        <label htmlFor="description">Book Description</label>
                                                        <textarea
                                                            id="description"
                                                            name="description"
                                                            value={formData.description}
                                                            onChange={handleInputChange}
                                                            placeholder="Enter a detailed description of the book..."
                                                        />
                                                    </div>
                                                    <div className="form-actions">
                                                        <button 
                                                            type="submit" 
                                                            className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                                                            disabled={isSubmitting}
                                                        >
                                                            {editingId ? 'Update Book' : 'Add Book'}
                                                        </button>
                                                        {editingId && (
                                                            <button
                                                                type="button"
                                                                className="cancel-button"
                                                                onClick={() => {
                                                                    setEditingId(null);
                                                                    setFormData({
                                                                        title: '',
                                                                        author: '',
                                                                        price: '',
                                                                        date_publication: '',
                                                                        cover: '',
                                                                        description: ''
                                                                    });
                                                                    setPreviewImage(null);
                                                                }}
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            <div className="book-list-section">
                                <div className="search-sort-inner">
                                    <TextField
                                        className="search-input"
                                        placeholder="Search books..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        variant="outlined"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                            endAdornment: searchQuery && (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="clear search"
                                                        onClick={() => setSearchQuery('')}
                                                        edge="end"
                                                        size="small"
                                                    >
                                                        <ClearIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                    <IconButton
                                        className="sort-button"
                                        onClick={(e) => setSortAnchor(e.currentTarget)}
                                        aria-label="Sort books"
                                    >
                                        <SortIcon />
                                    </IconButton>
                                    <Menu
                                        anchorEl={sortAnchor}
                                        open={Boolean(sortAnchor)}
                                        onClose={() => setSortAnchor(null)}
                                        TransitionComponent={Fade}
                                        PaperProps={{
                                            elevation: 3,
                                            sx: {
                                                mt: 1.5,
                                                borderRadius: '12px',
                                                minWidth: '180px',
                                                border: '1px solid rgba(99, 102, 241, 0.1)',
                                                '& .MuiMenuItem-root': {
                                                    px: 2,
                                                    py: 1.5,
                                                    borderRadius: '8px',
                                                    mx: 1,
                                                    my: 0.5,
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(99, 102, 241, 0.08)'
                                                    }
                                                }
                                            }
                                        }}
                                    >
                                        <MenuItem onClick={() => handleSort('title')}>
                                            Title {sortField === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </MenuItem>
                                        <MenuItem onClick={() => handleSort('author')}>
                                            Author {sortField === 'author' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </MenuItem>
                                        <MenuItem onClick={() => handleSort('price')}>
                                            Price {sortField === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </MenuItem>
                                        <MenuItem onClick={() => handleSort('date')}>
                                            Date {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </MenuItem>
                                    </Menu>
                                </div>
                                
                                <div className="books-grid">
                                    {showEmptySearch && (
                                        <div className="empty-search-container">
                                            <SearchOffIcon className="empty-search-icon" />
                                            <p className="empty-search-text">No books found matching your search</p>
                                            <p className="empty-search-text">Try a different search term</p>
                                        </div>
                                    )}

                                    {!showEmptySearch && (
                                        <>
                                            {isLoading ? (
                                                <div className="loading-container">
                                                    <div className="loading-spinner"></div>
                                                    <div className="loading-text">Loading Books...</div>
                                                </div>
                                            ) : error ? (
                                                <div className="error-state">
                                                    <svg className="error-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <div className="error-text">Failed to load books</div>
                                                    <div className="error-subtext">{error}</div>
                                                </div>
                                            ) : filteredBooks.length === 0 ? (
                                                <div className="empty-state">
                                                    <svg className="empty-state-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                    <div className="empty-state-text">No Books Found</div>
                                                    <div className="empty-state-subtext">
                                                        {searchQuery 
                                                            ? "Try adjusting your search terms or filters"
                                                            : "Start by adding your first book to the collection"}
                                                    </div>
                                                </div>
                                            ) : (
                                                filteredBooks.map((book) => (
                                                    <div key={book._id} className="book-card">
                                                        <div className="book-cover" 
                                                             style={{ 
                                                                 backgroundImage: book.cover ? `url(${book.cover})` : 'none',
                                                                 backgroundSize: 'cover',
                                                                 backgroundPosition: 'center'
                                                             }}>
                                                            {!book.cover && (
                                                                <div className="no-cover">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="book-card-content">
                                                            <div className="book-info">
                                                                <h3 className="book-title">{book.title}</h3>
                                                                <p className="book-author">by {book.author}</p>
                                                                {book.description && (
                                                                    <p className="book-description">{book.description}</p>
                                                                )}
                                                            </div>
                                                            <div className="book-meta">
                                                                <div className="book-price">${parseFloat(book.price).toFixed(2)}</div>
                                                                <div className="book-date">
                                                                    {formatDate(book.date_publication)}
                                                                </div>
                                                            </div>
                                                            <div className="book-actions">
                                                                <button 
                                                                    className="edit-btn"
                                                                    onClick={() => handleEdit(book)}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                    Edit
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteClick(book)} 
                                                                    className="delete-btn"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            <Dialog
                                open={deleteDialogOpen}
                                TransitionComponent={Transition}
                                keepMounted
                                onClose={handleDeleteCancel}
                                aria-describedby="alert-dialog-slide-description"
                                PaperProps={{
                                    style: {
                                        borderRadius: '15px',
                                        padding: '10px'
                                    }
                                }}
                            >
                                <DialogTitle sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '10px',
                                    color: '#d32f2f'
                                }}>
                                    <WarningIcon color="error" />
                                    Confirm Deletion
                                </DialogTitle>
                                <DialogContent>
                                    <DialogContentText id="alert-dialog-slide-description">
                                        Are you sure you want to delete "<strong>{bookToDelete?.title}</strong>"?<br />
                                        This action cannot be undone.
                                    </DialogContentText>
                                </DialogContent>
                                <DialogActions sx={{ padding: '20px' }}>
                                    <Button 
                                        onClick={handleDeleteCancel}
                                        variant="outlined"
                                        sx={{ borderRadius: '8px' }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        onClick={handleDelete}
                                        variant="contained"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        sx={{ borderRadius: '8px' }}
                                    >
                                        Delete
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </>
                    )}

                    {isLoading && (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <div className="loading-text">Loading Books...</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookManager;
