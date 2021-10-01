from flask import Flask, request
from datetime import datetime
from json import loads, dumps
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
	for i in range(len(lines)):
		lines[i]=lines[i].strip()
	parsed = loads(''.join(lines))
	passwd = parsed["tpServerPass"]
	host = parsed["tpServerIP"]
	port = parsed["tpServerPort"]
	ScoreSheetID = parsed["ScoreSheet"]

creds = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', gspread.auth.DEFAULT_SCOPES)
client = gspread.authorize(creds)

sheetInfo = client.open_by_key(ScoreSheetID)
sheet = sheetInfo.sheet1

update_sheets = []#[sheetInfo.get_worksheet(i) for i in range(1, 5)]

records = []

notes = {}

class Color():
	def __init__(self, r, g, b):
		self.r = r
		self.g = g
		self.b = b

	def get_dict(self):
		return {"r": self.r, "g": self.g, "b": self.b}

class Player():
	def __init__(self, name, r, g, b, solve, strike, score, rank, solo_clears, solo_rank, optout):
		self.name = name
		self.color = Color(r,g,b)
		self.solve = solve
		self.strike = strike
		self.score = score
		self.rank = rank
		self.solo_clears = solo_clears
		self.solo_rank = solo_rank
		self.opted_out = optout

	def get_dict(self):
		return {"name": self.name, "color": self.color.get_dict(), "solve": self.solve, "strike": self.strike, "score": self.score, "rank": self.rank, "soloClears": self.solo_clears, "soloRank": self.solo_rank, "OptedOut":self.opted_out}

players = {}

updateAdded = {
	"OptedOut":False
}

FetchQueue = 1

def updated(p: dict) -> dict:
	for k in updateAdded:
		if not k in p:p[k]=updateAdded[k]
	return p

update_result = lambda d : str(d).replace("'",'"').replace("True","true").replace("False","false")

@app.route("/get/<streamer>/<player>")
def get_stats(streamer, player):
	streamer = streamer.lower()
	player = player.lower()
	if not streamer in players: return str({"error": "Streamer not found"}).replace("'",'"')
	if not player in players[streamer]: return str({"error": "Player not found"}).replace("'",'"')
	return update_result(players[streamer][player].getDict())

#Old method, use the next one instead!
@app.route("/set/<password>/<streamer>/<player>/<r>/<g>/<b>/<solve>/<strike>/<score>/<rank>/<soloClears>/<soloRank>")
def set_stats(password, streamer, player, r, g, b, solve, strike, score, rank, solo_clears, solo_rank, opt_out):
	streamer = streamer.lower()
	player = player.lower()
	if not password == passwd: return str({"error": "Invalid password"})
	if not streamer in players: players[streamer] = {}
	players[streamer][player] = Player(player, int(r), int(g), int(b), int(solve), int(strike), int(score), int(rank), int(solo_clears), int(solo_rank), opt_out)
	return "Player stats set!"

@app.route("/setReq/<password>/<streamer>", methods=['POST'])
def set_req(password, streamer):
	streamer = streamer.lower()
	if not password == passwd: return str({"error": "Invalid password"})
	got = request.json
	for player in got['Players']:
		player = updated(player)
		set_stats(password, streamer, player["UserName"].lower(), player["UserColor"]["r"], player["UserColor"]["g"], player["UserColor"]["b"], player["SolveCount"], player["StrikeCount"], player["SolveScore"], player["Rank"], player["TotalSoloClears"], player["SoloRank"], player["OptedOut"])
	return "Player stats set!"

@app.route("/dump")
def dump() -> dict:
	global players
	temp = {"Stats":{},"CommunityNotes":notes}
	for streamer in players:
		temp["Stats"][streamer] = {}
		for player in players[streamer]:
			temp["Stats"][streamer][player] = players[streamer][player].getDict()
	return temp

@app.route("/save/<password>")
def save_stats(password):
	if not password == passwd: return str({"error": "Invalid password"}).replace("'",'"')
	f = open("stats.json","w+")
	f.write(update_result(dump()))
	f.close()
	return "Save successful"

