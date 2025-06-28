import { Request, Response } from "express";
import ImageService from "../services/imageService";

export const imageUpload = async (req: Request, res: Response) : Promise<void> => {
    try{
        const file = req.file;
        if(file){
            const imageUrl = await ImageService.uploadImageToS3(file);
            res.status(200).json({imageUrl});
        }
        else{
            res.status(400).json({message: "No file uploaded"});
        }
    } catch(error: any){
        console.log(error.message);
        res.status(500).json({error:error.message});
    }
}

export const imageDelete = async (req: Request, res: Response) : Promise<void> => {
    try{
        const {imageUrl} = req.body;
        if(imageUrl){
            await ImageService.deleteImageFromS3(imageUrl);
            res.status(200).json({message: "Image deleted"});
        }
        else{
            res.status(400).json({message: "No image URL provided"});
        }
    } catch(error: any){
        console.log(error.message);
        res.status(500).json({error:error.message});
    }
}

export const updateImageUrls = (imageUrl: string[]): string[] => {
    if (!imageUrl || !Array.isArray(imageUrl)) {
        return [];
    }
    return imageUrl.map(url => url.replace('reflectimages.', 'reflectimages2.'));
}