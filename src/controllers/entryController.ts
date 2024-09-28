import { Request, Response } from "express";
import EntryService from "../services/entryService";
import ChapterService from "../services/chapterService";
import timestampService from "../services/timestampService";
import { IEntry } from "../models/entryModel";


export const getAllEntriesOfChapter = async (req: Request, res: Response) : Promise<void> => {
    try{
        const {chapterId} = req.params;
        const entries = await EntryService.getEntries(chapterId);

        //console.log("Entries found! " + entries);
        res.status(200).json(entries);
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
            await ChapterService.incrementEntryCount(entry.chapterId);
            
            if(_entry){
                console.log("Entry created! " + JSON.stringify(_entry));

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
            await ChapterService.decrementEntryCount(chapterId as String);
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
        const {entry} = req.body;
        console.log("wbt here?");
        const _entry = await EntryService.updateEntry(entry, entry.chapterId);

        console.log("Entry updated! " + _entry);
        res.status(200).json(_entry);
    } catch(error: any){
        console.log(error.message);
        res.status(500).json({error:error.message});
    }
}