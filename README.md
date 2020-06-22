# KTaNE Discord Bot

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
    "tpServerPass": "yourpwd"
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

To run the bot, run this command: `node src/main.js`

## Compile the TP server

**Dependencies**

-[Flask](https://pypi.org/project/Flask/)

You also need Python3.8+

**Run**

To run the server, run the following command: `python ./stats_server/__main__.py`

To send scores to the server, use [this](https://github.com/Qkrisi/tp-score-saver) mod. (Keep in mind, it only works on Windows for now; more about it in the readme of its repo)

## Contributions

Contributions are highly appreciated, but under the following rule(s):

-Do not submit pull requests for the master, nor the Beta branch! Pull requests are only accepted for the Test branch, which will be merged with the Beta branch later on.
