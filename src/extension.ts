import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Plinko extension is now active!');

    let disposable = vscode.commands.registerCommand('plinko.start', () => {
        PlinkoPanel.createOrShow(context.extensionUri);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}

class PlinkoPanel {
    public static currentPanel: PlinkoPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (PlinkoPanel.currentPanel) {
            PlinkoPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'plinko',
            'Plinko Game',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri)]
            }
        );

        PlinkoPanel.currentPanel = new PlinkoPanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        this._panel.webview.html = this._getHtmlForWebview(extensionUri);

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    public dispose() {
        PlinkoPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _getHtmlForWebview(extensionUri: vscode.Uri): string {
        const logoUri = this._panel.webview.asWebviewUri(
            vscode.Uri.joinPath(extensionUri, 'src', 'plinko-logo.svg')
        );

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plinko Game</title>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: #0f212e;
            color: #b1bad3;
            font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            overflow: hidden;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .top-bar {
            background: #1a2c38;
            padding: 12px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #0f212e;
        }

        .logo {
            display: flex;
            align-items: center;
            height: 100%;
        }

        .logo img {
            height: 28px;
            width: auto;
        }

        .top-controls {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .mute-btn {
            background: #2f4553;
            border: none;
            border-radius: 6px;
            padding: 10px;
            color: #fff;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
        }

        .mute-btn:hover {
            background: #3d5564;
        }

        .mute-btn.muted {
            background: #1a2c38;
            color: #888;
        }

        .balance-display {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .balance-wrapper {
            background: #0f212e;
            border-radius: 6px;
            padding: 8px 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .balance-label {
            font-size: 16px;
            color: #b1bad3;
        }

        .balance-amount {
            font-size: 18px;
            font-weight: 700;
            color: #fff;
        }

        .add-dropdown {
            position: relative;
        }

        .add-btn {
            background: #1475e1;
            border: none;
            border-radius: 6px;
            padding: 10px 20px;
            color: #fff;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: background 0.2s;
        }

        .add-btn:hover {
            background: #1a88ff;
        }

        .add-menu {
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 8px;
            background: #1a2c38;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            display: none;
            z-index: 1000;
        }

        .add-menu.show {
            display: block;
        }

        .add-option {
            padding: 12px 20px;
            cursor: pointer;
            color: #b1bad3;
            font-size: 14px;
            font-weight: 600;
            transition: background 0.2s;
            white-space: nowrap;
        }

        .add-option:hover {
            background: #2f4553;
            color: #fff;
        }

        .container {
            display: flex;
            flex: 1;
            overflow: hidden;
        }

        .container.bottom-layout {
            flex-direction: row;
        }

        .container.bottom-layout .sidebar .drop-btn {
            display: none;
        }

        .bottom-drop-btn {
            display: none;
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            background: #00e701;
            border: none;
            border-radius: 8px;
            padding: 16px 40px;
            color: #0f212e;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 12px rgba(0, 231, 1, 0.4);
        }

        .bottom-drop-btn:hover {
            background: #00ff01;
            transform: translateX(-50%) scale(1.05);
            box-shadow: 0 6px 16px rgba(0, 231, 1, 0.6);
        }

        .bottom-drop-btn:active {
            transform: translateX(-50%) scale(0.98);
        }

        .container.bottom-layout .bottom-drop-btn {
            display: block;
        }

        .sidebar {
            width: 340px;
            background: #1a2c38;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        /* Scale canvas for medium viewports */
        @media (max-width: 1200px) and (min-width: 801px) {
            #canvas {
                max-width: calc(100vw - 320px);
                max-height: calc(100vh - 100px);
                width: auto !important;
                height: auto !important;
            }
        }

        /* Responsive sidebar for small viewports */
        @media (max-width: 800px) {
            .sidebar {
                width: 100%;
                flex-direction: column;
                padding: 10px 15px;
                gap: 10px;
            }

            .container {
                flex-direction: column-reverse;
            }

            .sidebar .mode-toggle {
                width: 100%;
                order: 6;
                padding: 3px;
            }

            .sidebar .mode-btn {
                padding: 8px;
                font-size: 13px;
            }

            .sidebar .control-group {
                gap: 4px;
            }

            .sidebar .control-label {
                font-size: 12px;
            }

            .sidebar .bet-input,
            .sidebar select {
                padding: 10px;
                font-size: 13px;
            }

            .sidebar .bet-btn {
                padding: 8px 12px;
                font-size: 12px;
            }

            .sidebar .control-group:nth-child(2) {
                order: 2;
            }

            .sidebar .control-group:nth-child(3) {
                order: 3;
            }

            .sidebar .control-group:nth-child(4) {
                order: 4;
            }

            .sidebar .control-group:nth-child(5) {
                order: 5;
            }

            .sidebar .drop-btn {
                order: 1;
                width: 100%;
                padding: 12px;
                font-size: 14px;
            }

            .game-area {
                flex: 1;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
            }

            #canvas {
                max-width: 100%;
                max-height: 100%;
                width: auto !important;
                height: auto !important;
            }
        }


        .mode-toggle {
            display: flex;
            background: #0f212e;
            border-radius: 50px;
            padding: 4px;
        }

        .mode-btn {
            flex: 1;
            padding: 10px;
            border: none;
            background: transparent;
            color: #b1bad3;
            cursor: pointer;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s;
        }

        .mode-btn.active {
            background: #2f4553;
            color: #fff;
        }

        .control-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .control-label {
            font-size: 13px;
            font-weight: 600;
            color: #b1bad3;
        }

        .input-wrapper {
            display: flex;
            gap: 0;
            align-items: center;
            background: #0f212e;
            border: 1px solid #2f4553;
            border-radius: 8px;
            overflow: hidden;
        }

        .input-prefix {
            color: #7a8a99;
            font-size: 15px;
            font-weight: 600;
            padding-left: 12px;
            padding-right: 4px;
            user-select: none;
            display: flex;
            align-items: center;
        }

        .bet-input {
            flex: 1;
            background: transparent;
            border: none;
            padding: 12px 12px 12px 0;
            color: #fff;
            font-size: 14px;
            min-width: 0;
        }

        .bet-input:focus {
            outline: none;
        }

        .input-wrapper:focus-within {
            border-color: #557086;
        }

        .bet-btn {
            background: #666;
            border: none;
            border-radius: 3px;
            width: 28px;
            height: 28px;
            color: #fff;
            cursor: pointer;
            font-size: 12px;
            font-weight: 700;
            transition: background 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-right: 6px;
        }

        .bet-btn:hover {
            background: #777;
        }

        .bet-btn:last-child {
            margin-right: 8px;
        }

        select {
            width: 100%;
            background: #0f212e;
            border: 1px solid #2f4553;
            border-radius: 8px;
            padding: 12px;
            color: #fff;
            font-size: 14px;
            cursor: pointer;
        }

        select:focus {
            outline: none;
            border-color: #557086;
        }

        .drop-btn {
            width: 100%;
            background: #00e701;
            border: none;
            border-radius: 8px;
            padding: 16px;
            color: #0f212e;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            margin-top: 10px;
        }

        .drop-btn:hover {
            background: #00ff01;
        }

        .drop-btn:active {
            transform: scale(0.98);
        }

        .game-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: visible;
        }

        #canvas {
            background: #0f212e;
            border-radius: 12px;
            max-width: 100%;
            max-height: 100vh;
            height: auto;
            width: auto;
        }

        .multiplier-history {
            position: fixed;
            right: 20px;
            top: 80px;
            display: flex;
            flex-direction: column;
            gap: 0;
            z-index: 100;
        }

        .multiplier-card {
            background: #ff9500;
            color: #000;
            padding: 10px 16px;
            font-weight: 700;
            font-size: 14px;
            min-width: 60px;
            text-align: center;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .multiplier-card:first-child {
            border-radius: 8px 8px 0 0;
        }

        .multiplier-card:last-child {
            border-radius: 0 0 8px 8px;
            border-bottom: none;
        }
    </style>
</head>
<body>
    <div class="top-bar">
        <div class="logo"><img src="${logoUri}" alt="Plinko"></div>
        <div class="top-controls">
            <button class="mute-btn" id="muteBtn"><i data-lucide="volume-2"></i></button>
            <div class="balance-display">
                <div class="balance-wrapper">
                    <span class="balance-label">$</span>
                    <span class="balance-amount" id="balanceAmount">1000.00</span>
                </div>
                <div class="add-dropdown">
                    <button class="add-btn" id="addBalanceBtn">Add</button>
                    <div class="add-menu" id="addMenu">
                        <div class="add-option" data-amount="10">+$10</div>
                        <div class="add-option" data-amount="100">+$100</div>
                        <div class="add-option" data-amount="1000">+$1,000</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="sidebar">
            <div class="mode-toggle">
                <button class="mode-btn active" id="manualBtn">Manual</button>
                <button class="mode-btn" id="autoBtn">Auto</button>
            </div>

            <div class="control-group">
                <label class="control-label">Bet Amount</label>
                <div class="input-wrapper">
                    <span class="input-prefix">$</span>
                    <input type="number" class="bet-input" id="betAmount" value="10" min="1">
                    <button class="bet-btn" id="halveBtn">½</button>
                    <button class="bet-btn" id="doubleBtn">2×</button>
                </div>
            </div>

            <div class="control-group" id="numberOfBetsGroup" style="display: none;">
                <label class="control-label">Number of Bets</label>
                <div class="input-wrapper">
                    <input type="number" class="bet-input" id="numberOfBets" value="10" min="1" max="100" style="padding-left: 12px;">
                </div>
            </div>

            <div class="control-group">
                <label class="control-label">Risk</label>
                <select id="riskSelect">
                    <option value="low">Low</option>
                    <option value="medium" selected>Medium</option>
                    <option value="high">High</option>
                </select>
            </div>

            <div class="control-group">
                <label class="control-label">Rows</label>
                <select id="rowsSelect">
                    <option value="8">8</option>
                    <option value="12">12</option>
                    <option value="16" selected>16</option>
                </select>
            </div>

            <button class="drop-btn" id="dropBtn">Drop Ball</button>
        </div>

        <div class="game-area">
            <div class="multiplier-history" id="multiplierHistory"></div>
            <canvas id="canvas" width="900" height="700"></canvas>
        </div>
    </div>

    <button class="bottom-drop-btn" id="bottomDropBtn">Drop Ball</button>

    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const dropBtn = document.getElementById('dropBtn');
        const manualBtn = document.getElementById('manualBtn');
        const autoBtn = document.getElementById('autoBtn');
        const betAmountInput = document.getElementById('betAmount');
        const halveBtn = document.getElementById('halveBtn');
        const doubleBtn = document.getElementById('doubleBtn');
        const riskSelect = document.getElementById('riskSelect');
        const rowsSelect = document.getElementById('rowsSelect');
        const multiplierHistory_element = document.getElementById('multiplierHistory');
        const balanceAmount = document.getElementById('balanceAmount');
        const addBalanceBtn = document.getElementById('addBalanceBtn');
        const addMenu = document.getElementById('addMenu');
        const muteBtn = document.getElementById('muteBtn');
        const container = document.querySelector('.container');
        const bottomDropBtn = document.getElementById('bottomDropBtn');
        const numberOfBetsGroup = document.getElementById('numberOfBetsGroup');
        const numberOfBetsInput = document.getElementById('numberOfBets');

        // Audio context for sound generation
        let audioContext;
        let isMuted = false;
        function initAudioContext() {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }

        // Bank balance
        let balance = 1000.00;

        // Auto mode state
        let isAutoMode = false;
        let autoBetsRemaining = 0;
        let autoDropInterval = null;

        // Game constants
        let ROWS = 16;
        const PEG_RADIUS = 4;
        const BALL_RADIUS = 10;
        const GRAVITY = 0.75;
        const BOUNCE = 0.5;
        const FRICTION = 0.98;
        let PEG_START_Y = 80;
        let PEG_SPACING_Y = 35;
        let PEG_SPACING_X = 35;

        // Multipliers based on risk and rows
        const MULTIPLIERS_CONFIG = {
            low: {
                8: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
                12: [8.9, 3, 1.6, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.6, 3, 8.9],
                16: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16]
            },
            medium: {
                8: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
                12: [10, 5, 3, 1.5, 1, 0.7, 0.4, 0.7, 1, 1.5, 3, 5, 10],
                16: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110]
            },
            high: {
                8: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
                12: [58, 10, 4, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 4, 10, 58],
                16: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000]
            }
        };

        let currentRisk = 'medium';
        let pegs = [];
        let balls = [];
        let slots = [];
        let slotAnimations = {}; // Track slot bounce animations
        let pegAnimations = {}; // Track peg pulse animations
        let pegPulseAnimations = {}; // Track peg pulse animations on collision
        let multiplierHistory = []; // Track last 4 multipliers

        function getCurrentMultipliers() {
            return MULTIPLIERS_CONFIG[currentRisk][ROWS];
        }

        // Initialize pegs in a pyramid pattern
        function initPegs() {
            pegs = [];
            const centerX = canvas.width / 2;

            for (let row = 0; row < ROWS; row++) {
                const pegsInRow = row + 3;
                const rowWidth = (pegsInRow - 1) * PEG_SPACING_X;
                const startX = centerX - rowWidth / 2;

                for (let col = 0; col < pegsInRow; col++) {
                    pegs.push({
                        x: startX + col * PEG_SPACING_X,
                        y: PEG_START_Y + row * PEG_SPACING_Y,
                        radius: PEG_RADIUS
                    });
                }
            }
        }

        // Initialize slots at the bottom
        function initSlots() {
            slots = [];
            const multipliers = getCurrentMultipliers();
            const totalSlots = multipliers.length;

            // Calculate the width of the bottom row of pegs to align slots
            const centerX = canvas.width / 2;
            const bottomRowPegs = ROWS + 2; // Last row has ROWS + 2 pegs
            const bottomRowWidth = (bottomRowPegs - 1) * PEG_SPACING_X;
            const pegStartX = centerX - bottomRowWidth / 2;
            const pegEndX = centerX + bottomRowWidth / 2;

            // Slots should span from the leftmost to rightmost peg
            const totalSlotWidth = pegEndX - pegStartX;
            const slotWidth = totalSlotWidth / totalSlots;

            // Position slots directly below the last row of pegs
            const lastRowY = PEG_START_Y + (ROWS - 1) * PEG_SPACING_Y;
            const slotY = lastRowY + 25; // Minimal gap below pegs

            for (let i = 0; i < totalSlots; i++) {
                slots.push({
                    x: pegStartX + i * slotWidth,
                    y: slotY,
                    width: slotWidth,
                    height: 40,
                    multiplier: multipliers[i],
                    index: i,
                    totalSlots: totalSlots,
                    color: getMultiplierColor(multipliers[i], i, totalSlots, currentRisk)
                });
            }
        }

        function getMultiplierColor(mult, slotIndex, totalSlots, risk) {
            // Calculate distance from center (0 = center, 1 = edge)
            const centerIndex = (totalSlots - 1) / 2;
            const distanceFromCenter = Math.abs(slotIndex - centerIndex) / centerIndex;
            
            // Color gradient: Yellow center -> Orange mid -> Red edges
            // Center (0.0): #ffff00 (bright yellow)
            // Mid (0.5): #ff8800 (orange)
            // Edge (1.0): #ff0000 (bright red)
            let red, green;
            
            if (distanceFromCenter < 0.5) {
                // Yellow to Orange: maintain red at 255, reduce green
                const ratio = distanceFromCenter / 0.5; // 0 to 1
                red = 255;
                green = Math.round(255 * (1 - ratio * 0.5)); // 255 down to 127.5
            } else {
                // Orange to Red: maintain red at 255, reduce green further
                const ratio = (distanceFromCenter - 0.5) / 0.5; // 0 to 1
                red = 255;
                green = Math.round(127.5 * (1 - ratio)); // 127.5 down to 0
            }
            
            const blue = 0;
            
            return '#' + 
                red.toString(16).padStart(2, '0') + 
                green.toString(16).padStart(2, '0') + 
                blue.toString(16).padStart(2, '0');
        }

        class Ball {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.vx = 0;
                this.vy = 0;
                this.radius = BALL_RADIUS;
                this.active = true;
            }

            update() {
                // Apply gravity
                this.vy += GRAVITY;

                // Apply friction
                this.vx *= FRICTION;
                this.vy *= FRICTION;

                // Update position
                this.x += this.vx;
                this.y += this.vy;

                // Check collision with pegs
                for (let pegIndex = 0; pegIndex < pegs.length; pegIndex++) {
                    const peg = pegs[pegIndex];
                    const dx = this.x - peg.x;
                    const dy = this.y - peg.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < this.radius + peg.radius) {
                        // Collision detected
                        const angle = Math.atan2(dy, dx);
                        const targetX = peg.x + Math.cos(angle) * (this.radius + peg.radius);
                        const targetY = peg.y + Math.sin(angle) * (this.radius + peg.radius);

                        // Move ball to collision point
                        this.x = targetX;
                        this.y = targetY;

                        // Bounce with some randomness
                        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                        const bounceAngle = angle + (Math.random() - 0.5) * 0.5;
                        this.vx = Math.cos(bounceAngle) * speed * BOUNCE;
                        this.vy = Math.sin(bounceAngle) * speed * BOUNCE;

                        // Trigger peg pulse animation
                        pegPulseAnimations[pegIndex] = {
                            progress: 0,
                            active: true
                        };
                    }
                }

                // Check if ball reached the slots
                if (slots.length > 0 && this.y >= slots[0].y - this.radius) {
                    // Determine which slot it landed in
                    for (let i = 0; i < slots.length; i++) {
                        if (this.x >= slots[i].x && this.x <= slots[i].x + slots[i].width) {
                            const multiplier = slots[i].multiplier;
                            const winAmount = this.betAmount * multiplier;

                            // Update balance with winnings
                            updateBalance(winAmount);

                            // Add to history
                            multiplierHistory.unshift(multiplier);
                            if (multiplierHistory.length > 4) {
                                multiplierHistory.pop();
                            }
                            updateMultiplierHistory();

                            // Trigger slot bounce animation
                            slotAnimations[i] = {
                                offset: 0,
                                velocity: 0,
                                active: true
                            };

                            // Play slot land sound
                            playSlotLandSound();

                            break;
                        }
                    }
                    this.active = false;
                }

                // Keep ball in bounds
                if (this.x < this.radius) {
                    this.x = this.radius;
                    this.vx *= -BOUNCE;
                }
                if (this.x > canvas.width - this.radius) {
                    this.x = canvas.width - this.radius;
                    this.vx *= -BOUNCE;
                }
            }

            draw() {
                // Draw solid red ball
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#ff4444';
                ctx.fill();
            }
        }

        function updateBalance(amount) {
            balance = Math.max(0, balance + amount);
            balanceAmount.textContent = balance.toFixed(2);
        }

        function playPegHitSound(pegIndex, totalPegs) {
            if (isMuted) return;
            initAudioContext();
            const now = audioContext.currentTime;

            // Vary pitch based on peg position (higher pegs = higher pitch)
            const centerIndex = (totalPegs - 1) / 2;
            const distanceFromCenter = Math.abs(pegIndex - centerIndex) / centerIndex;

            // Base frequency: 400-800 Hz range, inverted so center pegs are higher
            const baseFreq = 400 + (1 - distanceFromCenter) * 400;

            // Create oscillator
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();

            osc.connect(gain);
            gain.connect(audioContext.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq, now);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

            osc.start(now);
            osc.stop(now + 0.08);
        }

        function playSlotLandSound() {
            if (isMuted) return;
            initAudioContext();
            const now = audioContext.currentTime;

            // Create nodes
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();

            osc.connect(gain);
            gain.connect(audioContext.destination);

            // Piano-like note (A4 = 440 Hz)
            osc.frequency.value = 440;
            osc.type = 'sine';

            // Quick envelope
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

            osc.start(now);
            osc.stop(now + 0.15);
        }

        function updateMultiplierHistory() {
            multiplierHistory_element.innerHTML = '';
            for (let mult of multiplierHistory) {
                const card = document.createElement('div');
                card.className = 'multiplier-card';
                const text = mult >= 100 ? mult.toString() : mult + '×';
                card.textContent = text;
                
                // Find where this multiplier appears in current slots to get its color
                let color = '#ffff00'; // Default to yellow
                if (slots.length > 0) {
                    for (let i = 0; i < slots.length; i++) {
                        if (slots[i].multiplier === mult) {
                            color = slots[i].color;
                            break;
                        }
                    }
                }
                
                card.style.backgroundColor = color;
                card.style.borderBottomColor = 'rgba(0, 0, 0, 0.2)';
                
                multiplierHistory_element.appendChild(card);
            }
        }

        function dropSingleBall() {
            const betAmount = parseFloat(betAmountInput.value) || 0;

            // Validate bet
            if (betAmount <= 0) {
                return false;
            }

            if (betAmount > balance) {
                return false;
            }

            // Deduct bet from balance
            updateBalance(-betAmount);

            const centerX = canvas.width / 2;
            const randomOffset = (Math.random() - 0.5) * 10;
            const ball = new Ball(centerX + randomOffset, 30);
            ball.betAmount = betAmount;
            balls.push(ball);
            return true;
        }

        function stopAuto() {
            if (autoDropInterval) {
                clearInterval(autoDropInterval);
                autoDropInterval = null;
            }
            autoBetsRemaining = 0;
            isAutoMode = false;

            // Update button text based on current mode
            const isAuto = autoBtn.classList.contains('active');
            dropBtn.textContent = isAuto ? 'Start Autobet' : 'Drop Ball';
            dropBtn.style.background = '';
            // Re-enable input and restore original value
            numberOfBetsInput.disabled = false;
        }

        function startAuto() {
            const numberOfBets = parseInt(numberOfBetsInput.value) || 0;
            const betAmount = parseFloat(betAmountInput.value) || 0;

            if (numberOfBets <= 0) {
                alert('Please enter a valid number of bets');
                return;
            }

            if (betAmount <= 0) {
                alert('Please enter a valid bet amount');
                return;
            }

            if (betAmount > balance) {
                alert('Insufficient balance! Current balance: $' + balance.toFixed(2));
                return;
            }

            isAutoMode = true;
            autoBetsRemaining = numberOfBets;
            dropBtn.textContent = 'Stop Autobet';
            dropBtn.style.background = '#ff8800';
            // Disable input during auto mode
            numberOfBetsInput.disabled = true;

            autoDropInterval = setInterval(() => {
                if (autoBetsRemaining <= 0 || balance < betAmount) {
                    stopAuto();
                    return;
                }

                if (dropSingleBall()) {
                    autoBetsRemaining--;
                    // Update the displayed number
                    numberOfBetsInput.value = autoBetsRemaining;
                    if (autoBetsRemaining === 0) {
                        stopAuto();
                    }
                } else {
                    stopAuto();
                }
            }, 500); // Drop a ball every 500ms
        }

        function dropBall() {
            // Check if we're in auto mode
            const isAuto = autoBtn.classList.contains('active');

            if (isAuto) {
                if (isAutoMode) {
                    // Stop auto mode
                    stopAuto();
                } else {
                    // Start auto mode
                    startAuto();
                }
            } else {
                // Manual mode - drop single ball
                const betAmount = parseFloat(betAmountInput.value) || 0;

                if (betAmount <= 0) {
                    alert('Please enter a valid bet amount');
                    return;
                }

                if (betAmount > balance) {
                    alert('Insufficient balance! Current balance: $' + balance.toFixed(2));
                    return;
                }

                dropSingleBall();
            }
        }

        function drawPegs() {
            for (let pegIndex = 0; pegIndex < pegs.length; pegIndex++) {
                const peg = pegs[pegIndex];
                
                // Check if this peg has an active pulse animation
                const pulseAnim = pegPulseAnimations[pegIndex];
                
                // Draw pulse backdrop if animation is active
                if (pulseAnim && pulseAnim.active) {
                    const progress = pulseAnim.progress;
                    // Backdrop expands from peg radius to smaller size
                    const backdropRadius = peg.radius + (progress * 12);
                    // Opacity fades out as it expands
                    const opacity = Math.max(0, 1 - progress);
                    
                    ctx.beginPath();
                    ctx.arc(peg.x, peg.y, backdropRadius, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 255, 255, ' + (opacity * 0.5) + ')';
                    ctx.fill();
                }

                // Draw white dot (always same size)
                ctx.beginPath();
                ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
            }
        }

        function updateSlotAnimations() {
            // Update bounce animations
            for (let i in slotAnimations) {
                const anim = slotAnimations[i];
                if (!anim.active) continue;

                // Apply spring physics for bounce
                const spring = 0.3;
                const damping = 0.7;

                anim.velocity += -anim.offset * spring;
                anim.velocity *= damping;
                anim.offset += anim.velocity;

                // Start with downward push
                if (anim.offset === 0 && anim.velocity === 0) {
                    anim.velocity = 8; // Initial push down
                }

                // Stop animation when settled
                if (Math.abs(anim.offset) < 0.1 && Math.abs(anim.velocity) < 0.1) {
                    anim.offset = 0;
                    anim.active = false;
                }
            }
        }

        function updatePegPulseAnimations() {
            // Update peg pulse animations
            for (let i in pegPulseAnimations) {
                const anim = pegPulseAnimations[i];
                if (!anim.active) continue;

                // Animate progress from 0 to 1
                anim.progress += 0.1;

                // Stop when pulse completes
                if (anim.progress >= 1) {
                    anim.active = false;
                }
            }
        }

        function drawSlots() {
            const shadowOffset = 6;
            const borderRadius = 8;

            for (let i = 0; i < slots.length; i++) {
                const slot = slots[i];

                // Get animation offset for this slot
                const bounceOffset = slotAnimations[i] ? slotAnimations[i].offset : 0;

                // Draw 3D shadow/backdrop (darker version of color) with rounded corners
                const shadowColor = darkenColor(slot.color, 0.4);
                ctx.fillStyle = shadowColor;
                drawRoundedRect(
                    ctx,
                    slot.x + 1,
                    slot.y + shadowOffset + bounceOffset,
                    slot.width - 2,
                    slot.height - shadowOffset,
                    borderRadius
                );

                // Draw main slot background with rounded corners
                ctx.fillStyle = slot.color;
                drawRoundedRect(
                    ctx,
                    slot.x + 1,
                    slot.y + bounceOffset,
                    slot.width - 2,
                    slot.height - shadowOffset,
                    borderRadius
                );

                // Draw multiplier text on main part
                ctx.fillStyle = '#000';
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center';
                const multiplierText = slot.multiplier >= 100 ? slot.multiplier.toString() : slot.multiplier + 'x';
                ctx.fillText(
                    multiplierText,
                    slot.x + slot.width / 2,
                    slot.y + (slot.height - shadowOffset) / 2 + 4 + bounceOffset
                );
            }
        }

        function drawRoundedRect(ctx, x, y, width, height, radius) {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();
        }

        function darkenColor(color, factor) {
            // Convert hex to RGB
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);

            // Darken
            const newR = Math.floor(r * factor);
            const newG = Math.floor(g * factor);
            const newB = Math.floor(b * factor);

            // Convert back to hex
            return '#' +
                newR.toString(16).padStart(2, '0') +
                newG.toString(16).padStart(2, '0') +
                newB.toString(16).padStart(2, '0');
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update slot animations
            updateSlotAnimations();
            
            // Update peg pulse animations
            updatePegPulseAnimations();

            drawSlots();
            drawPegs();

            // Update and draw balls
            balls = balls.filter(ball => ball.active);
            for (let ball of balls) {
                ball.update();
                ball.draw();
            }

            requestAnimationFrame(animate);
        }

        function updateGame() {
            ROWS = parseInt(rowsSelect.value);
            currentRisk = riskSelect.value;

            // Recalculate spacing based on rows
            if (ROWS === 8) {
                PEG_START_Y = 120;
                PEG_SPACING_Y = 50;
            } else if (ROWS === 12) {
                PEG_START_Y = 100;
                PEG_SPACING_Y = 40;
            } else {
                PEG_START_Y = 80;
                PEG_SPACING_Y = 35;
            }

            initPegs();
            initSlots();
        }

        // Event listeners
        dropBtn.addEventListener('click', dropBall);

        manualBtn.addEventListener('click', () => {
            manualBtn.classList.add('active');
            autoBtn.classList.remove('active');
            numberOfBetsGroup.style.display = 'none';
            dropBtn.textContent = 'Drop Ball';
            // Stop auto mode if running
            stopAuto();
        });

        autoBtn.addEventListener('click', () => {
            autoBtn.classList.add('active');
            manualBtn.classList.remove('active');
            numberOfBetsGroup.style.display = 'block';
            dropBtn.textContent = 'Start Autobet';
        });

        halveBtn.addEventListener('click', () => {
            const current = parseFloat(betAmountInput.value) || 10;
            betAmountInput.value = Math.max(1, current / 2).toFixed(2);
        });

        doubleBtn.addEventListener('click', () => {
            const current = parseFloat(betAmountInput.value) || 10;
            betAmountInput.value = (current * 2).toFixed(2);
        });

        addBalanceBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            addMenu.classList.toggle('show');
        });

        // Close menu when clicking outside
        document.addEventListener('click', () => {
            addMenu.classList.remove('show');
        });

        // Handle add menu options
        document.querySelectorAll('.add-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const amount = parseFloat(option.getAttribute('data-amount'));
                updateBalance(amount);
                addMenu.classList.remove('show');
            });
        });

        riskSelect.addEventListener('change', updateGame);
        rowsSelect.addEventListener('change', updateGame);

        // Mute button functionality
        muteBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            muteBtn.classList.toggle('muted', isMuted);

            // Update icon by replacing the entire SVG
            if (isMuted) {
                muteBtn.innerHTML = '<i data-lucide="volume-off"></i>';
            } else {
                muteBtn.innerHTML = '<i data-lucide="volume-2"></i>';
            }
            lucide.createIcons();
        });

        // Bottom drop button functionality
        bottomDropBtn.addEventListener('click', dropBall);

        // Initialize Lucide icons
        lucide.createIcons();

        // Initialize and start
        initPegs();
        initSlots();
        animate();
    </script>
</body>
</html>`;
    }
}
