# trello-id-tools

A lightweight, production-ready Trello Power-Up that adds configurable card buttons for copying Trello IDs, card URLs, and structured metadata directly to your clipboard.

This project is built with plain HTML, CSS, and modern browser JavaScript. It runs as static files and does not require Node, bundlers, transpilers, frameworks, or a build step.

## Features

- Copy Card ID from a Trello card
- Copy List ID from the card's current list
- Copy Board ID from the card's board
- Copy Card URL
- Copy pretty-formatted JSON metadata with `cardId`, `listId`, `boardId`, `cardUrl`, `shortLink`, and `cardNumber`
- Board-level settings dialog to show or hide each button independently
- All buttons enabled by default
- Copy popup preloads the selected value, lets the user copy it with one click, and auto-closes after success
- Safe fallback behavior if settings cannot be loaded
- Optional debug logging via `const DEBUG = false`
- Static GitHub Pages deployment
- Optional static privacy policy page at `privacy.html`

## Project Structure

```text
trello-id-tools/
├── .gitignore
├── LICENSE
├── manifest.json
├── power-up.js
├── index.html
├── popup.html
├── popup.js
├── privacy.html
├── settings.html
├── settings.js
├── styles.css
├── icons/
│   └── icon.png
└── README.md
```

## Installation

1. Create a new GitHub repository named `trello-id-tools`.
2. Add these project files to the repository.
3. The project is preconfigured for the GitHub username `buckyinsfo`.
4. Commit and push the files.

No dependency install step is needed.

## GitHub Pages Deployment

1. Open your GitHub repository.
2. Go to `Settings` → `Pages`.
3. Under `Build and deployment`, choose `Deploy from a branch`.
4. Select your default branch, usually `main`, and the `/root` folder.
5. Save the Pages settings.
6. After deployment finishes, your connector URL will be:

```text
https://buckyinsfo.github.io/trello-id-tools/index.html
```

Optional privacy policy page:

```text
https://buckyinsfo.github.io/trello-id-tools/privacy.html
```

## Trello Power-Up Registration

Atlassian's current Power-Up docs for `card-buttons`, `show-settings`, and plugin data are here:

- [card-buttons](https://developer.atlassian.com/cloud/trello/power-ups/capabilities/card-buttons/)
- [show-settings](https://developer.atlassian.com/cloud/trello/power-ups/capabilities/show-settings/)
- [Getting and Setting Plugin Data](https://developer.atlassian.com/cloud/trello/power-ups/client-library/getting-and-setting-data/)

To register this Power-Up:

1. Visit [https://trello.com/power-ups/admin](https://trello.com/power-ups/admin).
2. Select your Trello Workspace.
3. Create a new Power-Up.
4. Set the iframe connector URL to:

```text
https://buckyinsfo.github.io/trello-id-tools/index.html
```

5. Upload or reference the icon at:

```text
https://buckyinsfo.github.io/trello-id-tools/icons/icon.png
```

6. Enable these capabilities in the Trello Power-Up admin UI:

- `card-buttons`
- `show-settings`

7. Save the Power-Up configuration.

## How to Enable the Power-Up on a Board

1. Open a Trello board.
2. Open `Power-Ups`.
3. Find your custom Power-Up in your Workspace's custom Power-Ups section.
4. Add or enable `trello-id-tools` for that board.
5. Open any card and look for the Power-Up buttons in the card's Power-Ups section.

## Settings Configuration

1. Open the board's Power-Ups menu.
2. Click the gear icon for `trello-id-tools`.
3. Toggle the checkboxes for each card button:

- Show Card ID button
- Show List ID button
- Show Board ID button
- Show Card URL button
- Show Metadata button

4. Click `Save Settings`.

Settings are stored with board-shared Trello plugin data so all board users see the same button configuration.

## Troubleshooting

- If no buttons appear on cards, confirm the `card-buttons` capability is enabled in the Power-Up admin portal.
- If the settings gear does not appear, confirm the `show-settings` capability is enabled.
- If Trello cannot load the Power-Up, verify GitHub Pages is deployed and the iframe connector URL uses HTTPS.
- If clipboard copy fails, check browser permissions and confirm the card popup is running in a secure HTTPS context.
- If browser clipboard access is limited, the popup keeps the selected value in a focused field so you can use your normal keyboard copy shortcut.
- If icon images do not appear, verify `icons/icon.png` is reachable from your GitHub Pages URL.
- If settings seem incorrect, reopen the settings dialog and resave. If loading board data fails, the Power-Up automatically falls back to all buttons enabled.
- If you turn on debug logging by changing `const DEBUG = false` to `true`, inspect browser DevTools for `console.debug()` output.

## Development Notes

- `power-up.js` registers the Power-Up capabilities and dynamically builds card buttons from board settings.
- `popup.js` renders the selected value into a lightweight copy dialog, attempts clipboard copy on button click, and auto-closes on success.
- `settings.js` loads board-shared settings, renders checkboxes, and saves updates.
- `styles.css` provides a small shared UI layer for the connector page, popup, and settings dialog.
- Settings are stored under the board-shared plugin data key `settings` and merged with defaults to support future options safely.
- The code uses `const`, `let`, arrow functions, `async`/`await`, template literals, destructuring, and reusable modular functions.
- `privacy.html` is a standalone static privacy policy page that can be linked from Trello admin settings if needed.

## Future Enhancement Ideas

- Copy Short Link as a dedicated button
- Copy Card Name, List Name, or Board Name
- Copy Labels and Members
- Export full card JSON
- Add configurable metadata templates
- Add keyboard shortcuts in the popup
- Add optional toast styling variants

## License

This project is licensed under the MIT License.

You are free to use, modify, distribute, and adapt it for personal or commercial Trello workflows, as long as the original license notice is included.

See [LICENSE](./LICENSE) for the full text.
