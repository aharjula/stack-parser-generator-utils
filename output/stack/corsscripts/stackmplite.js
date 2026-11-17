// This file is part of Stack - https://stack.maths.ed.ac.uk
//
// Stack is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Stack is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Stack.  If not, see <http://www.gnu.org/licenses/>.

////////////////////////////////////////////////////////////////////
// THIS FILE HAS BEEN GENERATED, DO NOT EDIT, EDIT THE GENERATOR. //
////////////////////////////////////////////////////////////////////
/*
 Lexers, parser and AST-logic for a STACK like parsing of Maxima
 code. Note that this does not implement all the syntax candy that
 normal STACK student input processing might apply.

 This is meant to parse CAS generated things for translation to other
 syntaxes. e.g. to JavaScript Math-library or to JessieCode and its
 JSXGraph Math Library extensions.

 @copyright  2025 Matti Harjula, Aalto University.
 @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later.
*/
"use strict";
// These are the things one can expect to come out of the parser
// Not entirelly unlike the ones in STACK MP-classes.
class MPNode {
	// Needs this for instanceof...
	constructor() {
		// A parent is either something, or undefined for detached
		// nodes and null for the root node.
		this.parent = undefined;
	}

	attachChilds() {
		this.getChildren().map((n) => n.parent = this);
	}

	// Executes a function for this node and all its children and
	// their children... Stops execution if that function returns false.
	// Returns false if execution was stopped and true if it completed.
	callbackRecurse(fun) {
		if (fun(this) !== false) {
			for (let n in this.getChildren()) {
				if (fun(n) === false) {
					return false;
				}
			}
		} else {
			return false;
		}
		return true;
	}

	// Turns the parsed result back to Maxima code
	// opt may be a dictinary defining two keys `list separator` and
	// `decimal separator` these are by default `,` and `.`.
	toString(opt) {
		return '';
	}

	// Applies translation to e.g. JS or JessieCode or something else.
	// The options contain dictionaries, defining how particular 
	// identifiers in particular roles are to be translated. Check the
	// implementations of `toJessieCode` and `toJS` for examples.
	// Note that you need to know what you are translating not all
	// possible parseable things have sensible translations.
	// Pay attenttion to the console when using this, should unidentified
	// functions or variables be spotted this will generally complain to
	// console, should you not want compaints define translations through
	// options.
	translate(opt) {
		return '';
	}

	// Sets translation options for translation to JavaScript and
	// its Math-library. Does not override any of the given options.
	toJS(opt) {
		if (opt === undefined) {
			opt = {'functions': {}, 'variables': {}, 'operators' : {}, 'decimal separator': '.', 'list separator': ','};
		} else {
			if (opt.functions === undefined) {
				opt.functions = {};
			}
			if (opt.variables === undefined) {
				opt.variables = {};
			}
			if (opt.operators === undefined) {
				opt.operators = {};
			}
			if (!opt.hasOwnProperty('decimal separator')) {
				opt['decimal separator'] = '.';
			}
			if (!opt.hasOwnProperty('list separator')) {
				opt['list separator'] = ',';
			}
		}
		// Basic functions. Mainly renames.
		let functions = {
			'abs' : 'Math.abs',
			'cos' : 'Math.cos',
			'cosh' : 'Math.cosh',
			'acos' : 'Math.acos',
			'acosh' : 'Math.acosh',
			'sin' : 'Math.sin',
			'sinh' : 'Math.sinh',
			'asin' : 'Math.asin',
			'asinh' : 'Math.asinh',
			'tan' : 'Math.tan',
			'tanh' : 'Math.tanh',
			'atan' : 'Math.atan',
			'atanh' : 'Math.atanh',
			'atan2' : 'Math.atan2',
			'ceiling' : 'Math.ceil',
			'exp' : 'Math.exp',
			'floor' : 'Math.floor',
			'log' : 'Math.log',
			'max' : 'Math.max',
			'mod' : (args, o) => '((' + args[0].translate(o) + ') % (' + args[1].translate(o) +'))',
			'min' : 'Math.min',
			'signum' : 'Math.sign',
			'sqrt': 'Math.sqrt',
			// Note the list separator, it is always defined here but not guaranteed in all translation logic.
			'root': (args, o) => args.length === 1 ? 'Math.sqrt(' + args[0].translate(o) + ')' : 'Math.pow(' + args[0].translate(o) + o['list separator'] + '1/(' + args[1].translate(o) + '))',
		};

		// Override with incoming.
		opt.functions = { ...functions, ...opt.functions };		


		// Basic constants. Simple rewrites. Never functions.
		let variables = {
			'e' : 'Math.E',
			'%e' : 'Math.E',
			'pi' : 'Math.PI',
			'%pi' : 'Math.PI',
			'%phi' : '1.618033988749895',
			'%gamma' : '0.5772156649015329'
		};

		// Override with incoming.
		opt.variables = { ...variables, ...opt.variables };		

		// Operators, sometimes mapping to functions.
		let operators = {
			'=' : '==',
			'and' : '&&',
			'or': '||',
			'not': '!',
			'#': '!=',
			'^': (lhs, rhs, o) => 'Math.pow(' + lhs.translate(o) + o['list separator'] + rhs.translate(o) + ')',
			'**': (lhs, rhs, o) => 'Math.pow(' + lhs.translate(o) + o['list separator'] + rhs.translate(o) + ')',
			'*': '*',
			'/': '/',
			'-': '-',
			'+': '+'
		};

		// Override with incoming.
		opt.operators = { ...operators, ...opt.operators };		



		return this.translate(opt);
	}

	// Sets translation options for translation to JessieCode and
	// JSXGraphMath-library. Does not override any of the given options.
	toJessieCode(opt) {
		if (opt === undefined) {
			opt = {'functions': {}, 'variables': {}, 'operators' : {}, 'decimal separator': '.', 'list separator': ','};
		} else {
			if (opt.functions === undefined) {
				opt.functions = {};
			}
			if (opt.variables === undefined) {
				opt.variables = {};
			}
			if (opt.operators === undefined) {
				opt.operators = {};
			}
			if (!opt.hasOwnProperty('decimal separator')) {
				opt['decimal separator'] = '.';
			}
			if (!opt.hasOwnProperty('list separator')) {
				opt['list separator'] = ',';
			}
		}

		// Basic functions. Mainly renames.
		let functions = {
			'cot' : 'JXG.Math.cot',
			'acot': 'JXG.Math.acot',
			'binomial': 'JXG.Math.binomial',
			'erf': 'JXG.Math.erf',
			'erfc': 'JXG.Math.erfc',
			'gamma': 'JXG.Math.gamma',
			'lcm': 'JXG.Math.lcm',
			'gcd': 'JXG.Math.gcd',
		};

		// Override with incoming.
		opt.functions = { ...functions, ...opt.functions };	


		// Operators, mapping to functions.
		let operators = {
			'!': (lhs, o) => 'JXG.Math.factorial(' + lhs.translate(o) + ')',
			'xor' : (lhs, rhs, o) => 'JXG.Math.xor(' + lhs.translate(o) + o['list separator'] + rhs.translate(o) + ')',
		};

		// Override with incoming.
		opt.operators = { ...operators, ...opt.operators };		

		return this.toJS(opt);
	}

	getChildren() {
		return [];
	}

	replace(part_of, with_this) {
		// This is a meaningles function for most things.
	}
}

class MPAtom extends MPNode {
	constructor(value) {
		super();
		this.value = value;
	}

	toString(opt) {
		return this.value;
	}

	translate(opt) {
		return this.value;
	}
}

class MPInteger extends MPAtom {
	constructor(value) {
		super(value);
	}
}

class MPIdentifier extends MPAtom {
	constructor(value) {
		super(value);
	}

	translate(opt) {
		// Note the translation of functions has already happened
		// so only check for variable usage.
		if (opt.variables !== undefined && opt.variables.hasOwnProperty(this.value)) {
			return opt.variables[this.value];
		} else {
			console.log("Translation of undeclared variable: " + this.value);
		}
		return this.value;
	}
}


class MPFloat extends MPAtom {
	constructor(value) {
		super(value);
	}

	toString(opt) {
		let r = '' + this.value;
		if (opt !== undefined && opt['decimal separator'] !== undefined && opt['decimal separator'] !== '.') {
			r = r.replace('.', opt['decimal separator']);
		}
		return r;
	}

	translate(opt) {
		let r = '' + this.value;
		if (opt !== undefined && opt['decimal separator'] !== undefined && opt['decimal separator'] !== '.') {
			r = r.replace('.', opt['decimal separator']);
		}
		return r;
	}
}

class MPString extends MPAtom {
	constructor(value) {
		super(value);
	}

	toString(opt) {
		return '"' + this.value.replaceAll("\\", "\\\\").replaceAll('"', "\\\"") + '"';
	}

	translate(opt) {
		// We will use 'strings' to match JessieCode and JS at the same time.
		return "'" + this.value.replaceAll("\\", "\\\\").replaceAll("'", "\\'").replaceAll("\n", "\\n").replaceAll("\t", "\\t") + "'";
	}
}

class MPBoolean extends MPAtom {
	constructor(value) {
		super(value);
	}
	toString(opt) {
		if (this.value === false || this.value === 'false') {
			return 'false';
		}
		return 'true';
	}
}

class MPFunctionCall extends MPNode {
	constructor(name, args) {
		super();
		this.name = name;
		this.args = args;
		this.attachChilds();
	}

	toString(opt) {
		let r = this.name.toString(opt) + '(';
		if (opt !== undefined && opt['list separator'] !== undefined && opt['list separator'] !== ',') {
			r += this.args.map((x) => x.toString(opt)).join(opt['list separator']);
		} else {
			r += this.args.map((x) => x.toString(opt)).join(',');
		}
		return r + ')';
	}

	getChildren() {
		let r = [this.name];
		return r.concat(this.args); 
	}

