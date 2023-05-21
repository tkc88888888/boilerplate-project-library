/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
var expect = require('chai').expect;
let mongodb = require('mongodb');
let mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let bookSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.ObjectId, auto: true },
  title: { type: String, required: true },
  comments: { type: Array, "default": [] }
});

let Book = mongoose.model('Book', bookSchema);

module.exports = function(app) {

  app.route('/api/books')
    .get(function(req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      let arrayOfBooks = [];
      Book.find({}, (err, arr) => {
        if (err) return console.error(err);
        if (arr) {
          arr.forEach(book => {
            book = book.toJSON();
            book['commentcount'] = book.comments.length;
            arrayOfBooks.push(book);
          })
          //console.log("GET /api/books");
          //console.log(arrayOfBooks);
          return res.json(arrayOfBooks);
        }
      });
    })

    .post(function(req, res) {
      let title = req.body.title;
      if (!title) {
        return res.send('missing required field title');
      } 
      //response will contain new book object including atleast _id and title
      let book = new Book({ title });
      book.save((err, book) => {
        if (err) return console.error(err);
        if (book){
          let { _id, title } = book;
          //console.log("POST /api/books");
          //console.log({ _id, title });
          return res.json({ _id, title });
        }
      });
    })

    .delete(function(req, res) {
      //if successful response will be 'complete delete successful'
      let deletedCount = Book.deleteMany({});
      //console.log("DELETE /api/books");
      //console.log("deletedCount is " + deletedCount);
      //console.log('complete delete successful');
      return res.send('complete delete successful');
    });




  app.route('/api/books/:id')
    .get(function(req, res) {
      let bookid = req.params.id;
      if (!bookid) {
        return res.send('missing required field title');
      } 
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      Book.findById(bookid, (err, book) => {
        if (err) return console.error(err);
        if (!book) return res.send("no book exists");
        book = book.toJSON();
        book['commentcount'] = book.comments.length;
        //console.log("GET /api/books/:id");
        //console.log(book);
        return res.json(book);
      });
    })

    .post(function(req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (!bookid) return res.send('missing required field title');
      if (!comment) return res.send('missing required field comment');
      Book.findById(bookid, (err, book) => {
        if (err) return console.error(err);
        if (!book){
          return res.send("no book exists");
        } else {
          book.comments.push(comment);
          book.save((err, book) => {
            if (err) return;// console.error(err);
          });
          //console.log("POST /api/books/:id");
          //console.log(book);
          return res.json(book);
        };
      });
    })

    .delete(function(req, res) {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      Book.findByIdAndDelete(bookid, (err, deletedBook) => {
        if (err) return console.error(err);
        if (!deletedBook) return res.send("no book exists"); 
        //console.log("DELETE /api/books/:id");
        //console.log("deletedBook is " + deletedBook);
        //console.log('delete successful');
        return res.send('delete successful');
      });
    });
};
