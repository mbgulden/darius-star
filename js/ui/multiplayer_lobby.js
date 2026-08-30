/**
 * js/ui/multiplayer_lobby.js — Nyxa Tactical Squadron Link Room Lobby (GRO-4303)
 * Renders in-universe cockpit room creation, squadron joining via 4-digit code,
 * live telemetry ping, and readiness status.
 * 
 * Load order: after js/ui.js, before js/game_loop.js
 */

let squadronRoomCode = 'STAR-77';
let squadronPilots = [
    { name: 'Darius Star [HOST]', ship: 'X-1 Striker', ready: true, ping: 12 },
    { name: 'Naya Thorne', ship: 'Warden Support', ready: true, ping: 24 }
];

function drawMultiplayerLobby(ctx) {
    if (typeof CockpitUI !== 'undefined') {
        CockpitUI.drawCockpitGrid(ctx, canvas.width, canvas.height, (typeof gameTime !== 'undefined' ? gameTime : 0));
    }

    const panelW = 720;
    const panelH = 340;
    const panelX = (canvas.width - panelW) / 2;
    const panelY = (canvas.height - panelH) / 2;

    if (typeof CockpitUI !== 'undefined') {
        CockpitUI.drawPanel(ctx, panelX, panelY, panelW, panelH, {
            chamfer: 8,
            borderColor: '#00ffff',
            bgColor: 'rgba(6, 14, 28, 0.94)',
            bracketColor: '#ffaa00',
            headerBar: true,
            headerBarHeight: 24
        });

        ctx.textAlign = 'left';
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 10.5px monospace';
        ctx.fillText('📡 NYXA SQUADRON TACTICAL LINK // CO-OP LOBBY', panelX + 14, panelY + 16);
    }

    // Room Code Banner
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 22px monospace';
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 10;
    ctx.fillText(`TACTICAL ROOM CODE: [ ${squadronRoomCode} ]`, canvas.width / 2, panelY + 54);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#88aacc';
    ctx.font = '10px monospace';
    ctx.fillText('CLOUDFLARE EDGE WEBSOCKET RELAY // SUB-30MS TICK SYNC', canvas.width / 2, panelY + 70);

    // Pilots Roster Box
    const rosterY = panelY + 86;
    const rosterW = panelW - 40;
    const rosterH = 150;
    const rosterX = panelX + 20;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(rosterX, rosterY, rosterW, rosterH);
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.25)';
    ctx.strokeRect(rosterX, rosterY, rosterW, rosterH);

    // Column Headers
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('PILOT CALLSIGN', rosterX + 15, rosterY + 20);
    ctx.fillText('VESSEL CHASSIS', rosterX + 220, rosterY + 20);
    ctx.fillText('LINK LATENCY', rosterX + 420, rosterY + 20);
    ctx.fillText('STATUS', rosterX + 560, rosterY + 20);

    // Pilot Rows
    const pilots = (typeof NetworkClient !== 'undefined' && NetworkClient.isConnected()) 
        ? [{ name: 'You [LOCAL PILOT]', ship: selectedShip.toUpperCase(), ready: true, ping: NetworkClient.getPing() }]
        : squadronPilots;

    for (let i = 0; i < 4; i++) {
        const ry = rosterY + 45 + i * 26;
        const p = pilots[i];

        if (p) {
            ctx.fillStyle = '#00ffff';
            ctx.font = 'bold 11px monospace';
            ctx.fillText(p.name, rosterX + 15, ry);

            ctx.fillStyle = '#ffffff';
            ctx.fillText(p.ship, rosterX + 220, ry);

            ctx.fillStyle = '#00ff88';
            ctx.fillText(`${p.ping || 18} ms`, rosterX + 420, ry);

            ctx.fillStyle = '#00ff88';
            ctx.fillText('● ENGAGED', rosterX + 560, ry);
        } else {
            ctx.fillStyle = '#4a5a7a';
            ctx.font = '10px monospace';
            ctx.fillText(`[ SLOT 0${i + 1} OPEN — WAITING FOR WINGMAN... ]`, rosterX + 15, ry);
        }
    }

    // Action Buttons
    const btnY = panelY + 252;
    const btnW = (panelW - 60) / 2;
    const btnH = 40;

    if (typeof CockpitUI !== 'undefined') {
        CockpitUI.drawAvionicsButton(ctx, panelX + 20, btnY, btnW, btnH, 'LAUNCH SQUADRON SORTIE', '[SPACE / ENTER]', true, false, {
            primaryColor: '#00ff88',
            font: 'bold 10.5px monospace'
        });
        CockpitUI.drawAvionicsButton(ctx, panelX + 20 + btnW + 20, btnY, btnW, btnH, 'RETURN TO COMMAND BRIDGE', '[ESC]', false, false, {
            primaryColor: '#ff2244',
            font: 'bold 10.5px monospace'
        });
    }
}

if (typeof window !== 'undefined') {
    window.drawMultiplayerLobby = drawMultiplayerLobby;
}
