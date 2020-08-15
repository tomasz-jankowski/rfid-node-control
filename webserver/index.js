const express = require('express'),
      app = express(),
      mongoose = require('mongoose');

const User = require('./models/user');

mongoose.connect('mongodb://localhost:27017/rfid', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true
})
.then(() => console.log("Connected to DB"))
.catch(err => console.log(err.message));

app.get('/', (req, res) => {
    console.log("get request");

   User.findOne({ uid: req.params.uid }).exec((err, foundUser) => {
        if(err)
            res.sendStatus(404);
        else
            res.json(foundUser);
   });
});

app.listen(8080, () => {
    console.log("Server started");
});