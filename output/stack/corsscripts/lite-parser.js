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
const tables = JSON.parse('{"nonterminalsz["List"yGroup"yTopOp"yOpInfix"yOpSuffix"yOpPrefix"yTerm"yAbs"yCallOrIndex?"yIndexableOrCallable"ySet"yStatement"yListsOrGroups"yStatementNullList"yTermList"yStart"]yterminalsz["-"y+"y+-"y|"y]"y}"y)"yLIST SEP"yEND OF FILE"y*"y**"y^^"y^"y."y#"y/"yand"yor",z:=",z=",z:",z"y<="y<"y>="y>"y="y~"y%and"y%or"ynounmul"y@"yimplies"y ^-"y ^+"y ^+-"y ^#pm#"y **-"y **+"y **+-"y **#pm#"y ^^-"y ^^+"y ^^+-"y ^^#pm#"yxor"yxnor"ynor"ynand"y!"y!!"y["y("y\'\'"y\'"ynot"ynot "y?? "y? "y?"ynounnot"y%not"ynounnot "yBOOL"yINT"yFLOAT"ySTRING"yID"y{"]yrules_to_nonterminalsz[15,0,10,1,13,13,14,14,11,6,6,6,6,9,9,9,9,9,8,12,12,12,2,2,2,2,2,5,5,5,5,5,5,5,5,5,5,4!;#3!tr!tr!tr!tr!tr,7,5,5!tr,5!tr!tr!tr!tr,3]yrule_lengthsz[1!t#2,0!#0,1,1,1,1,1,1,1,1,1,1,2,2,0,2,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2!tr!tr!tr!tr!tr!t#2,2!tr,2!tr!tr!tr!tr,3]ytablez[{"!@$8w!$8w7y7w7jw7cw7Yw7y9!d;0#.iz94v9z96k0z98k1w00#4^!Xqbj9!a!S&X5c0X5y9X5v0X5v1X5v2X5v3X5v4X5v5X5y0X5vX5kX5v6X5v7X5v8X5v9X5k0X5k1X5k2X5k3X5k4X5k5X5k6X5k7X5qX5k8X5k9X5q0X5q1X5q2X5q3X5q4X5q5X5q6X5q7X5q8X5q9X5j0X5j1X5j2X5j3X5j4X5j5X5j6X5j7X5j8X5y8X5y7X5jX5cX5YX5!&X7c0X7y9X7v0X7v1X7v2X7v3X7v4X7v5X7y0X7vX7kX7v6X7v7X7v8X7v9X7k0X7k1X7k2X7k3X7k4X7k5X7k6X7k7X7qX7k8X7k9X7q0X7q1X7q2X7q3X7q4X7q5X7q6X7q7X7q8X7q9X7j0X7j1X7j2X7j3X7j4X7j5X7j6X7j7X7j8X7y8X7y7X7jX7cX7YX7!&X9c0X9y9X9v0X9v1X9v2X9v3X9v4X9v5X9y0X9vX9kX9v6X9v7X9v8X9v9X9k0X9k1X9k2X9k3X9k4X9k5X9k6X9k7X9qX9k8X9k9X9q0X9q1X9q2X9q3X9q4X9q5X9q6X9q7X9q8X9q9X9j0X9j1X9j2X9j3X9j4X9j5X9j6X9j7X9j8X9y8X9y7X9jX9cX9YX9!&U1c0U1y9U1v0U1v1U1v2U1v3U1v4U1v5U1y0U1vU1kU1v6U1v7U1v8U1v9U1k0U1k1U1k2U1k3U1k4U1k5U1k6U1k7U1qU1k8U1k9U1q0U1q1U1q2U1q3U1q4U1q5U1q6U1q7U1q8U1q9U1j0U1j1U1j2U1j3U1j4U1j5U1j6U1j7U1j8U1y8U1y7U1jU1cU1YU1!&U3c0U3y9U3v0U3v1U3v2U3v3U3v4U3v5U3y0U3vU3kU3v6U3v7U3v8U3v9U3k0U3k1U3k2U3k3U3k4U3k5U3k6U3k7U3qU3k8U3k9U3q0U3q1U3q2U3q3U3q4U3q5U3q6U3q7U3q8U3q9U3j0U3j1U3j2U3j3U3j4U3j5U3j6U3j7U3j8U3y8U3y7U3jU3cU3YU3!!C8!C8!C8!?&w9c0w9y9w9v0w9v1w9v2w9v3w9v4w9v5w9y0w9vw9kw9v6w9v7w9v8w9v9w9k0w9k1w9#$9#&9#(9#)9k6w9k7w9qw9k8w9k9w9q0w9q1w9q2w9q3w9q4w9q5w9q6w9q7w9q8w9q9w9j0w9j1w9j2w9j3w9j4w9j5w9j6w9j7w9j8w9y8w9y7w9jw9cw9Yw9!&Z1c0Z1!-1v0Z1v1Z1v2Z1v3Z1v4Z1v5Z1y0Z1vZ1kZ1v6Z1v7Z1v8Z1v9Z1k0Z1k1Z1k2Z1k3Z1k4Z1k5Z1k6Z1k7Z1qZ1k8Z1k9Z1q0Z1q1Z1q2Z1q3Z1q4Z1q5Z1q6Z1q7Z1q8Z1q9Z1j0Z1j1Z1j2Z1j3Z1j4Z1j5Z1j6Z1j7Z1j8Z1!,1y7Z1jZ1cZ1YZ1!&Z3c0Z3!-3v0Z3v1Z3v2Z3v3Z3v4Z3v5Z3y0Z3vZ3kZ3v6Z3v7Z3v8Z3v9Z3k0Z3k1Z3k2Z3k3Z3k4Z3k5Z3k6Z3k7Z3qZ3k8Z3k9Z3q0Z3q1Z3q2Z3q3Z3q4Z3q5Z3q6Z3q7Z3q8Z3q9Z3j0Z3j1Z3j2Z3j3Z3j4Z3j5Z3j6Z3j7Z3j8Z3!,3y7Z3jZ3cZ3YZ3!&Z5c0Z5!-5v0Z5v1Z5v2Z5v3Z5v4Z5v5Z5y0Z5vZ5kZ5v6Z5v7Z5v8Z5v9Z5k0Z5k1Z5k2Z5k3Z5k4Z5k5Z5k6Z5k7Z5qZ5k8Z5k9Z5q0Z5q1Z5q2Z5q3Z5q4Z5q5Z5q6Z5q7Z5q8Z5q9Z5j0Z5j1Z5j2Z5j3Z5j4Z5j5Z5j6Z5j7Z5j8Z5!,5y7Z5jZ5cZ5YZ5!!?&X1c0X1y9!V0!V1!V2!V3!V4!V5X1y0!V!q!V6!V7!V8!V9!q0!q1!q2!q3!q4!q5!q6!q7!x!q8!q9!x0!x1!x2!x3!x4!x5!x6!x7!x8!x9!g0!g1!g2!g3!g4!g5!g6!g7!g8X1y8X1y7!gX1cX1YX1c1V4c!:$51Z7c2Z7j9Z7c0Z7!-7v0Z7v1Z7v2Z7v3Z7v4Z7v5Z7y0Z7vZ7kZ7v6Z7v7Z7v8Z7v9Z7k0Z7k1Z7k2Z7k3Z7k4Z7k5Z7k6Z7k7Z7qZ7k8Z7k9Z7q0Z7q1Z7q2Z7q3Z7q4Z7q5Z7q6Z7q7Z7q8Z7q9Z7j0Z7j1Z7j2Z7j3Z7j4Z7j5Z7j6Z7j7Z7j8Z7!,7y7Z7jZ7cZ7YZ7!$51Z9c2Z9j9Z9c0Z9y9!(!/1!(2!(3!(4!(5Z9!<Z9k!(6!(7!(8!(9Z9k0Z9k1Z9k2Z9k3Z9k4Z9k5Z9k6Z9k7Z9qZ9k8Z9k9Z9q0Z9q1Z9q2Z9q3Z9q4Z9q5Z9q6Z9q7Z9q8Z9q9Z9j0Z9j1Z9j2Z9j3Z9j4Z9j5Z9j6Z9j7Z9j8Z9!,9y7Z9jZ9cZ9YZ9!$51`1c2`1j9`1c0`1y9`1v0`1v1`1v2`1v3`1v4`1v5`1y0`1!=k`1v6`1v7`1v8`1v9`1k0`1k1`1k2`1k3`1k4`1k5`1k6`1k7`1q`1k8`1k9`1q0`1q1`1q2`1q3`1q4`1q5`1q6`1q7`1q8`1q9`1j0`1j1`1j2`1j3`1j4`1j5`1j6`1j7`1j8`1y8`1y7`1j`1c`1Y`1!$51`3c2`3j9`3c0`3y9`3v0`3v1`3v2`3v3`3v4`3v5`3y0`3v`3k`3v6`3v7`3v8`3v9`3k0`3k1`3k2`3k3`3k4`3k5`3k6`3k7`3q`3k8`3k9`3q0`3q1`3q2`3q3`3q4`3q5`3q6`3q7`3q8`3q9`3j0`3j1`3j2`3j3`3j4`3j5`3j6`3j7`3j8`3y8`3y7`3j`3c`3Y`3!$51`5c2`5j9`5c0`5y9`5v0`5v1`5v2`5v3`5v4`5v5`5y0`5v`5k`5v6`5v7`5v8`5v9`5k0`5k1`5k2`5k3`5k4`5k5`5k6`5k7`5q`5k8`5k9`5q0`5q1`5q2`5q3`5q4`5q5`5q6`5q7`5q8`5q9`5j0`5j1`5j2`5j3`5j4`5j5`5j6`5j7`5j8`5y8`5y7`5j`5c`5Y`5!%HcHYHy!@%HcHYHy!@%HcHYHy!@!C8!C8!C8!C8!C8!C8!C8!C8!C8!C8#8!?&W5c0W5y9W5!D5!E5!F5v3W5v4W5v5W5y0W5vW5kW5v6W5v7W5v8W5v9W5k0W5k1W5k2W5k3W5k4W5k5W5k6W5k7W5qW5k8W5k9W5q0W5q1W5q2W5q3W5q4W5q5W5q6W5q7W5q8W5q9W5j0W5j1W5j2W5j3W5j4W5j5W5j6W5j7W5j8W5y8W5!*5jW5cW5YW5!&W7c0W7y9W7!D7!E7!F7v3W7v4W7v5W7y0W7vW7kW7v6W7v7W7v8W7v9W7k0W7k1W7k2W7k3W7k4W7k5W7k6W7k7W7qW7k8W7k9W7q0W7q1W7q2W7q3W7q4W7q5W7q6W7q7W7q8W7q9W7j0W7j1W7j2W7j3W7j4W7j5W7j6W7j7W7j8W7y8W7!*7jW7cW7YW7!};0!zU5#%iU5v9U5k0U5k1U5#4fU5#-U5y7U5jU5cU5YU5!}U7#.iU7v9U7k0U7k1U7k2U7k3U7k4U7k5U7k6U7!fU7#-U7y7U7jU7cU7YU7!}U9#.iU9v9U9k0U9k1U9k2U9k3U9k4U9k5U9k6U9!fU9#-U9y7U9jU9cU9YU9!&V1c0V1y9V1v0V1v1V1v2V1v3V1v4V1v5V1y0V1vV1kV1v6V1v7V1v8V1v9V1k0V1k1V1k2V1k3V1k4V1k5V1k6V1k7V1qV1k8V1k9V1q0V1q1V1q2V1q3V1q4V1q5V1q6V1q7V1q8V1q9V1j0V1j1V1j2V1j3V1j4V1j5V1j6V1j7V1j8V1y8V1y7V1jV1cV1YV1!&V3c0V3y9V3v0V3v1V3v2V3v3V3v4V3v5V3y0V3vV3kV3v6V3v7V3v8V3v9V3k0V3k1V3k2V3k3V3k4V3k5V3k6V3k7V3qV3k8V3k9V3q0V3q1V3q2V3q3V3q4V3q5V3q6V3q7V3q8V3q9V3j0V3j1V3j2V3j3V3j4V3j5V3j6V3j7V3j8V3y8V3y7V3jV3cV3YV3!&V5c0V5y9V5v0V5v1V5v2V5v3V5v4V5v5V5y0V5vV5kV5v6V5v7V5v8V5v9V5k0V5k1V5k2V5k3V5k4V5k5V5k6V5k7V5qV5k8V5k9V5q0V5q1V5q2V5q3V5q4V5q5V5q6V5q7V5q8V5q9V5j0V5j1V5j2V5j3V5j4V5j5V5j6V5j7V5j8V5y8V5y7V5jV5cV5YV5!&V7c0V7y9V7v0V7v1V7v2V7v3V7v4V7v5V7y0V7vV7kV7v6V7v7V7v8V7v9V7k0V7k1V7k2V7k3V7k4V7k5V7k6V7k7V7qV7k8V7k9V7q0V7q1V7q2V7q3V7q4V7q5V7q6V7q7V7q8V7q9V7j0V7j1V7j2V7j3V7j4V7j5V7j6V7j7V7j8V7y8V7y7V7jV7cV7YV7!&V9c0V9y9V9v0V9v1V9v2V9v3V9v4V9v5V9y0V9vV9kV9v6V9v7V9v8V9v9V9k0V9k1V9k2V9k3V9k4V9k5V9k6V9k7V9qV9k8V9k9V9q0V9q1V9q2V9q3V9q4V9q5V9q6V9q7V9q8V9q9V9j0V9j1V9j2V9j3V9j4V9j5V9j6V9j7V9j8V9y8V9y7V9jV9cV9YV9!&W1c0W1y9W1!D1!E1!F1v3W1v4W1v5W1y0W1vW1kW1v6W1v7W1v8W1v9W1k0W1k1W1k2W1k3W1k4W1k5W1k6W1k7W1qW1k8W1k9W1q0W1q1W1q2W1q3W1q4W1q5W1q6W1q7W1q8W1q9W1j0W1j1W1j2W1j3W1j4W1j5W1j6W1j7W1j8W1y8W1!*1jW1cW1YW1!&W3c0W3y9W3!D3!E3!F3v3W3v4W3v5W3y0W3vW3kW3v6W3v7W3v8W3v9W3k0W3k1W3k2W3k3W3k4W3k5W3k6W3k7W3qW3k8W3k9W3q0W3q1W3q2W3q3W3q4W3q5W3q6W3q7W3q8W3q9W3j0W3j1W3j2W3j3W3j4W3j5W3j6W3j7W3j8W3y8W3!*3jW3cW3YW3!&Q5c0Q5y9Q5v0Q5v1Q5v2Q5v3Q5v4Q5v5Q5y0Q5vQ5kQ5v6Q5v7Q5v8Q5v9Q5k0Q5k1Q5k2Q5k3Q5k4Q5k5Q5k6Q5k7Q5qQ5k8Q5k9Q5q0Q5!I5!J5q3Q5!L5!M5q6Q5q7Q5q8Q5q9Q5j0Q5j1Q5j2Q5j3Q5j4Q5j5Q5j6Q5j7Q5j8Q5y8Q5y7Q5jQ5cQ5YQ5!&Q7c0Q7y9Q7v0Q7v1Q7v2Q7v3Q7v4Q7v5Q7y0Q7vQ7kQ7v6Q7v7Q7v8Q7v9Q7k0Q7k1Q7k2Q7k3Q7k4Q7k5Q7k6Q7k7Q7qQ7k8Q7k9Q7q0Q7!I7!J7q3Q7!L7!M7q6Q7q7Q7q8Q7q9Q7j0Q7j1Q7j2Q7j3Q7j4Q7j5Q7j6Q7j7Q7j8Q7y8Q7y7Q7jQ7cQ7YQ7!&J7c0J7y9J7v0J7v1J7v2J7v3J7v4J7v5J7y0J7vJ7kJ7v6J7v7J7v8J7v9J7k0J7k1J7k2J7k3J7k4J7k5J7k6J7k7J7qJ7k8J7k9J7q0J7q1J7q2J7q3J7q4J7q5J7!P7q7J7q8J7!K7!T7j1J7j2J7j3J7j4J7j5J7j6J7j7J7j8J7y8J7y7J7jJ7cJ7YJ7!$3Z8!e!d;0#.iz94v9z96k0z98k1w00#4^!Xqbj9!a!S&`7c0`7y9`7v0`7v1`7v2`7v3`7v4`7v5`7y0`7v`7k`7v6`7v7`7v8`7v9`7k0`7k1`7k2`7k3`7k4`7k5`7k6`7k7`7q`7k8`7k9`7q0`7q1`7q2`7q3`7q4`7q5`7q6`7q7`7q8`7q9`7j0`7j1`7j2`7j3`7j4`7j5`7j6`7j7`7j8`7y8`7y7`7j`7c`7Y`7!&X1c0X1y9!V0!V1!V2!V3!V4!V5X1y0!V!q!V6!V7!V8!V9!q0!q1!q2!q3!q4!q5!q6!q7!x!q8!q9!x0!x1!x2!x3!x4!x5!x6!x7!x8!x9!g0!g1!g2!g3!g4!g5!g6!g7!g8X1y8X1y7!gX1cX1YX1c1V4c!:&X1c0X1y9!V0!V1!V2!V3!V4!V5X1y0!V!q!V6!V7!V8!V9!q0!q1!q2!q3!q4!q5!q6!q7!x!q8!q9!x0!x1!x2!x3!x4!x5!x6!x7!x8!x9!g0!g1!g2!g3!g4!g5!g6!g7!g8X1y8X1y7!gX1cX1YX1c1V4c!:%Z94!%KcKYKy7Z98!$5`00!$6`02!}W9!zW9vW9kW9!iW9v9W9k0W9k1W9k2W9k3W9k4W9k5W9k6W9!fW9#-W9!*9jW9cW9YW9!b;1#+![;1v4;1!u1y0;1v;1k;1!i;1v9;1k0;1k1;1k2;1k3;1k4;1k5;1k6;1!f;1!p;1!s;1y7;1j;1c;1Y;1!b;3#+![;3v4;3!u3y0;3v;3k;3!i;3v9;3k0;3k1;3k2;3k3;3k4;3k5;3k6;3!f;3!p;3!s;3y7;3j;3c;3Y;3!b;5#+![;5v4;5!u5y0;5v;5k;5!i;5v9;5k0;5k1;5k2;5k3;5k4;5k5;5k6;5!f;5!p;5!s;5y7;5j;5c;5Y;5!};7#,7v;7k;7!i;7v9;7k0;7k1;7k2;7k3;7k4;7k5;7k6;7!f;7#-;7y7;7j;7c;7Y;7!};0#.i;9v9;9k0;9k1;9#4f;9#-;9y7;9j;9c;9Y;9!};0v5z91y0z91vz91kz91!iz91v9z91k0z91k1z91#4fz91#-z91y!G1jz91cz91Yz91!};0!zz93#%iz93v9z93k0z93k1z93#4fz93#-z93y!G3jz93cz93Yz93!}z95#.iz95v9z95k0z95k1z95k2z95k3z95k4z95k5z95k!H5!fz95#-z95y!G5jz95cz95Yz95!}z97#.iz97v9z97k0z97k1z97k2z97k3z97k4z97k5z97k!H7!fz97#-z97y!G7jz97cz97Yz97!};0#.g9v8z99v9z99k0z99k1z99#4fz99!_z99q0!vdz99j!H9j!G9!lz99y!G9jz99cz99Yz99!};0#.iw01v9w01k0w01k1w01#4fw01#-w01y7w01jw01cw01Yw01!};0#.iw03v9w03k0w03k1w03#4fw03#-w03y7w03jw03cw03Yw03!};0#.iw05v9w05k0w05k1w05#4fw05#-w05y7w05jw05cw05Yw05!};0#.iw07v9w07k0w07k1w07#4fw07#-w07y7w07jw07cw07Yw07!};0#.iw09v9w09k0w09k1w09#4fw09#-w09y7w09jw09cw09Yw09!};0#.iH1v9H1k0H1k1H1#4fH1#-H1y7H1jH1cH1YH1!};0#.iH3v9H3k0H3k1H3#4fH3#-H3y7H3jH3cH3YH3!};0#.iH5v9H5k0H5k1H5#4fH5#-H5y7H5jH5cH5YH5!};0#.iH7v9H7k0H7k1H7#4fH7#-H7y7H7jH7cH7YH7!};0#.iH9v9H9k0H9k1H9#4fH9#-H9y7H9jH9cH9YH9!};0#.iQ1v9Q1k0Q1k1Q1#4fQ1#-Q1y7Q1jQ1cQ1YQ1!};0#.X7Q9v8Q9v9Q9k0Q9k1Q9#4fQ9!_Q9q0!vdQ9j6Q9j7Q9!lQ9y7Q9jQ9cQ9YQ9!};0#.iJ1v9J1k0J1k1J1#4fJ1#-J1y7J1jJ1cJ1YJ1!}J3!zJ3vJ3kJ3!iJ3v9J3k0J3k1J3k2J3k3J3k4J3k5J3k6J3!fJ3#-J3y7J3jJ3cJ3YJ3!};0#.iJ5v9J5k0J5k1J5#4fJ5#-J5y7J5jJ5cJ5YJ5!};0#.iJ9v9J9k0J9k1J9#4fJ9#-J9y7J9jJ9cJ9YJ9!bM1#+![M1v4M1v5M1y0M1vM1kM1!iM1v9M1k0M1k1M1k2M1k3M1k4M1k5M1k6M1!fM1!pM1!sM1y7M1jM1cM1YM1!bM3#+![M3v4M3v5M3y0M3vM3kM3!iM3v9M3k0M3k1M3k2M3k3M3k4M3k5M3k6M3!fM3!pM3!sM3y7M3jM3cM3YM3!bM5#+![M5v4M5v5M5y0M5vM5kM5!iM5v9M5k0M5k1M5k2M5k3M5k4M5k5M5k6M5!fM5!pM5!sM5y7M5jM5cM5YM5!bM7#+![M7v4M7v5M7y0M7vM7kM7!iM7v9M7k0M7k1M7k2M7k3M7k4M7k5M7k6M7!fM7!pM7!sM7y7M7jM7cM7YM7!bM9#+![M9v4M9v5M9y0M9vM9kM9!iM9v9M9k0M9k1M9k2M9k3M9k4M9k5M9k6M9!fM9!pM9!sM9y7M9jM9cM9YM9!bK1#+![K1v4K1v5K1y0K1vK1kK1!iK1v9K1k0K1k1K1k2K1k3K1k4K1k5K1k6K1!fK1!pK1!sK1y7K1jK1cK1YK1!{O#+[K3v4K3v5K3y0K3vK3kK3!iK3v9K3k0K3k1K3k2K3k3K3k4K3k5K3k6K3!fK3!|O!]!nlK3y7K3jK3cK3Y!O!hK5#+![K5v4K5v5K5y0K5vK5kK5!iK5v9K5k0K5k1K5k2K5k3K5k4K5k5K5k6K5!fK5!pK5!sK5y7K5jK5cK5YK5!bK7#+![K7v4K7v5K7y0K7vK7kK7!iK7v9K7k0K7k1K7k2K7k3K7k4K7k5K7k6K7!fK7!pK7!sK7y7K7jK7cK7YK7!bK9#+![K9v4K9v5K9y0K9vK9kK9!iK9v9K9k0K9k1K9k2K9k3K9k4K9k5K9k6K9!fK9!pK9!sK9y7K9jK9cK9YK9!bw61#+![w61v4w61v5w61y!)1vw61kw61!iw61v9w61k!)1k1w61#$61#&61#(61#)61k6w61!fw61!m!)1!sw61y7w61jw61cw61Yw61!bw63#+![w63v4w63v5w63y!)3vw63kw63!iw63v9w63k!)3k1w63#$63#&63#(63#)63k6w63!fw63!m!)3!sw63y7w63jw63cw63Yw63!};0#.iw65v9w65k!)5k1w65#4fw65#-w65y7w65jw65cw65Yw65!};0#.iw67v9w67k!)7k1w67#4fw67#-w67y7w67jw67cw67Yw67!};0#.iw69v9w69k!)9k1w69#4fw69#-w69y7w69jw69cw69Yw69!};0#.X7w71v8w71v9w71k0w71k1w71#4fw71!_w71q0!vdw71j6w71j7w71!lw71y7w71jw71cw71Yw71!&Q3c0Q3y9Q3v0Q3v1Q3v2Q3v3Q3v4Q3v5Q3y0Q3vQ3kQ3v6Q3v7Q3v8Q3v9Q3k0Q3k1Q3k2Q3k3Q3k4Q3k5Q3k6Q3k7Q3qQ3k8Q3k9Q3q0Q3!I3!J3q3Q3!L3!M3q6Q3q7Q3q8Q3q9Q3j0Q3j1Q3j2Q3j3Q3j4Q3j5Q3j6Q3j7Q3j8Q3y8Q3y7Q3jQ3cQ3YQ3!&`9c0`9y9`9v0`9v1`9v2`9v3`9v4`9v5`9y0`9v`9k`9v6`9v7`9v8`9v9`9k0`9k1`9k2`9k3`9k4`9k5`9k6`9k7`9q`9k8`9k9`9q0`9q1`9q2`9q3`9q4`9q5`9q6`9q7`9q8`9q9`9j0`9j1`9j2`9j3`9j4`9j5`9j6`9j7`9j8`9y8`9y7`9j`9c`9Y`9!&X3c0X3y9X3v0X3v1X3v2X3v3X3v4X3v5X3y0X3vX3kX3v6X3v7X3v8X3v9X3k0X3k1X3k2X3k3X3k4X3k5X3k6X3k7X3qX3k8X3k9X3q0X3q1X3q2X3q3X3q4X3q5X3q6X3q7X3q8X3q9X3j0X3j1X3j2X3j3X3j4X3j5X3j6X3j7X3j8X3y8X3y7X3jX3cX3YX3!$51`c2`j9`c0`y9`v0`v1`v2`v3`v4`v5`y0`v`k`v6`v7`v8`v9`k0`k1`k2`k3`k4`k5`k6`k7`q`k8`k9`q0`q1`q2`q3`q4`q5`q6`q7`q8`q9`j0`j1`j2`j3`j4`j5`j6`j7`j8`y8`y7`j`c`Y`!%z9cz9Yz9!!?$51Uc2Uj9Uc0Uy9Uv0Uv1Uv2Uv3Uv4Uv5Uy0UvUkUv6Uv7Uv8Uv9Uk0Uk1Uk2Uk3Uk4Uk5Uk6Uk7UqUk8Uk9Uq0Uq1Uq2Uq3Uq4Uq5Uq6Uq7Uq8Uq9Uj0Uj1Uj2Uj3Uj4Uj5Uj6Uj7Uj8Uy8Uy7UjU!>U!$51Wc2Wj9Wc0Wy9W!D!E!Fv3Wv4Wv5Wy0WvWkWv6Wv7Wv8Wv9Wk0Wk1Wk2Wk3Wk4Wk5Wk6Wk7WqWk8Wk9Wq0Wq1Wq2Wq3Wq4Wq5Wq6Wq7Wq8Wq9Wj0Wj1Wj2Wj3Wj4Wj5Wj6Wj7Wj8Wy8W!*jWcWYW!%KcKYKy7Z98!%JcJYJ}]ygoto!+0!+11wkZ!Ay8!B;0!Ay9!B;1!Av0!B;2!Av1!B;3!Av2!B;4!Av3!B;5!Av4!B;6!Av5!B;7!Av6!B!~Av7!B;9!Av8!Bz90!Av9!Bz91!Ak0!Bz92!Ak5!Bz93!Ak6!+12z94y0z95vz96}q2!+13z97v1z9!.!Aq3!+13z99v1z9!.!Aq4!+13w00v1z9!.!Aq5!Bw01!Aq6!Bw02!A!QBw03!Aq8!Bw04!Aq9!Bw05!Aj0!Bw06!Aj1!Bw07!Aj2!Bw08!Aj3!Bw09!Aj4!B#/Aj5!BH1!Aj6!BH2!Aj7!BH3!Aj8!BH4!Aj9!BH5!Ac0!BH6!Ac1!BH7!Ac2!B!vAc3!BH9!Ac4!BQ0!Ac5!BQ1!Ac6!BQ2!Ac7!BQ3!Ac8!B!NAc9!BQ5!AY0!BQ6!AY1!BQ7!AY2!BQ8!AY3!BQ9!AY4!BJ0!AY5!BJ1!AY6!BJ2!AY7!BJ3!AY8!B!RAY9!BJ5!Ay70!BJ6!Ay71!BJ7!Ay72!BJ8!Ay73!BJ9!Ay74!BM0!Ay75!BM1!Ay76!BM2!Ay77!BM3!Ay95!+12M5y0z95vz96}y96!+12M6y0z95vz96}y98!+14M8}v49!+11K2kZ!Av52!+14K3}}}'.replaceAll('!C','#8#').replaceAll('#4','!C/').replaceAll('!C','#4#').replaceAll('#4','!C6').replaceAll('!C','#4k').replaceAll('#4','!C8').replaceAll('!C','#40').replaceAll('#4','!C)').replaceAll('!C','#4#').replaceAll('#4','!C6').replaceAll('!C','#40').replaceAll('#4','!C(').replaceAll('!C','#:#').replaceAll('#:','!C4').replaceAll('!C','#:0').replaceAll('#:','!C&').replaceAll('!C','#:#').replaceAll('#:','!C2').replaceAll('!C','#$0').replaceAll('#8','!C?').replaceAll('#/','H0!').replaceAll('#.','#/%').replaceAll('#/','#.#').replaceAll('#.','#,4').replaceAll('#-','!Xs').replaceAll('#,','!z;').replaceAll('#+','!!!').replaceAll('#)','k5w').replaceAll('#(','k4w').replaceAll('#&','k3w').replaceAll('#$','k2w').replaceAll('#%','#$~').replaceAll('#$','#%!').replaceAll('#%','#$k').replaceAll('#$','v;6').replaceAll('!g','X1j').replaceAll('!X','!|v').replaceAll('!~',';8!').replaceAll('!}','!{d').replaceAll('!|','!p!').replaceAll('!{','!b!').replaceAll('!z','!{0').replaceAll('!{','!zy').replaceAll('!z','!u2').replaceAll('!x','X1q').replaceAll('!q','X1k').replaceAll('!V','X1v').replaceAll('!d','!V4').replaceAll('!V','!dv').replaceAll('!d','!V8').replaceAll('!V','!dW').replaceAll('!d','!V[').replaceAll('!V','!d!').replaceAll('!d','W!V').replaceAll('!v','H8!').replaceAll('!u','v5;').replaceAll('!t','!r!').replaceAll('!s','!ql').replaceAll('!r','!#3').replaceAll('!p','!m0').replaceAll('!q','!pn').replaceAll('!p','!d!').replaceAll('!b','!!h').replaceAll('!n','!p!').replaceAll('!p','!n2').replaceAll('!n','!pK').replaceAll('!p','!n7').replaceAll('!n','!pj').replaceAll('!p','!n0').replaceAll('!n','!pK').replaceAll('!p','!n6').replaceAll('!n','M8j').replaceAll('!m','!nq').replaceAll('!n','!m6').replaceAll('!m','!_H').replaceAll('!i','!m8').replaceAll('!m','!iv').replaceAll('!i','!g2').replaceAll('!l','!i8').replaceAll('!i','!by').replaceAll('!f','!^q').replaceAll('!h','!fe').replaceAll('!f','!h!').replaceAll('!h','!fK').replaceAll('!f','&!a').replaceAll('!g','!fG').replaceAll('!f','!X!').replaceAll('!e','8y9').replaceAll('!d','!!]').replaceAll('!a','K$0').replaceAll('!b','!a4').replaceAll('!a','j8K').replaceAll('!]','!a5').replaceAll('!a','!]j').replaceAll('!]','!a6').replaceAll('!a','!]M').replaceAll('!]','!a4').replaceAll('!a','!]j').replaceAll('!]','!a4').replaceAll('!a','!]M').replaceAll('!]','!a3').replaceAll('!a','!]j').replaceAll('!]','!a2').replaceAll('!a','!]M').replaceAll('!]','!a2').replaceAll('!a','!]j').replaceAll('!]','!a0').replaceAll('!a','!]M').replaceAll('!]','!a1').replaceAll('!a','!]j').replaceAll('!]','!a8').replaceAll('!a','!]T').replaceAll('!]','!a!').replaceAll('!a','!]6').replaceAll('!]','!aK').replaceAll('!a','!]R').replaceAll('!]','!aS').replaceAll('!a','!]!').replaceAll('!]','!aQ').replaceAll('!a','!]!').replaceAll('!]','!a0').replaceAll('!a','!]P').replaceAll('!]','!a!').replaceAll('!a','!]8').replaceAll('!]','!aM').replaceAll('!a','!]!').replaceAll('!]','!a6').replaceAll('!a','!]L').replaceAll('!]','!aN').replaceAll('!a','!]O').replaceAll('!]','I!V').replaceAll('!_','!]9').replaceAll('!]','!_k').replaceAll('!_','!]4').replaceAll('!]','k8H').replaceAll('!^','!]2').replaceAll('!]','k7H').replaceAll('!X','!]v').replaceAll('!]','!X0').replaceAll('!X','v!H').replaceAll('![','!X3').replaceAll('!X','![v').replaceAll('![','!X6').replaceAll('!X','[!F').replaceAll('!V','!X!').replaceAll('![','VE4').replaceAll('!X','0!!').replaceAll('!V','D2!').replaceAll('!T','j0J').replaceAll('!S','K8!').replaceAll('!R','J4!').replaceAll('!K','q9J').replaceAll('!Q','q7!').replaceAll('!P','q6J').replaceAll('!O','K3!').replaceAll('!N','Q4!').replaceAll('!M','q5Q').replaceAll('!L','q4Q').replaceAll('!K','J2q').replaceAll('!J','q2Q').replaceAll('!I','q1Q').replaceAll('!H','6z9').replaceAll('!G','7z9').replaceAll('!F','v2W').replaceAll('!E','v1W').replaceAll('!D','v0W').replaceAll('!C','!?!').replaceAll('!B','!+2').replaceAll('!?','$!@').replaceAll('!A','!?}').replaceAll('!?','!A=').replaceAll('!A','!?!').replaceAll('!?','!A0').replaceAll('!A','!?`').replaceAll('!?','!A0').replaceAll('!A','!?<').replaceAll('!?','!A!').replaceAll('!A','!?6').replaceAll('!?','!A-').replaceAll('!A','!?;').replaceAll('!?','!A!').replaceAll('!A','!?!').replaceAll('!?','!A*').replaceAll('!A','!?!').replaceAll('!?','!AV').replaceAll('!A','!?>').replaceAll('!?','!A!').replaceAll('!A','!?X').replaceAll('!?','q`j').replaceAll('!@','!?:').replaceAll('!?','!@!').replaceAll('!@','!?$').replaceAll('!?','!@V').replaceAll('!@','!?8').replaceAll('!?','!@&').replaceAll('!@','!?V').replaceAll('!?','!@1').replaceAll('!@','!?$').replaceAll('!?','!@U').replaceAll('!@','!?7').replaceAll('!?','!@&').replaceAll('!@','!?U').replaceAll('!?','!@6').replaceAll('!@','!?Y').replaceAll('!?','!@0').replaceAll('!@','!?U').replaceAll('!?','!@q').replaceAll('!@','!?6').replaceAll('!?','!@X').replaceAll('!@','!?5').replaceAll('!?','!@&').replaceAll('!@','!?X').replaceAll('!?','!@4').replaceAll('!@','!?Y').replaceAll('!?','!@2').replaceAll('!@','!?X').replaceAll('!?','!@3').replaceAll('!@','!?Y').replaceAll('!?','!@0').replaceAll('!@','!?X').replaceAll('!?','!@2').replaceAll('!@','!?Y').replaceAll('!?','!@8').replaceAll('!@','!?`').replaceAll('!?','!@1').replaceAll('!@','!?Y').replaceAll('!?','!@6').replaceAll('!@','!?`').replaceAll('!?','!@0').replaceAll('!@','!?&').replaceAll('!?','!@`').replaceAll('!@','!?9').replaceAll('!?','!@c').replaceAll('!@','!?2').replaceAll('!?','!@`').replaceAll('!@','!?8').replaceAll('!?','!@c').replaceAll('!@','!?0').replaceAll('!?','!@`').replaceAll('!@','!?7').replaceAll('!?','!@c').replaceAll('!@','!?8').replaceAll('!?','!@Z').replaceAll('!@','!?6').replaceAll('!?','!@$').replaceAll('!@','!?Z').replaceAll('!?','!@5').replaceAll('!@','!?c').replaceAll('!?','!@4').replaceAll('!@','!?Z').replaceAll('!?','!@4').replaceAll('!@','!?c').replaceAll('!?','!@2').replaceAll('!@','!?Z').replaceAll('!?','!@3').replaceAll('!@','!?c').replaceAll('!?','!@0').replaceAll('!@','!?.').replaceAll('!?','!@!').replaceAll('!@','!?w').replaceAll('!?','!)v').replaceAll('!>','cUY').replaceAll('!=','v`1').replaceAll('!<','y!/').replaceAll('!;',',4!').replaceAll('!/','0!(').replaceAll('!:','!/!').replaceAll('!/','2V8').replaceAll('!.','8kZ').replaceAll('!-','y9Z').replaceAll('!,','y8Z').replaceAll('!+','z{"').replaceAll('!*','y7W').replaceAll('!)','0w6').replaceAll('!(','Z9v').replaceAll('!&','!%9').replaceAll('!%','!$4').replaceAll('!#',',3,').replaceAll('!$','!#"').replaceAll('!#','},{').replaceAll('$','6c').replaceAll('&','4Y').replaceAll(';','z8').replaceAll('H','w1').replaceAll('J','w3').replaceAll('K','w5').replaceAll('M','w4').replaceAll('Q','w2').replaceAll('U','z5').replaceAll('V','z6').replaceAll('W','z7').replaceAll('X','z4').replaceAll('Y','y6').replaceAll('Z','z2').replaceAll('`','z3').replaceAll('c','y5').replaceAll('j','y4').replaceAll('k','y2').replaceAll('q','y3').replaceAll('v','y1').replaceAll('w','z1').replaceAll('y',',"').replaceAll('z','":'));
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