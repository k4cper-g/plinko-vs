# Plinko VSCode Extension

Bored of waiting for your AI agent to finish code? Gamble your time away with Plinko right inside VSCode!

## Features

- Realistic physics simulation with gravity and collision detection
- 12 rows of pegs arranged in a pyramid pattern
- 13 multiplier slots at the bottom (ranging from 0.5x to 10x)
- Drop individual balls or auto-drop 10 balls at once
- Color-coded multiplier slots (red for high multipliers, blue for low)
- Track total drops and last multiplier won

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Compile the extension:
   ```bash
   npm run compile
   ```

## Running the Extension

1. Open this project in VSCode
2. Press `F5` to launch the Extension Development Host
3. In the new VSCode window, open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
4. Type "Plinko: Start Game" and press Enter
5. Enjoy the game!

## How to Play

- Click **Drop Ball** to drop a single ball
- Click **Auto Drop (10)** to drop 10 balls automatically with a delay
- Watch the ball bounce through the pegs and land in a multiplier slot
- The multiplier slots show your potential winnings (in a real game)

## Development

- `npm run compile` - Compile TypeScript
- `npm run watch` - Watch mode for development
- Press `F5` to test the extension

## Technical Details

The extension uses:
- Canvas API for rendering
- Physics simulation with gravity, friction, and bounce effects
- Webview API to create an interactive panel in VSCode
- Collision detection between ball and pegs

Enjoy playing Plinko while coding!
