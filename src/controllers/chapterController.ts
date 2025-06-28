import e, { Request, Response } from "express";
import ChapterService from "../services/chapterService";
import { IChapter } from "../models/chapterModel";
import userService from "../services/userService";
import timestampService from "../services/timestampService";
import { DateTime } from 'luxon';
import imageService from "../services/imageService";


export const getChapters = async (req: Request, res: Response) : Promise<void> => {
    try{
        const {uid, date, explicit} = req.query;
        const _explicit = explicit == 'true';
        const chapters = await ChapterService.getChapters(uid as string, new Date(date as string), _explicit);
        if(chapters){
            console.log("Chapters fetched! from uid: " + uid);
            //console.log(chapters);
            res.status(200).json(chapters);
        }
        else{
            console.log("user already has latest data");
            res.status(304).json({message: "User already has latest data"});
        }
    } catch(error: any){
        console.log(error.message);
        res.status(500).json({error:error.message});
    }
}

export const createChapter = async (req: Request, res: Response) : Promise<void> => {
    try{
        const {chapter} = req.body;
        const _chapter = await ChapterService.createChapter(chapter as IChapter);
        await userService.linkChapterToUser(chapter.uid, _chapter._id as string);

        if(_chapter){
            console.log("Chapter created! " + _chapter._id);
            await timestampService.updateChapterTimestamp(chapter.uid);
            res.status(201).json(_chapter);
        }
        else res.status(409).json({message: "Chapter already exists"});
        //res.status(201).json({chapter: _chapter});
        
    } catch(error: any){
        console.log(error.message);
        res.status(500).json({error:error.message});
    }
}

export const deleteChapter = async (req: Request, res: Response) : Promise<void> => {
    try {
        const {uid, id} = req.query;
        console.log("Deleting chapter: " + id + " for user: " + uid);

        const chapter = await ChapterService.deleteChapter(id as string);
        await userService.unlinkChapterFromUser(uid as string, id as string);

        if(chapter){
            console.log("Chapter deleted! " + id);
            if(chapter.imageUrl) for(const image of chapter.imageUrl) await imageService.deleteImageFromS3(image);
            if(chapter.entries) for(const entry of chapter.entries) if(entry.imageUrl) for(const image of entry.imageUrl) await imageService.deleteImageFromS3(image);

            timestampService.updateChapterTimestamp(uid as string);
            res.status(200).json(chapter);
        }
    } catch(error: any){
        console.log(error.message);
        res.status(500).json({error:error.message});
    }
}

export const updateChapter = async (req: Request, res: Response) : Promise<void> => {
    try{
        const {chapter} = req.body;
        console.log("Updating chapter: " + JSON.stringify(chapter));
        const _chapter = await ChapterService.updateChapter(chapter as IChapter, chapter.id as string, chapter.date as string);
        if(_chapter == null){
            res.status(404).json({error: "Chapter not found!"});
            return;
        }
        console.log("Chapter updated! ");
        timestampService.updateChapterTimestamp(chapter.uid);
        res.status(200).json(_chapter);
    } catch(error: any){
        console.log(error.message);
        res.status(500).json({error:error});
    }
}

export const importChapters = async (req: Request, res: Response) : Promise<void> => {
    try{
        const {uid} = req.query;
        const chapters = await ChapterService.importAll(uid as string);
        console.log("Importing all chapters for user: " + JSON.stringify(chapters));
        if(chapters){
            res.status(200).json({chapters: chapters});
        }
        else{
            console.log("No chapters found for user: " + uid);
            res.status(404).json({message: "No chapters found"});
        }
    } catch(error: any){
        console.log(error.message);
        res.status(500).json({error:error.message});
    }
}

export const exportChapters = async (req: Request, res: Response) : Promise<void> => {
    try{
        const {uid, chapters} = req.body;
        const _chapters = chapters as IChapter[];
        const exportedChapters = await ChapterService.exportAll(uid as string, _chapters);
        if(exportedChapters){
            res.status(200).json({chapters: exportedChapters});
        }
        else{
            console.log("No chapters found for user: " + uid);
            res.status(404).json({message: "No chapters found"});
        }
    } catch(error: any){
        console.log(error.message);
        res.status(500).json({error:error.message});
    }
}