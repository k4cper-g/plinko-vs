# Plinko VSCode Extension

Bored of waiting for your AI agent to finish code? Gamble your time away with Plinko right inside VSCode!

<img style="max-width:300px;" src="https://cdn.loom.com/sessions/thumbnails/2e6e8fbdc47e40a0a236b9c6a481b034-04f2d1835e2dd40c-full-play.gif#t=0.1">

<div style="position: relative; padding-bottom: 81.44796380090497%; height: 0;"><iframe src="https://www.loom.com/embed/2e6e8fbdc47e40a0a236b9c6a481b034" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>


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