	replace(part_of, with_this) {
		if (part_of === this.name) {
			this.name = with_this;
			this.name.parent = this;
		}
		for (let i = 0; i < this.args.length; i++) {
			if (this.args[i] === part_of) {
				this.args[i] = with_this;
				this.args[i].parent = this;
				break;
			}
		}
	}

	translate(opt) {
		// If the function name is a pure identifier it might be translated.
		let name = null;
		if (this.name instanceof MPIdentifier && opt.functions !== undefined && opt.functions.hasOwnProperty(this.name.value)) {
			let repl = opt.functions[this.name.value];
			if (typeof repl == 'function') {
				return repl(this.args, opt);
			} else {
				name = repl;
			}
		} else if (this.name instanceof MPIdentifier) {
			console.log("Translation of undeclared function: " + this.name.value);
			name = this.name.value;
		}
		if (opt !== undefined && opt['list separator'] !== undefined) {
			return name + '(' + this.args.map((x)=>x.translate(opt)).join(opt['list separator']) + ')';
		}
		return name + '(' + this.args.map((x)=>x.translate(opt)).join(',') + ')';
	}
}

class MPOperation extends MPNode {
	constructor(lhs, op, rhs) {
		super();
		this.lhs = lhs;
		this.op = op;
		this.rhs = rhs;
		this.attachChilds();
	}

	toString(opt) {
		return this.lhs.toString(opt) + " " + this.op + " " + this.rhs.toString(opt);
	}

	getChildren() {
		return [this.lhs, this.rhs];
	}

	replace(part_of, with_this) {
		if (part_of === this.lhs) {
			this.lhs = with_this;
			this.lhs.parent = this;
		}
		if (part_of === this.lhs) {
			this.rhs = with_this;
			this.rhs.parent = this;
		}
	}

	translate(opt) {
		if (opt.operators !== undefined && opt.operators.hasOwnProperty(this.op)) {
			let repl = opt.operators[this.op];
			if (typeof repl == 'function') {
				return repl(this.lhs, this.rhs, opt);
			} else {
				return this.lhs.translate(opt) + ' ' + repl + ' ' + this.rhs.translate(opt);
			}
		} else {
			console.log("Translation of undeclared operator: " + this.op);
			return this.lhs.translate(opt) + ' ' + this.op + ' ' + this.rhs.translate(opt);
		}
	}
}

class MPPrefixOp extends MPNode {
	constructor(op, rhs) {
		super();
		this.op = op;
		this.rhs = rhs;
		this.attachChilds();
	}

	toString(opt) {
		return this.op + this.rhs.toString(opt);
	}

	getChildren() {
		return [this.rhs];
	}

	replace(part_of, with_this) {
		if (part_of === this.lhs) {
			this.rhs = with_this;
			this.rhs.parent = this;
		}
	}

	translate(opt) {
		if (opt.operators !== undefined && opt.operators.hasOwnProperty(this.op)) {
			let repl = opt.operators[this.op];
			if (typeof repl == 'function') {
				return repl(this.rhs, opt);
			} else {
				return repl + ' ' + this.rhs.translate(opt);
			}
		} else {
			console.log("Translation of undeclared operator: " + this.op);
			return this.op + this.rhs.translate(opt);
		}
	}
}

class MPPostfixOp extends MPNode {
	constructor(lhs, op) {
		super();
		this.lhs = lhs;
		this.op = op;
		this.attachChilds();
	}

	toString(opt) {
		return this.lhs.toString(opt) + this.op;
	}

	getChildren() {
		return [this.lhs];
	}

	replace(part_of, with_this) {
		if (part_of === this.lhs) {
			this.lhs = with_this;
			this.lhs.parent = this;
		}
	}

	translate(opt) {
		if (opt.operators !== undefined && opt.operators.hasOwnProperty(this.op)) {
			let repl = opt.operators[this.op];
			if (typeof repl == 'function') {
				return repl(this.lhs, opt);
			} else {
				return this.lhs.translate(opt) + repl;
			}
		} else {
			console.log("Translation of undeclared operator: " + this.op);
			return this.lhs.translate(rhs) + this.op;
		}
	}
}

class MPGroup extends MPNode {
	constructor(items) {
		super();
		this.items = items;
		this.attachChilds();
	}

	toString(opt) {
		let r = '(';
		if (opt !== undefined && opt['list separator'] !== undefined && opt['list separator'] !== ',') {
			r += this.items.map((x) => x.toString(opt)).join(opt['list separator']);
		} else {
			r += this.items.map((x) => x.toString(opt)).join(',');
		}
		return r + ')';
	}

	getChildren() {
		return [].concat(this.items);
	}

	replace(part_of, with_this) {
		for (let i = 0; i < this.items.length; i++) {
			if (this.items[i] === part_of) {
				this.items[i] = with_this;
				this.items[i].parent = this;
				break;
			}
		}
	}

	translate(opt) {
		if (this.items.length !== 1) {
			console.log("Translation of multiple element groups undefined.");
			if (this.items.length > 1) {
				return '(' + this.items[this.items.length - 1].translate(opt) + ')';
			} else {
				return '0';
			}
		} else {
			return '(' + this.items[0].translate(opt) + ')';
		}
	}
}

class MPList extends MPNode {
	constructor(items) {
		super();
		this.items = items;
		this.attachChilds();
	}

	toString(opt) {
		let r = '[';
		if (opt !== undefined && opt['list separator'] !== undefined && opt['list separator'] !== ',') {
			r += this.items.map((x) => x.toString(opt)).join(opt['list separator']);
		} else {
			r += this.items.map((x) => x.toString(opt)).join(',');
		}
		return r + ']';
	}

	getChildren() {
		return [].concat(this.items);
	}

	replace(part_of, with_this) {
		for (let i = 0; i < this.items.length; i++) {
			if (this.items[i] === part_of) {
				this.items[i] = with_this;
				this.items[i].parent = this;
				break;
			}
		}
	}

	translate(opt) {
		if (opt !== undefined && opt['list separator'] !== undefined) {
			return '[' + this.items.map((x)=>x.translate(opt)).join(opt['list separator']) + ']';
		}
		return '[' + this.items.map((x)=>x.translate(opt)).join(',') + ']';
	}
}

class MPSet extends MPNode {
	constructor(items) {
		super();
		this.items = items;
		this.attachChilds();
	}

	toString(opt) {
		let r = '{';
		if (opt !== undefined && opt['list separator'] !== undefined && opt['list separator'] !== ',') {
			r += this.items.map((x) => x.toString(opt)).join(opt['list separator']);
		} else {
			r += this.items.map((x) => x.toString(opt)).join(',');
		}
		return r + '}';
	}

	getChildren() {
		return [].concat(this.items);
	}

	replace(part_of, with_this) {
		for (let i = 0; i < this.items.length; i++) {
			if (this.items[i] === part_of) {
				this.items[i] = with_this;
				this.items[i].parent = this;
				break;
			}
		}
	}

	translate(opt) {
		console.log("Translation of sets undefined.");
		return '0';
	}
}

class MPIndexing extends MPNode {
	constructor(target, indices) {
		super();
		this.target = target;
		this.indices = indices;
		this.attachChilds();
	}

	toString(opt) {
		let r = this.target.toString(opt);
		this.indices.map((x) => r += x.toString(opt));
		return r;
	}

	getChildren() {
		return [this.target].concat(this.indices);
	}

	replace(part_of, with_this) {
		if (this.target === part_of) {
			this.target = with_this;
			this.target.parent = this;
		}
		for (let i = 0; i < this.indices.length; i++) {
			if (this.indices[i] === part_of) {
				this.indices[i] = with_this;
				this.indices[i].parent = this;
				break;
			}
		}
	}

	translate(opt) {
		return this.target.translate(opt) + this.indices.map((x)=>x.translate(opt)).join('');
	}
}

class MPIf extends MPNode {
	constructor(conditions, branches) {
		super();
		this.conditions = conditions;
		this.branches = branches;
		this.attachChilds();
	}

	toString(opt) {
		let i = 0;
		let r = 'if ' + this.conditions[i].toString(opt) + ' then '
			+ this.branches[i].toString(opt);
		i = 1;
		while (this.conditions.length > i) {
			r += ' elseif ' + this.conditions[i].toString(opt) + ' then '
			+ this.branches[i].toString(opt);
			i = i + 1;
		}
		if (this.branches.length > this.conditions.length) {
			r += ' else ' + this.branches[i].toString(opt);
		}
		return r;
	}

	getChildren() {
		return [].concat(this.conditions).concat(this.branches);
	}

	replace(part_of, with_this) {
		for (let i = 0; i < this.conditions.length; i++) {
			if (this.conditions[i] === part_of) {
				this.conditions[i] = with_this;
				this.conditions[i].parent = this;
				break;
			}
		}
		for (let i = 0; i < this.branches.length; i++) {
			if (this.branches[i] === part_of) {
				this.branches[i] = with_this;
				this.branches[i].parent = this;
				break;
			}
		}
	}

	translate(opt) {
		console.log("Translation of if statements undefined.");
		return '0';
	}
}

class MPLoop extends MPNode {
	constructor(body, branches) {
		super();
		this.body = body;
		this.conf = conf;
		this.attachChilds();
	}

	toString(opt) {
		let r = '';
		this.conf.map((x) => r += x.toString(opt) + ' ');
		r += 'do ' + this.body.toString(opt);
		return r;
	}

	getChildren() {
		return [this.body].concat(this.conf);
	}

	replace(part_of, with_this) {
		if (this.body === part_of) {
			this.body = with_this;
			this.body.parent = this;
		}
		for (let i = 0; i < this.conf.length; i++) {
			if (this.conf[i] === part_of) {
				this.conf[i] = with_this;
				this.conf[i].parent = this;
				break;
			}
		}
	}

	translate(opt) {
		console.log("Translation of loops undefined.");
		return '0';
	}
}

class MPLoopBit extends MPNode {
	constructor(mode, branches) {
		super();
		this.mode = mode;
		this.param = param;
		this.attachChilds();
	}

