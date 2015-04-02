(function () {
	'use strict';

	function pack(definition) {
		var inputs = definition.inputs.map(function (input) {
			return '#input ' + input.type + ' ' + input.name;
		}).join('\n');

		var outputs = definition.outputs.map(function (output) {
			return '#output ' + output.type + ' ' + output.name;
		}).join('\n');

		return inputs + '\n' + outputs + '\n\n' + definition.body;
	}

	function pipe(fun1, fun2) {
		return function () {
			return fun2.call(this, fun1.apply(this, arguments));
		}
	}

	var wrapTrim = pipe.bind(null, function (str) { return str.trim(); });

	var declarationRegex = /^#(?:input|output) (\w+) (\w+)$/;
	var isDeclarationy = wrapTrim(function (trimmed) {
		return trimmed.length === 0 || declarationRegex.test(trimmed);
	});

	var inputDeclarationRegex = /^#input (\w+) (\w+)$/;
	var isInputDeclaration = wrapTrim(function (trimmed) {
		return inputDeclarationRegex.test(trimmed);
	});

	var outputDeclarationRegex = /^#output (\w+) (\w+)$/;
	var isOutputDeclaration = wrapTrim(function (trimmed) {
		return outputDeclarationRegex.test(trimmed);
	});

	var processDeclaration = wrapTrim(function (trimmed) {
		var matching = trimmed.match(declarationRegex);
		return {
			type: matching[1],
			name: matching[2]
		};
	});

	function unpack(code) {
		var lines = code.split('\n');

		var lineCounter = 0;

		while (isDeclarationy(lines[lineCounter]) && lineCounter < lines.length - 1) {
			lineCounter++;
		}

		var inputs = lines.slice(0, lineCounter - 1)
			.filter(isInputDeclaration)
			.map(processDeclaration);

		var outputs = lines.slice(0, lineCounter - 1)
			.filter(isOutputDeclaration)
			.map(processDeclaration);

		var body = lines.slice(lineCounter).join('\n');

		return {
			inputs: inputs,
			outputs: outputs,
			body: body
		};
	}

	window.shaderInputProcessor = window.shaderInputProcessor || {};
	window.shaderInputProcessor.pack = pack;
	window.shaderInputProcessor.unpack = unpack;
})();
