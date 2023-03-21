const { nanoid } = require("nanoid");
const books = require("./books");
const { z } = require("zod");

// Adding a book
const addBook = (request, h) => {
  // Unpack the request payload
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  // Generate required data
  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const finished = pageCount === readPage;
  const updatedAt = insertedAt;

  // Books object
  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  // Validate the request payload
  const schema = z.object({
    name: z.string({
      required_error: "Gagal menambahkan buku. Mohon isi nama buku",
    }),
    readPage: z.number().max(pageCount, {
      message:
        "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
    }),
    pageCount: z.number().min(1),
  });

  const isValid = schema.safeParse(newBook);

  // Return failed response if validation failed
  if (!isValid.success) {
    const response = h.response({
      status: "fail",
      message: isValid.error.issues[0].message,
    });
    response.code(400);
    return response;
  }

  // Save the book
  books.push(newBook);
  const success = books.filter((book) => book.id === id).length > 0;

  // return success response
  if (success) {
    const response = h.response({
      status: "success",
      message: "Buku berhasil ditambahkan",
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }
};

// Get all books
const getAllBooks = (request, h) => {
  const { name, reading, finished } = request.query;

  // Return default empty array if there is no books
  if (books.length === 0) {
    const response = h.response({
      status: "success",
      data: {
        books: [],
      },
    });
    response.code(200);
    return response;
  }

  // Filter books according to query
  let filteredBooks = books;

  if (name) {
    filteredBooks = filteredBooks.filter((book) =>
      book.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (reading) {
    filteredBooks = filteredBooks.filter(
      (book) => book.reading === (reading === "1")
    );
  }

  if (finished) {
    filteredBooks = filteredBooks.filter(
      (book) => book.finished === (finished === "1")
    );
  }

  // Return filtered books
  const response = h.response({
    status: "success",
    data: {
      books: filteredBooks.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      })),
    },
  });
  response.code(200);

  return response;
};

// Get book by id
const getBookById = (request, h) => {
  const { bookId } = request.params;

  // Search books by id
  const book = books.filter((n) => n.id === bookId)[0];

  // Return book if found
  if (book) {
    const response = h.response({
      status: "success",
      data: {
        book,
      },
    });

    response.code(200);
    return response;
  }

  // Return fail if book not found
  const response = h.response({
    status: "fail",
    message: "Buku tidak ditemukan",
  });

  response.code(404);
  return response;
};

// Edit book
const editBookById = (request, h) => {
  const { bookId } = request.params;

  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const updatedAt = new Date().toISOString();
  const finished = pageCount === readPage;

  // Search for the book
  const index = books.findIndex((book) => book.id === bookId);

  // Validate data
  const schema = z.object({
    name: z.string({
      required_error: "Gagal memperbarui buku. Mohon isi nama buku",
    }),
    readPage: z.number().max(pageCount, {
      message:
        "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
    }),
    pageCount: z.number().min(1),
  });

  const isValid = schema.safeParse({
    name,
    readPage,
    pageCount,
  });

  // Return failed response if validation failed
  if (!isValid.success) {
    const response = h.response({
      status: "fail",
      message: isValid.error.issues[0].message,
    });
    response.code(400);
    return response;
  }

  // Update the books in the array if id is found
  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      updatedAt,
    };

    const response = h.response({
      status: "success",
      message: "Buku berhasil diperbarui",
    });

    response.code(200);
    return response;
  }

  // Return failed response if id is not found
  const response = h.response({
    status: "fail",
    message: "Gagal memperbarui buku. Id tidak ditemukan",
  });

  response.code(404);
  return response;
};

// delete book
const deleteBookById = (request, h) => {
  const { bookId } = request.params;

  // find the book in the array
  const index = books.findIndex((book) => book.id === bookId);

  // Delete book and return response
  if (index !== -1) {
    books.splice(index, 1);

    const response = h.response({
      status: "success",
      message: "Buku berhasil dihapus",
    });

    response.code(200);
    return response;
  }

  // Return fail if book not found
  const response = h.response({
    status: "fail",
    message: "Buku gagal dihapus. Id tidak ditemukan",
  });

  response.code(404);
  return response;
};

module.exports = {
  addBook,
  getAllBooks,
  getBookById,
  editBookById,
  deleteBookById,
};
