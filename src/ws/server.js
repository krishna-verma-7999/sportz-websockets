import { WebSocket, WebSocketServer } from "ws";

function sendJson(socket, payload){
    if(socket.readyState === WebSocket.OPEN){
        socket.send(JSON.stringify(payload));
    }
}

function broadcastJson(wss, payload){
    wss.clients.forEach((client) => {
        if(client.readyState !== WebSocket.OPEN) return;
        sendJson(client, payload);
    });
}

export function attachWebSocketServer(server){
    const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 1024*1024 });

    wss.on('connection', (ws) => {
        console.log('New client connected');

        sendJson(ws, {type: 'welcome', message: 'Welcome to the WebSocket server!' });

        ws.on('error', console.error);
    });

    function broadcastMatchCreated(match){
        broadcastJson(wss, { type: 'matchCreated', match });
    }

    return { wss, broadcastMatchCreated };
}
