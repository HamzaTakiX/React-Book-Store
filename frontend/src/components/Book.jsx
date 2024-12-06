function Book({book}){
    // Format the date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Format the price
    const formatPrice = (price) => {
        if (!price) return '0.00';
        return Number(price).toFixed(2);
    };

    return <>
    <tr>
        <td>{book.title}</td>
        <td>{formatPrice(book.price)}</td>
        <td>{book.author}</td>
        <td>{formatDate(book.date_publication)}</td>
    </tr>
    </>
}
export default Book;