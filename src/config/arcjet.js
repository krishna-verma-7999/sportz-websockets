import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node"

const arcjetKey = process.env.ARCJET_KEY 
const arcjetMode = process.env.ARCJET_MODE === 'DRY_RUN' ? 'DRY_RUN' : 'LIVE'

if(!arcjetKey) {
    throw new Error("ARCJET_KEY is not defined in environment variables.")
}

export const httpArcjet = arcjet({
    apiKey: arcjetKey,
    rules: [
        shield({mode: arcjetMode}),
        detectBot({mode: arcjetMode, allow: ['CATEGORY:SEARCH_ENGINE', "CATEGORY:PREVIEW"]}),
        slidingWindow({mode: arcjetMode, interval: '10s', max: 50})
    ]
})

export const wsArcjet = arcjet({
    apiKey: arcjetKey,
    rules: [
        shield({mode: arcjetMode}),
        detectBot({mode: arcjetMode, allow: ['CATEGORY:SEARCH_ENGINE', "CATEGORY:PREVIEW"]}),
        slidingWindow({mode: arcjetMode, interval: '2s', max: 5})
    ]
})

export function securityMiddleware(){
    return async (req, res, next) => {
        if(!httpArcjet) return next();
        try {
            const dicision = await httpArcjet.protect(req)
            console.log(`Arcjet: ${dicision.conclusion}`, dicision.results.map(r => `${r.ruleType}:${r.state}`).join(', '))
            if(dicision.isDenied()){
                if(dicision.reason?.type === "RATE_LIMITED") {
                    return res.status(429).json({ error: "Too Many Requests" })
                }
                return res.status(403).json({ error: "Forbidden" })
            }
            next()
        } catch (error) {
            console.error("Request blocked by Arcjet:", error.message)
            return res.status(503).json({ error: "Service Unavailable" })
        }
    }   
}