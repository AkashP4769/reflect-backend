import Chapter, { IChapter } from "../models/chapterModel";
import { IEntry } from "../models/entryModel";
import chapterService from "./chapterService";
import mongoose, { ObjectId } from 'mongoose';
import imageService from "./imageService";

class EntryService{
    public async getEntries(chapterId : string) : Promise<IEntry[] | null>{
        const chapterWithEntries = await Chapter.findById(chapterId).populate<{ entries: IEntry[] }>('entries'); 
        if (chapterWithEntries && chapterWithEntries.entries) {
            return chapterWithEntries.entries as IEntry[];  // Type assertion here
        }
        else{
            throw new Error('Chapter not found');
        }
    }

    public async createEntry(entry: IEntry, chapterId: string) : Promise<IEntry>{
        const chapter = await chapterService.getChapterById(chapterId);
        if(chapter){
            console.log("subsections: " + JSON.stringify(entry.subsections));
            if(entry._id == null) entry._id = new mongoose.Types.ObjectId();
            if(chapter.entries) chapter.entries.push(entry);
            else chapter.entries = [entry];

            chapter.entryCount = chapter.entries.length;
            chapter.save();
        }
        else{
            throw new Error('Chapter not found');
        }
        return entry;
    }

    public async deleteEntry(chapterId: string, entryId: string) : Promise<IEntry | null>{
        const chapter = await chapterService.getChapterById(chapterId);
        if(chapter){
            if(chapter.entries){
                const entry = chapter.entries.find(e => e._id == entryId);
                if(entry && entry.imageUrl){
                    for(const url of entry.imageUrl){
                        // Delete image from storage
                        console.log("deleting image: " + url);
                        await imageService.deleteImageFromS3(url);
                    }

                    chapter.entries = chapter.entries.filter(e => e._id != entryId) as [IEntry];
                    chapter.entryCount = chapter.entries.length;
                    chapter.save();
                    return entry;
                }
            }
            else{
                throw new Error('Entry not found');
            }
        }
        else{
            throw new Error('Chapter not found');
        }
        return null;
    }

    public async updateEntry(entry: IEntry, chapterId: string) : Promise<IEntry | null>{
        console.log("my entry: " + JSON.stringify(entry));
        const chapter = await chapterService.getChapterById(chapterId);
        if(chapter){
            if(chapter.entries){
                console.log(entry);
                const index = chapter.entries.findIndex(e => e._id == entry._id);
                if(index != -1){
                    chapter.entries[index] = entry;
                    chapter.entries[index].content = entry.content;
                    chapter.entries[index].subsections = entry.subsections;

                    const newImages: {[key: string]: boolean} = {};
                    for(const url of entry.imageUrl){
                        newImages[url] = true;
                    }

                    for(const url of chapter.entries[index].imageUrl){
                        if(!(url in newImages)){
                            await imageService.deleteImageFromS3(url);
                        }
                    }

                    

                    chapter.entries[index].imageUrl = entry.imageUrl;
                    console.log("after sometime" + JSON.stringify(chapter.entries[index], null, 2));
                    chapter.save();
                    return entry;
                }
            }
            else{
                throw new Error('Entry not found');
            }
        }
        else{
            throw new Error('Chapter not found');
        }
        return entry;
    }

    public async migrateTimestamps() : Promise<void>{
        let chapterDateUpdatedCount = 0;
        let entryDateUpdatedCount = 0;

        const chapters = await Chapter.find();
        for(const chapter of chapters){
            if(chapter.entries){
                //subtract 5:30 hours from each entry date
                if(chapter.date){
                    chapter.date = new Date(chapter.date.getTime() - (5*60 + 30)*60000);
                    chapterDateUpdatedCount++;
                }
                for(const entry of chapter.entries){
                    if(entry.date){
                        entry.date = new Date(entry.date.getTime() - (5*60 + 30)*60000);
                        entryDateUpdatedCount++;
                    }
                }
                await chapter.save();
            }
        }

        console.log("Chapter dates updated: " + chapterDateUpdatedCount);
        console.log("Entry dates updated: " + entryDateUpdatedCount);
    }
}

export default new EntryService();