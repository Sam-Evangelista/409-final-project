const express = require('express')
const router = express.Router()
const Comment = require('../model/comment')

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
    const comment = new Comment({
        user_id: req.body.user_id,
        rating_id: req.body.rating_id,
        comment_body: req.body.comment_body,
        likes: req.body.likes || 0,
        child_comments: req.body.child_comments || [],
        //date: req.body.date
    })

    try {
        const newComment = await comment.save()
        res.status(201).json(newComment)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

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
