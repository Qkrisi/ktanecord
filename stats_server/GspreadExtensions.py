#Gspread methods to manage cell notes
#Source: https://github.com/burnash/gspread/issues/50

from gspread.utils import cast_to_a1_notation, a1_to_rowcol

def update_note(worksheet, cell, content):
	if not isinstance(content, str):
		raise TypeError("Only string allowed as content for a note.")

	(startRow, startColumn) = a1_to_rowcol(cell)

	body = {
		"requests": [
			{
				"updateCells": {
					"range": {
						"sheetId": worksheet.id,
						"startRowIndex": startRow - 1,
						"endRowIndex": startRow,
						"startColumnIndex": startColumn - 1,
						"endColumnIndex": startColumn,
					},
					"rows": [
						{
							"values": [
								{
									"note": content
								}
							]
						}
					],
					"fields": "note"
				}
			}
		]
	}
	worksheet.spreadsheet.batch_update(body)

@cast_to_a1_notation
def insert_note(worksheet, cell, content):
	update_note(worksheet, cell, content)

@cast_to_a1_notation
def clear_note(worksheet, cell):
	update_note(worksheet, cell, "")
