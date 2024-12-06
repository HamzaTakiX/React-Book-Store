import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, default: 0 },
    date_publication: { type: Date, default: Date.now },
    author: { type: String, required: true },
    cover: { type: String }, // Made cover optional for updates
    description: { type: String, required: true },
    orders: [{ type: mongoose.Types.ObjectId, ref: "Order" }]
}, {
    timestamps: true
});

const Book = mongoose.model("Book", bookSchema);

export default Book;