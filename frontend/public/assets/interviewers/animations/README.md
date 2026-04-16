# Looped Avatar Video Assets

This folder contains looped talking-head clips used by the interview avatar.

## Folder layout

Create one folder per agent:

- `sophia/`
- `rohan/`
- `marcus/`
- `emma/`

## Supported state keys

The UI accepts these animation keys from code:

- `speaking`
- `idle`
- `thinking`
- `listening`

Behavior notes:

- `speaking` state only uses `speaking` clips.
- Non-speaking UI states (`idle`, `thinking`, `listening`) can all be used as idle visuals.
- If `thinking` or `listening` are not provided, `idle` clips are still enough.

## File naming

Use any naming pattern you prefer, as long as your mapping in code points to valid paths.

Examples:

- Single clip per state: `idle.mp4`, `speaking.mp4`
- Multiple clips per state: `idle1.mp4`, `idle2.mp4`, `speaking1.mp4`, `speaking2.mp4`

The component supports a single string or an array of clip paths per state and rotates clips randomly.

## Feature flag

Enable looped avatar mode in frontend env:

- `VITE_ENABLE_LOOPED_VIDEO_AVATAR=true`

## Encoding recommendations

- Prefer MP4 (H.264)
- Target: 720p, 24fps
- Keep loops short (around 4-8s)
- Keep bitrate low enough for smooth preload on slower networks

## Fallback behavior

If a clip is missing or fails to load, UI automatically falls back to static avatar image.
