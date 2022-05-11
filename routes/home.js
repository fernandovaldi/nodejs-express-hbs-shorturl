const express = require('express');
const router = express.Router();

router.get("/", (req, res) => {
        const urls = [
            {origin: "www.google.com/fernando1", shortURL: "fjaasda1"},
            {origin: "www.google.com/fernando2", shortURL: "fjaasda2"},
            {origin: "www.google.com/fernando3", shortURL: "fjaasda3"},
            {origin: "www.google.com/fernando4", shortURL: "fjaasda4"}
        ]
        res.render('home', {urls: urls});
});

module.exports = router;