	toString(opt) {
		return this.mode + ' ' + this.param.toString(opt);
	}

	getChildren() {
		return [this.param];
	}

	translate(opt) {
		console.log("Translation of loops undefined.");
		return '0';
	}
}

class MPEvaluationFlag extends MPNode {

	constructor(name, value) {
		super();
		this.name = name;
		this.value = value;
		this.attachChilds();
	}

	toString(opt) {
		let r = ',';
		if (opt !== undefined && opt['list separator'] !== undefined && opt['list separator'] !== ',') {
			r = opt['list separator'];
		}
		r += this.name.toString(opt);
		if (this.value !== undefined) {
			r += '=' + this.value.toString(opt);
		}
		return r;
	}

	getChildren() {
		let r = [this.name];
		if (this.value !== undefined) {
			r.push(this.value);
		}
		return r;
	}

	translate(opt) {
		console.log("Translation of evaluation-flags undefined.");
		return '';
	}
}

class MPStatement extends MPNode {
	constructor(statement, flags) {
		super();
		this.statement = statement;
		this.flags = flags;
		this.attachChilds();
	}

	toString(opt) {
		let r = this.statement.toString(opt);
		this.flags.map((x) => r += x.toString(opt) + ' ');
		return r;
	}

	getChildren() {
		return [this.statement].concat(this.flags);
	}

	translate(opt) {
		return this.statement.translate(opt);
	}
}

class MPPrefixeq extends MPNode {
	constructor(statement) {
		super();
		this.statement = statement;
		this.attachChilds();
	}

	toString(opt) {
		return 'stackeq(' + this.statement.toString() + ')';
	}

	getChildren() {
		return [this.statement];
	}
}

class MPLet extends MPNode {
	constructor(statement) {
		super();
		this.statement = statement;
		this.attachChilds();
	}

	toString(opt) {
		return 'stacklet(' + this.statement.toString() + ')';
	}

	getChildren() {
		return [this.statement];
	}
}

class MPRoot extends MPNode {
	constructor(items) {
		super();
		this.items = items;
		this.attachChilds();
	}

	toString(opt) {
		let r = '';
		if (opt !== undefined && opt['list separator'] !== undefined && opt['list separator'] === ';') {
			r += this.items.map((x) => x.toString(opt)).join('$');
		} else {
			r += this.items.map((x) => x.toString(opt)).join(';');
		}
		return r;
	}

	getChildren() {
		return [].concat(this.items);
	}

	translate(opt) {
		if (this.items.length !== 1) {
			console.log("Translation of multiple statements undefined.");
			if (this.items.length > 1) {
				return this.items[this.items.length - 1].translate(opt);
			} else {
				return '0';
			}
		} else {
			return this.items[0].translate(opt);
		}
	}
}

const TOKENTYPES = Object.freeze({
	ID: 1,
	KW: 2,
	INT: 3,
	FLT: 4,
	BOOL: 5,
	STR: 6,
	SYM: 7,
	WS: 8,
	COM: 9,
	LS: 10,
	ET: 11,
	LI: 12,
	ERR: 13
});


// Tokens, without position data or original forms.
class MPToken {
	constructor(type,value) {
		this.t = type;
		this.v = value;
	}
}

// Some common regexps.
const DIGITS = /[\d]/;
const ALPHA = /[a-zA-Z]/;
const LETTER = /\p{Letter}/iu;
const WS = /\s+/u;

// Then the lexer. For now for CAS output so no Unicode rewrites.
class MPLexerBase {
	constructor(src, options) {
		this.buffer = Array.from(src);
		this.outputbuffer = [];
		this.options = options;
		if (options === undefined) {
			this.options = {};
		}
	}

	popc() {
		if (this.buffer.length === 0) {
			return null;
		}
		return this.buffer.shift();
	}

	pushc(char) {
		if (char !== null) {
			this.buffer.unshift(char);
		}
	}

	return_token(token) {
		if (token !== null) {
			this.outputbuffer.push(token);
		}
	}

	get() {
		if (this.outputbuffer.length > 0) {
			return this.outputbuffer.pop();
		}

		const c0 = this.popc();
		if (c0 === null) {
			return null;
		}
		let token = new MPToken(TOKENTYPES.SYM, c0);
		switch (c0) {
            case ',':
                token.t = TOKENTYPES.LS;
                return token;
            case ';':
            case '$':
                token.t = TOKENTYPES.ET;
                return token;
            case '-':
            case '(':
            case ')':
            case '[':
            case ']':
            case '{':
            case '}':
            case '~':
            case '=':
            case '|':
            case '@': // Note no '@@Is@@' in this lexer.
                return token;
            case '>':
            case '<':
            	const c1 = this.popc();
            	if (c1 === '=') {
            		token.v += c1;
            	} else {
            		this.pushc(c1);
            	}
                return token;
			case '*':
            case '^':
            case '!':
            case "'":
            	const c2 = this.popc();
            	if (c2 === c0) {
            		token.v += c2;
            	} else {
            		this.pushc(c2);
            	}
                return token;
            case '+':
            	if (this.options['pm'] === true) {
            		const c3 = this.popc();
            		if (c3 === '-') {
            			token.v += c3;
            		} else {
            			this.pushc(c3);
            		}
            	}
            	return token;
            case ':':
            	const c4 = this.popc();
            	if (c4 === ':') {
            		token.v += c4;
            		const c5 = this.popc();
            		if (c5 === '=') {
            			token.v += c5;
            		} else {
            			this.pushc(c5);	
            		}
            	} else if (c4 === '=') {
            		token.v += c4;
            	} else {
            		this.pushc(c4);
            	}
            	return token;
            case '?':
            	// No LISP identifiers here.
            	token.v = 'QMCHAR';
            	return token;
            case '#':
            	const c6 = this.popc();
            	if (c6 === 'p') {
					const c7 = this.popc();
	            	if (c7 === 'm') {
						const c8 = this.popc();
		            	if (c8 === '#') {
		            		token.v = '#pm#';
		            	} else {
		            		this.pushc(c8);
		            	}
	            	} else {
	            		this.pushc(c7);
	            	}
            	} else {
            		this.pushc(c6);
            	}
            	return token;
            case ' ':
            case '\n':
            case '\t':
            	return this.eat_whitespace(token);
            case '"':
            	return this.eat_string();
            case '/':
            	const c9 = this.popc();
            	if (c9 === '*') {
            		return this.eat_comment();
            	} else {
            		this.pushc(c9);
            	}
            	return token;
		}

		if (c0 === '.' || (c0.match(DIGITS) !== null)) {
			return this.eat_number(token);
		}
		if (c0 === '_' || c0 === '%' || (c0.match(LETTER)) !== null) {
			return this.kwidentify(this.eat_identifier(token));
		}
		if (c0.match(WS) !== null) {
			return this.eat_whitespace(token);
		}

		token.t = TOKENTYPES.ERR;
		token.v = 'Unexpected character "' + c0 + '"';
		return token;
	}

	eat_whitespace(token) {
		let c1 = this.popc();
		while (c1 !== null && c1.match(WS) !== null) {
			token.v += c1;
			c1 = this.popc();
		}
		this.pushc(c1);
		token.t = TOKENTYPES.WS;
		return token;
	}

	eat_identifier(token) {
		let c1 = this.popc();
		while (c1 !== null && (c1 === '%' || c1 === '_' || c1.match(LETTER) !== null || c1.match(DIGITS) !== null)) {
			token.v += c1;
			c1 = this.popc();
		}
		this.pushc(c1);
		token.t = TOKENTYPES.ID;
		return token;
	}

	eat_comment() {
		/* We have already eaten that starting ´/*´. */
		let token = new MPToken(TOKENTYPES.COM, '');
		let c1 = this.popc();
		while (c1 !== null) {
			switch(c1) {
				case '*':
					let c2 = this.popc();
					if (c2 === '/') {
						return token;
					} else {
						this.pushc(c2);
					}
				default:
					token.v += c1;
			}
			c1 = this.popc();
		}
		token.t = TOKENTYPES.ERR;
		token.v = 'Comment not closed.';
		return token;
	}

	eat_string() {
		/* We have already eaten that starting ´"´. */
		let token = new MPToken(TOKENTYPES.STR, '');
		let c1 = this.popc();
		while (c1 !== null) {
			switch(c1) {
				case '"':
					return token;
				case '\\':
					let c2 = this.popc();
					if (c2 !== null) {
						token.v += c2;
					} else {
						token.t = TOKENTYPES.ERR;
						token.v = 'String not closed.';
						return token;						
					}
					break;
				default:
					token.v += c1;
			}
			c1 = this.popc();
		}
		token.t = TOKENTYPES.ERR;
		token.v = 'String not closed.';
		return token;
	}

	eat_number(token) {
		let mode = 'pre-dot';
		let c1 = this.popc();
		if (token.v === '.') {
			// It could be the matrix multiplication op.
			if (c1 !== null && c1.match(DIGITS) !== null) {
				token.v += c1;
				mode = 'post-dot';
			} else {
				this.pushc(c1);
				token.t = TOKENTYPES.SYM;
				return token;
			}
		}
		while(true && c1 !== null) {
			if (c1.match(DIGITS) !== null) {
				token.v += c1;
			} else if (mode === 'pre-dot' && c1 === '.') {
				let c2 = this.popc();
				if (c2.match(DIGITS) !== null) {
					token.v += c1 + c2;
					mode = 'post-dot';
				} else {
					// Must have a digit after the decimal sep.
					this.pushc(c2);
					this.pushc(c1);
					break;	
				}
			} else if (mode === 'post-dot' && c1 === '.') {
				this.pushc(c1);
				break;
			} else if (c1 === 'e' || c1 === 'E') {
				if (mode === 'exp') {
					this.pushc(c1);
					break;
				} else {
					let c2 = this.popc();
					if (c2 === '-' || c2 === '+' || c2.match(DIGITS) !== null) {
						token.v += c1 + c2;
						mode === 'exp';
					} else {
						this.pushc(c2);
						this.pushc(c1);
						break;
					}
				}
			} else {
				this.pushc(c1);
				break;
			}

			c1 = this.popc();
		}
		if (mode === 'exp' || mode === 'post-dot') {
			token.t = TOKENTYPES.FLT;
		} else {
			token.t = TOKENTYPES.INT;
		}
		return token;

	}

