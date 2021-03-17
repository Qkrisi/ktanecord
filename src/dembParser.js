const { MessageEmbed } = require('discord.js')
const Enum = require('enum')
const fs = require('fs')
var _ = require('lodash');

const Attribute = new Enum({
	'Root': 0,
	'Field': 1,
	'Author': 2
})

class dembParseException extends Error { }
class ValueError extends Error { }

var Invoke = (base, name, args = []) => Reflect.apply(Reflect.get(base, name), base, args)

var forEach = (arr, func) => Array.prototype.forEach.call(arr, func)

function isDict(v) {
	return typeof v === 'object' && v !== null && !(v instanceof Array) && !(v instanceof Date);
}

class Embed {
	constructor(name) {
		this.Name = name
		this.Fields = []
		this.Author = undefined
	}
	set_Color(color) {
		let c = Number.isInteger(color) ? color : parseInt(color, 16)
		if (isNaN(c)) throw new dembParseException(`Invalid color: ${color}`)
		this.Color = c
	}
	set_Thumbnail(thumbnail) {
		this.Thumbnail = encodeURI(thumbnail)
	}
	set_URL(url) {
		this.URL = encodeURI(url)
	}
	finalize() {
		let emb = new MessageEmbed()
		let rootArgs = ["Title", "URL", "Description", "Color", "Thumbnail", "Footer"]
		forEach(rootArgs, arg => {
			let val = Reflect.get(this, arg)
			if (val != undefined) Invoke(emb, `set${arg}`, [val])
		})
		if (this.Author != undefined) Invoke(emb, "setAuthor", [this.Author.name, this.Author.icon_url, this.Author.URL])
		forEach(this.Fields, field => emb.addField(field.name, field.value, field.inline))
		return emb
	}
}

class Author {
	set_URL(url) {
		this.URL = encodeURI(url)
	}
	set_icon_url(url) {
		this.icon_url = encodeURI(url)
	}
}

class Field {
	constructor() {
		this.name = ""
		this.value = ""
		this.inline = false
	}
	set_inline(i) {
		if (i == "true") this.inline = true
		else if (i == "false") this.inline = false
		else { throw new dembParseException(`Invalid inline value: ${i}`) }
	}
}

