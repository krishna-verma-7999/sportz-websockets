import { WebSocket, WebSocketServer } from "ws";
import { wsArcjet } from "../config/arcjet.js";

function sendJson(socket, payload){
    if(socket.readyState === WebSocket.OPEN){
        socket.send(JSON.stringify(payload));
    }
}

function broadcastJson(wss, payload){
    wss.clients.forEach((client) => {
        sendJson(client, payload);
    });
}

const HEARTBEAT_INTERVAL = 30_000;

export function attachWebSocketServer(server){
    const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 1024*1024 });

    wss.on('connection', async (ws) => {
        if(wsArcjet){
            try {
                const decision = await wsArcjet.protect(ws);
                if(decision.isDenied()){
                    const code = decision.reason?.type === "RATE_LIMITED" ? 4001 : 4002;
                    const reason = decision.reason?.type === "RATE_LIMITED" ? "Too Many Requests" : "Service Unavailable";
                    console.error(`WebSocket connection denied by Arcjet: ${decision.reason?.type}`);
                    ws.close(code, reason);
                    return;
                }
            } catch (error) {
                console.error("WebSocket request blocked by Arcjet:", error.message);
                ws.close(4002, "Service Unavailable");
                return;
            }
        }
        console.log('New client connected');
        ws.isAlive = true;

        ws.on('pong', () => { ws.isAlive = true; });

        sendJson(ws, {type: 'welcome', message: 'Welcome to the WebSocket server!' });

        ws.on('error', console.error);
        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });

    const heartbeat = setInterval(() => {
        wss.clients.forEach((ws) => {
            if(!ws.isAlive) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        });
    }, HEARTBEAT_INTERVAL);

    wss.on('close', () => {
        clearInterval(heartbeat);
    });

    function broadcastMatchCreated(match){
        broadcastJson(wss, { type: 'matchCreated', match });
    }

    return { wss, broadcastMatchCreated };
}
