import User, { IUser } from "../models/userModel";

class TimestampService{
    public async getChapterTimestamp(uid: string): Promise<IUser | null>{
        return User.findOne({uid: uid}, {updateTimestamp: 1})
    }

    public async updateChapterTimestamp(uid: string): Promise<IUser | null>{
        console.log("Updating chapter timestamp for user: " + uid);
        return User.findOneAndUpdate({uid: uid}, { $set: { 'updateTimestamp.chapters': new Date() } }, {new: true}).exec()
    }

    public async updateEntryTimestamp(uid: string, chapterId: string): Promise<IUser | null>{
        const user = await User.findOne({uid: uid}).exec();
        const entriesOfChapter = user?.updateTimestamp.entriesOfChapter;
        var found = false;
        entriesOfChapter?.forEach((entry) => {
            if(entry.chapterId === chapterId){
                entry.updatedAt = new Date();
                found = true;
            }
        });

        if(!found){
            entriesOfChapter?.push({chapterId: chapterId, updatedAt: new Date()});
        }

        //console.log("Entries of chapter: " + entriesOfChapter);

        return User.findOneAndUpdate({uid: uid}, { $set: { 'updateTimestamp.entriesOfChapter': entriesOfChapter } }, {new: true}).exec();
    }

    public async getEntryTimestamp(uid: string, chapterId: string): Promise<Date>{
        const user = await User.findOne({uid: uid}).exec();
        return user?.updateTimestamp.entriesOfChapter.find((entry) => entry.chapterId === chapterId)?.updatedAt ?? new Date();
    }
}

export default new TimestampService;