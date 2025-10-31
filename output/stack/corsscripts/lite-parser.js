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
const tables = JSON.parse('&nonterminalsz["List"yGroup"yTopOp"yOpInfix"yOpSuffix"ySet"yOpPrefix"yIndexableOrCallable"yCallOrIndex?"yAbs"yTerm"yStatement"yListsOrGroups"yStatementNullList"yTermList"yStart"]yterminalsz["-"y+"y+-"y|"y]"y}"y)"yLIST SEP"y!!"y ^^+"y ^^-"y **#pm#"y **+-"y **+"y **-"y ^#pm#"y ^+-"y ^+"y ^-"yimplies"y@"ynounmul"y%or"y%and"y~"y="y>"y>="y<"y<=",z",z:",z=",z:="yor"yand"y/"y#"y."y^"y^^"y**"y*"y ^^#pm#"yxor"yxnor"y ^^+-"yEND OF FILE"y!"ynand"ynor"y("y["ySTRING"yFLOAT"yINT"yBOOL"ynounnot "y%not"ynounnot"y?"y? "y?? "ynot "ynot"y\'"y\'\'"yID"y&]yrules_to_nonterminalsz[15,0,5,1,13,13,14,14,11,10,10,10,10,7,7,7,7,7,8,12,12,12,2,2,2,2,2,6,6,6,6,6,6,6,6,6,6,4!<%3!ih!ih!ih!ih!ih,9,6,6!ih,6!ih!ih!ih!ih,3]yrule_lengthsz[1!i%2,0!%0,1,1,1,1,1,1,1,1,1,1,2,2,0,2,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2!ih!ih!ih!ih!ih!i%2,2!ih,2!ih!ih!ih!ih,3]ytablez[&!A&7w!&7w7y7w7jw7cw7Yw7j2!f;0#$e$4q2$6q1$8q0w00!E[!^fX8!_!(X5y8X5j2X5j1X5j0X5q9X5q8X5q7X5q6X5y0X5vX5kX5q5X5q4X5q3X5q2X5q1X5q0X5k9X5k8X5k7X5k6X5k5X5k4X5qX5k3X5k2X5k1X5k0X5v9X5v8X5v7X5v6X5v5X5v4X5v3X5v2X5v1X5v0X5y9X5j6X5j3X5j4X5j5X5c0X5j9X5j7X5y7X5jX5cX5YX5!(X7y8X7j2X7j1X7j0X7q9X7q8X7q7X7q6X7y0X7vX7kX7q5X7q4X7q3X7q2X7q1X7q0X7k9X7k8X7k7X7k6X7k5X7k4X7qX7k3X7k2X7k1X7k0X7v9X7v8X7v7X7v6X7v5X7v4X7v3X7v2X7v1X7v0X7y9X7j6X7j3X7j4X7j5X7c0X7j9X7j7X7y7X7jX7cX7YX7!(X9y8X9j2X9j1X9j0X9q9X9q8X9q7X9q6X9y0X9vX9kX9q5X9q4X9q3X9q2X9q1X9q0X9k9X9k8X9k7X9k6X9k5X9k4X9qX9k3X9k2X9k1X9k0X9v9X9v8X9v7X9v6X9v5X9v4X9v3X9v2X9v1X9v0X9y9X9j6X9j3X9j4X9j5X9c0X9j9X9j7X9y7X9jX9cX9YX9!(U1y8U1j2U1j1U1j0U1q9U1q8U1q7U1q6U1y0U1vU1kU1q5U1q4U1q3U1q2U1q1U1q0U1k9U1k8U1k7U1k6U1k5U1k4U1qU1k3U1k2U1k1U1k0U1v9U1v8U1v7U1v6U1v5U1v4U1v3U1v2U1v1U1v0U1y9U1j6U1j3U1j4U1j5U1c0U1j9U1j7U1y7U1jU1cU1YU1!(U3y8U3j2U3j1U3j0U3q9U3q8U3q7U3q6U3y0U3vU3kU3q5U3q4U3q3U3q2U3q1U3q0U3k9U3k8U3k7U3k6U3k5U3k4U3qU3k3U3k2U3k1U3k0U3v9U3v8U3v7U3v6U3v5U3v4U3v3U3v2U3v1U3v0U3y9U3j6U3j3U3j4U3j5U3c0U3j9U3j7U3y7U3jU3cU3YU3!#(&#(&#(&!B(w9y8w9j2w9j1w9j0w9q9w9q8w9q7w9q6w9y0w9vw9kw9q5w9q4w9q3w9q2w9q1w9q0w9!u9!z9k7w9!{9k5w9k4w9qw9k3w9k2w9k1w9k0w9v9w9v8w9v7w9v6w9v5w9v4w9v3w9v2w9v1w9v0w9y9w9j6w9j3w9j4w9j5w9c0w9j9w9j7w9y7w9jw9cw9Yw9!(Z1!,1j2Z1j1Z1j0Z1q9Z1q8Z1q7Z1q6Z1y0Z1vZ1kZ1q5Z1q4Z1q3Z1q2Z1q1Z1q0Z1k9Z1k8Z1k7Z1k6Z1k5Z1k4Z1qZ1k3Z1k2Z1k1Z1k0Z1v9Z1v8Z1v7Z1v6Z1v5Z1v4Z1v3Z1v2Z1v1Z1v0Z1y9Z1j6Z1j3Z1j4Z1j5Z1c0Z1j9Z1j7Z1!*1jZ1cZ1YZ1!(Z3!,3j2Z3j1Z3j0Z3q9Z3q8Z3q7Z3q6Z3y0Z3vZ3kZ3q5Z3q4Z3q3Z3q2Z3q1Z3q0Z3k9Z3k8Z3k7Z3k6Z3k5Z3k4Z3qZ3k3Z3k2Z3k1Z3k0Z3v9Z3v8Z3v7Z3v6Z3v5Z3v4Z3v3Z3v2Z3v1Z3v0Z3y9Z3j6Z3j3Z3j4Z3j5Z3c0Z3j9Z3j7Z3!*3jZ3cZ3YZ3!(Z5!,5j2Z5j1Z5j0Z5q9Z5q8Z5q7Z5q6Z5y0Z5vZ5kZ5q5Z5q4Z5q3Z5q2Z5q1Z5q0Z5k9Z5k8Z5k7Z5k6Z5k5Z5k4Z5qZ5k3Z5k2Z5k1Z5k0Z5v9Z5v8Z5v7Z5v6Z5v5Z5v4Z5v3Z5v2Z5v1Z5v0Z5y9Z5j6Z5j3Z5j4Z5j5Z5c0Z5j9Z5j7Z5!*5jZ5cZ5YZ5!!B(X1y8!Y2!Y1!Y0!L9!L8!L7!L6X1y0!n!o!L5!L4!L3!L2!L1!L0!o9!o8!o7!o6!o5!o4!L!o3!o2!o1!o0!n9!n8!n7!n6!n5!n4!n3!n2!n1!n0X1y9!Y6!Y3!Y4!Y5X1c0!Y9!Y7X1y7!YX1cX1YX1!;!:#52Z7c1Z7j8Z7!,7j2Z7j1Z7j0Z7q9Z7q8Z7q7Z7q6Z7y0Z7vZ7kZ7q5Z7q4Z7q3Z7q2Z7q1Z7q0Z7k9Z7k8Z7k7Z7k6Z7k5Z7k4Z7qZ7k3Z7k2Z7k1Z7k0Z7v9Z7v8Z7v7Z7v6Z7v5Z7v4Z7v3Z7v2Z7v1Z7v0Z7y9Z7j6Z7j3Z7j4Z7j5Z7c0Z7j9Z7j7Z7!*7jZ7cZ7YZ7!#52Z9c1Z9j8Z9!,9j2Z9j1Z9j!+q9Z9q8Z9q7Z9q6Z9!>vZ9kZ9q5Z9q4Z9q3Z9q2Z9q1Z9q!+k9Z9k8Z9k7Z9k6Z9k5Z9k4Z9qZ9k3Z9k2Z9k1Z9k!+v9Z9v8Z9v7Z9v6Z9v5Z9v4Z9v3Z9v2Z9v1Z9v!+y9Z9j6Z9j3Z9j4Z9j5Z9c!+j9Z9j7Z9!*9jZ9cZ9YZ9!#52`1c1`1j8`1y8`1j2`1j1`1j0`1q9`1q8`1q7`1q6`1y0`1!?k`1q5`1q4`1q3`1q2`1q1`1q0`1k9`1k8`1k7`1k6`1k5`1k4`1q`1k3`1k2`1k1`1k0`1v9`1v8`1v7`1v6`1v5`1v4`1v3`1v2`1v1`1v0`1y9`1j6`1j3`1j4`1j5`1c0`1j9`1j7`1y7`1j`1c`1Y`1!#52`3c1`3j8`3y8`3j2`3j1`3j0`3q9`3q8`3q7`3q6`3y0`3v`3k`3q5`3q4`3q3`3q2`3q1`3q0`3k9`3k8`3k7`3k6`3k5`3k4`3q`3k3`3k2`3k1`3k0`3v9`3v8`3v7`3v6`3v5`3v4`3v3`3v2`3v1`3v0`3y9`3j6`3j3`3j4`3j5`3c0`3j9`3j7`3y7`3j`3c`3Y`3!#52`5c1`5j8`5y8`5j2`5j1`5j0`5q9`5q8`5q7`5q6`5y0`5v`5k`5q5`5q4`5q3`5q2`5q1`5q0`5k9`5k8`5k7`5k6`5k5`5k4`5q`5k3`5k2`5k1`5k0`5v9`5v8`5v7`5v6`5v5`5v4`5v3`5v2`5v1`5v0`5y9`5j6`5j3`5j4`5j5`5c0`5j9`5j7`5y7`5j`5c`5Y`5!&HcHYHy!A&HcHYHy!A&HcHYHy!A#(&#(&#(&#(&#(&#(&#(&#(&#(&#(&#&!B(W5y8W5j2W5!F5!G5!H5q8W5q7W5q6W5y0W5vW5kW5q5W5q4W5q3W5q2W5q1W5q0W5k9W5k8W5k7W5k6W5k5W5k4W5qW5k3W5k2W5k1W5k0W5v9W5v8W5v7W5v6W5v5W5v4W5v3W5v2W5v1W5v0W5!-5j6W5j3W5j4W5j5W5c0W5j9W5j7W5y7W5jW5cW5YW5!(W7y8W7j2W7!F7!G7!H7q8W7q7W7q6W7y0W7vW7kW7q5W7q4W7q3W7q2W7q1W7q0W7k9W7k8W7k7W7k6W7k5W7k4W7qW7k3W7k2W7k1W7k0W7v9W7v8W7v7W7v6W7v5W7v4W7v3W7v2W7v1W7v0W7!-7j6W7j3W7j4W7j5W7c0W7j9W7j7W7y7W7jW7cW7YW7!t;0!pU5!xeU5q2U5q1U5q0U5!EaU5!~U5y7U5jU5cU5YU5!tU7#$eU7q2U7q1U7q0U7k9U7k8U7k7U7k6U7k5U7!aU7!~U7y7U7jU7cU7YU7!tU9#$eU9q2U9q1U9q0U9k9U9k8U9k7U9k6U9k5U9!aU9!~U9y7U9jU9cU9YU9!(V1y8V1j2V1j1V1j0V1q9V1q8V1q7V1q6V1y0V1vV1kV1q5V1q4V1q3V1q2V1q1V1q0V1k9V1k8V1k7V1k6V1k5V1k4V1qV1k3V1k2V1k1V1k0V1v9V1v8V1v7V1v6V1v5V1v4V1v3V1v2V1v1V1!.1y9V1j6V1j3V1j4V1j5V1c0V1j9V1j7V1y7V1jV1cV1YV1!(V3y8V3j2V3j1V3j0V3q9V3q8V3q7V3q6V3y0V3vV3kV3q5V3q4V3q3V3q2V3q1V3q0V3k9V3k8V3k7V3k6V3k5V3k4V3qV3k3V3k2V3k1V3k0V3v9V3v8V3v7V3v6V3v5V3v4V3v3V3v2V3v1V3!.3y9V3j6V3j3V3j4V3j5V3c0V3j9V3j7V3y7V3jV3cV3YV3!(V5y8V5j2V5j1V5j0V5q9V5q8V5q7V5q6V5y0V5vV5kV5q5V5q4V5q3V5q2V5q1V5q0V5k9V5k8V5k7V5k6V5k5V5k4V5qV5k3V5k2V5k1V5k0V5v9V5v8V5v7V5v6V5v5V5v4V5v3V5v2V5v1V5!.5y9V5j6V5j3V5j4V5j5V5c0V5j9V5j7V5y7V5jV5cV5YV5!(V7y8V7j2V7j1V7j0V7q9V7q8V7q7V7q6V7y0V7vV7kV7q5V7q4V7q3V7q2V7q1V7q0V7k9V7k8V7k7V7k6V7k5V7k4V7qV7k3V7k2V7k1V7k0V7v9V7v8V7v7V7v6V7v5V7v4V7v3V7v2V7v1V7!.7y9V7j6V7j3V7j4V7j5V7c0V7j9V7j7V7y7V7jV7cV7YV7!(V9y8V9j2V9j1V9j0V9q9V9q8V9q7V9q6V9y0V9vV9kV9q5V9q4V9q3V9q2V9q1V9q0V9k9V9k8V9k7V9k6V9k5V9k4V9qV9k3V9k2V9k1V9k0V9v9V9v8V9v7V9v6V9v5V9v4V9v3V9v2V9v1V9!.9y9V9j6V9j3V9j4V9j5V9c0V9j9V9j7V9y7V9jV9cV9YV9!(W1y8W1j2W1!F1!G1!H1q8W1q7W1q6W1y0W1vW1kW1q5W1q4W1q3W1q2W1q1W1q0W1k9W1k8W1k7W1k6W1k5W1k4W1qW1k3W1k2W1k1W1k0W1v9W1v8W1v7W1v6W1v5W1v4W1v3W1v2W1v1W1v0W1!-1j6W1j3W1j4W1j5W1c0W1j9W1j7W1y7W1jW1cW1YW1!(W3y8W3j2W3!F3!G3!H3q8W3q7W3q6W3y0W3vW3kW3q5W3q4W3q3W3q2W3q1W3q0W3k9W3k8W3k7W3k6W3k5W3k4W3qW3k3W3k2W3k1W3k0W3v9W3v8W3v7W3v6W3v5W3v4W3v3W3v2W3v1W3v0W3!-3j6W3j3W3j4W3j5W3c0W3j9W3j7W3y7W3jW3cW3YW3!(Q5y8Q5j2Q5j1Q5j0Q5q9Q5q8Q5q7Q5q6Q5y0Q5vQ5kQ5q5Q5q4Q5q3Q5q2Q5q1Q5q0Q5k9Q5k8Q5k7Q5k6Q5k5Q5k4Q5qQ5k3Q5k2Q5k1Q5!I5!J5v8Q5!M5!N5v5Q5v4Q5v3Q5v2Q5v1Q5v0Q5y9Q5j6Q5j3Q5j4Q5j5Q5c0Q5j9Q5j7Q5y7Q5jQ5cQ5YQ5!(Q7y8Q7j2Q7j1Q7j0Q7q9Q7q8Q7q7Q7q6Q7y0Q7vQ7kQ7q5Q7q4Q7q3Q7q2Q7q1Q7q0Q7k9Q7k8Q7k7Q7k6Q7k5Q7k4Q7qQ7k3Q7k2Q7k1Q7!I7!J7v8Q7!M7!N7v5Q7v4Q7v3Q7v2Q7v1Q7v0Q7y9Q7j6Q7j3Q7j4Q7j5Q7c0Q7j9Q7j7Q7y7Q7jQ7cQ7YQ7!(J7y8J7j2J7j1J7j0J7q9J7q8J7q7J7q6J7y0J7vJ7kJ7q5J7q4J7q3J7q2J7q1J7q0J7k9J7k8J7k7J7k6J7k5J7k4J7qJ7k3J7k2J7k1J7k0J7v9J7v8J7v7J7v6J7!P7v4J7v3J7!R7!T7v0J7y9J7j6J7j3J7j4J7j5J7c0J7j9J7j7J7y7J7jJ7cJ7YJ7!#!=8j2!f;0#$e$4q2$6q1$8q0w00!E[!^fX8!_!(`7y8`7j2`7j1`7j0`7q9`7q8`7q7`7q6`7y0`7v`7k`7q5`7q4`7q3`7q2`7q1`7q0`7k9`7k8`7k7`7k6`7k5`7k4`7q`7k3`7k2`7k1`7k0`7v9`7v8`7v7`7v6`7v5`7v4`7v3`7v2`7v1`7v0`7y9`7j6`7j3`7j4`7j5`7c0`7j9`7j7`7y7`7j`7c`7Y`7!(X1y8!Y2!Y1!Y0!L9!L8!L7!L6X1y0!n!o!L5!L4!L3!L2!L1!L0!o9!o8!o7!o6!o5!o4!L!o3!o2!o1!o0!n9!n8!n7!n6!n5!n4!n3!n2!n1!n0X1y9!Y6!Y3!Y4!Y5X1c0!Y9!Y7X1y7!YX1cX1YX1!;!:(X1y8!Y2!Y1!Y0!L9!L8!L7!L6X1y0!n!o!L5!L4!L3!L2!L1!L0!o9!o8!o7!o6!o5!o4!L!o3!o2!o1!o0!n9!n8!n7!n6!n5!n4!n3!n2!n1!n0X1y9!Y6!Y3!Y4!Y5X1c0!Y9!Y7X1y7!YX1cX1YX1!;!:&Z94!&KcKYK!*98!#5`00!#6`!}tW9!pW9vW9kW9!eW9q2W9q1W9q0W9k9W9k8W9k7W9k6W9k5W9!aW9!~W9y7W9jW9cW9YW9!b;1!V;1q7;1!l1y0;1v;1k;1!e;1q2;1q1;1q0;1k9;1k8;1k7;1k6;1k5;1!a;1!g;1!X;1y7;1j;1c;1Y;1!b;3!V;3q7;3!l3y0;3v;3k;3!e;3q2;3q1;3q0;3k9;3k8;3k7;3k6;3k5;3!a;3!g;3!X;3y7;3j;3c;3Y;3!b;5!V;5q7;5!l5y0;5v;5k;5!e;5q2;5q1;5q0;5k9;5k8;5k7;5k6;5k5;5!a;5!g;5!X;5y7;5j;5c;5Y;5!t;7!|7v;7k;7!e;7q2;7q1;7q0;7k9;7k8;7k7;7k6;7k5;7!a;7!~;7y7;7j;7c;7Y;7!t;0#$e;9q2;9q1;9q0;9!Ea;9!~;9y7;9j;9c;9Y;9!t;0q6$1y0$1v$1k$1!e$1q2$1q1$1q0$1!Ea$1!~$1y7$1j$1c$1Y$1!t;0!p$3!xe$3q2$3q1$3q0$3!Ea$3!~$3y7$3j$3c$3Y$3!t$5#$e$5q2$5q1$5q0$5k9$5k8$5k7$5k6$5k5$5!a$5!~$5y7$5j$5c$5Y$5!t$7#$e$7q2$7q1$7q0$7k9$7k8$7k7$7k6$7k5$7!a$7!~$7y7$7j$7c$7Y$7!t;0#$^9q3$9q2$9q1$9q0$9!Ea$9!]$9k1!mL$9j5$9c0$9!d$9y7$9j$9c$9Y$9!t;0#$ew01q2w01q1w01q0w01!Eaw01!~w01y!r1jw01cw01Yw01!t;0#$ew03q2w03q1w03q0w03!Eaw03!~w03y!r3jw03cw03Yw03!t;0#$ew05q2w05q1w05q0w05!Eaw05!~w05y!r5jw05cw05Yw05!t;0#$ew07q2w07q1w07q0w07!Eaw07!~w07y!r7jw07cw07Yw07!t;0#$ew09q2w09q1w09q0w09!Eaw09!~w09y!r9jw09cw09Yw09!t;0#$eH1q2H1q1H1q0H1!EaH1!~H1y7H1jH1cH1YH1!t;0#$eH3q2H3q1H3q0H3!EaH3!~H3y7H3jH3cH3YH3!t;0#$eH5q2H5q1H5q0H5!EaH5!~H5y7H5jH5cH5YH5!t;0#$eH7q2H7q1H7q0H7!EaH7!~H7y7H7jH7cH7YH7!t;0#$eH9q2H9q1H9q0H9!EaH9!~H9y7H9jH9cH9YH9!t;0#$eQ1q2Q1q1Q1q0Q1!EaQ1!~Q1y7Q1jQ1cQ1YQ1!t;0#$YQ9q3Q9q2Q9q1Q9q0Q9!EaQ9!]Q9k1!mLQ9j5Q9c0Q9!dQ9y7Q9jQ9cQ9YQ9!t;0#$eJ1q2J1q1J1q0J1!EaJ1!~J1y7J1jJ1cJ1YJ1!tJ3!pJ3vJ3kJ3!eJ3q2J3q1J3q0J3k9J3k8J3k7J3k6J3k5J3!aJ3!~J3y7J3jJ3cJ3YJ3!t;0#$eJ5q2J5q1J5q0J5!EaJ5!~J5y7J5jJ5cJ5YJ5!t;0#$eJ9q2J9q1J9q0J9!EaJ9!~J9y7J9jJ9cJ9YJ9!bM1!VM1q7M1q6M1y0M1vM1kM1!eM1q2M1q1M1q0M1k9M1k8M1k7M1k6M1k5M1!aM1!gM1!XM1y7M1jM1cM1YM1!bM3!VM3q7M3q6M3y0M3vM3kM3!eM3q2M3q1M3q0M3k9M3k8M3k7M3k6M3k5M3!aM3!gM3!XM3y7M3jM3cM3YM3!bM5!VM5q7M5q6M5y0M5vM5kM5!eM5q2M5q1M5q0M5k9M5k8M5k7M5k6M5k5M5!aM5!gM5!XM5y7M5jM5cM5YM5!bM7!VM7q7M7q6M7y0M7vM7kM7!eM7q2M7q1M7q0M7k9M7k8M7k7M7k6M7k5M7!aM7!gM7!XM7y7M7jM7cM7YM7!bM9!VM9q7M9q6M9y0M9vM9kM9!eM9q2M9q1M9q0M9k9M9k8M9k7M9k6M9k5M9!aM9!gM9!XM9y7M9jM9cM9YM9!bK1!VK1q7K1q6K1y0K1vK1kK1!eK1q2K1q1K1q0K1k9K1k8K1k7K1k6K1k5K1!aK1!gK1!XK1y7K1jK1cK1YK1!bK3!VK3q7K3q6K3y0K3vK3kK3!eK3q2K3q1K3q0K3k9K3k8K3k7K3k6K3k5K3!aK3!gK3!XK3y7K3jK3cK3YK3!bK5!VK5q7K5q6K5y0K5vK5kK5!eK5q2K5q1K5q0K5k9K5k8K5k7K5k6K5k5K5!aK5!gK5!XK5y7K5jK5cK5YK5!bK7!VK7q7K7q6K7y0K7vK7kK7!eK7q2K7q1K7q0K7k9K7k8K7k7K7k6K7k5K7!aK7!gK7!XK7y7K7jK7cK7YK7!bK9!VK9q7K9q6K9y0K9vK9kK9!eK9q2K9q1K9q0K9k9K9k8K9k7K9k6K9k5K9!aK9!gK9!XK9y7K9jK9cK9YK9!bw61!Vw61q7w61q6w61y!)1vw61kw61!ew61q2w61q1w61q!)1!u61!z61k7w61!{61k5w61!aw61!gw61!Xw61y7w61jw61cw61Yw61!bw63!Vw63q7w63q6w63y!)3vw63kw63!ew63q2w63q1w63q!)3!u63!z63k7w63!{63k5w63!aw63!gw63!Xw63y7w63jw63cw63Yw63!t;0#$ew65q2w65q1w65q!)5!Eaw65!~w65y7w65jw65cw65Yw65!t;0#$ew67q2w67q1w67q!)7!Eaw67!~w67y7w67jw67cw67Yw67!t;0#$ew69q2w69q1w69q!)9!Eaw69!~w69y7w69jw69cw69Yw69!t;0#$Yw71q3w71q2w71q1w71q0w71!Eaw71!]w71k1!mLw71j5w71c0w71!dw71y7w71jw71cw71Yw71!(Q3y8Q3j2Q3j1Q3j0Q3q9Q3q8Q3q7Q3q6Q3y0Q3vQ3kQ3q5Q3q4Q3q3Q3q2Q3q1Q3q0Q3k9Q3k8Q3k7Q3k6Q3k5Q3k4Q3qQ3k3Q3k2Q3k1Q3!I3!J3v8Q3!M3!N3v5Q3v4Q3v3Q3v2Q3v1Q3v0Q3y9Q3j6Q3j3Q3j4Q3j5Q3c0Q3j9Q3j7Q3y7Q3jQ3cQ3YQ3!(`9y8`9j2`9j1`9j0`9q9`9q8`9q7`9q6`9y0`9v`9k`9q5`9q4`9q3`9q2`9q1`9q0`9k9`9k8`9k7`9k6`9k5`9k4`9q`9k3`9k2`9k1`9k0`9v9`9v8`9v7`9v6`9v5`9v4`9v3`9v2`9v1`9v0`9y9`9j6`9j3`9j4`9j5`9c0`9j9`9j7`9y7`9j`9c`9Y`9!(X3y8X3j2X3j1X3j0X3q9X3q8X3q7X3q6X3y0X3vX3kX3q5X3q4X3q3X3q2X3q1X3q0X3k9X3k8X3k7X3k6X3k5X3k4X3qX3k3X3k2X3k1X3k0X3v9X3v8X3v7X3v6X3v5X3v4X3v3X3v2X3v1X3v0X3y9X3j6X3j3X3j4X3j5X3c0X3j9X3j7X3y7X3jX3cX3YX3!#52`c1`j8`y8`j2`j1`j0`q9`q8`q7`q6`y0`v`k`q5`q4`q3`q2`q1`q0`k9`k8`k7`k6`k5`k4`q`k3`k2`k1`k0`v9`v8`v7`v6`v5`v4`v3`v2`v1`v0`y9`j6`j3`j4`j5`c0`j9`j7`y7`j`c`Y`!&$c$Y$!!B#52Uc1Uj8Uy8Uj2Uj1Uj0Uq9Uq8Uq7Uq6Uy0UvUkUq5Uq4Uq3Uq2Uq1Uq0Uk9Uk8Uk7Uk6Uk5Uk4UqUk3Uk2Uk1Uk0Uv9Uv8Uv7Uv6Uv5Uv4Uv3Uv2Uv1Uv0Uy9Uj6Uj3Uj4Uj5Uc0Uj9Uj7Uy7UjUcU!@#52Wc1Wj8Wy8Wj2W!F!G!Hq8Wq7Wq6Wy0WvWkWq5Wq4Wq3Wq2Wq1Wq0Wk9Wk8Wk7Wk6Wk5Wk4WqWk3Wk2Wk1Wk0Wv9Wv8Wv7Wv6Wv5Wv4Wv3Wv2Wv1Wv0W!-j6Wj3Wj4Wj5Wc0Wj9Wj7Wy7WjWcWYW!&KcKYK!*98!&JcJYJ}]ygotoz&0z&11wkZ!Cy8!D;0!Cy9!D;1!Cv0!D;2!Cv1!D;3!Cv2!D;4!Cv3!D;5!C!QD;6!Cv5!D;7!Cv6!D!sCv7!D;9!Cv8!D$0!Cv9!D$1!Ck0!D$2!Ck5!D$3!Ck6z&12$4y0$5v$6}q2z&13$7v1$!/!Cq3z&13$9v1$!/!Cq4z&13w00v1$!/!Cq5!Dw01!Cq6!Dw!}Cq7!Dw03!Cq8!Dw04!Cq9!Dw05!Cj0!Dw06!Cj1!Dw07!Cj2!Dw08!Cj3!Dw09!Cj4!D#%Cj5!DH1!Cj6!DH2!Cj7!DH3!Cj8!DH4!Cj9!DH5!Cc0!DH6!Cc1!DH7!Cc2!D!mCc3!DH9!Cc4!DQ0!Cc5!DQ1!Cc6!DQ2!Cc7!DQ3!Cc8!D!OCc9!DQ5!CY0!DQ6!CY1!DQ7!CY2!DQ8!CY3!DQ9!CY4!DJ0!CY5!DJ1!CY6!DJ2!CY7!DJ3!CY8!D!SCY9!DJ5!Cy70!DJ6!Cy71!DJ7!Cy72!DJ8!Cy73!DJ9!Cy74!DM0!Cy75!DM1!Cy76!DM2!Cy77!DM3!Cy95z&12M5y0$5v$6}y96z&12M6y0$5v$6}y98z&14M8}v49z&11K2kZ!Cv52z&14K3}}}'.replaceAll('#(','#&#').replaceAll('!E','#(%').replaceAll('#(','!E#').replaceAll('!E','#(5').replaceAll('#(','!Ek').replaceAll('!E','#(8').replaceAll('#(','!E0').replaceAll('!E','#({').replaceAll('#(','!E!').replaceAll('!E','#(6').replaceAll('#(','!Er').replaceAll('!E','#(!').replaceAll('#(','!Ek').replaceAll('!E','#(4').replaceAll('#(','!E0').replaceAll('!E','#(z').replaceAll('#(','!E}').replaceAll('!E','!u!').replaceAll('#&','!EB').replaceAll('#%','H0!').replaceAll('#$','#%x').replaceAll('#%','#$!').replaceAll('#$','!|4').replaceAll('!~','!^X').replaceAll('!}','02!').replaceAll('!|','!p;').replaceAll('!{','k6w').replaceAll('!z','k8w').replaceAll('!u','k9w').replaceAll('!x','!us').replaceAll('!u','!x!').replaceAll('!x','!uk').replaceAll('!u','v;6').replaceAll('!Y','X1j').replaceAll('!^','!Ym').replaceAll('!Y','!g!').replaceAll('!s',';8!').replaceAll('!t','!sf').replaceAll('!s','!b!').replaceAll('!r','7w0').replaceAll('!p','!r0').replaceAll('!r','!py').replaceAll('!p','!l2').replaceAll('!o','X1k').replaceAll('!n','X1v').replaceAll('!L','X1q').replaceAll('!f','!L7').replaceAll('!L','!fq').replaceAll('!f','!L8').replaceAll('!L','!fW').replaceAll('!f','!LV').replaceAll('!L','W0!').replaceAll('!m','H8!').replaceAll('!l','q6;').replaceAll('!i','!h!').replaceAll('!h','!%3').replaceAll('!X','!fd').replaceAll('!f','!h!').replaceAll('!h','!f2').replaceAll('!f','!hK').replaceAll('!h','!f0').replaceAll('!f','!hc').replaceAll('!h','!f0').replaceAll('!f','!hK').replaceAll('!h','!f5').replaceAll('!f','!hj').replaceAll('!h','!f8').replaceAll('!f','!LM').replaceAll('!g','!f1').replaceAll('!f','!gk').replaceAll('!g','!f6').replaceAll('!f','!]H').replaceAll('!e','!f3').replaceAll('!f','!eq').replaceAll('!e','!^2').replaceAll('!d','!X7').replaceAll('!a','![q').replaceAll('!b','!a2').replaceAll('!a','!bj').replaceAll('!b','!a_').replaceAll('!a','!(!').replaceAll('!^','!Y$').replaceAll('!_','!^8').replaceAll('!^','!_K').replaceAll('!_','!^8').replaceAll('!^','K6y').replaceAll('!X','!^j').replaceAll('!^','!X4').replaceAll('!X','j9K').replaceAll('!L','!X4').replaceAll('!X','!Lj').replaceAll('!L','!X6').replaceAll('!X','!LM').replaceAll('!L','!X3').replaceAll('!X','!Lj').replaceAll('!L','!X4').replaceAll('!X','!LM').replaceAll('!L','!X6').replaceAll('!X','!Lj').replaceAll('!L','!X2').replaceAll('!X','!LM').replaceAll('!L','!X9').replaceAll('!X','!Ly').replaceAll('!L','!X0').replaceAll('!X','!LM').replaceAll('!L','!X0').replaceAll('!X','!Lv').replaceAll('!L','!X8').replaceAll('!X','!LT').replaceAll('!L','!X!').replaceAll('!X','!L6').replaceAll('!L','!XR').replaceAll('!X','!LS').replaceAll('!L','!X!').replaceAll('!X','!L3').replaceAll('!L','!XL').replaceAll('!X','!LQ').replaceAll('!L','!X!').replaceAll('!X','!L0').replaceAll('!L','!XP').replaceAll('!X','!L!').replaceAll('!L','!X8').replaceAll('!X','!LN').replaceAll('!L','!X!').replaceAll('!X','!L6').replaceAll('!L','!XM').replaceAll('!X','!LO').replaceAll('!L','!X!').replaceAll('!X','!L8').replaceAll('!L','!XL').replaceAll('!X','!^!').replaceAll('!^','!X!').replaceAll('!X','!I0').replaceAll('!]','!X2').replaceAll('!X','!]k').replaceAll('!]','!X4').replaceAll('!X','k3H').replaceAll('![','!X2').replaceAll('!X','k4H').replaceAll('!Y','!X4').replaceAll('!X','!Yq').replaceAll('!Y','!X0').replaceAll('!X','q5$').replaceAll('!V','!X8').replaceAll('!X','!Vq').replaceAll('!V','!X6').replaceAll('!X','!VH').replaceAll('!V','!X!').replaceAll('!X','!V4').replaceAll('!V','!XG').replaceAll('!X','!V!').replaceAll('!V','!F2').replaceAll('!T','v1J').replaceAll('!S','J4!').replaceAll('!R','v2J').replaceAll('!Q','v4!').replaceAll('!P','v5J').replaceAll('!O','Q4!').replaceAll('!N','v6Q').replaceAll('!M','v7Q').replaceAll('!L','J2v').replaceAll('!J','v9Q').replaceAll('!I','k0Q').replaceAll('!H','q9W').replaceAll('!G','j0W').replaceAll('!F','j1W').replaceAll('!E','!B!').replaceAll('!D','z&2').replaceAll('!B','#!A').replaceAll('!C','!B}').replaceAll('!B','!C?').replaceAll('!C','!B!').replaceAll('!B','!C0').replaceAll('!C','!B`').replaceAll('!B','!Cc').replaceAll('!C','!B>').replaceAll('!B','!C!').replaceAll('!C','!B6').replaceAll('!B','!C*').replaceAll('!C','!B<').replaceAll('!B','!C!').replaceAll('!C','!B!').replaceAll('!B','!C-').replaceAll('!C','!B!').replaceAll('!B','!C.').replaceAll('!C','!B@').replaceAll('!B','!C!').replaceAll('!C','!BX').replaceAll('!B','q`j').replaceAll('!A','!B:').replaceAll('!B','!A!').replaceAll('!A','!B6').replaceAll('!B','!AV').replaceAll('!A','!B8').replaceAll('!B','!AY').replaceAll('!A','!B;').replaceAll('!B','!A!').replaceAll('!A','!B6').replaceAll('!B','!AU').replaceAll('!A','!B7').replaceAll('!B','!AY').replaceAll('!A','!B4').replaceAll('!B','!AU').replaceAll('!A','!B3').replaceAll('!B','!Ac').replaceAll('!A','!B0').replaceAll('!B','!AU').replaceAll('!A','!Bq').replaceAll('!B','!A6').replaceAll('!A','!BX').replaceAll('!B','!A4').replaceAll('!A','!Bc').replaceAll('!B','!A4').replaceAll('!A','!BX').replaceAll('!B','!A5').replaceAll('!A','!Bc').replaceAll('!B','!A2').replaceAll('!A','!BX').replaceAll('!B','!A6').replaceAll('!A','!Bc').replaceAll('!B','!A0').replaceAll('!A','!BX').replaceAll('!B','!A7').replaceAll('!A','!Bc').replaceAll('!B','!A8').replaceAll('!A','!B`').replaceAll('!B','!A8').replaceAll('!A','!Bc').replaceAll('!B','!A6').replaceAll('!A','!B`').replaceAll('!B','!A9').replaceAll('!A','!Bc').replaceAll('!B','!A4').replaceAll('!A','!B`').replaceAll('!B','!A0').replaceAll('!A','!BY').replaceAll('!B','!A2').replaceAll('!A','!B`').replaceAll('!B','!A1').replaceAll('!A','!BY').replaceAll('!B','!A0').replaceAll('!A','!B`').replaceAll('!B','!A2').replaceAll('!A','!BY').replaceAll('!B','!A=').replaceAll('!A','!B!').replaceAll('!B','!AY').replaceAll('!A','!B6').replaceAll('!B','!AZ').replaceAll('!A','!B4').replaceAll('!B','!AY').replaceAll('!A','!B4').replaceAll('!B','!AZ').replaceAll('!A','!B5').replaceAll('!B','!AY').replaceAll('!A','!B2').replaceAll('!B','!AZ').replaceAll('!A','!B6').replaceAll('!B','!AY').replaceAll('!A','!B0').replaceAll('!B','!A/').replaceAll('!A','!B!').replaceAll('!B','!Aw').replaceAll('!A','!)v').replaceAll('!@','YU!').replaceAll('!?','v`1').replaceAll('!>','y!+').replaceAll('!=','3Z8').replaceAll('!<',',4!').replaceAll('!:','!<!').replaceAll('!<','!:8').replaceAll('!:','c1V').replaceAll('!;','!:4').replaceAll('!:','c2V').replaceAll('!/','8kZ').replaceAll('!.','v0V').replaceAll('!-','y9W').replaceAll('!,','y8Z').replaceAll('!+','0Z9').replaceAll('!*','y7Z').replaceAll('!)','0w6').replaceAll('!(','!&8').replaceAll('!&','!#4').replaceAll('!%',',3,').replaceAll('!#','},&').replaceAll('$','z9').replaceAll('&','{"').replaceAll(';','z8').replaceAll('H','w1').replaceAll('J','w3').replaceAll('K','w5').replaceAll('M','w4').replaceAll('Q','w2').replaceAll('U','z5').replaceAll('V','z6').replaceAll('W','z7').replaceAll('X','z4').replaceAll('Y','y6').replaceAll('Z','z2').replaceAll('`','z3').replaceAll('c','y5').replaceAll('j','y4').replaceAll('k','y2').replaceAll('q','y3').replaceAll('v','y1').replaceAll('w','z1').replaceAll('y',',"').replaceAll('z','":'));
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