const express = require('express')
const router = express.Router()
const Comment = require('../models/comment')
const Rating = require('../models/rating')

async function getComment(req, res, next) {
    // Middleware to get rating by ID
    let comment
    try {
        comment = await Comment.findById(req.params.id)
        if (comment == null) {
            return res.status(404).json({ message: 'Cannot find comment' })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
    res.comment = comment
    next()
}

//getone
router.get('/:id', getComment, (req, res) => {
    res.json(res.comment)
})

//create comment
router.post('/', async (req, res) => {
    const { user_id, rating_id, comment_body } = req.body;

    if (!user_id || !rating_id || !comment_body) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const comment = new Comment({
            user_id,
            rating_id,
            comment_body,
            likes: 0,
            child_comments: []
        });

        const newComment = await comment.save();

        const rating = await Rating.findById(rating_id);
        if (!rating) {
            return res.status(404).json({ message: 'Rating not found' });
        }

        rating.comments.push(newComment._id);
        await rating.save();
        res.status(201).json(newComment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});


//delete comment
router.delete('/:id', getComment, async (req, res) => {
    try {
        await res.comment.deleteOne()
        res.json({ message: 'Deleted comment' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})



//get all comments for a single rating
router.get('/rating/:rating_id', async (req, res) => {
    try {
        const comments = await Comment.find({ rating_id: req.params.rating_id })
        res.json(comments)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})



//reply to a comment
router.post('/:id/reply', getComment, async (req, res) => {
    try {
        const reply = new Comment({
            user_id: req.body.user_id,
            rating_id: res.comment.rating_id,
            comment_body: req.body.comment_body
        })

        const savedReply = await reply.save()
        res.comment.child_comments.push(savedReply._id)
        await res.comment.save()

        res.status(201).json(savedReply)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

//updating likes for comment
router.patch('/:id/like', getComment, async (req, res) => {
    try {
        res.comment.likes += 1; // increment likes by 1
        await res.comment.save();
        res.json({ likes: res.comment.likes });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
