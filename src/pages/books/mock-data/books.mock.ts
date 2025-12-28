/* eslint-disable prefer-const */

import type { Book, BookAccess, BookOrder } from "../Types/books.types";

function iso(d: Date) {
  return d.toISOString();
}

export let BOOKS: Book[] = [
  {
    id: "b1",
    title: "Applied Mathematics — Grade 8-9",
    author: "Author Name",
    publisher: "Publisher Name",
    description: "A complete guide with exercises and solved examples.",
    price: 1500,
    currency: "PKR",
    fileType: "pdf",
    coverUrl: "https://images.unsplash.com/photo-1759337283317-a452c486d79a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw1fHx8ZW58MHx8fHx8.png",
    fileUrl: "",
    subjectId: "s1",
    subjectTitle: "Applied Mathematics",
    courseId: "c1",
    courseTitle: "Trigonometry",
    status: "published",
    createdAt: iso(new Date(Date.now() - 8640_000 * 10)),
    updatedAt: iso(new Date(Date.now() - 8640_000 * 2)),
  },
  {
    id: "b2",
    title: "Physics Basics — Volume 1",
    author: "Author Name",
    publisher: "Publisher Name",
    description: "Concepts + practical understanding for beginners.",
    price: 1200,
    currency: "PKR",
    fileType: "pdf",
    coverUrl: "https://images.unsplash.com/photo-1766858667597-a9ba9d49473a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxMHx8fGVufDB8fHx8fA%3D%3D.png",
    fileUrl: "",
    subjectId: "s2",
    subjectTitle: "Physics",
    courseId: "c2",
    courseTitle: "Motion",
    status: "draft",
    createdAt: iso(new Date(Date.now() - 8640_000 * 6)),
    updatedAt: iso(new Date(Date.now() - 8640_000 * 1)),
  },
];

export let BOOK_ORDERS: BookOrder[] = [
  {
    id: "o1",
    bookId: "b1",
    bookTitle: "Applied Mathematics — Grade 8-9",
    userId: "u1",
    userName: "Hassan",
    userEmail: "hassan@mail.com",
    amount: 1500,
    currency: "PKR",
    status: "paid",
    createdAt: iso(new Date(Date.now() - 8640_000 * 3)),
  },
  {
    id: "o2",
    bookId: "b1",
    bookTitle: "Applied Mathematics — Grade 8-9",
    userId: "u2",
    userName: "Ayesha",
    userEmail: "ayesha@mail.com",
    amount: 1500,
    currency: "PKR",
    status: "paid",
    createdAt: iso(new Date(Date.now() - 8640_000 * 2)),
  },
];

export let BOOK_ACCESS: BookAccess[] = [
  {
    id: "a1",
    bookId: "b1",
    userId: "u1",
    userName: "Hassan",
    userEmail: "hassan@mail.com",
    source: "order",
    grantedAt: iso(new Date(Date.now() - 8640_000 * 3)),
  },
  {
    id: "a2",
    bookId: "b1",
    userId: "u2",
    userName: "Ayesha",
    userEmail: "ayesha@mail.com",
    source: "order",
    grantedAt: iso(new Date(Date.now() - 8640_000 * 2)),
  },
];