	kwidentify(token) {
		switch(token.v) {
			case 'true':
			case 'false':
				token.t = TOKENTYPES.BOOL;
				return token;
			case 'nounnot':
            case 'not':
            	const c1 = this.popc();
            	if (c1 === ' ') {
            		token.v += ' ';
            		token.t = TOKENTYPES.SYM;
            		return token;
            	} else {
            		this.pushc(c1);
            		token.t = TOKENTYPES.KW;
            		return token;
            	}
            case '%not':
            case '%and':
            case '%or':
            case 'and':
            case 'or':
            case 'nouneq':
            case 'nounadd':
            case 'nounand':
            case 'nounor':
            case 'nounsub':
            case 'nounmul':
            case 'nounpow':
            case 'noundiv':
            case 'nand':
            case 'nor':
            case 'implies':
            case 'xor':
            case 'xnor':
            case 'UNARY_RECIP':
            case 'unary_recip':
            case 'blankmult':
            case 'if':
            case 'then':
            case 'elseif':
            case 'else':
            case 'do':
            case 'for':
            case 'from':
            case 'step':
            case 'next':
            case 'in':
            case 'thru':
            case 'while':
            case 'unless':
                token.t = TOKENTYPES.KW;
                return token;
            case '%':
            case '%%':
                token.t = TOKENTYPES.ERR;
                token.v = 'LEXER LEVEL FORBIDDEN TOKEN: "' + token.v + '"';
                return token;
            default:
            	token.t = TOKENTYPES.ID;
            	return token;
		}
	}
}

// Same but with decimal commas.
class MPCommaLexer extends MPLexerBase {
	constructor(src, options) {
		super(src, options);
	}

	get() {
		if (this.outputbuffer.length > 0) {
			return this.outputbuffer.pop();
		}

		const c0 = this.popc();
		if (c0 === null) {
			return null;
		}
		let token = new MPToken(TOKENTYPES.SYM, c0);
		switch (c0) {
            case ';':
                token.t = TOKENTYPES.LS;
                return token;
            case '$':
                token.t = TOKENTYPES.ET;
                return token;
            case '-':
            case '(':
            case ')':
            case '[':
            case ']':
            case '{':
            case '}':
            case '~':
            case '=':
            case '|':
            case '.':
            case '@': // Note no '@@Is@@' in this lexer.
                return token;
            case '>':
            case '<':
            	const c1 = this.popc();
            	if (c1 === '=') {
            		token.v += c1;
            	} else {
            		this.pushc(c1);
            	}
                return token;
			case '*':
            case '^':
            case '!':
            case "'":
            	const c2 = this.popc();
            	if (c2 === c0) {
            		token.v += c2;
            	} else {
            		this.pushc(c2);
            	}
                return token;
            case '+':
            	if (this.options['pm'] === true) {
            		const c3 = this.popc();
            		if (c3 === '-') {
            			token.v += c3;
            		} else {
            			this.pushc(c3);
            		}
            	}
            	return token;
            case ':':
            	const c4 = this.popc();
            	if (c4 === ':') {
            		token.v += c4;
            		const c5 = this.popc();
            		if (c5 === '=') {
            			token.v += c5;
            		} else {
            			this.pushc(c5);	
            		}
            	} else if (c4 === '=') {
            		token.v += c4;
            	} else {
            		this.pushc(c4);
            	}
            	return token;
            case '?':
            	// No LISP identifiers here.
            	token.v = 'QMCHAR';
            	return token;
            case '#':
            	const c6 = this.popc();
            	if (c6 === 'p') {
					const c7 = this.popc();
	            	if (c7 === 'm') {
						const c8 = this.popc();
		            	if (c8 === '#') {
		            		token.v = '#pm#';
		            	} else {
		            		this.pushc(c8);
		            	}
	            	} else {
	            		this.pushc(c7);
	            	}
            	} else {
            		this.pushc(c6);
            	}
            	return token;
            case ' ':
            case '\n':
            case '\t':
            	return this.eat_whitespace(token);
            case '"':
            	return this.eat_string();
            case '/':
            	const c9 = this.popc();
            	if (c9 === '*') {
            		return this.eat_comment();
            	} else {
            		this.pushc(c9);
            	}
            	return token;
		}

		if (c0 === ',' || (c0.match(DIGITS) !== null)) {
			return this.eat_number(token);
		}
		if (c0 === '_' || c0 === '%' || (c0.match(LETTER)) !== null) {
			return this.kwidentify(this.eat_identifier(token));
		}
		if (c0.match(WS) !== null) {
			return this.eat_whitespace(token);
		}

		token.t = TOKENTYPES.ERR;
		token.v = 'Unexpected character "' + c0 + '"';
		return token;
	}

	eat_number(token) {
		let mode = 'pre-comma';
		let c1 = this.popc();
		if (token.v === ',') {
			if (c1 !== null && c1.match(DIGITS) !== null) {
				token.v += c1;
				mode = 'post-comma';
			} else {
				this.pushc(c1);
				// Invalid comma
				token.t = TOKENTYPES.ERR;
				token.v = 'Unexpected comma.'
				return token;
			}
		}
		while(true && c1 !== null) {
			if (c1.match(DIGITS) !== null) {
				token.v += c1;
			} else if (mode === 'pre-comma' && c1 === ',') {
				let c2 = this.popc();
				if (c2.match(DIGITS) !== null) {
					token.v += "." + c2;
					mode = 'post-comma';
				} else {
					// Must have a digit after the decimal sep.
					this.pushc(c2);
					this.pushc(c1);
					break;	
				}
			} else if (mode === 'post-comma' && c1 === ',') {
				this.pushc(c1);
				break;
			} else if (c1 === 'e' || c1 === 'E') {
				if (mode === 'exp') {
					this.pushc(c1);
					break;
				} else {
					let c2 = this.popc();
					if (c2 === '-' || c2 === '+' || c2.match(DIGITS) !== null) {
						token.v += c1 + c2;
						mode === 'exp';
					} else {
						this.pushc(c2);
						this.pushc(c1);
						break;
					}
				}
			} else {
				this.pushc(c1);
				break;
			}

			c1 = this.popc();
		}
		if (mode === 'exp' || mode === 'post-comma') {
			token.t = TOKENTYPES.FLT;
		} else {
			token.t = TOKENTYPES.INT;
		}
		return token;
	}
}

