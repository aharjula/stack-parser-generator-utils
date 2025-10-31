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
				opt['list separator'] = ';';
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
				opt['list separator'] = ';';
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
		return '"' + this.value.replace("\\", "\\\\").replace('"', "\\\"") + '"';
	}

	translate(opt) {
		// We will use 'strings' to match JessieCode and JS at the same time.
		return "'" + this.value.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n").replace("\t", "\\t") + "'";
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
const tables = JSON.parse('{"nonterminalsz["Group"yList"yOpSuffix"yOpPrefix"yCallOrIndex?"yAbs"yTopOp"yIndexableOrCallable"ySet"yTerm"yOpInfix"yStatement"yStatementNullList"yListsOrGroups"yTermList"yStart"]yterminalsz["-"y+-"y+"y|"y]"y}"y)"yLIST SEP"y."y ^+",z:="y **#pm#"y **-"yimplies"yxor"y **+-"y%and"y ^^#pm#"ynor"y^"ynounmul"y<"y*"y ^+-"ynand"y!"y@"y~"yxnor",z="y#"yor"y="y>"y **+"y>="y**"y ^^-"y<="y^^",z:"yand"y ^-"y ^^+",z"y/"y ^^+-"y!!"y ^#pm#"y%or"yEND OF FILE"y["y("y\'\'"ySTRING"y?? "y{"y\'"y? "ynounnot"ynot"yINT"ynounnot "y?"ynot "yFLOAT"yID"y%not"yBOOL"]yrules_to_nonterminalsz[15,1,8,0,12,12,14,14,11,9,9,9,9,7,7,7,7,7,4,13,13,13,6,6,6,6,6!#!#!#,3,2,2,!#H#H#H+!+5,3,3,!+!+3,!#H#H+!+10]yrule_lengthsz[1!#,2,0,3,0,1,1,1,1,1,1,1,1,1,1,2,2,0,2,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2!#!#!#!#!#!#!#,3,3,2,2!#,3,2!#!#!#!#!#,3,3]ytablez[{"5!D#{B%(F#c>!]$)/!l!mb!aqW6#%.$VL!*!|r$26Y7y0Y7j6Y7ZY7j3Y7k7Y7q7Y7kY7j1Y7cY7j0Y7j9Y7v2Y7y8Y7v1Y7y7Y7q2Y7k8Y7qY7j8Y7k0Y7k6Y7k2Y7k9Y7y9Y7v3Y7v0Y7v8Y7k1Y7k4Y7j2Y7j4Y7v4Y7j7Y7q9Y7v5Y7q3Y7v6Y7q5Y7c0Y7q4Y7q8Y7q1Y7jY7k3Y7vY7v9Y7k5Y7q0Y7j5Y7v7Y7!$9`5j2`5k`5k3`5k9`5j7`5y0`5q3`5c1`5k6`5c0`5j0`5v5`5q0`5j4`5v4`5!T5k4`5q2`5q5`5j8`5v6`5v2`5q7`5y7`5v9`5q6`5v3`5y8`5j6`5j3`5q1`5q9`5q8`5k7`5v1`5Z`5q`5k8`5j1`5k0`5k5`5c2`5v7`5j`5k1`5j9`5v8`5j5`5c`5v`5q4`5k2`5!$50w!$53Y0!r=!B!m]!i#%e!L!b$)a!d!}|_!l!>!F#o*!$6!s]#ob$)/!l#{>!F#%*!aqW6!i#crB$VL%(m$5!-!>!m!}/!|Y#oB!l!ra$&_!]!F#%*!=qW6#cL!$46X1j3X1cX1j4X1y9X1ZX1j2X1k4X1q1X1q5X1v3X1j8X1j9X1j0X1j1X1q2X1v5X1kX1qX1v0X1v8X1j7X1c0X1k2X1q9X1y7X1vX1q8X1q4X1v7X1j5X1jX1q6X1v9X1k1X1k5X1v4X1v1X1y8X1k3X1k9X1!C1k7X1q0X1q7X1q3X1k6X1v2X1k8X1k0X1v6X1!$62Y2!/!lZw1jw1!b#o=!acw1#%Y#c_!>!dL#{B!|ri!F!m]!$5!P$&b!*!rB#%!}L#oa%(l!|_$)]!>!d/!F!m$35X9v7X9j3X9kX9v5X9v9X9j9X9y9X9j0X9vX9y7X9j1X9v1X9y8X9k4X9v3X9k8X9q4X9k6X9q9X9j6X9v8X9!:9j8X9k9X9c0X9j5X9q5X9ZX9q7X9cX9jX9j2X9j4X9k3X9q8X9v0X9qX9!<9v4X9q0X9v6X9!C9k7X9k1X9k0X9q2X9q1X9v2X9j7X9k2X9q6X9q3X9!$53Y0!|]cw1Zw1#o>!m=!B$)L#%i!*!aqW6!ljw1#{b$VrF#c$67V!FqW6Z!X!|LZw1!_#{B#oma!b$&]!Y#c/jw1!>cw1%(*!l!$28W1v2W1v6W1j8W1v9W1qW1k5W1j0W1k6W1k2W1q3W1q6W1k1W1k3W1v4W1q0W1j2W1ZW1j7W1j1W1v5W1kW1y7W1v8W1j5W1jW1v3W1q7W1y8W1j3W1y0W1vW1j6W1v7W1k7W1cW1q9W1j9W1q1W1k0W1k8W1v1W1k4W1q4W1j4W1v0W1c0W1q5W1y9W1k9W1q2W1!$43Y9qY9v3Y9q0Y9q7Y9j0Y9k3Y9v7Y9j2Y9k4Y9kY9k1Y9v8Y9q6Y9j9Y9y7Y9q4Y9vY9v0Y9v1Y9v9Y9j4Y9k7Y9k6Y9j8Y9j5Y9q9Y9y8Y9q1Y9v2Y9y0Y9q8Y9k0Y9ZY9k9Y9k8Y9j1Y9q2Y9j7Y9k2Y9k5Y9cY9jY9v6Y9y9Y9q3Y9q5Y9v4Y9v5Y9j6Y9c0Y9!$6!um=#oL$&]$Va!rF!B!|/#{*#c>!l$)b!d$5!P!dL!/!]#{|>!_#%r*!B!l!=$&b#oma$)F!$43$(4$H3Y1!Bv8$(2$+2Y1c$(8$+7$H1#M6$($H2$H0#M5$+1$+9$(0#M7$H7Y1y9$+5Y1!>Z$+6Y1y0$H8Y1y7$(7$(6$+0#M$H6#M0#M4#M2#M8$+4$(1Y1y8Y1c0$H4$(5#M1$(3$+3$H$+#M9$H5$(9$H9Y1!$24`1k3`1j0`1j9`1k`1v5`1!xy9`1q1`1v8`1j7`1j8`1q3`1q`1c2`1c1`1v6`1k0`1q9`1y7`1q8`1v`1j1`1q7`1k9`1k1`1j`1j2`1k5`1q0`1k4`1j6`1Z`1v9`1q6`1c0`1v4`1k6`1j4`1j3`1k8`1!T1q2`1j5`1v3`1k7`1v7`1k2`1y8`1q5`1y0`1v2`1v1`1!$11w9jw9vw9j9w9j6w9c0w9k8w9q6w9k9w9v4w9j7w9y8w9k3w9j2w9j5w9y0w9j4w9q1w9kw9k0w9q0w9y9w9q5w9k1w9v7w9k2w9qw9v9w9q2w9q4w9q8w9j8w9q9w9j1w9q7w9v2w9y7w9k4w9k6w9cw9Zw9j0w9j3w9v6w9v3w9v0w9k5w9v5w9v8w9k7w9q3w9!$2W6!mY!F#crb!*!|B!>!L$&l!]%(a!_#{.!/#%$67V!B!a$&l%(>!LqW6#%e!*!F#ob!|_$)]!m/#{$2#(!RjH$y!h#I#k#u#s!p#-![#X#j#dk2;6$@$J#Sc0H#r#`#KZHq9U6!G!nv0w16!t%&%)%-#<!?!@#ZcH!Q#q!O!f$:!Ej0$4#Dj4M8#W#P!~!N!$66X0!b!>#c*!F!l!ri!B!/#{L!a!=#%d_!]$)|m$64K!]#%a$&>!F!B$)m/!L!|e!b%(*#{rl!d.!$21`3y0`3j3`3j0`3k2`3v3`3k6`3q8`3v1`3c`3v9`3v`3k7`3j9`3Z`3j`3v4`3k`3q9`3y7`3k1`3q5`3j2`3j5`3v8`3q6`3q2`3y8`3y9`3k4`3j4`3j7`3j8`3q7`3q0`3j6`3v7`3k5`3j1`3v2`3k3`3q3`3c1`3q4`3!T3k9`3k0`3c0`3v6`3k8`3v5`3c2`3q`3!$63$!d/!L!l!b!=#c|_#{>#%.!B!*!F$)mi!ra!$20X7jX7j5X7k9X7q6X7v9X7k7X7!:7j7X7q9X7k0X7q4X7j1X7v3X7j4X7c0X7v8X7j9X7j8X7v6X7y7X7k1X7k2X7v4X7k8X7vX7k5X7q7X7v5X7!<7j3X7y9X7!C7v0X7k3X7j2X7j6X7q8X7ZX7q5X7q1X7qX7v1X7v7X7j0X7k6X7k4X7cX7q3X7q2X7y8X7kX7v2X7!$0Q6!=#oL!|F!ml!a!b#%_!B!*!d/!]!re!Y$&>!$49X3j6X3!C3qX3k7X3v3X3v1X3j8X3jX3v8X3q2X3j2X3k9X3q6X3q4X3ZX3q5X3j0X3k0X3j1X3k2X3y9X3q1X3v7X3k8X3k3X3v0X3k4X3y7X3v5X3q9X3c0X3q7X3v2X3j4X3v9X3kX3q3X3y8X3v6X3k6X3j3X3vX3q0X3cX3q8X3k5X3j5X3v4X3k1X3j7X3!$46X5j9X5k1X5c0X5k!)v1X5q7X5q1X5j1X5v9X5v5X5q!)j!)k5X5k3X5j2X5v7X5j3X5kX5q0X5k2X5y9X5qX5q2X5v4X5v!)!C5q3X5q6X5v3X5y7X5j5X5q4X5jX5vX5cX5j0X5q5X5v0X5q9X5k9X5ZX5#$j4X5k4X5k7X5k0X5j7X5v6X5k6X5v2X5!$25W3v1W3jW3v9W3v7W3q7W3qW3j9W3v5W3j8W3j5W3v0W3k6W3y0W3k1W3v4W3ZW3k3W3q9W3q4W3j2W3q3W3cW3k4W3v6W3k8W3v8W3j3W3k5W3j6W3y8W3vW3k9W3c0W3j1W3q8W3y9W3k2W3v3W3v2W3k7W3j4W3j0W3q0W3q1W3q6W3y7W3j7W3q2W3kW3k0W3!$1Y6!ra!L#%Y!d*#cb#o]$&/$V|m!}=!>!B!F!$6!sF$)l$&m/$Vr*#%>!L!da!b!]#{B#c=#o$27Y5k9Y5v5Y5y8Y5j8Y5q4Y5v2Y5k1Y5j7Y5k5Y5k7Y5j3Y5jY5j0Y5v3Y5q3Y5v1Y5v0Y5vY5j9Y5k2Y5j6Y5j4Y5q8Y5v7Y5k6Y5j5Y5q5Y5q9Y5c0Y5k8Y5kY5q6Y5k0Y5v9Y5cY5v8Y5y0Y5y9Y5ZY5y7Y5j1Y5v6Y5qY5k3Y5v4Y5q0Y5j2Y5q2Y5k4Y5q1Y5!$34Q3q1Q3q6Q3v4Q3k1Q3vQ3v2Q3q8Q3y8Q3q4Q3v6Q3q5Q3k8Q3y9Q3k2Q3j7Q3k3Q3v3Q3!A3v9Q3j0Q3k9Q3qQ3cQ3v1Q3v8Q3q2Q3j2Q3j6Q3v0Q3k6Q3y7Q3k0Q3j5Q3q9Q3j1Q3v5Q3q3Q3q0Q3q7Q3k5Q3j3Q3kQ3jQ3ZQ3k7Q3j4Q3v7Q3j9Q3c0Q3j8Q3!$19Q7v3Q7k0Q7k2Q7j9Q7qQ7j5Q7k9Q7jQ7v6Q7y7Q7v7Q7v8Q7!A7c0Q7j7Q7kQ7q6Q7v4Q7j3Q7q2Q7k7Q7j6Q7q9Q7j8Q7q4Q7k4Q7ZQ7j2Q7vQ7cQ7k8Q7y9Q7q5Q7y8Q7q0Q7v1Q7k3Q7v5Q7v2Q7q7Q7j4Q7k6Q7k1Q7j1Q7q1Q7v0Q7k5Q7q3Q7j0Q7q8Q7!$34V7j4V7$^7#&7k6V7k8V7k0V7v1V7cV7kV7j0V7v2V7j7V7q6V7ZV7jV7k3V7q0V7v8V7v6V7vV7k2V7k7V7k9V7q9V7q4V7j5V7j1V7y8V7v9V7v0V7qV7q8V7q3V7c0V7v7V7q5V7v3V7q2V7y9V7j2V7y0V7k5V7v5V7j3V7k1V7j6V7y7V7j8V7v4V7j9V7!$7X04cJjJZJ!$5X06!$2&3q5&3v0&3k8&3j6&3v&3c&3y9&3k6&3v2&3k0&3q3&3k5&3j&3q9&3q8&3k3&3v8&3k7&3v6&3Z&3k9&3k4&3y7&3j4&3y0&3j0&3k1&3j8&3v9&3q0&3v7&3j9&3q7&3j3&3j2&3q1&3k&3v5&3q2&3j7&3q6&3v4&3q4&3y8&3j5&3v1&3c0&3v3&3k2&3j1&3!$4X08!$6X10!$48Q9kQ9c0Q9v1Q9k8Q9k0Q9v0Q9v6Q9q7Q9!A9q9Q9v8Q9cQ9q2Q9v9Q9k5Q9j4Q9qQ9k4Q9v3Q9v7Q9j7Q9q3Q9v2Q9jQ9k7Q9v4Q9j3Q9y8Q9j2Q9j6Q9q4Q9k1Q9ZQ9j5Q9j1Q9vQ9q5Q9q8Q9v5Q9k3Q9q1Q9j9Q9k9Q9y9Q9q6Q9k2Q9y7Q9q0Q9k6Q9j0Q9!$30&1j7&1Z&1k1&1q0&1q&1c&1y9&1v8&1v5&1c0&1k8&1j8&1k6&1y0&1q2&1y8&1q3&1q6&1v&1v7&1k5&1v0&1v6&1v3&1j4&1j5&1j9&1v2&1q8&1j1&1v1&1j&1j2&1q7&1q9&1k7&1j0&1v4&1k3&1q1&1y7&1j3&1k2&1k4&1v9&1q4&1q5&1k&1j6&1k9&1!$19`7k5`7j`7j3`7c`7q5`7k`7v2`7q4`7y8`7j8`7c0`7q1`7k8`7y9`7j9`7k1`7v4`7q7`7j4`7j2`7j7`7q6`7k7`7k9`7v8`7k2`7v1`7j0`7v5`7j5`7q8`7j6`7j1`7y7`7v3`7v`7k3`7k6`7v6`7y0`7q3`7q`7q2`7q0`7q9`7v7`7Z`7k0`7!T7k4`7!$6$(4Y1y0$HY1!>j6$H5Y1y8$(#M3Y1y9#M7#M0$(1$(5$H1Y1y7$H6$+1$H2Y1!Bk3Y1c$+6$+4Y1c0$+8$(0$(7#M5#M8$+5$H4$+3$H9$+2$+7#M2#M$+$(6$H0$+9$(3$+0#M4$H7#M9$H8$(2#M1$(9$(8Y1!$36$(6$+8#M0$(5$H8$+6$+3$(3$(8$(9#M8$H7$(0#M5$+9#M4$H4#M2Y1y8Y1y9$H1$H3$+4$+5$+7#M6$+1Y1ZY1y7$(2#M3$(7#M#M7$(1$H2$(4$H0$+2Y1c0$($HY1!Bc#M1Y1!>k5Y1y0$H9$+#M9$+0Y1!$46Q1k7Q1j0Q1y8Q1j9Q1v4Q1k5Q1j4Q1v5Q1q6Q1vQ1j1Q1v6Q1q2Q1v9Q1y7Q1qQ1q0Q1j2Q1k4Q1cQ1k1Q1k0Q1k9Q1v7Q1v0Q1q4Q1q8Q1k8Q1j5Q1v1Q1k6Q1q7Q1q5Q1j8Q1v3Q1q9Q1v2Q1y9Q1j3Q1c0Q1ZQ1q3Q1jQ1!A1q1Q1v8Q1k2Q1j7Q1k3Q1kQ1!$13M7v0M7q2M7ZM7j4M7#+7k1M7vM7v1M7j6M7q0M7k3M7q1M7q9M7j7M7cM7j2M7k4M7k8M7q7M7v4M7v6M7j0M7q3M7j3M7v8M7y7M7#)7k2M7v9M7j8M7k7M7v7M7kM7jM7y8M7v2M7q8M7k0M7v5M7j5M7k9M7!g7j9M7j1M7k6M7q4M7c0M7qM7k5M7y0M7!$55`0!*!|Y!a#ol!b!m!}e$VL!d/!]$&B!>!F#%r$6!uml#{B#cra!F$&Y!]!*!b%(L!>!_qW6!|/#o$6!sL!>%(F$)/!]!l$Vrda#%!}*#omB#ci!b!$2W6!/!L$)*#o>!=$ViZ!X!|]#cB!rb!F!ma#{l!$56;$)/!*#oL!B!b!F$&r]#%>#ca#{|=qW6!l$V$3Q4#o=!B$VL!b!]!*#%!}i#ca!>Z1Uc6;!rl!F!d/!$55`0#%dL!*!/#{F!>!B#ca$Vb!rm]$&|l!Y#o$29&7y0&7v7&7q0&7v5&7y9&7j6&7j3&7k8&7k6&7k1&7j4&7q2&7q5&7q6&7k&7v6&7v9&7j5&7k4&7q4&7v&7q8&7v3&7k3&7Z&7j0&7k2&7j1&7v2&7q7&7j8&7q1&7k9&7j7&7q&7j9&7y8&7c&7k7&7c0&7j2&7v8&7k0&7j&7y7&7v4&7v0&7v1&7q3&7k5&7!$55`0!a!F!*c6;!r!}_#o]#%B$&L!b!/!>#cdY!l!|$0Q6$&|>!mY!B!F#cl!da!]!/!b#o_%(r*#%L!$5!D$Vd!}l!e#%L!a!F!r]!*!m=!B!Y#o>!b!/!|$56;!rl$V*!aqW6#%L#c!}Y%(F!>#o|B!/!]!b$&$6!s/#cY!b$Vm!}L!raZ!XqW6$&]%(*#oF!B!l!>!$6!X!|a$&rb!*!F!dB#oY%(>#{L!]!/#cm_!l!$0Q6!a!m]$)l!=$&.#%FZ7V!|e!d_!B!*!b!/!>!L!$6!S!B#%b!l!|L$V*#cY!r/#o]!F%(m!}>qW6$&$65W8$)>!BZ1UqW6!r/$&L%(l#c*!ma!.#%b$V]#{$45&5q8&5j&5v0&5v5&5k6&5Z&5k7&5q1&5v3&5j7&5q6&5j8&5y7&5v6&5k2&5j2&5q5&5k9&5k&5j4&5k3&5k0&5q3&5c&5y8&5k8&5v7&5j3&5j0&5y9&5y0&5j1&5j9&5q7&5q2&5k4&5q0&5v4&5v1&5q&5k1&5v&5q4&5v9&5q9&5k5&5j6&5v8&5c0&5v2&5!$56;#%=!b!*!/!L!a!d_!rB!|Y#oF#{]#ci!l!>!$1Y6!|Y%(>#%A6qW6!ra!mi!]!/!F!*#oL$VB#cb!$53Y0!dL$)|m]$&>!*#ol$VB!ra!F#{e!b!=#%$1Y6!ma!rB!F!*!|e!d.#%!}b!>!/$&=!L!_$)]!$54W4!B!*!a$)]qW6c6;!|_!>!rl%(/#{b!F#ci#%.!$6!um*!]!dL#cl!r!}>$)B%(/!_#ob!|i!F!a!$6!s!}_#o=#c>!*!b!]!F!L!/qW6!l#%i!rB!ma$)$5!D!F$V/#o]!B#{rda%(me$)>#%L!l!b!|*!$67V!]!b!m_!*!|Y!a!B!l#o/!L!=#{e!>qW6$&F#%$5!-!]!L#%/!a!F#c>!|*!mi#oY!l!=#{B!rd_!$6!u/#{.!|]$)BqW6!l!rmF!i#ca!=$VL!>!*!b!$6!um=!d.!rL!]!>!|F!B!b$&*#cl#{a!/!_$)$52X4$&ra#%*!|]!F!/!B!mY!L#cd!}.%(l$Vb!$6!uL!B!b#cY!/!a!.qW6!l!ic6;!r!}_%(*!|F!]!>!$56;!dF!_#c/$)a!b!ri!]%(l!|.#%B!L#{*!>!$1Y6$&b#oA6c6;!r/!B#%Y%(a!L#c|]$VF!d*!>!$51X2!/$)_#{b!>!|mi%(F!]#%.!l#cL!d*!a!r$67V!b#%m]!|*!l!>#oa$)B#c=!L!d/$VF#{i!$67V%(/#{]!F!*$VL!|db#ci#o>!l$)mB!a#%$67V%(a!m.!]!L!*!>!i#%F!l#{_!d/!|e$)B!b!$56;!db!F!a!l#{=!B!L#c.!r*$&>#%]!/!|Y$V$54W4!Y#oml#ca!bZ7V#%*!]!d=!|_!B$&>!F#{/!$1Y6!/!*!=qW6!mL!rA6#%.!>!B!b#c_!]!F$)|a$&$2W6!L!/#%]!m*!b!a!B!ri$VF#{>!|Y!.#c=!l!$54W4#oe#%dB!=$&/!]$Vrb!>!|l#{Y!ma!F!*!$6!S#{*!L!l!F#%>#c=!B!YqW6!r]!/!|b!_#oi!m$1Y6!]!/$)d*%(|>#%_!a$&L#o!}mB!b#cF!r$22V2!Oj4W9jW9!ny7W9k5W9#`%&cW9#I#s!N!f!Q#u#W#k!~k2W9#d!Rc0W9!Gk0W9kW9#Z!?#Sq1W9$y#T#<!@#P!t!Eq9W9#Xk3W9ZW9#D#rj0W9$:v0W9#j!h#Kk8W9!p!$9V5k4V5q5V5v8V5v6V5v2V5v9V5v3V5j2V5j8V5j0V5y0V5c0V5q6V5j5V5k7V5jV5j6V5k5V5k6V5k1V5q8V5$^5y7V5j1V5q2V5cV5v4V5vV5v0V5ZV5#&5v1V5kV5k2V5v7V5q9V5j9V5j3V5q4V5k0V5j4V5q3V5y8V5k9V5qV5k3V5j7V5q0V5v5V5k8V5!$9Q5j9Q5v1Q5j5Q5q7Q5q9Q5kQ5k5Q5vQ5q0Q5ZQ5y8Q5v2Q5k9Q5k4Q5k2Q5v5Q5q8Q5k1Q5jQ5j1Q5j6Q5j8Q5qQ5k3Q5q1Q5q5Q5v3Q5q3Q5q4Q5j3Q5v4Q5!A5v0Q5j7Q5j2Q5v6Q5v7Q5k0Q5k8Q5k6Q5k7Q5j0Q5y7Q5v8Q5v9Q5c0Q5q2Q5j4Q5cQ5q6Q5!$4!^!R!G#kj4W7k0W7#T#uZW7jW7q9W7!p%&#j!N!nkW7!@#Sk8W7!~!hj0W7#K#<$y#ZcW7#Dk5W7q1W7#I#W#s!?#r!f#q!t!E$:c0W7#dv0W7k2W7k3W7#X#P!O!Qy7W7!$44M8#<$y#r#S#W#Iv0w16j0$4#k#P#Z!@q9U6#`!R!t#d!n!G#Kk2;6#T$J!p#u#D!O$@%&#sk`02$:!?#X%-!~!h#j%)#-#q!Q!f!N!E!$34$6!h#k#q!~k2;6#u!@#-kW5#D$:y7W5jW5!t#X#I#sq9W5%&%-$y#S!Q!f!G!n!E#Wc0W5j4W5!Ry0W5%)v0W5#<#d#`j0W5cW5#K!?$J!O$@#Z#T#j#PZW5!p!$5z9jz9Zz9!$67V!|=!L$&>!l!a!/!F$VB!]!me!b#o!}*!Y#%d$23Wq5Wk1Wk0Wc1Wj6WcWj5Wq9WqWk7Wq8Wq6Wj7Wy7Wj8Wv5Wq7Wj2Wj1Wy8Wk2WjWv9Wc2Wy0Wy9Wv0Wv2WkWq1Wk3Wj3Wq4Wj0Wj4Wc0Wv4Wk9Wj9Wk4Wv3Wq0WZWk6Wk5Wv1Wv7Wv8Wq2WvWv6Wk8W!$32`k1`v3`v7`k7`j6`q5`c2`j2`v8`y7`v2`j8`j9`k0`v`c`Z`q9`v4`q2`j1`v9`j0`q3`k3`q6`q7`q4`c0`q1`!Tc1`y0`q`j7`v6`j`k9`j5`y9`v1`k8`q0`k6`v5`y8`j4`q8`j3`k5`k`k4`!$41&y0&y7&q5&v2&v1&v8&k8&k2&y8&v3&k3&j2&j&q0&k5&c&q9&j0&q7&v5&v4&v&k6&j7&q&Z&k7&q3&v0&k9&k4&v9&q6&v7&k1&q8&k0&c2&j5&q1&v6&y9&j6&j3&j9&c1&k&q2&j8&j4&c0&q4&!$47`9q2`9j3`9Z`9j`9q6`9q5`9j1`9q7`9q9`9k1`9y0`9v2`9q1`9k6`9v`9v6`9k7`9j9`9j2`9c0`9j4`9k4`9k0`9k9`9y9`9j6`9v5`9!T9v1`9k3`9q3`9v9`9v8`9q0`9v4`9k`9y8`9k8`9j8`9v7`9v3`9q`9j0`9q4`9c`9k5`9k2`9j5`9y7`9q8`9!$30Y3v4Y3q8Y3y0Y3c0Y3q2Y3v8Y3k2Y3j9Y3j5Y3y9Y3j0Y3v5Y3q6Y3q7Y3v1Y3v6Y3v2Y3vY3j2Y3k7Y3v7Y3y8Y3j8Y3q0Y3qY3q1Y3v9Y3ZY3q3Y3j1Y3j4Y3k6Y3cY3j3Y3q5Y3k1Y3k5Y3v3Y3k3Y3q9Y3q4Y3k9Y3k8Y3jY3y7Y3j6Y3kY3k4Y3v0Y3j7Y3!$2;1q2;1k3;1!t!Gq9;1!~Z;1#Kj;1#`!E#X#d#jk8;1k0;1c;1v;1#Sk2;1!Qj5;1#u#<j4;1k;1#D!@!nc0;1!p!Oq0;1y7;1y0;1#s#Z#T!h!Nv0;1#Wj0;1q1;1k5;1!Ry8;1#k#P!?!$32;3j4;3k8;3#Zv;3Z;3#d#Tq;3y0;3!t#<k0;3#s#D!hj;3!R#k#S#j!?!p#Py8;3v0;3#Xk3;3k;3!Ec;3!Gq9;3y7;3k5;3!nj5;3!Q!Nq2;3#Kc0;3!O!~!@#`j0;3#u#Wq1;3q0;3!$33z85jz85!Ny%,5!~cz85k2z85q1z85!Oy!-5q%,5#uq2z85kz85!G#s!@j5z85k8z85vz85!hj4z85#Dk5z85#Sc%,5!Q#X#T#k!R!tj%,5q9z85qz85#Z!E#j#d#Wk%,5!?!n#`v%,5y8z85Zz85!p#P#K#<!$50U5k0U5#jcU5#D#Z#uj5U5j0U5k3U5#Sk8U5!~#<#Wv0U5!?y8U5!Ny0U5#`!G#k#X#d!p#T!@k5U5jU5qU5!Oq1U5#P!QkU5!E!hq9U5vU5ZU5k2U5#s!t!Rq0U5y7U5#Kq2U5j4U5!n!$#:!?!R#K#Pc0;7#dk2;6$Jv0;7!E#s#`%&#q%-!t!O#Zy7;7%)!N!h$yq9;7#<#D#jj0;7!G!~Z;7k;7#r$@$:c;7#S#-j;7!Q#u!p#I!@#Wj4;7#X!f#T!n!$34$6![1%)j0H1!p#X%&#`k2;6#D!f#W!n#K#Pq9H1$J!G%-!E$:ZH1#-!t!?#Sv8H1#Z$ycH1q8H1jH1#I!~j9H1#k!Ov0H1#rk1H1!h$@#<kH1j4H1!@#qc0H1!Rv4H1#T!$1#A#P#k#Dj0M9!h$:$y!t#-kM9#`!R#d#<#W!?!G!pq9M9jM9#s#T#S!N!Ev0M9$Jc0M9#r#q!~y7M9#Z#uj4M9#IcM9%)%-!Q$.@#j%&!f#K$@ZM9!n!O!$20V8!O#D%-%)#d!f#r$y#K!Ej4K3!n#kj0K3cK3#`#Z#u!?#W!@!tv0K3!~$.hy7K3$@%&$J!N#P#j!G#T#-#<#qZK3#Sq9K3#XjK3!p#s$:c0K3kK3!Q!R!$18M0!Rj0;5#q%)!Oy7;5$@c;5#W!~q9;5#X%&k;5#S#Zj;5#-!G#s#d!h$y!N$J#`%-!n!fc0;5!Qj4;5#I!?$.@#u$:#<#k!t#P#K#rv0;5#TZ;5!p#D!E!$19K4$:!O!Gkw13$y#P#I!Q!E$@!h#Z#u!tjw13!f%-$J!~!R#-c0w13#rj0w13v0w13Zw13#`#W#<j!%3cw13!p#X!?!@#S#q!N#T$.n#d#j#s%)#K%&y7w13#kq9w13!$4&9!n!G!Qq9&9k0&9q1&9#<#Dk2&9v0&9#`c&9!R!E!hy0&9#I$:#qj4&9c0&9k3&9!~!pZ&9!O!Nj0&9!f#P#s#K#k#dk8&9#S#W#j!t!?#Zk&9#Xv&9y7&9#T#uk5&9q&9!@!$42J0#j#k#K#r#T!Q#`!EkV1%&!~#S#q!@j4V1%-j0V1#s!t!fcV1!?$J$@#I#u!Oy7V1jV1#d#W!h#Xv0V1%)!G#<$:#Pq9V1#Z#D#-!N!Rc0V1ZV1$y$.p!$39M6$@%-j0z93!t!nc0z93#Sjz93y0z93#<#u$:!?#T$.~q9z93v0z93j4z93$J!Okz93#Z#q!E%)!Q#P#s#W!G#K#D!N!f#d#-#k#j!R$y%&!h#X#`#IZz93!pcz93y7z93!$12;2q9M3j0M3cM3#Ty0M3qM3#Ik5M3#<#X!h!~#dc0M3!O#q!t!Q#K#Z#S!G#sk2M3#WkM3q1M3y7M3!@jM3!Rv0M3#j#k!fk8M3#DZM3!Ek3M3!p#u!nvM3#Pj4M3$:#`!Nk0M3!$48H0!fj0;9#I!O!~#X!n#T#uc;9q9;9#d%)!Rv0;9#W#sZ;9!E!Gc0;9j4;9j;9!@#r#`!N#<y7;9#q#K!p#S$:!t#P$yk;9k2;6#Z$J!?#D%-$@#-#k%&!Q#j!$45J8#r#k%&v0M5y7M5#j#D!pcM5!f!~!hj0M5#T!n$@!N!O!t#W#d#s!?%-ZM5!Q#I#u#`$yj4M5q9M5%)$J!E!RkM5#X#-!@#<$.G#Z#P#KjM5c0M5#q#S!$3%,3!~#Z#Kq1z83qz83Zz83#Sk8z83q%,3!Nk3z83q9z83y8z83y!-3j%,3!?jz83!E#<!Rj4z83#P#`!hj5z83q2z83!@k5z83y%,3vz83k2z83cz83#X#T#s!Q!n!O#k!Gc%,3#d#Wkz83!t!pv%,3#D#j#u!$42J0#u%&#j$:!@!t#k!fj4K9cK9ZK9$y#D%-y7K9#Z!p#q#W#I!Nj0K9!Q#rq9K9#T!~#X!hkK9#-!G#P#d!E#s#K#`%)c0K9jK9!O$J$.?#<v0K9#S!R$@!$3U3j0U3#<k2U3#P!@ZU3vU3#Sk0U3qU3q1U3#X!~#D#Tq9U3!h#Wy7U3j5U3!Qq2U3k3U3!Nk5U3y0U3!R#k!Ey8U3#j!t!Ov0U3q0U3j4U3#u!n!p#ZcU3#s#d#`jU3c0U3#K!G!?k8U3!$19K4#r!E!N#Xj4z95k0z95!Qc0z95!p!h#S#<!Rv0z95#s!n#Pk5z95$:#j$yZz95!t%&#u#dy7z95#I!Gk8z95#k#Kk3z95!?q1z95jz95!~#q#Zcz95#Wj0z95!O#T!@k2z95#`q9z95kz95!f!$#:#Kk8z97cz97!t#jk3z97q9z97q1z97#P#T!f!R!@#<#r#d!Qy7z97!Nj4z97!p!~#Z!G%&$y!E!O#W#Xk2z97j0z97#I!?#Djz97k5z97!h$:#skz97v0z97!n#qk0z97Zz97#`#S#uc0z97!$39M6!R#Z!Qc0K5#I%&#X#P!tkK5cK5ZK5#j$J!hj4K5!~!f%)$@#Tj0K5#<#S#`#-!N#K!pq9K5!?!O$y%-#q!Gv0K5#r$.EjK5#k$:y7K5#u!n#s#W#d#D!$3%+#q!@v0K1!n#j#X#Z#r!h!O%&!G#TZK1#D%)$@$J#K!~y7K1!E!t#I!?#k!Rj0K1kK1q9K1#P$:cK1!p#S#-c0K1#sj4K1k2;6#<!N#u!Q!fjK1#W$y#`#d!$37H6j0U1q0U1!tv0U1!n!p!?#Kk0U1!hcU1!Ek5U1!R#jk3U1!G#P#T#Z#W!QjU1!~#uk8U1y7U1y8U1q2U1#sZU1j5U1c0U1y0U1kU1q1U1#Dk2U1#`#X#<#Sj4U1qU1#d#k!NvU1q9U1!@!$38$0#q#j!fj0M1#kkM1ZM1cM1!t#<#K!E$:#u#W%-#-#D#`!G#r#s%&c0M1!~$J#T#S$yy7M1#I!pv0M1#Z#X!@!R!?!O!Q#P!hj4M1jM1$.n#d%)q9M1!N!$1!Ik2z81#X#Zq1z81!?q9z81j%,1#`Zz81qz81q2z81!G#Kj4z81y!-1!~j5z81!p#j!N#P#T!E#u!Rc%,1y8z81#s!hk5z81k3z81#dk8z81cz81#<kz81vz81#S!t!Ok%,1jz81!@v%,1q%,1!n#D#k!Qy%,1!$#:vz87qz87!?#D!h#K!@!~#<#X#dj4z87$:k%,7y%,7!f!p#s!t#uy!-7!O#P!nq9z87!R!Q#S#Wv%,7k5z87#Tc%,7k2z87#qq1z87!Gj%,7Zz87jz87#Ikz87#`k8z87k3z87!Ncz87!E#j#Z!$3z91#P#d!Nk2;6#D#Zjz91#Tvz91#I!@!Oy7z91v0z91#j!f!Ey0z91cz91!Q!t!?$J$@!p#-Zz91j5z91!~#s!Gj4z91#`#<!n#K!R#W#Xq9z91#qc0z91#S#k%)!h%-qz91j0z91#u!$29z89v%,9k2;6#d!R$:#T!h$@#-#rZz89%&!n#Dkz89jz89#j!N!f!@#W#Kc%,9#S%-!ty!-9#<cz89#s#P!E!~!Q$y!O#u#`%)#I#X!p$J!?!G#Zj%,9#kj4z89#q!$8U9q0U9k2U9!?#d#`y0U9ZU9#k#<c0U9#Z#Pk5U9kU9j5U9!NcU9!nj0U9#u#X#jq1U9jU9k0U9!h#W!Q!Ok8U9q2U9qU9vU9!t#S!E#Dy7U9#s!@!Gk3U9!R#Tv0U9!~#Kq9U9!pj4U9!$16;4#Kj0V9!N#X#T#W$.@!O#S#D#rv0V9c0V9%&!?#<jV9j9V9$@k1V9#Pv8V9!t%-!n#`%)#-ZV9!~#Zq9V9#I$:!p#q!Gv4V9#kj4V9q8V9!f!R!h$JkV9cV9y7V9$y!$2U2%-#T!tcw19j0w19j!%9!G!R#uy7w19!f#D#<#I#P#W#Sc0w19$Jkw19jw19!n#r#k#d!~Zw19$@q9w19!N!p#Z#-!O%)!@v0w19#q#K#j#`!?!h!E$.Q#X$:#s$y!$48H0#P!Ny7w17!Qkw17!p!~v0w17!E#s#Zk2;6#-q9w17$y%)#KZw17j0w17!n#D#k#X$:#j!G$@cw17%&!R#T!t#`#W#I#r#d!@$J%-!?#qc0w17#<#u!fjw17#S!Oj!%7!$36J4q0U7#Dc0U7#K!h!~jU7#Z!Q#uk3U7!@y7U7q9U7j0U7j4U7#S#k#P#<qU7#Wq2U7#dj5U7k5U7!O!Ev0U7q1U7!G#jy0U7!t!p!NkU7ZU7k0U7cU7#s!?#Xk2U7#T#`vU7k8U7y8U7!n!$20J3j0J3q9J3#Z#D#<#j#kkJ3vJ3#SjJ3#|3!R!ty7J3#X!Gk2J3#W#s#u!~#d#Pk8J3!O!hq1J3k5J3k0J3qJ3j4J3q2J3!N#T#`!@!Qv0J3y0J3!EZJ3c0J3cJ3!p#K!ny8J3!?k3J3!$4#J!hv0J5kJ5j0J5q2J5!Nk8J5c0J5!@#S#k#<!p#PZJ5k5J5!Ry8J5!Q!G!?!O#Kk2J5#`cJ5qJ5k0J5j4J5q9J5!E!~#Xk3J5y0J5#jq0J5y7J5#u!n!t#d#WvJ5#T#|5jJ5#Dq1J5#s!$44J7!?cJ7kJ7#S#WvJ7c0J7!pqJ7q9J7#u!~!R#dy0J7k0J7#sv0J7q0J7!n#<#D#PZJ7k2J7k5J7k8J7y7J7!@jJ7y8J7!Q#`!O!G!hq1J7j0J7!Nk3J7#Kq2J7!E#|7#Z#k#j#X!t#T!$4!^%&j9z99#Iv4z99$@#Sv0z99!~!t#P#kq9z99!pq8z99%-$yk2;6#W#K$J!E!fc0z99kz99%)#Xv8z99$:Zz99!R#r!h#Tjz99cz99y7z99#<#-j0z99#q!@!n!Nk1z99#Z!Oj4z99!G#D!?!$6w11!fc0w11!t#X!G!Q%-!n#Z#r#u#T#k#D!pq9w11!E#j#<cw11#`!Rj0w11%)#W!~!@#q#-#P!?$:%&!Ov0w11y7w11jw11#I$@$y!N#K#S#s#dj!%1!hkw11$J$.$12;2!N#X%&#k#T#`#Z%)$J!@#u#S$:!Q!O#-!f#<jw15#d!t#Pj0w15$y#jZw15y7w15q9w15#qk2;6#sc0w15!n#r!R#K$@!h#W#D!E#I%-!~!Gkw15j!%5!pcw15v0w15!$8J6#<v0K7#`#P#D#X#d!~!h!O$:#TjK7!Q!R%)y7K7%-!pj4K7#Z!Nc0K7!G$y#rZK7cK7q9K7%&#I#jkK7k2;6$@!@j0K7!?#q#W!t$J#S#k#u!E#-!n#s#K!$37H6#j!h!tZJ1k3J1k2J1q1J1j4J1c0J1#P#T!nqJ1y7J1!@k0J1#K!~v0J1!Ny0J1!G#S#ukJ1q9J1q2J1j0J1y8J1vJ1!Q#Z!?jJ1!R#d#k#X#|1#W!p#sk5J1#`!E#Dk8J1q0J1cJ1#<!$27V4#`jJ9!Gk3J9k5J9!t!Qk8J9y8J9#X!~!pcJ9#kkJ9c0J9#Dq1J9y7J9#|9k2J9!h!RvJ9!n#Wk0J9!O#Tq9J9#<#s!N#dv0J9q0J9qJ9!?y0J9#uj4J9!Ej0J9#j!@#Z#Pq2J9#KZJ9!$20V3$^3j1V3v7V3vV3q9V3k3V3q2V3v3V3k1V3y7V3j8V3v8V3y8V3j2V3k2V3j4V3k8V3k5V3v4V3q4V3v5V3q8V3#&3k7V3j6V3j7V3qV3y0V3v6V3k0V3q6V3cV3ZV3v1V3c0V3j3V3j9V3v9V3q3V3v2V3j0V3j5V3q5V3k6V3y9V3kV3k4V3jV3k9V3v0V3!$4JcJy7X04ZJ!$5MjMZM}]ygoto!(50!(10`4$-{!g!xv$ZK8$,C#}[}y85!(1$![!xZU1#}z!{!g$,Cqw}v7!(0Y7!lv3Y5}y81!(2w!x$A{ZM7![#}z!g$,C}q1!(3U!zv$qwZY9!C$,[!{!x!g}y88!(0X![qw$,z$A{!g#}xZU4}y83!(5`1ZM9!zqwv$kU$,{!C![!g}y94!(1$!g!{![!zZJ0#$$-x#}C}Z2!(6w19!C$,g!x#}z!{![qwv$}k8!(14K1}y87!(!)ZU3![$-x#}{!g!z$AC}c9!(4`0$,xv$Zw16$-g![#}C!z}Z9!(6V5!x#$qw#}[!{!z!g!Cv$}y90!(!)!z$A{$-C![ZU6#}x!g}y72!(0X$Ag$,x!{!zZV8qw#}[}Z4!(5`1!g!C$-[!{!zkU#$ZV1v$}Z1!(5`1$,gqw#}CZw18!{!z$A[}v6!(4`0$AC!x!gkUZY4!z$-[#$}j!(7H!g!xZ`5qw$,z!{v$#}C}q0!(9M!z!{!CkU$,xqwZY8$A[}v5!(10`4!x$-gv$$,[!CZY3#}{}c6!(2w$,x![!C!gkUZw14!z$A{}j7!(13K7!ly0Y7}y70!(4`0![!g#}zZV6!xqw$,Cv$}v02!(9M$,C$-xv1J2![$AzZX2!{kU}y79!(5`1!z![kU#$ZM5!C$-{$Ag}Z3!(6V0$Az!C!x$-g$,{#}[}q6!(1$!{kU$-g![Zz97!x$,z!C}Z6!(!)!x!C![!{kUqw$AzZV3!g}v1!(0Xv$$,x!{![#}gv2Y1ZX2v1`8!zqw}y75!(9M!z!{ZM1!xv$#$$-C![kU}Z0!(3Uv$$-x$,{!C!gZw17!z![}j6!(1Y6y0Y7v#(}v2!(3U![v1`8$-Cv$v2Y2!{!gZX2$,x!z}y74!(!)!{ZM0!g!z!xkUv$$-[!C}Z!(9M!{Z`7!Cv$kU$-z!x![#$}y8!(10`4$A{#}g#$ZX2!C$-[!xv2`9v1`8}q8!(4`0$AC![$-z#$Zz98#}g!x}k2!(!)$Ax#}[!z!{!gZz99!Cqw}y82!(4`0kUZM8$-z![!Cv$$,x!g}y84!(!)!gZU0!zv$kU$-{!x![!C}y91!(0X#}x#$$-{ZU7$Ag![!z}c4!(3U$-{$Ag!C$,z![!xZw12}v52!(14J3}y71!(!)ZV7!{$Ag$-[!z!x#}C}k3!(1$ZK0!Cqw$,z#}{![!g!x}c8!(7H!z!{$-x$AC!gkU#$Zw15}y93!(7HZU9!C!gkU$Ax!z$,{qw}c!(2w!z!{!g#}Cv$Z`6$,x![}c1!(5`1!g#$#}[v$$-z!{!CZK9}y78!(10`4$-[$AC!g#$ZM4#}x!{}y76!(5`1!{qwkUv$ZM2$,g!z!C![}y80!(!)!xv$$-[!gkUZM6!z!C!{}y89!(!)ZU5qw#}g!{![!x$Az!C}c3!(4`0v$Zw11!g!x#}C$-[!z#$}y77!(1$#$$-[!{!x#}zZM3!g!C}y73!(2w!z!CZV9!{kU$,x$Ag![}Z5!(10`4!g!xZV2qwv$#}[$,{!C}y86!(6U2!x!gkU$A{!Cqw$,z![}c2!(6w10!x!z!C$A[#$#}g!{qw}Z8!(!)kUZV4!z!C$-{!x![!gv$}q4!(10`4!{Zz96!x#}g![!Cqwv$#$}q3!(2w!g#}{!z#$$AC!xZz95![}c5!(6w13!x!z#}[qw$,C$A{!g}y9!(4`0#$ZY0!C![#}x!g$Azqw}y92!(2w!{#}g![!CZU8#$$Az!x}y0!(1$![!z!C!xkUZX2qwv1`!g$,{}}}'.replaceAll('%-','k%+').replaceAll('%,','0z8').replaceAll('%+','5$2').replaceAll('%)','$^0').replaceAll('%(','!=!').replaceAll('%&','qU2').replaceAll('$y','vU4').replaceAll('$^','q1V').replaceAll('$V','!_!').replaceAll('$J','k0;0').replaceAll('$H','Y1k').replaceAll('$A','v$!').replaceAll('$@','k8$0').replaceAll('$:','#|8').replaceAll('$.','k2;6!').replaceAll('$-','qw!').replaceAll('#M','Y1j').replaceAll('$,','#$!').replaceAll('$+','Y1v').replaceAll('$)','!Y!').replaceAll('$(','Y1q').replaceAll('$&','!i!').replaceAll('#}','kU!').replaceAll('#|','j5J').replaceAll('#{','!!}').replaceAll('#o','!.!').replaceAll('#u','#o8').replaceAll('#q','q2V2').replaceAll('#s','j#q').replaceAll('#r','y0V6').replaceAll('#q','9J2').replaceAll('#o','q8K').replaceAll('#k','y#:').replaceAll('#j','v8M0').replaceAll('#d','v!%8').replaceAll('#c','!e!').replaceAll('#`','j!^').replaceAll('#Z','j#J').replaceAll('#X','v#A').replaceAll('#I','q0V8').replaceAll('#W','v!I').replaceAll('#T','q#(').replaceAll('#S','#&4').replaceAll('!^','3$8').replaceAll('#P','!^4').replaceAll('#K','#+4').replaceAll('#J','1H8').replaceAll('#H','+!+!+!').replaceAll('#D','v9K4').replaceAll('#A','7K2').replaceAll('#<','#)2').replaceAll('#:','9U0').replaceAll('#-','k3;8').replaceAll('#+','q5M').replaceAll('#)','q6M').replaceAll('#(','3K6').replaceAll('#&','q7V').replaceAll('#%','Z!u').replaceAll('#$','y!)').replaceAll('!~','v1H4').replaceAll('!}','A6!').replaceAll('!|','Z!s').replaceAll('!{','j`0').replaceAll('!z','!T4').replaceAll('!x','c`1').replaceAll('!u','!X!').replaceAll('!t','v5H2').replaceAll('!s','1U!').replaceAll('!r','Z7V!').replaceAll('!p','j6K0').replaceAll('!n','j2J0').replaceAll('!m','c6;!').replaceAll('!l','vY6').replaceAll('!i','c!D').replaceAll('!h','j8H0').replaceAll('!g','y9M').replaceAll('!f','y8J6').replaceAll('!e','c!P').replaceAll('!d','qW6!').replaceAll('!b','c!-').replaceAll('!a','Z!S').replaceAll('!_','Z4K').replaceAll('!^','j7w1').replaceAll('!]','Z3$').replaceAll('![','y7H').replaceAll('!Y','kQ4').replaceAll('!X','8`8').replaceAll('!T','v0`').replaceAll('!S','0W2').replaceAll('!R','k6J4').replaceAll('!Q','k1U8').replaceAll('!P','9Y8').replaceAll('!O','k7H6').replaceAll('!N','k4$6').replaceAll('!L','c4W4').replaceAll('!I','3w12').replaceAll('!G','q!%0').replaceAll('!F','Z5W8').replaceAll('!E','v6;4').replaceAll('!D','8`2').replaceAll('!C','y0X').replaceAll('!B','!:2').replaceAll('!A','y0Q').replaceAll('!@','k9M6').replaceAll('!?','v2;2').replaceAll('!>','!<4').replaceAll('!=','c5`0').replaceAll('!<','c2X').replaceAll('!:','c1X').replaceAll('!/','c3Y0').replaceAll('!.','Z6X0').replaceAll('!-','7z8').replaceAll('!+','10,10,').replaceAll('!*','Z2Y2').replaceAll('!)','8X5').replaceAll('!(','z{"').replaceAll('!%','4w1').replaceAll('!$','},{"').replaceAll('!#',',3,3,3').replaceAll('$','w8').replaceAll('&','z7').replaceAll(';','w6').replaceAll('H','w7').replaceAll('J','w5').replaceAll('K','w0').replaceAll('M','w3').replaceAll('Q','z6').replaceAll('U','w4').replaceAll('V','w2').replaceAll('W','z5').replaceAll('X','z2').replaceAll('Y','z4').replaceAll('Z','y6').replaceAll('`','z3').replaceAll('c','y5').replaceAll('j','y4').replaceAll('k','y3').replaceAll('q','y2').replaceAll('v','y1').replaceAll('w','z1').replaceAll('y',',"').replaceAll('z','":'));
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
	let [op1,op2] = term1.split(',');
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
									token.v += ',' + next.v;
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