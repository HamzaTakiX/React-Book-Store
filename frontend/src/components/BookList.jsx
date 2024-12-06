import { useState,useEffect } from "react";
import Book from './Book'
import './BookList.css'
import axios from 'axios'

function BookList(){
    const [books,setBooks]=useState([]);
    
    useEffect(()=>{
        fetchBooks();
    },[])
    
    async function fetchBooks(){
        try {
            const res = await axios.get("http://localhost:9090/api/books");
            // Log the entire response
            console.log("Books from API:", res.data);
            
            // If we have books, log the first one's structure
            if (res.data && res.data.length > 0) {
                const firstBook = res.data[0];
                console.log("First book structure:", {
                    title: firstBook.title,
                    author: firstBook.author,
                    date: firstBook.date_publication
                });
            }
            
            setBooks(res.data);
        } catch (error) {
            console.error("Error fetching books:", error);
        }
    }

    return (
        <div>
            <h2>Debug Info:</h2>
            <pre>
                {JSON.stringify(books, null, 2)}
            </pre>
            
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>prix</th>
                        <th>auhtor</th>
                        <th>Date de publication</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map((b,index)=>{
                        return <Book key={index} book={b}/>
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default BookList;