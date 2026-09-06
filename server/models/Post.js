const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, default: '' },
    category: { type: String, required: true },
    tags: { type: [String], default: [] },
    district: { type: String, default: '' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    anonymous: { type: Boolean, default: false },
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pinned: { type: Boolean, default: false },
    replies: [replySchema],
  },
  { timestamps: true }
);

postSchema.methods.toPublicJSON = function (currentUserId) {
  return {
    id: this._id,
    title: this.title,
    body: this.body,
    category: this.category,
    tags: this.tags,
    district: this.district,
    authorName: this.anonymous ? 'Anonymous' : this.authorName,
    votes: this.voters.length,
    votedByMe: currentUserId ? this.voters.some((v) => v.toString() === currentUserId.toString()) : false,
    pinned: this.pinned,
    repliesCount: this.replies.length,
    replies: this.replies.map((r) => ({
      id: r._id,
      authorName: r.authorName,
      body: r.body,
      createdAt: r.createdAt,
    })),
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Post', postSchema);
