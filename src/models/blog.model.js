import mongoose, { Schema } from "mongoose";

const blogSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        image: {
            type: String,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        writter:{
            type: mongoose.Schema.Types.String,
            ref: "User",
            required: true,

        },
        writterAvatar:{
            type: mongoose.Schema.Types.String,
            ref: "User",
            required: true,

        }
    },
    { timestamps: true }
);

export const Blog = mongoose.model("Blog", blogSchema);
