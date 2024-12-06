import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EBookManager.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Slide from '@mui/material/Slide';
import { useNavigate } from 'react-router-dom';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const ITEMS_PER_PAGE = 12;
const API_BASE_URL = 'http://localhost:9090/api';

const EBookManager = () => {
    const navigate = useNavigate();
    const [ebooks, setEbooks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [startIndex, setStartIndex] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        price: '',
        date_publication: '',
        cover: '',
        description: ''
    });

    const fetchEbooks = async () => {
        if (!searchQuery.trim()) {
            setEbooks([]);
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await axios.get(GOOGLE_BOOKS_API, {
                params: {
                    q: searchQuery,
                    startIndex: startIndex,
                    maxResults: ITEMS_PER_PAGE,
                    printType: 'books',
                    projection: 'full'
                }
            });
            
            if (!response.data.items) {
                setError('No books found. Try a different search term.');
                setEbooks([]);
                return;
            }

            const formattedBooks = response.data.items
                .filter(book => book.volumeInfo)
                .map(book => {
                    const volumeInfo = book.volumeInfo;
                    const imageLinks = volumeInfo.imageLinks || {};
                    
                    // Get the highest quality image available
                    const coverImage = imageLinks.extraLarge || 
                                     imageLinks.large || 
                                     imageLinks.medium || 
                                     imageLinks.small || 
                                     imageLinks.thumbnail || 
                                     imageLinks.smallThumbnail || 
                                     '';

                    return {
                        id: book.id,
                        title: volumeInfo.title || 'Untitled',
                        author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
                        description: volumeInfo.description || 'No description available',
                        cover: coverImage.replace('http:', 'https:'),
                        previewLink: volumeInfo.previewLink || '',
                        pageCount: volumeInfo.pageCount,
                        publishedDate: volumeInfo.publishedDate,
                        categories: volumeInfo.categories || [],
                        averageRating: volumeInfo.averageRating,
                        language: volumeInfo.language,
                        publisher: volumeInfo.publisher
                    };
                });

            if (startIndex === 0) {
                setEbooks(formattedBooks);
            } else {
                setEbooks(prevBooks => [...prevBooks, ...formattedBooks]);
            }
            setError(null);
        } catch (error) {
            console.error('Error fetching books:', error);
            setError('Failed to fetch books. Please try again.');
            if (startIndex === 0) {
                setEbooks([]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDialog = (book) => {
        setSelectedBook(book);
        setFormData({
            title: book.title || '',
            author: book.author || '',
            price: '0.00',
            date_publication: book.publishedDate || new Date().toISOString().split('T')[0],
            cover: book.cover || '',
            description: book.description || ''
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedBook(null);
        setFormData({
            title: '',
            author: '',
            price: '',
            date_publication: '',
            cover: '',
            description: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddToCollection = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE_URL}/books`, formData);
            
            if (response.status === 201) {
                handleCloseDialog();
                
                // Clear any existing toasts
                toast.dismiss();
                
                // Show success message
                toast.success('Book added successfully! Redirecting...', {
                    position: "top-center",
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: false,
                    onClose: () => toast.dismiss()
                });
                
                // Navigate after toast duration
                setTimeout(() => {
                    window.location.href = '/books';
                }, 1000);
            }
        } catch (error) {
            console.error('Error adding book to collection:', error);
            
            // Clear any existing toasts
            toast.dismiss();
            
            toast.error('Failed to add book. Please try again', {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                onClose: () => toast.dismiss()
            });
        }
    };

    useEffect(() => {
        if (searchQuery.trim()) {
            fetchEbooks();
        }
    }, [startIndex]);

    const handleSearch = (e) => {
        e.preventDefault();
        setEbooks([]);
        setStartIndex(0);
        setError(null);
        fetchEbooks();
    };

    const loadMore = () => {
        if (!isLoading) {
            setStartIndex(prevIndex => prevIndex + ITEMS_PER_PAGE);
        }
    };

    return (
        <div className="ebooks-container">
            <ToastContainer
                position="top-center"
                autoClose={1000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable={false}
                pauseOnHover={false}
                theme="light"
                limit={1}
                toastClassName="custom-toast"
            />
            
            <div className="ebooks-header">
                <h1>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    eBook Collection
                </h1>
            </div>

            <div className="ebook-search">
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for any book (e.g., 'Harry Potter', 'The Lord of the Rings')..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                    />
                    <button type="submit" disabled={!searchQuery.trim()}>
                        Search
                    </button>
                </form>
            </div>

            {isLoading && ebooks.length === 0 ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">Loading eBooks...</div>
                </div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : ebooks.length === 0 ? (
                <div className="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3>Search for eBooks</h3>
                    <p>Enter a search term to discover amazing books!</p>
                </div>
            ) : (
                <>
                    <div className="ebook-grid">
                        {ebooks.map(book => (
                            <div key={book.id} className="ebook-card">
                                <div className="ebook-cover">
                                    {book.cover ? (
                                        <img src={book.cover} alt={book.title} loading="lazy" />
                                    ) : (
                                        <div className="no-cover">No Cover</div>
                                    )}
                                </div>
                                <div className="ebook-info">
                                    <h3>{book.title}</h3>
                                    <p className="ebook-author">{book.author}</p>
                                    {book.averageRating && (
                                        <div className="ebook-rating">
                                            Rating: {book.averageRating} ★
                                        </div>
                                    )}
                                    <div className="ebook-actions" style={{ 
                                        display: 'flex',
                                        gap: '8px',
                                        justifyContent: 'center'
                                    }}>
                                        <Button
                                            href={book.previewLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="action-button preview-button"
                                            variant="contained"
                                            sx={{
                                                backgroundColor: '#6366f1',
                                                color: 'white',
                                                flex: 1,
                                                maxWidth: '160px',
                                                '&:hover': {
                                                    backgroundColor: '#4f46e5',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 8px rgba(99, 102, 241, 0.3)',
                                                },
                                                transition: 'all 0.2s ease-in-out',
                                                textTransform: 'none',
                                                borderRadius: '8px',
                                                padding: '8px 16px',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            Preview Book
                                        </Button>
                                        <Button
                                            onClick={() => handleOpenDialog(book)}
                                            className="action-button add-button"
                                            variant="outlined"
                                            sx={{
                                                borderColor: '#6366f1',
                                                color: '#6366f1',
                                                flex: 1,
                                                maxWidth: '160px',
                                                '&:hover': {
                                                    borderColor: '#4f46e5',
                                                    backgroundColor: 'rgba(99, 102, 241, 0.04)',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 8px rgba(99, 102, 241, 0.2)',
                                                },
                                                transition: 'all 0.2s ease-in-out',
                                                textTransform: 'none',
                                                borderRadius: '8px',
                                                padding: '8px 16px',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            Add to Collection
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {ebooks.length > 0 && (
                        <div className="load-more">
                            <button onClick={loadMore} disabled={isLoading}>
                                {isLoading ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}
                </>
            )}

            <Dialog
                open={openDialog}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleCloseDialog}
                aria-describedby="add-book-dialog"
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Add Book to Collection</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleAddToCollection} className="book-form">
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Author"
                            name="author"
                            value={formData.author}
                            onChange={handleInputChange}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Price"
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Publication Date"
                            name="date_publication"
                            type="date"
                            value={formData.date_publication}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Description"
                            name="description"
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={handleInputChange}
                        />
                        {formData.cover && (
                            <img 
                                src={formData.cover} 
                                alt="Book cover preview" 
                                style={{ maxWidth: '200px', marginTop: '16px' }} 
                            />
                        )}
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleAddToCollection} color="primary" variant="contained">
                        Add to Collection
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default EBookManager;