class Parser {
	constructor(path, vars = {}) {
		this.Cache = {}
		this.Parse(path, vars)
	}
	Parse(path, vars = {}) {
		let forceCreate = true
		this.Default = undefined
		this.Path = path
		this.defVars = vars
		this.Parsed = {}
		let delStr = (s, i = 0) => {
			let l = s.split('')
			l.splice(i, 1)
			return l.join('')
		}
		let currentEmb = this.Default
		let currentAttr = Attribute.Root
		let currentAttrName = undefined
		let currentInner = undefined
		let attrDict = {}
		attrDict[Attribute.Root] = ["title", "comment", "description", "url", "field", "author", "color", "thumbnail", "footer"]
		attrDict[Attribute.Field] = ["name", "comment", "value", "inline", "end"]
		attrDict[Attribute.Author] = ["name", "comment", "url", "icon_url", "end"]
		let overrides = {
			"title": "Title",
			"url": "URL",
			"description": "Description",
			"color": "Color",
			"thumbnail": "Thumbnail",
			"footer": "Footer"
		}
		let variableOverrides = {
			"Color": 0x000000,
			"inline": "false"
		}
		let lIndex = 0
		if (!path.endsWith(".demb")) path = [path, ".demb"].join('')
		let raiser = s => { throw new dembParseException(`Line ${lIndex}: ${s}`) }
		if (!fs.existsSync(path)) throw new dembParseException(`Path is not valid: ${path}`)
		let lines = fs.readFileSync(path, "UTF-8").split(/\r?\n/)
		lines.forEach(line => {
			lIndex++
			line = line.replace("\n", "")
			while (line.startsWith("	") || line.startsWith(" ") || line.startsWith("    ")) line = delStr(line)
			if (line != "") {
				if (forceCreate || currentEmb == undefined) {
					if (!line.startsWith("#") || line == "#" || line == "#end") raiser("You didn't provide a name")
					line = delStr(line)
					if (line in this.Parsed) raiser(`Embed named ${line} already exists`)
					currentEmb = currentEmb == undefined ? new Embed(line) : currentEmb
					currentEmb.Name = line
					attrDict[Attribute.Root] = currentEmb.Name == "Default" ? ["title", "comment", "description", "url", "color", "thumbnail", "footer"] : ["title", "comment", "description", "url", "field", "author", "color", "thumbnail", "footer"]
					forceCreate = false
				}
				else if (line.startsWith("@")) {
					if (line == "@") raiser("You didn't provide an attribute name")
					line = delStr(line).toLowerCase()
					if (!attrDict[currentAttr].includes(line)) raiser("The given attribute is not valid in this context")
					line = line in overrides ? overrides[line] : line
					if (line == "author") {
						currentAttr = Attribute.Author
						currentInner = new Author()
					}
					else if (line == "field") {
						currentAttr = Attribute.Field
						currentInner = new Field()
					}
					else if (line == "end") {
						currentAttr = Attribute.Root
						if (currentInner instanceof Field) currentEmb.Fields.push(currentInner)
						else { currentEmb.Author = currentInner }
						currentAttrName = undefined
						currentInner = undefined
					}
					else {
						currentAttrName = line
					}
				}
				else if (line.startsWith("#")) {
					if (line.toLowerCase() != "#end") raiser("You can't create a new embed until you finish the current one")
					if (currentAttr != Attribute.Root || currentAttrName != undefined) raiser("Cannot end embed due to an unassigned attribute")
					this.Parsed[currentEmb.Name] = currentEmb.finalize()
					if (currentEmb.Name == "Default") this.Default = _.cloneDeep(currentEmb)
					currentEmb = this.Default == undefined ? undefined : _.cloneDeep(this.Default)
					currentAttr = Attribute.Root
					currentAttrName = undefined
					forceCreate = true
				}
				else {
					if (currentAttrName == undefined) raiser("There's no attribute you can set the value of")
					if (line.startsWith('"')) line = delStr(line)
					else if (line.startsWith("|")) {
						let templine = delStr(line)
						let d = templine.split("=")
						if (d.length > 1) {
							templine = d[0]
							d = d.slice(1).join("=")
						}
						else {
							d = undefined
						}
						line = templine in vars ? vars[templine] : d != undefined ? d : currentAttrName in variableOverrides ? variableOverrides[currentAttrName] : templine
					}
					if (currentInner == undefined) {
						if (Reflect.has(currentEmb, `set_${currentAttrName}`)) Invoke(currentEmb, `set_${currentAttrName}`, [line])
						else { Reflect.set(currentEmb, currentAttrName, line) }
					}
					else {
						if (Reflect.has(currentInner, `set_${currentAttrName}`)) Invoke(currentInner, `set_${currentAttrName}`, [line])
						else { Reflect.set(currentInner, currentAttrName, line) }
					}
					currentAttrName = undefined
				}
			}
		})
	}
	getEmbed(name, vars = undefined, r = true) {
		if (vars != undefined && !isDict(vars)) throw new TypeError("Variables should be an object") // ITS NOT A DICT IN JS REEE
		//if((name, vars) in this.Cache) return this.Cache[vars]
		if (vars != undefined && vars != this.defVars) this.Parse(this.Path, vars)
		if (name in this.Parsed) {
			let emb = this.Parsed[name]
			if (vars != undefined && vars != {} && isDict(vars)) this.Cache[(name, vars)] = emb
			return emb
		}
		if (r) throw new ValueError(`Embed with name doesn't exist: "${name}"`)
		return undefined
	}
}

module.exports = Parser
