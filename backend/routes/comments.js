const express = require('express')
const router = express.Router()
const Comment = require('../models/comment')
const Rating = require('../models/rating')

async function getComment(req, res, next) {
    try {
        const comment = await Comment.findById(req.params.id)
            .populate({
                path: 'user_id',
                select: 'username icon'
            })
            .populate({
                path: 'child_comments',
                populate: {
                    path: 'user_id',
                    select: 'username icon'
                }
            });

        if (!comment) {
            return res.status(404).json({ message: 'Cannot find comment' });
        }

        res.comment = comment;
        next();
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}


//getone
router.get('/:id', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id)
            .populate("user_id", "username icon")        // user who wrote the comment
            .populate({
                path: "child_comments",
                populate: {
                    path: "user_id",
                    select: "username icon"
                }
            });

        if (!comment) return res.status(404).json({ message: "Cannot find comment" });

        return res.json(comment);

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});


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
router.get('/rating/:ratingId', async (req, res) => {
    try {
        const rating = await Rating.findById(req.params.ratingId);
        if (!rating)
            return res.status(404).json({ message: "Rating not found" });

        const comments = await Comment.find({ _id: { $in: rating.comments } })
            .populate("user_id", "username icon");

        const formatted = comments.map(c => ({
            _id: c._id,
            username: c.user_id.username,
            icon: c.user_id.icon,
            comment_body: c.comment_body,
            likes: c.likes,
            date: c.date,
            child_comments: [] // replies loaded separately
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});




//reply to a comment
router.post('/:id/reply', async (req, res) => {
    try {
        // Find parent comment
        const parent = await Comment.findById(req.params.id);
        if (!parent) {
            return res.status(404).json({ message: "Parent comment not found" });
        }

        // Create reply with same rating_id
        const reply = new Comment({
            user_id: req.body.user_id,
            rating_id: parent.rating_id,   // REQUIRED
            comment_body: req.body.comment_body,
            likes: 0,
            child_comments: []
        });

        const savedReply = await reply.save();

        // Add to parent's child list
        parent.child_comments.push(savedReply._id);
        await parent.save();

        // Populate reply user info before sending
        const populatedReply = await Comment.findById(savedReply._id)
            .populate("user_id", "username icon");

        res.status(201).json(populatedReply);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});



// GET replies for a comment
router.get("/:id/replies", async (req, res) => {
    try {
        const parent = await Comment.findById(req.params.id);

        if (!parent)
            return res.status(404).json({ message: "Parent comment not found" });

        const replies = await Comment.find({ _id: { $in: parent.child_comments } })
            .populate("user_id", "username icon"); // ⬅ important

        const formatted = replies.map(r => ({
            _id: r._id,
            username: r.user_id.username,
            icon: r.user_id.icon,
            comment_body: r.comment_body,
            likes: r.likes,
            date: r.date
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});




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
