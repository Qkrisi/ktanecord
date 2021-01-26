from flask import Flask, request
from datetime import datetime
from json import loads
from oauth2client.service_account import ServiceAccountCredentials
from urllib.parse import unquote
from Levenshtein import distance
from functools import cmp_to_key
from os import path
from GspreadExtensions import *
import gspread

app = Flask("tpScoreServer")

passwd = None
host = None
port = None
ScoreSheetID = None

with open("../config.json","r") as f:
	lines = f.readlines()
	for i in range(len(lines)):lines[i]=lines[i].strip()
	parsed = loads(''.join(lines))
	passwd = parsed["tpServerPass"]
	host = parsed["tpServerIP"]
	port = parsed["tpServerPort"]
	ScoreSheetID = parsed["ScoreSheet"]

creds = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', gspread.auth.DEFAULT_SCOPES)
client = gspread.authorize(creds)

sheetInfo = client.open_by_key(ScoreSheetID)
sheet = sheetInfo.sheet1

UpdateSheets = [sheetInfo.get_worksheet(i) for i in range(1, 5)]

Records = []

Notes = {}

class Color():
	def __init__(self, r, g, b):
		self.r = r
		self.g = g
		self.b = b
	def getDict(self): return {"r": self.r, "g": self.g, "b": self.b}

class Player():
	def __init__(self, name, r, g, b, solve, strike, score, rank, soloClears, soloRank, OptOut):
		self.name = name
		self.color = Color(r,g,b)
		self.solve = solve
		self.strike = strike
		self.score = score
		self.rank = rank
		self.soloClears = soloClears
		self.soloRank = soloRank
		self.OptedOut = OptOut
	def getDict(self):return {"name": self.name, "color": self.color.getDict(), "solve": self.solve, "strike": self.strike, "score": self.score, "rank": self.rank, "soloClears": self.soloClears, "soloRank": self.soloRank, "OptedOut":self.OptedOut}

players = {}

updateAdded = {
	"OptedOut":False
}

FetchQueue = 1

def Updated(p: dict) -> dict:
	for k in updateAdded:
		if not k in p:p[k]=updateAdded[k]
	return p

UpdateResult = lambda d : str(d).replace("'",'"').replace("True","true").replace("False","false")

@app.route("/get/<streamer>/<player>")
def GetStats(streamer, player):
	streamer = streamer.lower()
	player = player.lower()
	if not streamer in players: return str({"error": "Streamer not found"}).replace("'",'"')
	if not player in players[streamer]: return str({"error": "Player not found"}).replace("'",'"')
	return UpdateResult(players[streamer][player].getDict())

#Old method, use the next one instead!
@app.route("/set/<password>/<streamer>/<player>/<r>/<g>/<b>/<solve>/<strike>/<score>/<rank>/<soloClears>/<soloRank>")
def SetStats(password, streamer, player, r, g, b, solve, strike, score, rank, soloClears, soloRank, OptOut):
	streamer = streamer.lower()
	player = player.lower()
	if not password == passwd: return str({"error": "Invalid password"})
	if not streamer in players: players[streamer] = {}
	players[streamer][player] = Player(player, int(r), int(g), int(b), int(solve), int(strike), int(score), int(rank), int(soloClears), int(soloRank), OptOut)
	return "Player stats set!"

@app.route("/setReq/<password>/<streamer>", methods=['POST'])
def setReq(password, streamer):
	streamer = streamer.lower()
	if not password == passwd: return str({"error": "Invalid password"})
	got = request.json
	for player in got['Players']:
		player = Updated(player)
		SetStats(password, streamer, player["UserName"].lower(), player["UserColor"]["r"], player["UserColor"]["g"], player["UserColor"]["b"], player["SolveCount"], player["StrikeCount"], player["SolveScore"], player["Rank"], player["TotalSoloClears"], player["SoloRank"], player["OptedOut"])
	return "Player stats set!"

@app.route("/dump")
def Dump() -> dict:
	global players
	temp = {"Stats":{},"CommunityNotes":Notes}
	for streamer in players:
		temp["Stats"][streamer] = {}
		for player in players[streamer]:
			temp["Stats"][streamer][player] = players[streamer][player].getDict()
	return temp

@app.route("/save/<password>")
def SaveStats(password):
	if not password == passwd: return str({"error": "Invalid password"}).replace("'",'"')
	f = open("stats.json","w+")
	f.write(UpdateResult(Dump()))
	f.close()
	return "Save sucessful"

@app.route("/load/<password>")
def LoadStats(password):
	global players
	global Notes
	if not password == passwd: return str({"error": "Invalid password"}).replace("'",'"')
	if not path.exists("stats.json"):return str({"error": "Save file not found"}).replace("'",'"')
	f = open("stats.json","r+")
	stats = loads("\n".join(f.readlines()))
	Notes = stats["CommunityNotes"]
	f.close()
	players = {}
	for streamer in stats["Stats"]:
		players[streamer] = {}
		for player in stats["Stats"][streamer]:
			base = stats["Stats"][streamer][player]
			base = Updated(base)
			getInt = lambda n : int(base[n])
			players[streamer][player] = Player(player, int(base["color"]["r"]), int(base["color"]["g"]), int(base["color"]["b"]), getInt("solve"), getInt("strike"), getInt("score"), getInt("rank"), getInt("soloClears"), getInt("soloRank"), base["OptedOut"])
	return "Load successful"

