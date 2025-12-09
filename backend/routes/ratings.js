const express = require('express')
const router = express.Router()
const Rating = require('../models/rating')

async function getRating(req, res, next) {
    // Middleware to get rating by ID
    let rating
    try {
        rating = await Rating.findById(req.params.id)
        if (rating == null) {
            return res.status(404).json({ message: 'Cannot find rating' })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
    res.rating = rating
    next()
}


// Getting all
router.get('/', async(req, res) => {
    try {
        const ratings = await Rating.find()
        res.json(ratings)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Getting one
router.get('/:id', getRating, (req, res) => {
    res.json(res.rating)
})


// Creating one
router.post('/', async(req, res) => {
    // req.body
    const rating = new Rating({
        user_id: req.body.user_id,
        username: req.body.username,
        album: req.body.album,
        album_id: req.body.album_id,
        likes: req.body.likes || 0,
        stars: req.body.stars,
        comments: req.body.comments,
        review: req.body.review,
        tracklist_rating: req.body.tracklist_rating,
        //date: req.body.date
    })

    try {
        const newRating = await rating.save()
        res.status(201).json(newRating)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Updating one
router.patch('/:id', getRating, async (req, res) => {
    if (req.body.username != null) {
        res.rating.username = req.body.username
    }
    if (req.body.album != null) {
        res.rating.album = req.body.album
    }
    if (req.body.artist != null) {
        res.rating.artist = req.body.artist
    }
    if (req.body.rating != null) {
        res.rating.rating = req.body.rating
    }
    if (req.body.review != null) {
        res.rating.review = req.body.review
    }
    try {
        const updatedRating = await res.rating.save()
        res.json(updatedRating)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Deleting one
router.delete('/:id', getRating, async (req, res) => {
    try {
        await res.rating.deleteOne()
        res.json({ message: 'Deleted Rating' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//get all ratings from a user
router.get('/user/:username', async (req, res) => {
    try {
        const ratings = await Rating.find({ username: req.params.username })
        res.json(ratings)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//get all ratings for an album (in case we want to implement a feature)
router.get('/album/:album', async (req, res) => {
    try {
        const ratings = await Rating.find({ album: req.params.album })
        res.json(ratings)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.get('/popular/trending', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const daysAgo = parseInt(req.query.days) || 7;
        
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - daysAgo);
        
        const trendingRatings = await Rating.find({
            date: { $gte: dateThreshold }
        })
            .sort({ likes: -1, date: -1 })
            .limit(limit);
        
        res.json(trendingRatings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router