@app.route("/load/<password>")
def load_stats(password):
	global players
	global notes
	if not password == passwd: return str({"error": "Invalid password"}).replace("'",'"')
	if not path.exists("stats.json"): return str({"error": "Save file not found"}).replace("'",'"')
	f = open("stats.json","r+")
	stats = loads("\n".join(f.readlines()))
	notes = stats["CommunityNotes"]
	f.close()
	players = {}
	for streamer in stats["Stats"]:
		players[streamer] = {}
		for player in stats["Stats"][streamer]:
			base = stats["Stats"][streamer][player]
			base = updated(base)
			get_int = lambda n : int(base[n])
			players[streamer][player] = Player(player, int(base["color"]["r"]), int(base["color"]["g"]), int(base["color"]["b"]), get_int("solve"), get_int("strike"), get_int("score"), get_int("rank"), get_int("soloClears"), get_int("soloRank"), base["OptedOut"])
	return "Load successful"

@app.route("/fetchScores")
def fetch_scores():
	global records
	records = sheet.get_all_records()
	del records[0]
	return str({"Response": "Modules successfully fetched!"}).replace("'",'"')


def update_record(old):
	for key in old:
		if isinstance(old[key], str): old[key] = old[key].replace("'","{__apostrophe__}")
	return str(old).replace("'",'"').replace("{__apostrophe__}","'")

def get_similar(key, module, return_record = False):
	similar = sorted(records, key = cmp_to_key(lambda a, b: distance(str(a[key]).lower(), module) - distance(str(b[key]).lower(), module)))[0]
	if (distance(str(similar[key]).lower(), module) >= 0.7): return update_record(similar) if not return_record else similar
	return None

@app.route("/Score/<module>")
def get_score(module):
	module = unquote(module).lower()
	for record in records:
		if (str(record["ModuleID"]).lower()==module or str(record["Module Name"]).lower()==module): return update_record(record)
	similar = get_similar("ModuleID", module)
	if (similar!=None): return similar
	similar = get_similar("Module Name", module)
	if (similar!=None): return similar
	return str({"error":"Module not found"}).replace("'",'"')

community_column = {
	"L": "Community Score",
	"M": "Community Boss Score",
}

@app.route("/SetCommunityScore", methods=["POST"])
def change_community_score(comment = False, body = {}):
	data = request.json if not comment else body
	module = data["module"].lower()
	module_record = None
	ignore_reason = "IgnoreReason" in data
	for record in records:
		if (str(record["ModuleID"]).lower()==module or str(record["Module Name"]).lower()==module): module_record = record
	if module_record==None:
		module_record = get_similar("ModuleID", module, True)
		if module_record==None: module_record = get_similar("Module Name", module, True)
		if module_record==None: return str({"error":"Module not found"}).replace("'",'"')
	if str(module_record["Module Name"]).lower() != module:
		return str({"error": "Module is not on the scoring sheet"}).replace("'", '"')
	index = sheet.find(str(module_record["Module Name"]), in_column=2).row
	col = data["column"]
	column_name = community_column[col]
	old_value = module_record[column_name] if column_name in module_record else ""
	if not comment and old_value==data["value"]: return str({"error":f"Value is already {data['value']}"}).replace("'",'"')
	start = '' if comment or not old_value else f'{module_record[column_name]} -> {data["value"]} '
	id_col = f'{module_record["ModuleID"]}-{col if not ignore_reason else "K"}'
	reason = f"[{data['discord']}]: {start}{data['reason'] if not ignore_reason else ''} ({datetime.today().strftime('%Y-%m-%d')} {datetime.now().strftime('%H:%M:%S')})" if not ignore_reason or old_value else ""
	reason = reason.replace("'","’").replace('"',"”")
	if not id_col in notes:
		notes[id_col]={"Notes":[],"Reason":""}
	if not ignore_reason:notes[id_col]["Notes"].append(reason)
	else:
		ind = -1
		try:
			ind = len(notes[id_col]["Notes"])-notes[id_col]["Notes"][::-1].index(notes[id_col]["Reason"])-1
		except ValueError:
			print("Reason not found")
		if ind != -1: notes[id_col]["Notes"].insert(ind, reason)
	if not comment and not ignore_reason: notes[id_col]["Reason"]=reason
	elif not comment: notes[id_col]["Reason"]="\n".join([reason, notes[id_col]["Reason"]])
	reason_list = notes[id_col]["Notes"][0:]
	full_reason = "\n".join(reason_list)
	while len(full_reason.encode("utf-8"))>262144:
		reason_list = reason_list[1:]
		full_reason = "\n".join(reason_list)
	if len(reason_list) < len(notes[id_col]["Notes"]):
		full_reason = (reason+"\n" if not reason in reason_list else '')+"...\n" + full_reason
	if not comment: sheet.update_acell(f"{col}{index}", data["value"])
	if ignore_reason: col="K"
	insert_note(sheet, f"{col}{index}", full_reason)
	for worksheet in update_sheets:
		insert_note(worksheet, f"{col}{worksheet.find(str(module_record['Module Name']), in_column=2).row}", full_reason)
	if not comment: fetch_scores()
	return str({"success":"PPM" if ignore_reason else "General"}).replace("'",'"')

