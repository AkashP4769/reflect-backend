import mongoose from "mongoose";
import Chapter, { IChapter } from "../models/chapterModel";
import timestampService from "./timestampService";
import { DateTime } from 'luxon';
import imageService from "./imageService";

class ChapterService{
    public async getChapters(uid: string, date: Date, explicit: boolean): Promise<IChapter[] | null> {
        if(explicit) return await Chapter.find({ uid: uid }).select('-entries');

        const chapterUpdatedAt = await timestampService.getChapterTimestamp(uid).then((user) => {
            if(user){
                return user.updateTimestamp.chapters;
            }
            else{
                return null;
            }
        });
        //console.log("Chapter updated at: " + chapterUpdatedAt + " Date: " + date + " Comparison: " + (chapterUpdatedAt && chapterUpdatedAt > date));
        if(chapterUpdatedAt && chapterUpdatedAt > date) return await Chapter.find({ uid: uid }).select('-entries');
        else return null;
    }

    public async getChapterById(id: string) : Promise<IChapter | null> {
        return await Chapter.findOne({ _id: id });
    }

    public async createChapter(chapterData: IChapter): Promise<IChapter> {
        const newChapter = new Chapter(chapterData);
        /*const chapters = await Chapter.find();
        for (const chapter of chapters) {
            if (chapter && chapter.entries) {
                let updated = false;

                for (const entry of chapter.entries) {
                    if (entry.id) {
                        entry._id = new mongoose.Types.ObjectId(entry.id);
                        delete entry.id;
                        updated = true; // Mark that an update happened
                    }
                    entry.chapterId = chapter._id as string
                }

                if (updated) {
                    chapter.markModified('entries'); // Inform Mongoose that 'entries' array has changed
                    await chapter.save(); // Save the chapter with updated entries
                }
            }
        }*/

        //return chapters[0];
        return newChapter.save();
    }

    public async updateChapter(chapterData: IChapter, id: string, date: string) : Promise<IChapter | null> {
        const newChapter = new Chapter(chapterData);
        console.log(newChapter); 

        const newImages: {[key: string]: boolean} = {};
        if(newChapter.imageUrl) for(const url of newChapter.imageUrl){
            newImages[url] = true;
        }

        const oldChapter = await Chapter.findOne({_id: id});
        if(oldChapter){
            if(oldChapter.imageUrl) for(const url of oldChapter.imageUrl){
                if(!(url in newImages)){
                    // Delete image from storage
                    await imageService.deleteImageFromS3(url);
                }
            }
        }

        return Chapter.findOneAndUpdate({_id: chapterData._id}, {"$set" : {title: chapterData.title, description: chapterData.description, date: new Date(date), imageUrl: chapterData.imageUrl}}, {new: true});
    }

    public async deleteChapter(id: string) : Promise<IChapter | null>{
        return Chapter.findOneAndDelete({_id: id});
    }

    public async incrementEntryCoun(id: string) : Promise<IChapter | null>{
        return Chapter.findOneAndUpdate({_id: id}, {$inc: {entryCount: 1}}, {new: true});
    }

    public async decrementEntryCoun(id: String) : Promise<IChapter | null>{
        console.log("Decrementing entry count for chapter: " + id);
        return Chapter.findOneAndUpdate({_id: id}, {$inc: {entryCount: -1}}, {new: true});
    }

    public async importAll(uid: String) : Promise<IChapter[] | null>{
        return await Chapter.find({uid: uid});
    }

    public async exportAll(uid: String, newChapters: IChapter[]) : Promise<IChapter[] | null>{
        console.log("Exporting all chapters for user: " + uid);
        //its not deleteing all the records
        await Chapter.deleteMany({uid: uid});

        for(const chapter of newChapters){
            await Chapter.insertMany(chapter);
        }

        return newChapters;
    }
}

export default new ChapterService();















/*public async updateChapter(uid: string, id: string, chapterData: IChapter): Promise<IChapter | null> {
        return await Chapter.findOneAndUpdate({ uid: uid, _id: id }, chapterData, { new: true });
    }*/