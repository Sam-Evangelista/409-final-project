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

module.exports = router

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
        username: req.body.username,
        album: req.body.album,
        artist: req.body.artist,
        rating: req.body.rating,
        review: req.body.review
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