@app.route("/Comment", methods=["POST"])
def comment():
	return change_community_score(True, request.json)

@app.route("/ClearScore/<module>")
def clear_community_score(module):
	global notes
	module = unquote(module).lower()
	similar = None
	for record in records:
		if(str(record["ModuleID"]).lower()==module or str(record["Module Name"]).lower()==module): similar = record
	if similar==None: similar = get_similar("ModuleID", module, True)
	if similar==None: similar = get_similar("Module Name", module, True)
	if similar==None: return str({"error":"Module not found"}).replace("'",'"')
	if str(similar["Module Name"]).lower() != module:
		return str({"error": "Module is not on the scoring sheet"}).replace("'", '"')
	index = sheet.find(str(similar["Module Name"]), in_column=2).row
	for col in community_column:
		sheet.update_acell(f"{col}{index}", "")
		clear_note(sheet, f"{col}{index}")
		for worksheet in update_sheets:
			clear_note(worksheet, f"{col}{worksheet.find(str(similar['Module Name']), in_column=2).row}")
		note_name = f'{similar["Module Name"]}-{col}'
		if note_name in notes: del notes[note_name]
	fetch_scores()
	return str({"success":""}).replace("'",'"')

@app.route("/GetCommunity/<module>")
def get_community_score(module):
	module = unquote(module).lower()
	similar = None
	for record in records:
		if(str(record["ModuleID"]).lower()==module or str(record["Module Name"]).lower()==module): similar = record
	if similar==None: similar = get_similar("ModuleID", module, True)
	if similar==None: similar = get_similar("Module Name", module, True)
	if similar==None: return str({"error":"Module not found"}).replace("'",'"')
	body = {}
	for key in community_column:
		id_col = f"{similar['ModuleID']}-{key}"
		if id_col in notes:
			body["MainReason" if key=="K" else "BossReason"] = notes[id_col]["Reason"]
		body[community_column[key]] = similar[community_column[key]]
	return str(body).replace("'",'"')

@app.route("/RemoveScores/<pwd>")
def remove_scores(pwd):
	if pwd!=passwd: return str({"error": "Invalid password"}).replace("'",'"')
	global notes
	remove = []
	for module in notes:
		raw_module = module[:-2]
		module = get_similar("ModuleID", raw_module, True)
		if module==None: module=get_similar("Module Name", raw_module, True)
		if module==None: continue
		module_name = module["Module Name"]
		try:
			maincell = sheet.cell(sheet.find(module_name, in_column=2).row, 11, "UNFORMATTED_VALUE")
			if not maincell.value:
				clear_note(sheet, f"K{maincell.row}")
				remove.append(module)
			for worksheet in update_sheets:
				clear_note(worksheet, f"K{worksheet.find(module_name, in_column=2).row}")
		except Exception as e:
			print(str(e))
			print(f"Removing {module_name} because it couldn't be found.")
			remove.append(module_name)
	for module in remove: del notes[module]
	save_stats(passwd)
	return "Success!"

@app.route("/ScoreDump")
def score_dump():
	return dumps(records)

fetch_scores()

app.run(host=host, port=port)
