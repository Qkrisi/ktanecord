# KTaNE Discord Bot

[Invite](https://top.gg/bot/546017180865789962)

## Setup

### Compile the bot

**Dependencies**

-[axios](https://www.npmjs.com/package/axios)

-[discord.js](https://www.npmjs.com/package/discord.js) - **v11**

-[enum](https://www.npmjs.com/package/enum)

-[larg](https://www.npmjs.com/package/larg)

-[lodash](https://www.npmjs.com/package/lodash)

-[wumpfetch](https://www.npmjs.com/package/wumpfetch)

**Run**

Run the following commands to clone the repo and get into its directory:

-`git clone https://github.com/qkrisi/ktanecord`

-`cd ktanecord`

<br>
In that directory create a file called `config.json`

Paste these lines in it, and replace the values with the proper ones:

```json
{
    "discord": "token",
    "token": "prefix",
    "prod": false,
    "tpServerIP": "IP",
    "tpServerPort": "port",
    "tpServerPass": "yourpwd",
    "ScoreSheet": "sheetID",
    "TwitchID": "AppID",
    "TwitchSecret": "AppSecret",
    "ScoreLog": "ChannelID"
}
```

| Name | Description |
| - | - |
| discord | The token of the bot |
| token | The prefix of the bot, that it'll use before commands (<prefix>help, etc.)|
| prod | Should always be `false`! |
| tpServerIP | The ip of the server that stores Twitch Plays scores, more about that below |
| tpServerPort | The port of the server that stores Twitch Plays scores, more about that below |
| tpServerPass | A password to block false scores |
| ScoreSheet | The ID of the Google Spreadsheet that stores module scores |
| TwitchID | ID of Twitch application (for streamer stats) |
| TwitchSecret | Secret of Twitch application (for streamer stats) |
| ScoreLog | ID of the score logging channel |

To run the bot, run the command `node src/main.js`

## Compile the TP server

**Dependencies**

-[Flask](https://pypi.org/project/Flask/)

-[gspread](https://pypi.org/project/gspread)

-[oauth2client](https://pypi.org/project/oauth2client)

-[Levenshtein](https://pypi.org/project/python-levenshtein)

You also need Python3.8+

**Run**

Create a Google Application with the Spreadsheet API enabled.

Create credentials for the Spreadsheet API, save that as a JSON to `stats_server/credentials.json`

To run the server, run the following command: `python ./stats_server/__main__.py`

To send scores to the server, use [this](https://github.com/Qkrisi/tp-score-saver) mod. (More about it in the readme of its repo)

## Contributions

Contributions are highly appreciated, but under the following rule(s):

-Do not submit pull requests for the master, nor the Beta branch! Pull requests are only accepted for the Test branch, which will be merged with the Beta branch later on. To switch to the Test branch, simply run `git checkout Test`

## Support

Join our [Discord Server](https://discord.gg/gJVy2Rt) to test out new feauters, give feedback about the bot!

If you're a streamer and wish to be the part of the tp stats system, ping me on Disord (`Qkrisi#4982`)


<br><br>
<p style="font-size:12;"><i>Bot made by <a href="https://github.com/cyber28">Cyber28</a> and <a href="https://github.com/qkrisi">Qkrisi</a>, maintained by <a href="https://github.com/qkrisi">Qkrisi</a></i></p>
