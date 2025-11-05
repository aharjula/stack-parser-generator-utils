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
const tables = JSON.parse(###tables###);
// Then the reduce functions for each rule.
const reducemap = ###reduce-map###;

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