@app.route("/fetchScores")
def FetchScores():
	global Records
	Records = sheet.get_all_records()
	del Records[0]
	return str({"Response": "Modules successfully fetched!"}).replace("'",'"')


def UpdateRecord(old):
	for key in old:
		if isinstance(old[key], str): old[key] = old[key].replace("'","{__apostrophe__}")
	return str(old).replace("'",'"').replace("{__apostrophe__}","'")

def GetSimilar(key, module, ReturnRecord = False):
	similar = sorted(Records, key = cmp_to_key(lambda a, b: distance(str(a[key]).lower(), module) - distance(str(b[key]).lower(), module)))[0]
	if(distance(str(similar[key]).lower(), module) >= 0.7): return UpdateRecord(similar) if not ReturnRecord else similar
	return None

@app.route("/Score/<module>")
def GetScore(module):
	module = unquote(module).lower()
	for record in Records:
		if(str(record["ModuleID"]).lower()==module or str(record["Module Name"]).lower()==module): return UpdateRecord(record)
	similar = GetSimilar("ModuleID", module)
	if(similar!=None): return similar
	similar = GetSimilar("Module Name", module)
	if(similar!=None): return similar
	return str({"error":"Module not found"}).replace("'",'"')
	
CommunityColumn = {
	"K":"Community Score",
	"L":"Community Boss Score",
	"M":"Community Per Module"
}

@app.route("/SetCommunityScore", methods=["POST"])
def ChangeCommunityScore(Comment = False, body = {}):
	data = request.json if not Comment else body
	print(f"received {data}")
	module = data["module"].lower()
	ModuleRecord = None
	for record in Records:
		if(str(record["ModuleID"]).lower()==module or str(record["Module Name"]).lower()==module): ModuleRecord = record
	if ModuleRecord==None:
		ModuleRecord = GetSimilar("ModuleID", module, True)
		if ModuleRecord==None:ModuleRecord = GetSimilar("Module Name", module, True)
		if ModuleRecord==None:return str({"error":"Module not found"}).replace("'",'"')
	index = sheet.find(ModuleRecord["Module Name"], in_column=2).row
	col = data["column"]
	ColumnName = CommunityColumn[col]
	OldValue = ModuleRecord[ColumnName] if ColumnName in ModuleRecord else ""
	if not Comment and OldValue==data["value"]:return str({"error":f"Value is already {data['value']}"}).replace("'",'"')
	start = '' if Comment or not OldValue else f'{ModuleRecord[ColumnName]} -> {data["value"]} '
	IDCol = f'{ModuleRecord["ModuleID"]}-{col}'
	Reason = f"[{data['discord']}]: {start}{data['reason']} ({datetime.today().strftime('%Y-%m-%d')} {datetime.now().strftime('%H:%M:%S')})"
	if not IDCol in Notes:
		Notes[IDCol]={"Notes":[],"Reason":""}
	Notes[IDCol]["Notes"].append(Reason)
	if not Comment:Notes[IDCol]["Reason"]=Reason
	ReasonList = Notes[IDCol]["Notes"][0:]
	FullReason = "\n".join(ReasonList)
	while len(FullReason.encode("utf-8"))>262144:
		ReasonList = ReasonList[1:]
		FullReason = "\n".join(ReasonList)
	if len(ReasonList)<len(Notes[IDCol]["Notes"]):
		FullReason = (Reason+"\n" if not Reason in ReasonList else '')+"...\n"+FullReason
	if not Comment:sheet.update_acell(f"{col}{index}", data["value"])
	insert_note(sheet, f"{col}{index}", FullReason)
	for worksheet in UpdateSheets:
		insert_note(worksheet, f"{col}{worksheet.find(ModuleRecord['Module Name'], in_column=2).row}", FullReason)
	if not Comment:FetchScores()
	return str({"success":""}).replace("'",'"')

@app.route("/Comment", methods=["POST"])
def Comment():
	return ChangeCommunityScore(True, request.json)

@app.route("/GetCommunity/<module>")
def GetCommunityScore(module):
	module = unquote(module).lower()
	similar = None
	for record in Records:
		if(str(record["ModuleID"]).lower()==module or str(record["Module Name"]).lower()==module): similar = record
	if similar==None:similar = GetSimilar("ModuleID", module, True)
	if similar==None:similar = GetSimilar("Module Name", module, True)
	if similar==None:return str({"error":"Module not found"}).replace("'",'"')
	body = {}
	for key in CommunityColumn:
		IDCol = f"{similar['ModuleID']}-{key}"
		if IDCol in Notes:
			body["MainReason" if key=="K" else "BossReason"]=Notes[IDCol]["Reason"]
		body[CommunityColumn[key]]=similar[CommunityColumn[key]]
	return str(body).replace("'",'"')
	
@app.route("/ScoreDump")
def ScoreDump():
	return str(Records)

FetchScores()

app.run(host=host, port=port)
