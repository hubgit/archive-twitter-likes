This tool fetches a list of the given user's favorites ("likes") from the Twitter API and saves them to a local newline-delimited JSON file with a timestamped filename.

Note that the Twitter API returns the liked tweets in reverse chronological posting order, and it's only possible to retrieve the 3200 most recent tweets.

## Usage

`npm start <screen_name>`
