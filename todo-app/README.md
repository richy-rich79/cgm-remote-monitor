# Todo App

A minimal, dependency-free todo app with keyboard- and screen reader-friendly interactions. Tasks persist via `localStorage`.

## Features
- Add, edit, delete tasks
- Mark complete/incomplete
- Filter by All, Active, Completed
- Persist to `localStorage`
- Accessible: labels, live region announcements, focus management

## Run
- Option 1: Open `index.html` directly in a browser.
- Option 2: Serve locally (recommended for some browsers):

```bash
python3 -m http.server --directory /workspace/todo-app 5173
# then open http://localhost:5173/index.html
```

## Structure
- `index.html`: Markup and app shell
- `styles.css`: Responsive styles
- `app.js`: App logic

## Notes
- No build step or dependencies required.