// Parser tables, note this comes from the generator and is "compressed" version of the lalr-lite.json.
const tables = JSON.parse('{"nonterminalsz["List"yGroup"yTopOp"yOpInfix"yOpSuffix"yOpPrefix"yTerm"yAbs"yCallOrIndex?"yIndexableOrCallable"ySet"yStatement"yListsOrGroups"yStatementNullList"yTermList"yStart"]yterminalsz["-"y+"y+-"y|"y]"y}"y)"yLIST SEP"yEND OF FILE"y*"y**"y^^"y^"y."y#"y/"yand"yor",z:=",z=",z:",z"y<="y<"y>="y>"y="y~"y%and"y%or"ynounmul"y@"yimplies"y ^-"y ^+"y ^+-"y ^#pm#"y **-"y **+"y **+-"y **#pm#"y ^^-"y ^^+"y ^^+-"y ^^#pm#"yxor"yxnor"ynor"ynand"y!"y!!"y["y("y\'\'"y\'"ynot"ynot "y?? "y? "y?"ynounnot"y%not"ynounnot "yBOOL"yINT"yFLOAT"ySTRING"yID"y{"]yrules_to_nonterminalsz[15,0,10,1,13,13,14,14,11,6,6,6,6,9,9,9,9,9,8,12,12,1!),2,2!-5!-5,5,5,4,4!=3U3,3,3,7,5,5U3,5!=3,3]yrule_lengthsz[1U2,0,3,0!B1!B1,1,1,2,2,0,2!B1,1,!),!),!)!=3U3U2,2U3,2!=3,3]ytablez[{"!$!%8w},{"8w7y7w7jw7cw7Yw7y9!E!:$8k1w00!G@0k!#2!Hj8;4j9;6c0;8JX5c0X5y9X5v0X5v1X5v2X5v3X5v4X5v5X5y0X5vX5kX5v6X5v7X5v8X5v9X5k0X5k1X5k2X5k3X5k4X5k5X5k6X5k7X5qX5k8X5k9X5q0X5q1X5q2X5q3X5q4X5q5X5q6X5q7X5q8X5q9X5j0X5j1X5j2X5j3X5j4X5j5X5j6X5j7X5j8X5y8X5y7X5jX5cX5YX5JX7c0X7y9X7v0X7v1X7v2X7v3X7v4X7v5X7y0X7vX7kX7v6X7v7X7v8X7v9X7k0X7k1X7k2X7k3X7k4X7k5X7k6X7k7X7qX7k8X7k9X7q0X7q1X7q2X7q3X7q4X7q5X7q6X7q7X7q8X7q9X7j0X7j1X7j2X7j3X7j4X7j5X7j6X7j7X7j8X7y8X7y7X7jX7cX7YX7JX9c0X9y9X9v0X9v1X9v2X9v3X9v4X9v5X9y0X9vX9kX9v6X9v7X9v8X9v9X9k0X9k1X9k2X9k3X9k4X9k5X9k6X9k7X9qX9k8X9k9X9q0X9q1X9q2X9q3X9q4X9q5X9q6X9q7X9q8X9q9X9j0X9j1X9j2X9j3X9j4X9j5X9j6X9j7X9j8X9y8X9y7X9jX9cX9YX9JV1c0V1y9V1v0V1v1V1v2V1v3V1v4V1v5V1y0V1vV1kV1v6V1v7V1v8V1v9V1k0V1k1V1k2V1k3V1k4V1k5V1k6V1k7V1qV1k8V1k9V1q0V1q1V1q2V1q3V1q4V1q5V1q6V1q7V1q8V1q9V1j0V1j1V1j2V1j3V1j4V1j5V1j6V1j7V1j8V1y8V1y7V1jV1cV1YV1JV3c0V3y9V3v0V3v1V3v2V3v3V3v4V3v5V3y0V3vV3kV3v6V3v7V3v8V3v9V3k0V3k1V3k2V3k3V3k4V3k5V3k6V3k7V3qV3k8V3k9V3q0V3q1V3q2V3q3V3q4V3q5V3q6V3q7V3q8V3q9V3j0V3j1V3j2V3j3V3j4V3j5V3j6V3j7V3j8V3y8V3y7V3jV3cV3YV3},{"!.%!$Q8Jw9c0w9y9w9v0w9v1w9v2w9v3w9v4w9v5w9y0w9vw9kw9v6w9v7w9v8w9v9w9k0w9k1w9k2w9k3w9k4w9k5w9k6w9k7w9qw9k8w9k9w9q0w9q1w9q2w9q3w9q4w9q5w9q6w9q7w9q8w9q9w9j0w9j1w9j2w9j3w9j4w9j5w9j6w9j7w9j8w9y8w9y7w9jw9cw9Yw9JZ1c0Z1y9Z1v0Z1v1Z1v2Z1v3Z1v4Z1v5Z1y0Z1vZ1kZ1v6Z1v7Z1v8Z1v9Z1k0Z1k1Z1k2Z1k3Z1k4Z1k5Z1k6Z1k7Z1qZ1k8Z1k9Z1q0Z1q1Z1q2Z1q3Z1q4Z1q5Z1q6Z1q7Z1q8Z1q9Z1j0Z1j1Z1j2Z1j3Z1j4Z1j5Z1j6Z1j7Z1j8Z1y8Z1y7Z1jZ1cZ1YZ1JZ3c0Z3y9Z3v0Z3v1Z3v2Z3v3Z3v4Z3v5Z3y0Z3vZ3kZ3v6Z3v7Z3v8Z3v9Z3k0Z3k1Z3k2Z3k3Z3k4Z3k5Z3k6Z3k7Z3qZ3k8Z3k9Z3q0Z3q1Z3q2Z3q3Z3q4Z3q5Z3q6Z3q7Z3q8Z3q9Z3j0Z3j1Z3j2Z3j3Z3j4Z3j5Z3j6Z3j7Z3j8Z3y8Z3y7Z3jZ3cZ3YZ3JZ5c0Z5y9Z5v0Z5v1Z5v2Z5v3Z5v4Z5v5Z5y0Z5vZ5kZ5v6Z5v7Z5v8Z5v9Z5k0Z5k1Z5k2Z5k3Z5k4Z5k5Z5k6Z5k7Z5qZ5k8Z5k9Z5q0Z5q1Z5q2Z5q3Z5q4Z5q5Z5q6Z5q7Z5q8Z5q9Z5j0Z5j1Z5j2Z5j3Z5j4Z5j5Z5j6Z5j7Z5j8Z5y8Z5y7Z5jZ5cZ5YZ5},{"!$Q8JX1c0X1y9!D0!D1!D2!D3!D4!D5X1y0!D!K!D6!D7!D8!D9!K0!K1!K2!K3!K4!K5!K6!K7!L!K8!K9!L0!L1!L2!L3!L4!L5!L6!L7!L8!L9!S0!S1!S2!S3!S4!S5!S6!S7!S8X1y8X1y7!SX1cX1YX1c1Q4c2!%51Z7c2Z7j9Z7c0Z7y9Z7v0Z7v1Z7v2Z7v3Z7v4Z7v5Z7y0Z7vZ7kZ7v6Z7v7Z7v8Z7v9Z7k0Z7k1Z7k2Z7k3Z7k4Z7k5Z7k6Z7k7Z7qZ7k8Z7k9Z7q0Z7q1Z7q2Z7q3Z7q4Z7q5Z7q6Z7q7Z7q8Z7q9Z7j0Z7j1Z7j2Z7j3Z7j4Z7j5Z7j6Z7j7Z7j8Z7y8Z7y7Z7jZ7cZ7YZ7},{"51Z9c2Z9j9Z9c0Z9y9Z9v0Z9v1Z9v2Z9v3Z9v4Z9v5Z9y0Z9vZ9kZ9v6Z9v7Z9v8Z9v9Z9k0Z9k1Z9k2Z9k3Z9k4Z9k5Z9k6Z9k7Z9qZ9k8Z9k9Z9q0Z9q1Z9q2Z9q3Z9q4Z9q5Z9q6Z9q7Z9q8Z9q9Z9j0Z9j1Z9j2Z9j3Z9j4Z9j5Z9j6Z9j7Z9j8Z9y8Z9y7Z9jZ9cZ9YZ9},{"51`1c2`1j9`1c0`1y9`1v0`1v1`1v2`1v3`1v4`1v5`1y0`1v`1k`1v6`1v7`1v8`1v9`1k0`1k1`1k2`1k3`1k4`1k5`1k6`1k7`1q`1k8`1k9`1q0`1q1`1q2`1q3`1q4`1q5`1q6`1q7`1q8`1q9`1j0`1j1`1j2`1j3`1j4`1j5`1j6`1j7`1j8`1y8`1y7`1j`1c`1Y`1},{"51`3c2`3j9`3c0`3y9`3v0`3v1`3v2`3v3`3v4`3v5`3y0`3v`3k`3v6`3v7`3v8`3v9`3k0`3k1`3k2`3k3`3k4`3k5`3k6`3k7`3q`3k8`3k9`3q0`3q1`3q2`3q3`3q4`3q5`3q6`3q7`3q8`3q9`3j0`3j1`3j2`3j3`3j4`3j5`3j6`3j7`3j8`3y8`3y7`3j`3c`3Y`3},{"51`5c2`5j9`5c0`5y9`5v0`5v1`5v2`5v3`5v4`5v5`5y0`5v`5k`5v6`5v7`5v8`5v9`5k0`5k1`5k2`5k3`5k4`5k5`5k6`5k7`5q`5k8`5k9`5q0`5q1`5q2`5q3`5q4`5q5`5q6`5q7`5q8`5q9`5j0`5j1`5j2`5j3`5j4`5j5`5j6`5j7`5j8`5y8`5y7`5j`5c`5Y`5},{"4w1cw1Yw1y!$!%4w1cw1Yw1y!$!%4w1cw1Yw1y!.%!.%!.%!I.%!$!%!$Q8JW5c0W5y9W5v0W5v1W5v2W5v3W5v4W5v5W5y0W5vW5kW5v6W5v7W5v8W5v9W5k0W5k1W5k2W5k3W5k4W5k5W5k6W5k7W5qW5k8W5k9W5q0W5q1W5q2W5q3W5q4W5q5W5q6W5q7W5q8W5q9W5j0W5j1W5j2W5j3W5j4W5j5W5j6W5j7W5j8W5y8W5y7W5jW5cW5YW5JW7c0W7y9W7v0W7v1W7v2W7v3W7v4W7v5W7y0W7vW7kW7v6W7v7W7v8W7v9W7k0W7k1W7k2W7k3W7k4W7k5W7k6W7k7W7qW7k8W7k9W7q0W7q1W7q2W7q3W7q4W7q5W7q6W7q7W7q8W7q9W7j0W7j1W7j2W7j3W7j4W7j5W7j6W7j7W7j8W7y8W7y7W7jW7cW7YW7!+!AV5!?V5vV5kV5v6V5v7V5!:V5k1V5k2V5k3V5k4V5k5V5k6V5!*V5k8V5k9V5!>V5j6V5j7V5j8V5y8V5y7V5jV5cV5YV5!+!AV7!?&4v&6k&8v6V7v7V7!:V7k1V7k2V7k3V7k4V7k5V7k6V7!*V7k8V7k9V7!>V7j6V7j7V7j8V7y8V7y7V7jV7cV7YV7!+!AV9!?&4v&6k&8v6V9v7V9!:V9k1V9k2V9k3V9k4V9k5V9k6V9!*V9k8V9k9V9!>V9j6V9j7V9j8V9y8V9y7V9jV9cV9YV9JQ1c0Q1y9Q1v0Q1v1Q1v2Q1v3Q1v4Q1v5Q1y0Q1vQ1kQ1v6Q1v7Q1v8Q1v9Q1k0Q1k1Q1k2Q1k3Q1k4Q1k5Q1k6Q1k7Q1qQ1k8Q1k9Q1q0Q1q1Q1q2Q1q3Q1q4Q1q5Q1q6Q1q7Q1q8Q1q9Q1j0Q1j1Q1j2Q1j3Q1j4Q1j5Q1j6Q1j7Q1j8Q1y8Q1y7Q1jQ1cQ1YQ1JQ3c0Q3y9Q3v0Q3v1Q3v2Q3v3Q3v4Q3v5Q3y0Q3vQ3kQ3v6Q3v7Q3v8Q3v9Q3k0Q3k1Q3k2Q3k3Q3k4Q3k5Q3k6Q3k7Q3qQ3k8Q3k9Q3q0Q3q1Q3q2Q3q3Q3q4Q3q5Q3q6Q3q7Q3q8Q3q9Q3j0Q3j1Q3j2Q3j3Q3j4Q3j5Q3j6Q3j7Q3j8Q3y8Q3y7Q3jQ3cQ3YQ3!J6Q5v7Q5!:Q5k1Q!MQ5k8Q5k9Q5!>Q5j6Q5j7Q5j8Q5y8Q5y7Q5jQ5cQ5YQ5!J6Q7v7Q7!:Q7k1Q!NQ7k8Q7k9Q7!>Q7j6Q7j7Q7j8Q7y8Q7y7Q7jQ7cQ7YQ7JQ9c0Q9y9Q9v0Q9v1Q9v2Q9v3Q9v4Q9v5Q9y0Q9vQ9kQ9v6Q9v7Q9v8Q9v9Q9k0Q9k1Q9k2Q9k3Q9k4Q9k5Q9k6Q9k7Q9qQ9k8Q9k9Q9q0Q9q1Q9q2Q9q3Q9q4Q9q5Q9q6Q9q7Q9q8Q9q9Q9j0Q9j1Q9j2Q9j3Q9j4Q9j5Q9j6Q9j7Q9j8Q9y8Q9y7Q9jQ9cQ9YQ9JW1c0W1y9W1v0W1v1W1v2W1v3W1v4W1v5W1y0W1vW1kW1v6W1v7W1v8W1v9W1k0W1k1W1k2W1k3W1k4W1k5W1k6W1k7W1qW1k8W1k9W1q0W1q1W1q2W1q3W1q4W1q5W1q6W1q7W1q8W1q9W1j0W1j1W1j2W1j3W1j4W1j5W1j6W1j7W1j8W1y8W1y7W1jW1cW1YW1JW3c0W3y9W3v0W3v1W3v2W3v3W3v4W3v5W3y0W3vW3kW3v6W3v7W3v8W3v9W3k0W3k1W3k2W3k3W3k4W3k5W3k6W3k7W3qW3k8W3k9W3q0W3q1W3q2W3q3W3q4W3q5W3q6W3q7W3q8W3q9W3j0W3j1W3j2W3j3W3j4W3j5W3j6W3j7W3j8W3y8W3y7W3jW3cW3YW3!J6M5v7M5!:M5k1M!MM5k8M5k9M5!>M5j6M5j7M5j8M5y8M5y7M5jM5cM5YM5!J6M7v7M7!:M7k1M!NM7k8M7k9M7!>M7j6M7j7M7j8M7y8M7y7M7jM7cM7YM7!J6H7v7H7!:H7k1H!NH7k8H7k9H7!>H7j6H7j7H7j8H7y8H7y7H7jH7cH7YH7},{"3Z88y9!E!:$8k1w00!G@0k!#2!Hj8;4j9;6c0;8J`7c0`7y9`7v0`7v1`7v2`7v3`7v4`7v5`7y0`7v`7k`7v6`7v7`7v8`7v9`7k0`7k1`7k2`7k3`7k4`7k5`7k6`7k7`7q`7k8`7k9`7q0`7q1`7q2`7q3`7q4`7q5`7q6`7q7`7q8`7q9`7j0`7j1`7j2`7j3`7j4`7j5`7j6`7j7`7j8`7y8`7y7`7j`7c`7Y`7JX1c0X1y9!D0!D1!D2!D3!D4!D5X1y0!D!K!D6!D7!D8!D9!K0!K1!K2!K3!K4!K5!K6!K7!L!K8!K9!L0!L1!L2!L3!L4!L5!L6!L7!L8!L9!S0!S1!S2!S3!S4!S5!S6!S7!S8X1y8X1y7!SX1cX1YX1c1Q4c2Q8JX1c0X1y9!D0!D1!D2!D3!D4!D5X1y0!D!K!D6!D7!D8!D9!K0!K1!K2!K3!K4!K5!K6!K7!L!K8!K9!L0!L1!L2!L3!L4!L5!L6!L7!L8!L9!S0!S1!S2!S3!S4!S5!S6!S7!S8X1y8X1y7!SX1cX1YX1c1Q4c2!%4Z94},{"4;c;Y;y7Z98},{"5`00},{"6`02!+!AW9!?W9vW9kW9v6W9v7W9!:W9k1W9k2W9k3W9k4W9k5W9k6W9!*W9k8W9k9W9!>W9j6W9j7W9j8W9y8W9y7W9jW9cW9YW9!+&1!;&1v4&1v5&1y0&1v&1k&1v6&1v7&1!:&1k1&1k2&1k3&1k4&1k5&1k6&1!*&1k8&1k9&1q0&1!<&1j6&1j7&1j8&1y8&1y7&1j&1c&1Y&1!+&3!;&3v4&3v5&3y0&3v&3k&3v6&3v7&3!:&3k1&3k2&3k3&3k4&3k5&3k6&3!*&3k8&3k9&3q0&3!<&3j6&3j7&3j8&3y8&3y7&3j&3c&3Y&3!+&5!;&5v4&5v5&5y0&5v&5k&5v6&5v7&5!:&5k1&5k2&5k3&5k4&5k5&5k6&5!*&5k8&5k9&5q0&5!<&5j6&5j7&5j8&5y8&5y7&5j&5c&5Y&5!+!A&7!?&7v&7k&7v6&7v7&7!:&7k1&7k2&7k3&7k4&7k5&7k6&7!*&7k8&7k9&7!>&7j6&7j7&7j8&7y8&7y7&7j&7c&7Y&7!J6&9v7&9!:&9k1&!O&9k8&9k9&9!>&9j6&9j7&9j8&9y8&9y7&9j&9c&9Y&9!+$1!;$1v4$1v5$1y0$1v$1k$1v6$1v7$1!:$1k1$1k2$1k3$1k4$1k5$1k6$1!*$1k8$1k9$1q0$1!<$1j6$1j7$1j8$1y8$1y7$1j$1c$1Y$1!+!A$3!?$3v$3k$3v6$3v7$3!:$3k1$3k2$3k3$3k4$3k5$3k6$3!*$3k8$3k9$3!>$3j6$3j7$3j8$3y8$3y7$3j$3c$3Y$3!+!A$5!?&4v&6k&8v6$5v7$5!:$5k1$5k2$5k3$5k4$5k5$5k6$5!*$5k8$5k9$5!>$5j6$5j7$5j8$5y8$5y7$5j$5c$5Y$5!+!A$7!?&4v&6k&8v6$7v7$7!:$7k1$7k2$7k3$7k4$7k5$7k6$7!*$7k8$7k9$7!>$7j6$7j7$7j8$7y8$7y7$7j$7c$7Y$7!+!C0v7$9!:$9k1$!O$9!F$9!>$9j6$9j7$9j8;4y8$9y7$9j$9c$9Y$9!P01k1w01!G@0!*w01!R8w01y7w01jw01cw01Yw01!P03k1w03!G@0!*w03!R8w03y7w03jw03cw03Yw03!P05k1w0!Mw05!R8w05y7w05jw05cw05Yw05!P07k1w0!Nw07!R8w07y7w07jw07cw07Yw07!P09k1w0!Ow09!R8w09y7w09jw09cw09Yw09!J!@1v!#1!:w11k1w11!G@0!*w11k8w11k9w11!>w11j!@1j!#1j8w11y8w11y!#1jw11cw11Yw11!J!@3v!#3!:w13k1w13!G@0!*w13k8w13k9w13!>w13j!@3j!#3j8w13y8w13y!#3jw13cw13Yw13!J!@5v!#5!:w15k1w1!Mw15k8w15k9w15!>w15j!@5j!#5j8w15y8w15y!#5jw15cw15Yw15!J!@7v!#7!:w17k1w1!Nw17k8w17k9w17!>w17j!@7j!#7j8w17y8w17y!#7jw17cw17Yw17!J!@9v!#9!:w19k1w1!Ow19k8w19k9w19!>w19j!@9j!#9j8w19y8w19y!#9jw19cw19Yw19!+!E!:M1k1M1!G@0!*M1!R8M1y7M1jM1cM1YM1!+!C0v7M9!:M9k1M!OM9!FM9!>M9j6M9j7M9j8;4y8M9y7M9jM9cM9YM9!+!E!:H1k1H1!G@0!*H1!R8H1y7H1jH1cH1YH1!+!AH3!?H3vH3kH3v6H3v7H3!:H3k1H3k2H3k3H3k4H3k5H3k6H3!*H3k8H3k9H3!>H3j6H3j7H3j8H3y8H3y7H3jH3cH3YH3!+!E!:H5k1H!MH5!R8H5y7H5jH5cH5YH5!+!E!:H9k1H!OH9!R8H9y7H9jH9cH9YH9!+K1!;K1v4K1v5K1y0K1vK1kK1v6K1v7K1!:K1k1K1k2K1k3K1k4K1k5K1k6K1!*K1k8K1k9K1q0K1!<K1j6K1j7K1j8K1y8K1y7K1jK1cK1YK1!+K3!;K3v4K3v5K3y0K3vK3kK3v6K3v7K3!:K3k1K3k2K3k3K3k4K3k5K3k6K3!*K3k8K3k9K3q0K3!<K3j6K3j7K3j8K3y8K3y7K3jK3cK3YK3!+K5!;K5v4K5v5K5y0K5vK5kK5v6K5v7K5!:K5k1K5k2K5k3K5k4K5k5K5k6K5!*K5k8K5k9K5q0K5!<K5j6K5j7K5j8K5y8K5y7K5jK5cK5YK5!+K7!;K7v4K7v5K7y0K7vK7kK7v6K7v7K7!:K7k1K7k2K7k3K7k4K7k5K7k6K7!*K7k8K7k9K7q0K7!<K7j6K7j7K7j8K7y8K7y7K7jK7cK7YK7!+K9!;K9v4K9v5K9y0K9vK9kK9v6K9v7K9!:K9k1K9k2K9k3K9k4K9k5K9k6K9!*K9k8K9k9K9q0K9!<K9j6K9j7K9j8K9y8K9y7K9jK9cK9YK9!+;1!;;1v4;1v5;1y0;1v;1k;1v6;1v7;1!:;1k1;1k2;1k3;1k4;1k5;1k6;1!*;1k8;1k9;1q0;1!<;1j6;1j7;1j8;1y8;1y7;1j;1c;1Y;1!+;3!;;3v4;3v5;3y0;3v;3k;3v6;3v7;3!:;3k1;3k2;3k3;3k4;3k5;3k6;3!*;3k8;3k9;3q0;3!<;3j6;3j7;3j8;3y8;3y7;3j;3c;3Y;3!+;5!;;5v4;5v5;5y0;5v;5k;5v6;5v7;5!:;5k1;5k2;5k3;5k4;5k5;5k6;5!*;5k8;5k9;5q0;5!<;5j6;5j7;5j8;5y8;5y7;5j;5c;5Y;5!+;7!;;7v4;7v5;7y0;7v;7k;7v6;7v7;7!:;7k1;7k2;7k3;7k4;7k5;7k6;7!*;7k8;7k9;7q0;7!<;7j6;7j7;7j8;7y8;7y7;7j;7c;7Y;7!+;9!;;9v4;9v5;9y0;9v;9k;9v6;9v7;9!:;9k1;9k2;9k3;9k4;9k5;9k6;9!*;9k8;9k9;9q0;9!<;9j6;9j7;9j8;9y8;9y7;9j;9c;9Y;9!+!T!;!Tv4!Tv5!Ty0!Tv!Tk!Tv6!Tv7!T!:!Tk1!Tk2!Tk3!Tk4!Tk5!Tk6!T!*!Tk8!Tk9!Tq0!T!<!Tj6!Tj7!Tj8!Ty8!Ty7!Tj!Tc!TY!T!+!U!;!Uv4!Uv5!Uy0!Uv!Uk!Uv6!Uv7!U!:!Uk1!Uk2!Uk3!Uk4!Uk5!Uk6!U!*!Uk8!Uk9!Uq0!U!<!Uj6!Uj7!Uj8!Uy8!Uy7!Uj!Uc!UY!U!P65k1w6!Mw65!R8w65y7w65jw65cw65Yw65!P67k1w6!Nw67!R8w67y7w67jw67cw67Yw67!P69k1w6!Ow69!R8w69y7w69jw69cw69Yw69!+!C0v7w71!:w71k1w71!G@0!*w71!Fw71!>w71j6w71j7w71j8;4y8w71y7w71jw71cw71Yw71JM3c0M3y9M3v0M3v1M3v2M3v3M3v4M3v5M3y0M3vM3kM3v6M3v7M3v8M3v9M3k0M3k1M3k2M3k3M3k4M3k5M3k6M3k7M3qM3k8M3k9M3q0M3q1M3q2M3q3M3q4M3q5M3q6M3q7M3q8M3q9M3j0M3j1M3j2M3j3M3j4M3j5M3j6M3j7M3j8M3y8M3y7M3jM3cM3YM3J`9c0`9y9`9v0`9v1`9v2`9v3`9v4`9v5`9y0`9v`9k`9v6`9v7`9v8`9v9`9k0`9k1`9k2`9k3`9k4`9k5`9k6`9k7`9q`9k8`9k9`9q0`9q1`9q2`9q3`9q4`9q5`9q6`9q7`9q8`9q9`9j0`9j1`9j2`9j3`9j4`9j5`9j6`9j7`9j8`9y8`9y7`9j`9c`9Y`9JX3c0X3y9X3v0X3v1X3v2X3v3X3v4X3v5X3y0X3vX3kX3v6X3v7X3v8X3v9X3k0X3k1X3k2X3k3X3k4X3k5X3k6X3k7X3qX3k8X3k9X3q0X3q1X3q2X3q3X3q4X3q5X3q6X3q7X3q8X3q9X3j0X3j1X3j2X3j3X3j4X3j5X3j6X3j7X3j8X3y8X3y7X3jX3cX3YX3},{"51`c2`j9`c0`y9`v0`v1`v2`v3`v4`v5`y0`v`k`v6`v7`v8`v9`k0`k1`k2`k3`k4`k5`k6`k7`q`k8`k9`q0`q1`q2`q3`q4`q5`q6`q7`q8`q9`j0`j1`j2`j3`j4`j5`j6`j7`j8`y8`y7`j`c`Y`},{"4$c$Y$},{"!$!%51Vc2Vj9Vc0Vy9Vv0Vv1Vv2Vv3Vv4Vv5Vy0VvVkVv6Vv7Vv8Vv9Vk0Vk1Vk2Vk3Vk4Vk5Vk6Vk7VqVk8Vk9Vq0Vq1Vq2Vq3Vq4Vq5Vq6Vq7Vq8Vq9Vj0Vj1Vj2Vj3Vj4Vj5Vj6Vj7Vj8Vy8Vy7VjVcVYV},{"51Wc2Wj9Wc0Wy9Wv0Wv1Wv2Wv3Wv4Wv5Wy0WvWkWv6Wv7Wv8Wv9Wk0Wk1Wk2Wk3Wk4Wk5Wk6Wk7WqWk8Wk9Wq0Wq1Wq2Wq3Wq4Wq5Wq6Wq7Wq8Wq9Wj0Wj1Wj2Wj3Wj4Wj5Wj6Wj7Wj8Wy8Wy7WjWcWYW},{"4;c;Y;y7Z98},{"4HcHYH}]ygoto!(0!(11wkZ!&y8!/&0!&y9!/&1!&v0!/&2!&v1!/&3!&v2!/&4!&v3!/&5!&v4!/&6!&v5!/&7!&v6!/&8!&v7!/&9!&v8!/$0!&v9!/$1!&k0!/$2!&k5!/$3!&k6!(12$4y0$5v$6}q2!(13$7v1$8kZ!&q3!(13$9v1$8kZ!&q4!(13w00v1$8kZ!&q5!/w01!&q6!/w02!&q7!/w03!&q8!/w04!&q9!/w05!&j0!/w06!&j1!/w07!&j2!/w08!&j3!/w09!&j4!/w10!&j5!/w11!&j6!/w12!&j7!/w13!&j8!/w14!&j9!/w15!&c0!/w16!&c1!/w17!&c2!/w18!&c3!/w19!&c4!/M0!&c5!/M1!&c6!/M2!&c7!/M3!&c8!/M4!&c9!/M5!&Y0!/M6!&Y1!/M7!&Y2!/M8!&Y3!/M9!&Y4!/H0!&Y5!/H1!&Y6!/H2!&Y7!/H3!&Y8!/H4!&Y9!/H5!&y70!/H6!&y71!/H7!&y72!/H8!&y73!/H9!&y74!/K0!&y75!/K1!&y76!/K2!&y77!/K3!&y95!(12K5y0$5v$6}y96!(12K6y0$5v$6}y98!(14K8}v49!(11;2kZ!&v52!(14;3}}}'.replaceAll('!U','w63').replaceAll('!T','w61').replaceAll('!S','X1j').replaceAll('!R','!Hj8;4y').replaceAll('!P','!+!E!:w').replaceAll('!O','9!G@0!*').replaceAll('!N','7!G@0!*').replaceAll('!M','5!G@0!*').replaceAll('!L','X1q').replaceAll('!K','X1k').replaceAll('!D','X1v').replaceAll('!J','!+!D&8v').replaceAll('!.','!I.%!I.').replaceAll('!I','!.%!.%!').replaceAll('!H','!I0j7;2').replaceAll('!I','!HK8j6;').replaceAll('!H','!Fw16!>').replaceAll('!F','k8w14k9').replaceAll('!G','!Fw08k!').replaceAll('!F','!Gw06k5').replaceAll('!G','!Fw04k4').replaceAll('!F','k2w02k3').replaceAll('!E','!C0v7$2').replaceAll('!C','!D&8v6$').replaceAll('!D','!C4v&6k').replaceAll('!C','!A&0!?&').replaceAll('!B',',1,1,1,').replaceAll('!=','U3U3U3U').replaceAll('!A','!=4').replaceAll('!@','6w1').replaceAll('!?','v5&2y0').replaceAll('!>','q0w18!<').replaceAll('!=','W0!;W8v').replaceAll('!-',',5,5,5,').replaceAll('!<','!-5').replaceAll('!/','!(2').replaceAll('!+','!/y9').replaceAll('!;','!+v3').replaceAll('!*','k!#2q').replaceAll('!:','!*6k0').replaceAll('!/','J;6c0;8').replaceAll('!.','!$!%!$!').replaceAll('!-','!.j4K6j').replaceAll('!.','!-2j3K4').replaceAll('!-','!.K0j2K').replaceAll('!.','!-0H8j1').replaceAll('!-','!.q9H6j').replaceAll('!.','!-2q8H4').replaceAll('!-','!.H0q7H').replaceAll('!.','!-5M8q6').replaceAll('!-','!.q4M6q').replaceAll('!.','!-2q3M4').replaceAll('!-','q1M0q2M').replaceAll('!*','v8$4v9$').replaceAll('!+','!*4v2W6').replaceAll('!*','v0W2v1W').replaceAll('!)','2,2,2,2').replaceAll('!(','z{"').replaceAll('!#','7w1').replaceAll('!&','!#v`1}').replaceAll('!%','Q8},{"').replaceAll('!#','!%9v0`0').replaceAll('!%','!#Z6y0Z').replaceAll('!#','!%8Z4y9').replaceAll('!%','!#Qy7Wy').replaceAll('!#','q`jXcVY').replaceAll('!$','!#8Q6c2').replaceAll('!#','!$c1Q4Y').replaceAll('!$','!#4Y7V6').replaceAll('!#','!$V0Y6V').replaceAll('!$','!#Y5X6q').replaceAll('!#','!$2Y4X4').replaceAll('!$','!#X0Y3X').replaceAll('!#','!$1`8Y2').replaceAll('!$','!#Y0`6Y').replaceAll('!#','!$2c9`4').replaceAll('!$','!#`0c8`').replaceAll('!#','!$6Z8c7').replaceAll('!$','!#c5Z6c').replaceAll('!#','!$2c4Z4').replaceAll('!$','!#Z0c3Z').replaceAll('!#','0w6vw8k').replaceAll('$','z9').replaceAll('&','z8').replaceAll(';','w5').replaceAll('H','w3').replaceAll('J','},{"49').replaceAll('K','w4').replaceAll('M','w2').replaceAll('Q','z6').replaceAll('U',',3,3,3,').replaceAll('V','z5').replaceAll('W','z7').replaceAll('X','z4').replaceAll('Y','y6').replaceAll('Z','z2').replaceAll('`','z3').replaceAll('c','y5').replaceAll('j','y4').replaceAll('k','y2').replaceAll('q','y3').replaceAll('v','y1').replaceAll('w','z1').replaceAll('y',',"').replaceAll('z','":'));
// Then the reduce functions for each rule.
const reducemap = [
		[1,(term0) => term0],
		[3,(term2, term1, term0) => new MPList(term1)],
		[3,(term2, term1, term0) => new MPSet(term1)],
		[3,(term2, term1, term0) => new MPGroup(term1)],
		[2,(term1, term0) => [term0].concat(term1)],
		[0,() => []],
		[3,(term2, term1, term0) => [term1].concat(term2)],
		[0,5],
		[1,0],
		[1,(term0) => new MPBoolean(term0.v)],
		[1,(term0) => new MPInteger(term0.v)],
		[1,(term0) => new MPFloat(term0.v)],
		[1,0],
		[1,(term0) => new MPString(term0.v)],
		[1,(term0) => new MPIdentifier(term0.v)],
		[1,0],
		[1,0],
		[1,0],
		[2,(term1, term0) => {
	let term = term0;
	while (term1.length > 0) {
		let item = term1.shift();
		if (item instanceof MPGroup) {
			term = new MPFunctionCall(term, item.items);
		} else {
			term = new MPIndexing(term, [item]);
		}
	}
	return term;}],
		[2,4],
		[0,5],
		[2,4],
		[1,0],
		[1,0],
		[1,0],
		[1,0],
		[1,0],
		[2,(term1, term0) => new MPPrefixOp(term0.v, term1)],
		[2,27],
		[2,27],
		[2,27],
		[2,27],
		[2,27],
		[2,27],
		[2,27],
		[2,27],
		[2,27],
		[2,(term1, term0) => new MPPostfixOp(term0, term1.v)],
		[2,37],
		[3,(term2, term1, term0) => new MPOperation(term0, term1.v, term2)],
		[3,39],
		[3,39],
		[3,39],
		[3,39],
		[3,39],
		[3,39],
		[3,39],
		[3,39],
		[3,39],
		[3,39],
		[3,39],
		[3,39],
		[3,39],
		[3,39],
		[3,39],
		[3,39],
		[3,39],
		[3,39],
		[3,39],
		[3,39],
		[3,39],
		[3,(term2, term1, term0) => new MPFunctionCall(new MP_Identifier('abs'),[term1])],
		[2,27],
		[2,27],
		[3,39],
		[3,39],
		[3,39],
		[3,39],
		[2,27],
		[3,39],
		[3,(term2, term1, term0) => {
	let [op1,op2] = term1.v.split(',');
	let term = new MPOperation(term0, op1, new MPPrefixOp(op2, term2));
	return term;}],
		[3,70],
		[3,70],
		[3,70],
		[3,70],
		[3,70],
		[3,70],
		[3,70],
		[3,70],
		[3,70],
		[3,70],
		[3,70],
		[3,39],
		[3,39],
		[3,39],
		[3,39]
	];

