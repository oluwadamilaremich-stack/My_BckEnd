const express = require('express');
const app = express();

app.use(express.json());


let books = [
    { "id": 1, "title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "publishedYear": 1925, "isRead": true },
    { "id": 2, "title": "1984", "author": "George Orwell", "publishedYear": 1949, "isRead": false },
    { "id": 3, "title": "The Hobbit", "author": "J.R.R. Tolkien", "publishedYear": 1937, "isRead": true }
];


function validateYear(req, res, next) {
    const currentYear = new Date().getFullYear();
    const { publishedYear } = req.body;

    if (publishedYear > currentYear) {
        return res.status(400).json({ 
            message: `Invalid year! You cannot add a book from the future (${publishedYear}).` 
        });
    }
    next();
}


app.get("/books", (req, res) => {
    const { isRead } = req.query;

    if (isRead !== undefined) {
        const filteredBooks = books.filter(b => b.isRead.toString() === isRead);
        return res.json(filteredBooks);
    }

    res.json(books);
});


app.get("/books/:title", (req, res) => {
    const title = req.params.title;
    const book = books.find(b => b.title.toLowerCase() === title.toLowerCase());

    if (book) {
        res.json(book);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});


app.post("/books", validateYear, (req, res) => {
    const { title, author, publishedYear, isRead } = req.body;

    const newBook = {
        id: books.length + 1,
        title,
        author,
        publishedYear,
        isRead: isRead || false
    };

    books.push(newBook);
    res.status(201).json({ message: "Book added to shelf!", book: newBook });
});


app.put("/books/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const { isRead, title, author } = req.body;

    const bookIndex = books.findIndex(b => b.id === id);

    if (bookIndex !== -1) {
        books[bookIndex] = { ...books[bookIndex], isRead, title, author };
        res.json({ message: "Book updated successfully", book: books[bookIndex] });
    } else {
        res.status(404).json({ message: "Book ID not found" });
    }
});


app.delete("/books/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const bookIndex = books.findIndex(b => b.id === id);

    if (bookIndex !== -1) {
        const deletedBook = books.splice(bookIndex, 1);
        res.json({ message: "Book removed from shelf", deletedBook });
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});


app.listen(3000, () => {
    console.log("Bookshelf API running on http://localhost:3000");
});