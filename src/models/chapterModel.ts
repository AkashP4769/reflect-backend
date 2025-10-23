import mangoose, { Schema, Document, Types } from 'mongoose';
import { IEntry } from './entryModel';

export interface IChapter extends Document {
    uid: string;
    title: string;
    description?: string;
    imageUrl?: string[];
    entryCount: number;
    entries?: [IEntry];
    date: Date;
    encrypted: boolean;
};

const chapterSchema: Schema = new Schema({
    uid: {type: String, required: true},
    title: {type: String, required: true},
    description: String,
    imageUrl: [String],
    date: {type: Date},
    entryCount: {type: Number, required: true},
    encrypted: {type: Boolean, default: false},
    entries: [{
        title: { type: String },
        content: { type: Array<{ [key: string]: any }> },  // Use dynamic keys for content
        subsections: [{ type: Schema.Types.Mixed }],
        date: { type: Date, required: true },
        tags: { type: Array<{ [key: string]: any }> },  // Use dynamic keys for content
        chapterId: { type: String, required: true },
        encrypted: {type: Boolean, default: false},
        favourite: {type: Boolean },
        imageUrl: [String]
    }],}, 
    { timestamps: true }
);

const Chapter = mangoose.model<IChapter>('Chapter', chapterSchema);
export default Chapter;
