const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

const app = express();


app.use(helmet()); 
app.use(cors()); 
app.use(morgan('dev')); 
app.use(express.json()); 
app.use(express.static("public")); 



let books = [
    { "id": 1, "title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "publishedYear": 1925, "isRead": true },
    { "id": 2, "title": "1984", "author": "George Orwell", "publishedYear": 1949, "isRead": false },
    { "id": 3, "title": "The Hobbit", "author": "J.R.R. Tolkien", "publishedYear": 1937, "isRead": true }
];


function validateYear(req, res, next) {
    const currentYear = new Date().getFullYear();
    const { publishedYear } = req.body;

    if (publishedYear && publishedYear > currentYear) {
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

app.post("/books", 
    [
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('author').trim().notEmpty().withMessage('Author is required'),
        body('publishedYear').isNumeric().withMessage('Year must be a number'),
        validateYear
    ], 
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, author, publishedYear, isRead } = req.body;

        const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;

        const newBook = {
            id: newId,
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
    const { isRead, title, author, publishedYear } = req.body;

    const bookIndex = books.findIndex(b => b.id === id);

    if (bookIndex !== -1) {
    
        books[bookIndex] = { 
            ...books[bookIndex], 
            title: title || books[bookIndex].title,
            author: author || books[bookIndex].author,
            publishedYear: publishedYear || books[bookIndex].publishedYear,
            isRead: isRead !== undefined ? isRead : books[bookIndex].isRead
        };
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
        res.json({ message: "Book removed from shelf", deletedBook: deletedBook[0] });
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong on our end!" });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    🚀 Bookshelf API running!
    Link: http://localhost:${PORT}/books
    Static files: http://localhost:${PORT}/
    `);
});