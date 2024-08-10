# How to use the endpoints

## Ping

### GET /api/ping

returns: "pong"

## Journal Entries

### GET /api/journal

Returns a list of journal entries.

### POST /api/journal

Expects: a JSON object with the following properties:
- `title` (string)
- `content` ({ Sender.BOT | Sender.USER , string })

Returns: the id of the newly created journal entry.

### DELETE /api/journal?:id

Expects: a query parameter `id` (string)

Returns: The deleted journal entry.

## Completion

### POST /api/completion

Expects: a JSON object with the following properties:
- `text` (string)

Returns: a readableStream of the completion.
