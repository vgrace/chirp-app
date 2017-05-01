var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username: String,
    password: String, //hash created from password
    created_at: { type: Date, default: Date.now }
});

var postSchema = new mongoose.Schema({
    created_by: String,//{ type: Schema.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now },
    text: String
});

// Declare models to use previously created schemas
mongoose.model('Post', postSchema);
mongoose.model('User', userSchema);