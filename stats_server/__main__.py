from flask import Flask, request
from json import loads

app = Flask("tpScoreServer")

passwd = None
host = None
port = None

with open("../config.json","r") as f:
	lines = f.readlines()
	for i in range(len(lines)):lines[i]=lines[i].strip()
	parsed = loads(''.join(lines))
	passwd = parsed["tpServerPass"]
	host = parsed["tpServerIP"]
	port = parsed["tpServerPort"]

class Color():
	def __init__(self, r, g, b):
		self.r = r
		self.g = g
		self.b = b
	def getDict(self): return {"r": self.r, "g": self.g, "b": self.b}

class Player():
	def __init__(self, name, r, g, b, solve, strike, score, rank, soloClears, soloRank):
		self.name = name
		self.color = Color(r,g,b)
		self.solve = solve
		self.strike = strike
		self.score = score
		self.rank = rank
		self.soloClears = soloClears
		self.soloRank = soloRank
	def getDict(self):return {"name": self.name, "color": self.color.getDict(), "solve": self.solve, "strike": self.strike, "score": self.score, "rank": self.rank, "soloClears": self.soloClears, "soloRank": self.soloRank}

players = {}

@app.route("/get/<streamer>/<player>")
def GetStats(streamer, player):
	streamer = streamer.lower()
	player = player.lower()
	if not streamer in players: return str({"error": "Streamer not found"}).replace("'",'"')
	if not player in players[streamer]: return str({"error": "Player not found"}).replace("'",'"')
	return players[streamer][player].getDict()

#Old method, use the next one instead!
@app.route("/set/<password>/<streamer>/<player>/<r>/<g>/<b>/<solve>/<strike>/<score>/<rank>/<soloClears>/<soloRank>")
def SetStats(password, streamer, player, r, g, b, solve, strike, score, rank, soloClears, soloRank):
	streamer = streamer.lower()
	player = player.lower()
	if not password == passwd: return str({"error": "Invalid password"})
	if not streamer in players: players[streamer] = {}
	players[streamer][player] = Player(player, int(r), int(g), int(b), int(solve), int(strike), int(score), int(rank), int(soloClears), int(soloRank))
	return "Player stats set!"

@app.route("/setReq/<password>/<streamer>", methods=['POST'])
def setReq(password, streamer):
	global streamerOverride
	streamer = streamer.lower()
	if not password == passwd: return str({"error": "Invalid password"})
	if streamer in streamerOverride:streamer = streamerOverride[streamer]
	got = request.json
	for player in got['Players']:SetStats(password, streamer, player["UserName"].lower(), player["UserColor"]["r"], player["UserColor"]["g"], player["UserColor"]["b"], player["SolveCount"], player["StrikeCount"], player["SolveScore"], player["Rank"], player["TotalSoloClears"], player["SoloRank"])
	return "Player stats set!"

@app.route("/dump")
def Dump() -> dict:
	global players
	temp = {"Stats":{}}
	for streamer in players:
		temp["Stats"][streamer] = {}
		for player in players[streamer]:
			temp["Stats"][streamer][player] = players[streamer][player].getDict()
	return temp

@app.route("/save/<password>")
def SaveStats(password):
	if not password == passwd: return str({"error": "Invalid password"}).replace("'",'"')
	f = open("stats.json","w+")
	f.write(str(Dump()).replace("'",'"'))
	f.close()
	return "Save sucessful"
	
@app.route("/load/<password>")
def LoadStats(password):
	global players
	if not password == passwd: return str({"error": "Invalid password"}).replace("'",'"')
	f = open("stats.json","r+")
	stats = loads(f.readline())
	f.close()
	players = {}
	for streamer in stats["Stats"]:	
		players[streamer] = {}
		for player in stats["Stats"][streamer]:
			base = stats["Stats"][streamer][player]
			getInt = lambda n : int(base[n])
			players[streamer][player] = Player(player, int(base["color"]["r"]), int(base["color"]["g"]), int(base["color"]["b"]), getInt("solve"), getInt("strike"), getInt("score"), getInt("rank"), getInt("soloClears"), getInt("soloRank"))
	return "Load successful"

app.run(host=host, port=port)
