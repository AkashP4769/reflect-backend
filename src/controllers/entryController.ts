import { Request, Response } from "express";
import EntryService from "../services/entryService";
import ChapterService from "../services/chapterService";
import timestampService from "../services/timestampService";
import { IEntry } from "../models/entryModel";


export const getAllEntriesOfChapter = async (req: Request, res: Response) : Promise<void> => {
    try{
        const {chapterId, uid, date, explicit} = req.query;
        const _explicit = explicit == 'true';
        console.log("explicit: " + _explicit);

        if(_explicit){
            console.log("explicit fetching");
            const entries = await EntryService.getEntries(chapterId as string);
            res.status(200).json(entries);
            return;
        }

        const chapterLastUpdated = await timestampService.getEntryTimestamp(uid as string, chapterId as string);
        console.log("Fetching entries for chapter: " + chapterId + " with last updated: " + chapterLastUpdated + "with client at: " + new Date(date as string));
        
        if(chapterLastUpdated && chapterLastUpdated > new Date(date as string)){
            const entries = await EntryService.getEntries(chapterId as string);
            if(entries && entries.length > 0){
                console.log("Entries found for chapter: " + chapterId);
                for(const entry of entries){
                    console.log("title of entry: " + entry.title);
                    entry.imageUrl = entry.imageUrl?.map(url => url.replace('reflectimages.', 'reflectimages2.'));
                }
            }
            else{
                console.log("No entries found for chapter: " + chapterId);
            }

            console.log("Entries found!");
            res.status(200).json(entries);
        }
        else{
            console.log("User already has latest Entries for chapter");
            res.status(304).json({message: "User already has latest data for entries"});
        }
        
    } catch (error: any){
        console.log(error.message);
        res.status(500).json({error:error.message});
    }
}

export const createEntry = async (req: Request, res: Response) : Promise<void> => {
    try{
        const {entrybody, uid}  = req.body;
        const entry = entrybody as IEntry;
        if(entry._id == null){
            console.log("Creating entry: for chapter: " + entry.chapterId);
            const _entry = await EntryService.createEntry(entry, entry.chapterId);
            
            if(_entry){
                console.log("Entry created! " + JSON.stringify(_entry));
                //await ChapterService.incrementEntryCount(entry.chapterId);
                await timestampService.updateEntryTimestamp(uid as string, entry.chapterId);
                await timestampService.updateChapterTimestamp(uid as string);
                res.status(201).json(_entry);
            }
        }
    } catch(error: any){
        console.log(error.message);
        res.status(500).json({error:error.message});
    }
}

export const deleteEntry = async (req: Request, res: Response) : Promise<void> => {
    try{
        const {chapterId, entryId, uid} = req.query;
        console.log("Deleting entry: " + entryId + " for chapter: " + chapterId);
        const entry = await EntryService.deleteEntry(chapterId as string, entryId as string);
        if(entry){
            console.log("Entry deleted! " + entry);
            //await ChapterService.decrementEntryCount(chapterId as String);
            await timestampService.updateEntryTimestamp(uid as string, chapterId as string);
            await timestampService.updateChapterTimestamp(uid as string);

            res.status(200).json(entry);
        }
        else{
            res.status(404).json({message: "Entry not found"});
        }
    } catch(error: any){
        console.log(error.message);
        res.status(500).json({error:error.message});
    }
}

export const updateEntry = async (req: Request, res: Response) : Promise<void> => {
    try{
        const {entry, uid} = req.body;
        console.log("wbt here?");
        const _entry = await EntryService.updateEntry(entry, entry.chapterId);

        if(_entry){
            await timestampService.updateEntryTimestamp(uid as string, entry.chapterId as string);
            console.log("Entry updated! " + _entry);
            res.status(200).json(_entry);
        }

        
    } catch(error: any){
        console.log(error.message);
        res.status(500).json({error:error.message});
    }
}