function get_action(state, terminal) {
	// TODO: flip the terminals after JSON-parsing, so this indexOf becomes unnecessary.
	const t_id = tables.terminals.indexOf(terminal);
	if (tables.table[state] !== undefined && tables.table[state][t_id] !== undefined) {
		const encoded = tables.table[state][t_id];
		if (encoded % 2 == 0) {
			return [encoded / 2]; // A shift
		} else {
			const rule = (encoded - 1) / 2;
			const nt_id = tables.rules_to_nonterminals[rule];
			return [rule, tables.nonterminals[nt_id], nt_id];
		}
	}
	return null;
}

function get_goto(state, nt_id) {
	if (tables.goto[state] !== undefined && tables.goto[state][nt_id] !== undefined) {
		return tables.goto[state][nt_id];
	}
	return null;
}

// Then the parser
class MPParser {
	constructor(insert) {
		this.insert = insert;
	}

	parse(lexer) {
		let previous = null;
		let token = null;
		let terminal = null;
		let stack = [0];
		let shifted = true;

		// For the KW -> ID remap we need some fallback state.
		let kwreverttoken = null;
		let kwrevertstack = null;
		let kwrevertreset = 0;

		while (true) {
			if (shifted) {
				previous = token;
				token = lexer.get();
				while (token !== null && (token.t === TOKENTYPES.COM || token.t === TOKENTYPES.WS)) {
					token = lexer.get();
				}

				if (token === null) {
					terminal = 'END OF FILE';
				} else {
					switch (token.t) {
						case TOKENTYPES.SYM:
							if (token.v === '^' || token.v === '^^' || token.v === '**') {
                                // Some operator precendence cases are difficult.
								let next = lexer.get();
								while (next !== null && (next.t === TOKENTYPES.COM || next.t === TOKENTYPES.WS)) {
									next = lexer.get();
								}
								if (next.t === TOKENTYPES.SYM && (next.v === '-' || next.v === '+' || next.v === '+-' || next.v === '#pm#')) {
									terminal = ' ' + token.v + next.v;
									token.v += ',' + next.v;
									break;
								} else {
									lexer.return_token(next);
								}
							}
						case TOKENTYPES.KW:
							terminal = token.v;
							break;
						case TOKENTYPES.ID:
							terminal = 'ID';
							break;
						case TOKENTYPES.INT:
							terminal = 'INT';
							break;
						case TOKENTYPES.FLT:
							terminal = 'FLOAT';
							break;
						case TOKENTYPES.BOOL:
							terminal = 'BOOL';
							break;
						case TOKENTYPES.STR:
							terminal = 'STRING';
							break;
						case TOKENTYPES.LS:
							terminal = 'LIST SEP';
							break;
						case TOKENTYPES.ET:
							terminal = 'END TOKEN';
							break;
						case TOKENTYPES.LI:
							terminal = 'LISP ID';
							break;
						case TOKENTYPES.ERR:
							throw SyntaxError('Lexer error: ' + token.v);
							break;
					}
				}
				shifted = false;
			}
			let currentstate = stack[stack.length - 1];

			let action = get_action(currentstate, terminal);

			if (action !== null && token !== null && token.t === TOKENTYPES.KW && get_action(currentstate, 'ID') !== null) {
				kwrevertstack = structuredClone(stack);
				kwreverttoken = structuredClone(token);
				kwrevertreset = 3;
			}
			if (kwrevertreset === 1) {
				kwrevertstack = null;
				kwreverttoken = null;
			}

			if (action === null) {
				if (this.insert === '*' && get_action(currentstate, '*') !== null) {
					lexer.return_token(token);
					token = new MPToken(TOKENTYPES.SYM, '*');
					terminal = '*';
					action = get_action(currentstate, terminal);
				}
				if (this.insert === ';' && get_action(currentstate, 'END TOKEN') !== null) {
					lexer.return_token(token);
					token = new MPToken(TOKENTYPES.ET, ';');
					terminal = 'END TOKEN';
					action = get_action(currentstate, terminal);
				}

			}

			if (action === null && kwreverttoken !== null) {
				lexer.return_token(token);
				token = kwreverttoken;
				token.t = TOKENTYPES.ID;
				terminal = 'ID';
				stack = kwrevertstack;
				currentstate = stack[stack.length - 1];
				kwreverttoken = null;
				action = get_action(currentstate, terminal);
			}
			kwrevertreset--;

			if (action === null) {
				throw SyntaxError('No action for "' + token.v + '"');
			}

			if (action.length === 1) {
				stack.push(token);
				stack.push(action[0]);
				shifted = true;
			} else {
				const [rule, nt_name, nt_id] = action;
				let [numargs, logic] = reducemap[rule];
				if (Number.isInteger(logic)) {
					// No need to store similar logics, just point to the
					// rule that stores the thing.
					logic = reducemap[logic][1];
				}
				let args = [];
				while (numargs > 0) {
					numargs--;
					stack.pop(); // No need for the state.
					args.push(stack.pop());
				}
				const reduced = logic.apply(null, args);

				if (nt_name === 'Start') {
					reduced.parent = null;
					return reduced;
				}
				const topstate = stack[stack.length - 1];
				stack.push(reduced);
				const next = get_goto(topstate, nt_id);
				if (next === null) {
					throw SyntaxError("GOTO table issue.");
				} else {
					stack.push(next);
				}
			}
		}
	}
}

