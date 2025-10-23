import mangoose, { Schema, Document, Types } from 'mongoose';

export interface IEntry extends Document{
    title?: string;
    content?: Array<{ [key:string]:any }>;
    subsections?: Array<{ [key:string]:any }>;
    date: Date;
    tags?: Array<{ [key:string]:any }>;
    chapterId: string;
    encrypted: boolean;
    favourite: boolean;
    imageUrl: string[];
}

const entrySchema: Schema = new Schema({
    title: { type: String },
    content: [{ type: Map, of: Schema.Types.Mixed }],  // Dynamic content
    subsections: [{ type: Map, of: Schema.Types.Mixed }],  // Dynamic content
    date: { type: Date, required: true },
    tags: [{ type: Map, of: Schema.Types.Mixed }],  // Dynamic content
    chapterId: { type: String, required: true },
    encrypted: {type: Boolean },
    favourite: {type: Boolean },
    imageUrl: [String]
});

interface IDevice {
    deviceId: string,
    deviceName: string,
    deviceType: string,
    publicKey: string,
    encryptedKey: string
}

const Entry = mangoose.model<IEntry>('Entry', entrySchema);
export default Entry;