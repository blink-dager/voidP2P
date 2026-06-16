# VoidChat

> **No servers. No history. No trace.**

A fully anonymous, serverless P2P chat. The link is the room. Close the tab — it's gone forever.

![VoidChat demo](demo.gif)

## How it works

1. Click **Create chat** → get a unique link
2. Share the link with your contact
3. They open it → chat starts instantly
4. Either tab closes → connection vanishes, no record exists

No accounts. No messages stored anywhere. No third-party servers see your content — only a free relay (STUN/TURN) used to punch through NAT, then everything flows directly browser-to-browser over **WebRTC**.

## Tech

| Layer | What |
|---|---|
| Transport | WebRTC DataChannel (encrypted, peer-to-peer) |
| Signalling | [PeerJS](https://peerjs.com) cloud broker (only used to exchange initial handshake) |
| Hosting | GitHub Pages (static files only) |
| Code | Vanilla JS + HTML + CSS — zero build step, zero dependencies |

## Run locally

```bash
# clone
git clone https://github.com/YOUR_USERNAME/voidchat.git
cd voidchat

# open — that's it, no npm install needed
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

> For the invite link to work across devices, serve over HTTPS (GitHub Pages, Vercel, etc.) or use a local tunnel like `npx serve .`.

## Deploy to GitHub Pages

1. Push the repo to GitHub
2. Settings → Pages → Source: `main` branch, root `/`
3. Done — your site is live at `https://YOUR_USERNAME.github.io/voidchat/`

## Privacy model

- Messages exist only in RAM of the two browsers, never written to disk
- PeerJS signalling server sees only opaque connection IDs, never message content
- After both tabs close, nothing persists anywhere