// Shorthand for parsing, allows selection of insert and whether `+-` is an op.
// e.g. `parse_decimal_dot("2x+-1","*",true)`
function parse_decimal_dot(src, insert, pm) {
	let opt = {};
	if (pm !== undefined) {
		opt.pm = pm;
	}
	let lexer = new MPLexerBase(src, opt);
	let parser = new MPParser(insert);
	return parser.parse(lexer);
}

function parse_decimal_comma(src, insert, pm) {
	let opt = {};
	if (pm !== undefined) {
		opt.pm = pm;
	}
	let lexer = new MPCommaLexer(src, opt);
	let parser = new MPParser(insert);
	return parser.parse(lexer);
}

export {
	MPNode,
	MPAtom,
	MPInteger,
	MPIdentifier,
	MPFloat,
	MPString,
	MPBoolean,
	MPFunctionCall,
	MPOperation,
	MPPrefixOp,
	MPPostfixOp,
	MPGroup,
	MPList,
	MPSet,
	MPIndexing,
	MPIf,
	MPLoop,
	MPLoopBit,
	MPEvaluationFlag,
	MPStatement,
	MPPrefixeq,
	MPLet,
	MPRoot,
	MPToken,
	MPLexerBase,
	MPCommaLexer,
	MPParser,
	parse_decimal_dot,
	parse_decimal_comma
};