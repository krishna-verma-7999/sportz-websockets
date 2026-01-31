import {Router} from 'express';
import { createMatchSchema, listMatchesQuerySchema } from '../validation/matches.js';
import {db} from '../db/db.js';
import { matches } from '../db/schema.js';
import { getMatchStatus } from '../utils/matchStatus.js';
import { desc } from 'drizzle-orm';

export const router = Router();
const MAX_LIMIT = 100;

router.get("/", async (req,res)=>{
    const parsed = listMatchesQuerySchema.safeParse(req.query);
    if(!parsed.success){
        return res.status(400).json({error: "Invalid Query Parameters", details: JSON.stringify(parsed.error)});
    }
    const limit = Math.min(parsed.data.limit ?? 10, MAX_LIMIT);

    try {
        const data = await db.select().from(matches).limit(limit).orderBy((desc(matches.startTime)));
        return res.json({data});
    } catch (error) {
        console.error("Failed to fetch matches:", error);
        return res.status(500).json({error: "Failed to fetch matches"});
    }
})

router.post("/", async (req,res)=>{

    const parsed = createMatchSchema.safeParse(req.body);
    if(!parsed.success){
        return res.status(400).json({error: "Invalid Payload", details: JSON.stringify(parsed.error)});
    }

    const {data: {startTime, endTime, homeScore, awayScore}} = parsed;

    try {

        const [event] = await db.insert(matches).values({
           ...parsed.data,
           startTime: new Date(startTime),
           endTime: new Date(endTime),
           homeScore: homeScore ?? 0,
           awayScore: awayScore ?? 0,
           status: getMatchStatus(new Date(startTime), new Date(endTime))
        }).returning();

        if(res.app.locals.broadcastMatchCreated){
            try {
                res.app.locals.broadcastMatchCreated(event);
            } catch (err) {
                console.error("Failed to broadcast match created event:", err);
            }
        }
        
        res.status(201).json({data: event});
    } catch (error) {
        console.error("Failed to create match:", error);
        return res.status(500).json({error: "Failed to create match"});
    }
})
