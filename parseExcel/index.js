/*
* 解析excel为json
* 第一行 参数type(array;仅取第一列)、val(number)、
* 第二行 key
* 例子：
* input:
* -----------------------------------
* type:Array    val:number
* -----------------------------------
* Id            No
* -----------------------------------
* 1             1
* output:
* {
	"Sheet1": [
		{
			"Id": "1",
			"No": 1
		}
	],
}
* */
var fs = require('fs');
var path = require('path');

var ejs = require('ejs');
var XLSX = require('xlsx');
var Q = require('q');
var program = require('commander');

program
	.version('0.0.1', '-v, --version')
	.option('-i, --input <string>', 'input')
	.option('-o, --output <string>', 'output')
	.parse(process.argv);

let dir = program.input || './input';
let outputDir = program.output || './output';
let parseOption = function (str) {
	let option = {};
	if (str) {
		let colOptions = str.split(/\r|\n/);
		colOptions.forEach(colOpt => {
			let opt = colOpt.split(':');
			option[opt[0]] = opt[1];
		});
	}
	return option;
}

let parseXlsx = function (filename) {
	var workbook = XLSX.readFile(filename);
	var output = {
		json: {},
		dts: {
			models: []
		}
	};
	var outJson = output.json;
	workbook.SheetNames.forEach(sheetName => {
		var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {header: 1});
		if (roa.length > 2) {
			let options = roa[0];
			let header = roa[1];
			let sheet;
			let pOption = {
				'0': parseOption(options[0])
			};
			let name = sheetName;
			let cols = [];
			for (let i = 2; i < roa.length; i++) {
				let obj = {};
				for (let j = 0; j < header.length; j++) {
					if (header[j]) {
						let val = roa[i][j];
						let option = pOption[j] || (pOption[j] = parseOption(options[j]));
						if (/^number$/i.test(option.val)) {
							val = parseFloat(val);
						}
						obj[header[j]] = val;
						if (i == 2) {
							cols.push({name: header[j], type: option.val || ''});
						}
					}
				}
				//按条件生成字典或数组
				if (/^array$/i.test(pOption[0].type)) {
					if (!sheet)
						sheet = outJson[name] = [];
					sheet.push(obj);
				} else {
					if (!sheet)
						sheet = outJson[name] = {};
					let key = roa[i][0];
					if (key) {
						sheet[key] = obj;
					}
				}
			}

			//dts
			output.dts.models.push({
				name: name,
				cols: cols
			})
		}
	});
	return output;
}

let mkdirsSync = function (dirname, mode) {
	if (fs.existsSync(dirname)) {
		return true;
	}
	else {
		if (mkdirsSync(path.dirname(dirname), mode)) {
			fs.mkdirSync(dirname, mode);
			return true;
		}
		else {
			return false;
		}
	}
}

let promise = function (fn, caller, nodeCallback, args) {
	var defer = Q.defer();
	try {
		if (!fn) {
			throw exports.error('fn can not be null');
		}
		if (!args)
			args = [];
		if (!nodeCallback) {
			var def = Q.defer();
			args.push(def);
			defer.resolve(fn.apply(caller, args));
		}
		else {
			args.push(function (err) {
				var cbArgs = [];
				for (var _i = 1; _i < arguments.length; _i++) {
					cbArgs[_i - 1] = arguments[_i];
				}
				if (err)
					defer.reject(err);
				else {
					defer.resolve.apply(void 0, cbArgs);
				}
			});
			fn.apply(caller, args);
		}
	}
	catch (e) {
		defer.reject(e);
	}
	return defer.promise;
};

promise(fs.readdir, fs, true, [dir]).then((files) => {
	files.forEach(function (file) {
		let pathname = path.join(dir, file);
		promise(fs.stat, fs, true, [pathname]).then(stat => {
			if (stat.isDirectory()) {
				// 如果是文件夹遍历
				//explorer(pathname);
			} else {
				let match = /(^[^~]+)\.xlsx$/.exec(file);
				if (match) {
					let output = parseXlsx(pathname);
					let filename = match[1];
					mkdirsSync(outputDir);
					let onError = function (e) {
						console.log(e);
					}
					let outJsonFilename = path.join(outputDir, filename + '.json');
					promise(fs.writeFile, fs, true, [outJsonFilename, JSON.stringify(output.json, null, '\t')]).then(() => {
						console.log(`${pathname} -> ${outJsonFilename}`);
					}).catch(onError);

					let outDtsFilename = path.join(outputDir, filename + '.d.ts');
					promise(ejs.renderFile, ejs, true, [path.resolve(__dirname + '/template/dts.ejs'), output.dts]).then((t) => {
						return promise(fs.writeFile, fs, true, [outDtsFilename, t]);
					}).then(() => {
						console.log(`${pathname} -> ${outDtsFilename}`);
					}).catch(onError);
				}
			}
		}).catch(e => {
			console.log(pathname);
			console.log(e);
		});
	});
}).catch(e => {
	console.log(e);
});