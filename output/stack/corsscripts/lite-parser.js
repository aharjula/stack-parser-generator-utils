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
			opt = {'functions': {}, 'variables': {}, 'operators' : {}};
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
			'root': (args, o) => args.length === 1 ? 'Math.sqrt(' + args[0].translate(o) + ')' : 'Math.pow(' + args[0].translate(o) + ',1.0/(' + args[1].translate(o) + '))',
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
			'^': (lhs, rhs, o) => 'Math.pow(' + lhs.translate(o) + ',' + rhs.translate(o) + ')',
			'**': (lhs, rhs, o) => 'Math.pow(' + lhs.translate(o) + ',' + rhs.translate(o) + ')',
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
			opt = {'functions': {}, 'variables': {}, 'operators' : {}};
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
			'xor' : (lhs, rhs, o) => 'JXG.Math.xor(' + lhs.translate(o) + ',' + rhs.translate(o) + ')',
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
const tables = JSON.parse('{"nonterminalsz["List"yGroup"yOpSuffix"yTerm"yOpInfix"yAbs"ySet"yCallOrIndex?"yOpPrefix"yTopOp"yIndexableOrCallable"yStatement"yListsOrGroups"yStatementNullList"yTermList"yStart"]yterminalsz["+-"y+"y-"y|"y]"y)"y}"yLIST SEP"y ^#pm#"yxnor"y<",z:="y>="y%and"y*"y#"y~"y ^^+"y ^^-"y>"y **+-"y**"y ^+-"y ^^+-"ynand"y/",z="y%or"y **#pm#"y^^"yxor",z"y@"yand"ynounmul"y ^^#pm#"y **-"yEND OF FILE"y^"ynor"y!!"y="y<=",z:"y!"y."y ^+"yor"yimplies"y **+"y ^-"y["y("y? "y?"y\'"ynounnot"ynot"y\'\'"y?? "yID"y%not"y{"yBOOL"ynot "ynounnot "yINT"ySTRING"yFLOAT"]yrules_to_nonterminalsz[15,0,6,1,13,13,14,14,11!-3,3,10,10,10,10,10,7,12,12,12,9,9,9,9,9,8,8,8,8,8,8,8,8,8,8,2,2#E!L#E!L,!L,4,5,8,8,!L,4,8#E!L#E4,4]yrule_lengthsz[1!-3,2,0,3,0#%1#%1,1,1,2,2,0,2#%1,1,2,2,2,2,2,2,2,2,2,2,2,2!-3!-3!-3!-3!-3!-3!-3!-2,2!-3,3,2!-3!-3!-3!-3!-3,3,3]ytablez[{"51Q!n$+u!Y$o|C#wg!/!a!`#&P!m#$)!Q!fe!^&"49Z3YZ3k0Z3k7Z3c0Z3y9Z3!rv0Z3k5Z3k9Z3v8Z3j0Z3j5Z3j3Z3q6Z3q4Z3k6Z3q7Z3v1Z3k1Z3y8Z3!&3v7Z3c1Z3j7Z3k2Z3vZ3k4Z3v9Z3j1Z3q0Z3cZ3v6Z3v5Z3jZ3v4Z3j2Z3q3Z3y7Z3j6Z3y0Z3q1Z3v3Z3q9Z3q2Z3q8Z3j8Z3q5Z3k8Z3v2Z3k3Z3kZ3j4Z3&"!x/!C!`!u$FJ$:P!Q#wT#&n$og!e!|fa$*Y&"60V8!`!fJ#$e$+)$FY#&u!C$oP!|Q$*g!a!/!n&"64;!O%E!u$*n!g!e!_#wa!`$+/#$C!Q!J!P!^#&)%&4`6!`$+g!J!n!e!P!/$F_#$m!|C!Q!Y!f[#wa!u&"4`3q9`3j6`3k5`3k0`3j9`3y8`3q1`3q8`3k9`3q7`3q6`3v0`3!:3j7`3v7`3v9`3k3`3j2`3q`3y7`3v4`3k2`3v1`3j3`3v3`3Y`3k4`3v8`3k7`3k1`3q0`3j8`3q3`3q5`3q4`3j1`3y9`3v2`3j4`3v5`3k6`3j0`3v`3k8`3v6`3k`3c0`3q2`3j5`3c`3&"41Z5j2Z5j8Z5c0Z5j4Z5q3Z5cZ5c1Z5k0Z5k7Z5v1Z5q6Z5kZ5jZ5q5Z5j9Z5q2Z5k4Z5!&5vZ5q9Z5k6Z5v4Z5v7Z5k1Z5y7Z5q8Z5v5Z5y0Z5v9Z5j5Z5q7Z5y8Z5v0Z5k9Z5YZ5v6Z5k8Z5q1Z5j0Z5k5Z5v3Z5q0Z5y9Z5j6Z5j7Z5k3Z5q4Z5v2Z5v8Z5j3Z5qZ5k2Z5$UE!,jw1$:e!n!P!g!Y#&m!J!a!f`!_cw1#$^!/!QYw1$+C!O&"30X1cX1y7$>9$>0$L7$R$}5$R6$}6$R0$R3$>$L6$}$}9$}1$>8$L4X1y0$}2$L3$L8$R1$>2$R9$}4X1c0$>6$>3$}7$L$}8$L0X1!Jv5$R8X1y8X1!/q2$>5$L9$L2$L1$R7$>4$R4X1y9$>7X1Y$R5$>1$}3X1%&0W0%($%!S#(%8$N#>%D$t!?#|!w%-#f!#!d#Z#-!$!h#V$;y7w7k1w74!<#B!M#G!H#ov1$0$=Yw7jw7%*!t!lk7w7#A!sj3K6cw7#xq6J8!+#.#W!b#N$UF!/!P!J#&e!|_$+a%E$*Q!C$:n#$u$FY!`!,%&3X!P!Y$ou!e!,#&|C!)#$^!Q$+/$*fa!g!`!J$UE%E$*n#w_!g#$Q!/!`!^$+e$:P!Y!|J#&C!a&"1`8!n!/!|J!a#$f)!e!g!Y$oQ!C$FP#&`#wT!u&"24`7k7`7k0`7v3`7q1`7v0`7q7`7q9`7k9`7j1`7j9`7c0`7j8`7q`7j3`7j0`7v8`7c`7j`7!:7q5`7v1`7j2`7k`7c2`7v9`7j4`7v5`7y8`7q3`7y7`7y9`7q6`7c1`7q2`7v`7q8`7k6`7k3`7q0`7k8`7k5`7j7`7k2`7v4`7k1`7v2`7k4`7j6`7Y`7j5`7v6`7v7`7&"6w1!Q%<n![jw1%Ecw1$:|m!/!a!J!g#wP$+^!Y!e!_#$`!C%&!@#$C$F/!e!P#&a$:Y!Q$+`%<g!n$oJ#w|m$U=!fP#$_!u#&Q$*g!Y$Fa!J!C!)$+|`!/#wn&"7X9v7X9v2X9j2X9j9X9j5X9q2X9k8X9cX9k0X9v0X9j4X9y0X9j3X9y8X9j0X9v5X9c0X9k5X9v4X9v3X9y9X9q4X9q3X9j1X9k1X9qX9vX9jX9q7X9k9X9k2X9kX9k7X9q5X9j6X9j7X9q6X9q9X9v8X9k6X9q1X9v1X9YX9v9X9v6X9q8X9j8X9k3X9q0X9k4X9%&3X#&/!`$+C$oYy!>Yw1!e%<g!P%Ejw1#wa!|mcw1!^$:Q!J&"14M3q5M3q9M3j5M3q1M3YM3k7M3vM3v8M3k2M3y7M3q8M3k3M3k1M3k9M3k8M3v2M3kM3y9M3j2M3c0M3j7M3q7M3q6M3jM3k6M3j6M3j9M3j0M3cM3v6M3q4M3v9M3v0M3v5M3qM3j4M3j3M3q0M3v7M3v3M3y8M3q2M3v1M3j8M3j1M3y0M3k4M3q3M3k0M3k5M3&"33`1k9`1q0`1v2`1k6`1k8`1v3`1v6`1v1`1k4`1j8`1j2`1k`1q8`1v`1v4`1q6`1j9`1v5`1y7`1j6`1q`1j1`1!ik2`1v7`1v8`1y8`1k0`1k5`1q2`1j7`1j4`1v9`1q5`1q9`1k1`1c0`1q3`1k7`1y9`1j3`1Y`1q4`1q7`1q1`1j5`1j0`1j`1!:1v0`1%&1Q!n!/!|a$oP!u#$,!Y!Q!`$FC![%E!g!e!T$*)%&!G$*C$FY!O#$u$:g!J!a!`#wQ!/#&n!P!f_!e&"29M1YM1v1M1k3M1q7M1q8M1q5M1j2M1y7M1j8M1c0M1y0M1q6M1jM1y9M1v3M1j6M1j9M1k8M1qM1j1M1k2M1v8M1j0M1k1M1v6M1kM1k7M1q1M1k0M1y8M1k5M1k9M1j5M1v9M1v5M1k4M1j3M1cM1v0M1vM1k6M1q4M1q3M1j4M1q0M1v2M1q2M1v4M1v7M1j7M1&"0Z1j!.kZ1vZ1k1Z1q5Z1j9Z1v5Z1v0Z1!~q!.j6Z1k9Z1k!.c1Z1y8Z1v6Z1k2Z1j8Z1v4Z1v8Z1q8Z1j0Z1j2Z1j1Z1j4Z1cZ1v3Z1qZ1k4Z1v9Z1k3Z1j5Z1q2Z1q0Z1k0Z1YZ1v!.j3Z1v2Z1v1Z1q1Z1y9Z1k6Z1!&1q3Z1q6Z1k5Z1k8Z1jZ1q9Z1q4Z1c0Z1&"43w9k5w9q4w9v1w9!*j1w9k0w9j5w9q6w9v5w9j0w9q2w9v7w9k3w9q9w9vw9v2w9q8w9j2w9v0w9q0w9k7w9y9w9q7w9j6w9kw9v6w9Yw9j7w9v8w9y0w9qw9q3w9k1w9k2w9jw9cw9v9w9q1w9v3w9v4w9q5w9j9w9k6w9k9w9c0w9j4w9k4w9j8w9k8w9y7w9&"3X6!|P!n!Y!`!J$*/!^#we$+g$:Q#$f[%<a!C&"39X5q0X5v0X5j9X5k4X5y9X5q1X5y0X5YX5q7X5k0X5k2X5j0X5k8X5v7X5j8X5qX5v9X5vX5v5X5k6X5y7X5v4X5k3X5c0X5k7X5j7X5v8X5cX5kX5v3X5v1X5j3X5k1X5q9X5q4X5v6X5j1X5j6X5y8X5j4X5q2X5j2X5j5X5q6X5q3X5jX5k5X5q5X5v2X5q8X5%&!@!P#wQ#&|C$:Y$*e!J!/!g#$u!_$F`!a!n!T&"20`5c0`5q9`5v9`5j1`5!:5k2`5k1`5k9`5y9`5q2`5j`5y7`5v3`5j9`5c`5k4`5y8`5j8`5Y`5q7`5q6`5j6`5v1`5v5`5k7`5j5`5q`5v8`5k6`5k3`5q3`5j2`5v2`5k0`5v7`5j3`5q8`5v`5j7`5j0`5j4`5v0`5q4`5v4`5k5`5q1`5k8`5q5`5!zv6`5&"37w&"4X7v2X7k4X7j7X7q3X7j3X7k0X7j2X7c0X7j6X7j1X7v5X7k9X7v6X7j4X7y8X7YX7q8X7j0X7y9X7v7X7y7X7k8X7v1X7v0X7v9X7k5X7j5X7q5X7cX7v3X7q4X7q1X7q6X7k6X7v8X7kX7j8X7q9X7y0X7k3X7qX7q2X7v4X7vX7k1X7q7X7j9X7q0X7k2X7k7X7&"43`9c1`9q5`9v7`9q`9v2`9j5`9j0`9j8`9k4`9k1`9y9`9!:9k5`9c2`9q7`9v1`9v6`9q1`9k7`9v5`9y8`9c`9k8`9k6`9q2`9j4`9j2`9k0`9c0`9q0`9v3`9k3`9v4`9j7`9!{Y`9v`9k9`9q3`9q6`9q9`9j6`9v8`9q8`9k`9j9`9k2`9j1`9v9`9q4`9y7`9v0`9&"31U1k9U1k4U1v5U1qU1j3U1v2U1k7U1v1U1k0U1y0U1q2U1j6U1k6U1j4U1v0U1q9U1k8U1k3U1v7U1cU1kU1y9U1vU1y7U1jU1c0U1j9U1j5U1q8U1j1U1q4U1q3U1y8U1v8U1j0U1k2U1j2U1q0U1k5U1q6U1YU1q7U1j7U1v6U1v9U1v3U1q1U1v4U1q5U1j8U1&"39V3y7V3j0V3k4V3v5V3k6V3v4V3y0V3q2V3qV3q7V3j2V3j3V3k2V3v8V3j6V3y8V3q3V3v1V3jV3q5V3v2V3k1V3k7V3v7V3j1V3v3V3c0V3q0V3j4V3YV3cV3k8V3k3V3j5V3k5V3kV3j8V3q4V3vV3v6V3q8V3j9V3k0V3v9V3j7V3q6V3q1V3q9V3y9V3v0V3&"6V1j2V1qV1q4V1q9V1k4V1k6V1k3V1jV1k1V1v9V1q2V1k8V1q7V1y0V1kV1q1V1v7V1v8V1q8V1y7V1j0V1j5V1cV1v6V1q6V1v1V1k0V1j6V1v5V1q0V1j4V1v0V1k2V1vV1y9V1j3V1q3V1v4V1v3V1k5V1j9V1q5V1j8V1y8V1j1V1k9V1c0V1v2V1k7V1j7V1&"35V7v2V7q2V7cV7v3V7jV7q6V7k4V7k3V7j7V7q4V7y9V7j4V7j5V7k2V7q5V7v0V7YV7k0V7v8V7q7V7j0V7vV7k6V7j2V7j8V7j6V7k7V7y0V7q8V7j9V7q1V7y7V7v9V7k1V7q3V7q0V7j3V7v4V7j1V7k8V7v7V7v1V7kV7qV7v6V7v5V7y8V7q9V7k9V7c0V7&"4JYJcJy7`02&"4`06&"34Z7q0Z7j9Z7j3Z7jZ7v6Z7q2Z7k8Z7kZ7j4Z7y8Z7j7Z7cZ7v0Z7v2Z7YZ7j5Z7v3Z7c0Z7q8Z7k2Z7k9Z7k1Z7j0Z7j8Z7k6Z7y7Z7j1Z7q6Z7v1Z7v5Z7q4Z7v4Z7q1Z7j2Z7k5Z7v9Z7q3Z7qZ7v8Z7y9Z7k7Z7k0Z7y0Z7j6Z7q9Z7q7Z7k3Z7q5Z7v7Z7vZ7&"20$R4X1c$L7$R$>4$L2$}8$}4$}$>3$R6$>0$R7$L1X1y0$}7$}6$}3$L9$L6$R1$>6$>5$>$}1$L4$R9X1Y$L3X1y7$R8$R3$}9$}5X1y8$}2X1y9X1!/v8$>7X1!Jq2$>1$L5$L0$R5$>9$>8$>2$}0X1c0$LX1&"32$L0$R9$}1X1Y$>7$R1X1y9$R3$R0$L6X1y0$}3X1y8$L9$L3$>1X1c$L4$>5$>0$>$L5$}$L8$R8X1y7$R$>9$>2$>3X1!/k7X1!Jk0$R7$R4$L7$R2$>4$L$}8$}4X1c0$}9$L1$}5$}6$R5$>6$R6$>8$L2X1&"42U7q3U7j8U7kU7jU7q9U7k6U7y9U7q8U7v6U7v5U7v8U7v4U7j3U7q0U7v0U7c0U7q7U7j7U7vU7k4U7cU7k7U7k0U7j0U7v9U7j6U7q1U7k8U7q5U7k9U7q6U7v7U7v3U7v1U7k1U7q2U7j9U7y7U7j5U7YU7j4U7qU7v2U7q4U7y0U7y8U7k2U7k3U7k5U7j1U7&"1`8#$)!C#wfa%</!g#&^!|Y!e!P$+Q!n!`$oJ%&4`6!C$FP#&J!|g%<`#$T!Y!/!_#wn$*a!Q!e%E$U=!n#$P!J#&g$F|T$*/!a%E%<Q!)#wC$oY!`%&!B!m#$`!g#&P#wa!J%<|n!e$F/$ofT!C!Y!)&"!xP$FJ!/!Q!C!,%E%<g$+`$oe$:n!Y#&m!a!O$UF!|Y$F/#$C!a!n$oQ%<f,!`$+e$*J!P$:[$UD$og$:`#$O$*/!a!n!J!C#&,!e%<Q!fP$+Y&"64;!n%<g$*_$:^!Q!|a!C#wP!/!J$+`![#$e%E&"2`4$+P!/!^#&f`!e!|,!Y$og!C$*n$:J!Q!uy!>%&3X$+f,!Y$:|u#&C!J!`!Q!_$*e!P!g!a!/!^y!>&"30U5q8U5vU5j0U5j8U5k3U5q9U5v5U5cU5q0U5q4U5k1U5qU5v2U5v4U5v0U5kU5y0U5v3U5y9U5k6U5v1U5j4U5q2U5j9U5j1U5j7U5v9U5j5U5YU5k9U5j6U5k7U5v6U5k8U5q1U5k5U5c0U5y7U5v8U5q3U5y8U5v7U5q7U5q5U5j2U5k4U5k2U5q6U5jU5j3U5&"1`8!/!n!g%<|e#$`$ofC$+J!P#w)!^#&Q!Y!a%&5V!T$*_!g!J$FC!n#&Q#wu!f`!Y#$/!|)!e!a&"64;!n#$,$:Q!/!P!a$Fe%<fT!`!|m#&C$og!J&"2`4#w/#&`!e%<Y%E!n#$J!^$*|g$+Q$:C!P!_%&!@!|e!`!g!Q#wY$*_#$)#&^!n!P!a$+u!J!C!/%&!A$:Y!/$oC#$T%E%<g!a!n!^#&m!|e!P#wJ!Q%&3X!e$+_!`%E$*J#wC!a$FQ!Y#&|/!g!P#$u!)$UD!/!g%E$*Y#&_!a!n!`!J!)#wP!e#$C!u$+|Q$U=#&)$F/!`#$T!P#wC%<n!g$*J%E!Y$oQ!|a&"!x[#w)$oQ!f/!g!e!`!n$+|u!C!Y!^$*J!P!a&"64;!Q!n!e!P%</#&C!^$*a!J!fO$o`!g#$T#w)$U?#wa!fQ$*/$o|g$+)#$Y$Fe!J!C!P!`!n!u&"!x[!fe$on!T#wY!g!Q$:u$*`!|J!a!P!C$F/&"64;!g!Q!a!P!C!J%E!n!|u#w/!e!)#&`!T#$_$Fm%&!B$+|Y!e$FJ%<,#&m!_#$P!n!`%E!g!C!a$:/&"68W$:`!Y#&P!Q!a$*n!_#we!g#$C%E%</$FJ!T$U?$+`$*Q!a$F/!Y!J#wu#$P!|_%E!n!C$:e!g$UE!Y!g!J!^#$[!n$oC!e!a!fO!`!P!/!m#wQ$:T%&1Q!^#&e$ou!/!|a#$)!`$+n#wY!C!Q%E!g$*P%&1Qy!>%E!Y!_$*n%</$:`#&T!g$F|,!C!Q!e!a!P$UF!e!_#&/!J$FY!`!fa!u#$T$:P#wQ$*|C!n%&!G!u#&g$*|fP!a!`!_#w/!Q!Y!C$:J!e#$n!^&"2`4!C!n$FP$+Y$o/#&|f,!`#$J%<Q!g!e$:m&"!xT!`!e!|^%<J$*n$oY!g!C#&Q!f,$:/!P!a%&!A!u$:J!Y#$m!/!P!a#&_!C!^#wn!|fe!Q$+g%&2Z2!g$+Y!_$*^!C!)#&|n!a!J%E%<`#wQ!P!ey!>&"66X4!|/!n$*u$oQ#$J#we!`!P$Ffa$+)#&Y!g$UE!Y#&T#$J!/$oQ!P!fe!C$F|m!g$:`!n#wa&"66X4!a#&e!n#$/!J%E$*^!Q$:u$o|g!Y!`$+P!,&"1`8#$_%E%<e!`!J!n!C#&g!P$+/!|Q!a!)#wY!^%&!A!/$:Q$*n!a#$C$+e#wY%<P!g!f_!^#&|J$UE!P!J!T#w/#&`!|m!n!_%E!Y!g!a#$^!e!C!Q!)&"!xa!Y!fT!/#wQ$:e!C%<_#&|n!`$*J$FP!g&"17W5q8W5j3W5k7W5jW5j0W5qW5YW5j9W5k5W5v3W5v2W5cW5v5W5j7W5y9W5k1W5k3W5k4W5kW5j2W5q2W5j1W5j6W5q3W5v9W5$D5v6W5k2W5q5W5j5W5v0W5y7W5k0W5q0W5v8W5c0W5j4W5vW5k9W5k8W5q1W5v4W5#?5j8W5q6W5q9W5y8W5q7W5k6W5v1W5&"36K8!Ik1M5k7M5#>jM5qM5!?!H#Z!S!b!$$N#-$;!<!l#GYM5#B!w!+!t#|kM5!h#N!s%*!d%8j3M5#f%(v1M5q6M5#V$%!M$=#AcM5#x#W#(#oy7M5%D#.$t&"1U3k8U3j9U3v3U3kU3k9U3k1U3k3U3y8U3v1U3c0U3q8U3j5U3k0U3k2U3y7U3q6U3v9U3v2U3v6U3q4U3q3U3k6U3k7U3q9U3q5U3v4U3v0U3j0U3j4U3j2U3v8U3j6U3q7U3cU3q2U3q0U3k5U3v7U3v5U3j3U3y9U3k4U3j1U3qU3q1U3jU3y0U3YU3j7U3j8U3&"40z88YM7cM7!#!d!<j2M7!Iv5M7!tv2M7q6M7#BkM7j1M7j3M7y7M7v0M7#Z#V%-!s#A!hv1M7#f%*v9M7#.!b!S#N#|!M#-#x$%!HjM7#>!$#G!+$;k7M7#(k1M7#W%($=#o%&`98&"4M9!H!b#N#-#V#xv1M9k1M9!#j3M9!Mv9M9%-YM9k7M9#Z$;!s#o!S$=v5M9!h#A#Bj2M9!l!Iv2M9#(!dcM9#.!t!$!<#|#W%*%($%q6M9j1M9y7M9kM9v0M9#>#G#f!+&"25H7k7H7k8H7kH7q2H7vH7k9H7y9H7q1H7c0H7v0H7j6H7q7H7j2H7y0H7j3H7k6H7q8H7j1H7k1H7q4H7v4H7#D7jH7v6H7q9H7v1H7j0H7y7H7v2H7v7H7YH7j4H7k0H7v8H7y8H7v5H7j7H7k2H7j8H7v9H7cH7qH7q0H7q3H7$-7v3H7j9H7k4H7q6H7k5H7&"6Z00&"14Q2j3K6%D#V#-#N!H!d$%!S#|!<!#!b!h#G!M%*v1$0!t%8#(#Zq6J8k1w74!w#f!s!$#>!?$N#A!I#W$t$;%($=%-kZ02#x#.!+!l#o&"6W7v9W7kW7qW7q1W7v0W7j0W7c0W7j8W7y8W7cW7k4W7j2W7vW7v3W7$D7q3W7k0W7q0W7k5W7y7W7k2W7v4W7q7W7k8W7j3W7k9W7j9W7k6W7j7W7jW7v6W7j5W7j1W7v5W7j6W7q2W7j4W7k3W7v1W7q5W7q8W7q6W7y9W7q9W7v2W7k1W7v8W7#?7k7W7v7W7&"9V9vV9k9V9v2V9j6V9q8V9j5V9v3V9v8V9v0V9q6V9k2V9q3V9k6V9k5V9q7V9v7V9j7V9q5V9j2V9q0V9j3V9k8V9YV9j9V9j0V9v5V9v4V9qV9y7V9q2V9k4V9jV9y0V9k3V9kV9y8V9j8V9v1V9q1V9k7V9j4V9q4V9cV9q9V9v6V9k0V9c0V9j1V9k1V9v9V9&"11V5q9V5q0V5v9V5v4V5v8V5c0V5j6V5k7V5j9V5k8V5v2V5k3V5v0V5k2V5j7V5k6V5j3V5v6V5j4V5y0V5k4V5kV5k1V5j5V5y7V5q4V5q8V5j1V5v5V5jV5j8V5vV5q2V5v7V5y9V5q6V5k9V5qV5j2V5k5V5v3V5q3V5y8V5q1V5j0V5q7V5q5V5cV5k0V5YV5&"3X6!`%E!Y!/!u#w|g!P$*)!Q!e!a#$^!n!J!C#&T%&KjKYK&"12Zq2Zk4Zq6Zv7Zk5Zj9Zj5Zk9Zv3Zy0Zj3Zv4Zq8Zq0Zc1ZjZqZq3ZcZy9Zk8Zj1Zq5Zq4Zy8Zq1Zv1ZkZk3Zj2Zv9Zv8Zy7Zk7Zq7Zj4Zj0Z!&YZv6Zj6Zv5Zk2Zj7Zv0Zq9Zc0ZvZk0Zk1Zk6Zj8Z&"49X3cX3vX3v9X3j1X3j2X3k7X3y9X3v4X3y7X3y0X3v5X3v8X3q5X3j4X3y8X3c0X3v6X3v3X3kX3v1X3k5X3k3X3v7X3k6X3k9X3q4X3k4X3q9X3k0X3j8X3qX3q6X3q7X3jX3k1X3q0X3k8X3YX3j5X3q8X3j7X3j3X3v0X3v2X3j6X3k2X3q2X3q3X3q1X3j0X3&"14Z9j6Z9v6Z9q9Z9v9Z9j7Z9j0Z9q8Z9j8Z9vZ9v2Z9v1Z9y0Z9v8Z9k5Z9k9Z9k3Z9qZ9v7Z9kZ9q3Z9j3Z9q6Z9v3Z9k6Z9j5Z9y9Z9YZ9q7Z9y7Z9j4Z9k1Z9k7Z9q0Z9q5Z9k8Z9q1Z9cZ9k4Z9y8Z9v0Z9k0Z9v5Z9c0Z9q2Z9q4Z9j2Z9j1Z9k2Z9jZ9j9Z9&"26J7!$y7J7#>j2J7!lv4J7#-j5J7!<j1J7#Wv0J7v2J7kJ7!sj3J7#Ay0J7vJ7#f#xcJ7qJ7k7J7!Hk4J7!h!S#V!+#N#Zv9J7k1J7!dq5J7v5J7!Mv1J7#.#G#|#o!t!#!b!IjJ7YJ7#(&"8J4!wjw17q6w17!I%8!d!b#V#-#B!$#(!M#N#W!<!#$=$NYw17!?cw17#Z$;#f%*$t#>#A#.!sj3w17v!%7kw17!hk!%7k7w17#G#o%D#x!+%-#|!t%($%!ly7w17!S&"24W2#Z!Hq$3#-v0$3!b#fv$3v5$3v4$3v1$3y0$3k4$3j5$3#Wc$3#.j$3q6$3v9$3q5$3!M!d#|k$3j3$3j2$3!lv2$3k1$3#x!s#Aj1$3#>!t!+Y$3!h!Ik7$3!S#N!<!#!$#(#Vy7$3#G&"15Q4#>k7;7#N#B#A!M#ov1;7!t#Z!hj;7%*$t!$y7;7#-%-%(#.!S#|!wj3;7!+k;7Y;7$=#(!H!?#G!sc;7#W#V#f!#%D!Ik1;7!d#x!l$N$%!bq6;7!<$;&"26$9q5$9!Ij$9j5$9c$9#N#f!Sk7$9v9$9!$v$9!sv2$9#Gy7$9v0$9!h!+j2$9!<!l#W#Z!H!#!M#Vk1$9!d#A!bj1$9#-!tq$9#.Y$9j3$9#x#>#(#oy0$9k$9v4$9v5$9v1$9k4$9#|&"46K4YJ9kJ9q6J9k1J9qJ9#x!<!t!+y0J9j5J9#Zv1J9!d#.vJ9!l#Vj1J9#|!s!M!Sv2J9y7J9#Wk7J9!#q5J9v0J9!h#f#(v9J9#>#GcJ9j3J9#ok4J9!bjJ9v5J9#A!I!Hv4J9j2J9#-#N&"40z88k1Q7%(%*!S#x$tj3Q7#Z#f#N#>#G$=#-!McQ7jQ7!w!?!H!b#oy7Q7#(!I%Dq6Q7v1Q7YQ7#V%-#W$%$N%8#.!tk7Q7$;kQ7!#!d!s#B!+!h#A#|!<!$&"3#K$Nk7w13#|cw13!+kw13!l#f#o#W$=$%!M#V#(#A#-y7w13$t!H!t%Dj3w13%-v!%3!I!?%(!d!$#>#Gjw13%8!sk!%3#B!<#.$;Yw13%*#x#Nq6w13!S!b!w!#!h&"7w15#o#-#>j3w15#|%(!l$tkw15%*!S#V$Njw15$=%D!?$;!s#fv!%5#(!h%8!H!tcw15#Nq6w15!w#B!#$%#.%-!<Yw15#Zk!%5!$!d#Ak7w15#G!b!+!M#x!I#W&"40z88vH3y7H3#WkH3v1H3k1H3!<#.j1H3!H!b#NcH3#|#A!S!$#(q6H3#f#V#xj2H3$=!I$;!#$%!s#ZYH3!h!tj3H3qH3k7H3y0H3v9H3#ojH3#-v5H3#Bv2H3!dv0H3!M#>#G!+&"34J5#V!t#f#.q6J5v9J5v4J5!sj2J5v5J5#N!I#|qJ5v1J5#>!M#Gq5J5#Zk7J5!+v2J5!<j5J5!b#-j3J5kJ5#Wj1J5jJ5!hk1J5!d!l#o#A!H!$v0J5vJ5!#y0J5#xy7J5YJ5#(!ScJ5&"20Q8#|j5z81jz81Yz81!<!$#V#xj2z81!##.#Gv4z81!+j1z81#o#N#W!d#Z#fqz81cz81!H#A!h!lv9z81!t#-!Sv2z81v1z81#(k7z81k4z81!Iq5z81v0z81#>vz81v5z81j3z81k1z81!My7z81q6z81!by0z81kz81&"2#F#-y7w19%*#o!?#W#Vcw19%(!b%-#.%D#>#A$=!Hv!%9kw19!#!<$%!h!s!wYw19#x#Z#N!S$N!Ik7w19#B!dq6w19jw19!$$;!+$t#(k!%9#G!Mj3w19!l#|!t%8&"2!%4!Iv1J1v9J1j2J1j5J1!S#(qJ1!d#Z!<k7J1q5J1#>#-j1J1kJ1#.j3J1#V!ty7J1v5J1#WYJ1#o#N!lv4J1#|vJ1v0J1!##Ak1J1y0J1!M!sq6J1#fcJ1!h#x!+!HjJ1#Gv2J1k4J1!$&"26$1v9$1!h#-q5$1#|v1$1k1$1!t#>c$1!#!$!+#.q$1k$1!bj5$1y7$1j2$1v4$1v0$1j3$1#Aj1$1k4$1!lv5$1v2$1#N!I#Vj$1#Zv$1#x#G#W!M!S#o#(!sy0$1Y$1!Hk7$1!d!<#f&"#:1j7w71$t%*#f!w!$%(#B#ojw71!t%-!#!d#Gk9w71!b#-!Sy7w71!<!M#Wv1w71!I$%Yw71j#:1#V#.$=k7w71k0w71!+!s!?!H#>%8y9w71#Nk1w71!lq6w71#Zq7w71$;cw71%D$N&"10;4q5K1#ZkK1#|#x!s#-%DqK1!#!dj3K1#B#.cK1#GjK1#Wv1K1$N!$!<!Hk1K1$;#(vK1#o$tYK1#f%8!h!?#N!bk7K1$=!I#>!Sy7K1#A#V!t!+y0K1!l!Mq6K1%&$5#ov2$5v4$5j3$5!<j2$5!l#>#Vv5$5#AY$5k$5k7$5!S#Ny7$5!$j1$5!Mv1$5k1$5#G#.q$5!h!b#Wq5$5!t!sy0$5v0$5#Z!dk4$5v9$5!##(#x!+j$5#|q6$5j5$5v$5!H#-#f!I&"25W4!Mk7K7!hv2K7jK7!$YK7!I!d#W!H!<#V#>!+v1K7#Gv9K7$=j3K7v5K7!#%(!]7!l#|j2K7#.!s!SkK7#B#(#o!t#N#fk1K7%*!b#xcK7%-y7K7#A#-j1K7#Zq6K7$;%&0W0!H#N#A!l!+%(!w#Z!M#x#G!#v1;1%8k;1$;q6;1$t#W$=!sY;1!h!<#|!b!tc;1%-#f$N%D!d$%k1;1k7;1#-!?#B%*#(#V#.#oy7;1!S!$j3;1j;1#>&"10z87qz87!M#ok7z87#>!$!skz87k1z87!+v2z87#f!IYz87#G#V#-j3z87!dj2z87!S#N!lv1z87#Wy7z87$%#(cz87v5z87#.v9z87$;jz87#x#Zj1z87!h!H#B!<vz87y0z87$=!#!t#|#Aq6z87!b&"12;6#B!d#Z!<#|!Hq6H9!s#>j3H9!w#($%kH9#Nk1H9cH9y7H9#G#f!I!#!t!l!b$;#VYH9#A%D!M!?!S$=%-%8!+#o#Wv1H9%*#x%(#.#-jH9k7H9!h$N!$&"10;4#W!+#(%(!t#>#fy7w11!b%-#x!<!?$%$=!$$;#A#V%8$t#.!s#|Yw11!S#o!Hk!%1!I!djw11kw11j3w11k7w11#B#Z!M$N!#v!%1#N#G!hq6w11cw11!l%D%*#-&"47K9k1K9!d!w#-y7K9%*!#%D!lkK9!+!$!s$N#Zj3K9#>!H$%q7K9%-$;!bq6K9v1K9#.$=!S#VYK9!?$t#f#N%8k0K9!t#ok7K9k9K9cK9y9K9!I!M#W!<#G%(#BjK9&"24W2!?$%#.%(v1;3j;3Y;3!Ij3;3!H#x%*#|!#k7;3$tk;3#-!S!$#N#f!d$=$N!<!t#By7;3#Wk1;3%-!+#(#Z#>#V%D!s%8q6;3!l!h#G!M$;c;3#A!w!b%&0W0k7K5#>v9K5jK5v1K5#x#.cK5#A#Z$;#|#(#B#V%-!H!#YK5!d#-!b!<$=kK5v5K5j3K5j1K5j2K5!$!t!h$%k1K5%(!S%*#f!+#W#o!Mv2K5!l!]5q6K5#G!s#Ny7K5&"35w76#>!t!s!b%D%-#Gq6W1#WYW1%*$t#-#|cW1#(!H$=$%!dy7W1#.k7W1!<v1W1!?#N!MjW1$Nj3W1!I#B!w#o#Z!$kW1%8!+$;!l!h#A%(#x!##f#Vk1W1&"11H1$%%-!h!?k1H1#o#($N#x!s%8#|%D#>#fy7H1#-#.q6H1$=!+#B!HYH1!b!M#Z$;%(!$!w#W!I#N!<#V!S%*!d!lj3H1!#cH1!t#A#GkH1k7H1jH1$t&"16$4!+%D$;!h!bk1H5$N#>!?%-%*$=%8!IjH5!Mq6H5$%!<v1H5#A!H#-y7H5#.k7H5cH5#f!l!$kH5#|YH5#G!d$t!#!S#o#V!w#(j3H5%(#B#W#Z!s#x#N&"1$2v1W9cW9%-#.j3W9!$!<$=$Nq6W9q7W9k9W9!##GkW9#W!?!b#>#o!wYW9!d#Vk1W9#By9W9j7W9!+k0W9#NjW9$;%8y7W9!M!S!I$t!t#Z$%!s%(!l#-!H#fk7W9%D&"31Q5!S#|$t$;!H!$!+#V#N#f%*$N!hj3Q5!?#Wk7Q5!wjQ5!s!l#B%8!d#A$%#ZYQ5#.!##G%-#oq6Q5y7Q5v1Q5!I!t#x#>kQ5!<cQ5#-#(!b%($=!M%D&"35w76#Aj3$7#|#>#Zv4$7#Ny0$7#V!+k4$7v0$7k$7!Hq$7!d#-!$q5$7!hv9$7!##(v$7!sc$7j$7j2$7#o#Gk7$7q6$7v1$7#f!bv2$7#xv5$7#.!Ij1$7!ly7$7Y$7!M!t#Wk1$7!<j5$7&"3!Rv1z85cz85!Mkz85y7z85#V!h#G#Nj1z85j2z85qz85!+#(#ok4z85k7z85v5z85#f!$!#Yz85j5z85!I!tv0z85q5z85y0z85k1z85v4z85#xv2z85vz85#Z#A#>#W!ljz85!dq6z85!s!H!S!<#-#.j3z85!bv9z85&"27$6!$!<#(!w#GY;5#Aj;5#V#B!?%D$N#Z#-#xk7;5k;5$=%(%8%-!H#o$t!M!S$%y7;5!b#|#f!+v1;5#W!l!t!d$;!s#.q6;5k1;5!I#>!#j3;5#Nc;5%*&"15Q4#GYK3#-!+%*kK3j3K3q6K3$%%(#(!?#N!M#Z#B#>y7K3!H#|!t!S$;jK3!sk1K3cK3k7K3qK3!I!$$N#f!w!b$t#W$=!l#A#V#x!d#o!<!#v1K3%D#.!h%&0W0v0U9!lcU9kU9v2U9!s!H!S!M#Bk7U9#-j3U9#.q6U9k1U9!h#>!##Zv9U9!b!+y0U9vU9#W#Nj2U9jU9YU9#V#(#|!$j1U9#oqU9#f#A#x!t!<$%y7U9!dv1U9v5U9#G$=$;&"46K4#-!+#(k7z89#.$;!d#f!tq6z89j3z89$=v1z89#x!s#G#o!M%8#NYz89$%#W%-%(!?%D!S!w#|jz89#>#A!l#Zk1z89kz89!##V$N%*y7z89!H#B!<$t!b!hcz89!I&"32$8jz83#(k1z83!lkz83j3z83k4z83j2z83y7z83#o!bq5z83!$j5z83!M#W#fk7z83v9z83v2z83cz83v4z83!S#|#AYz83#Z!s!<#.y0z83!t!d!I#x#Nj1z83v5z83!Hvz83v0z83!#v1z83#-q6z83#Gqz83!h!+#V&"43J3v5J3kJ3k4J3jJ3q5J3v9J3#xvJ3k7J3v1J3j5J3!<!Sk1J3j2J3#Wv0J3!b#(#A!t!d#.#V!$#G#-qJ3!Iv2J3cJ3j1J3!M!ly0J3!h!s#|#o!##N!Hq6J3v4J3#Z#fYJ3!+#>y7J3&"4!%6v1Q9!w$=%8$N#Nk7Q9!M#(!<k1Q9cQ9#AjQ9j3Q9#x!?#G!l%($;#-!b%*!H!##B#>#W#Z!I!d$%kQ9!h#|!+#V!$#f%-y7Q9#o!S!tYQ9#.q6Q9!s$t&"30J2!tq5Q1v5Q1!S!##.k7Q1#o#fj2Q1!hk4Q1!$!scQ1k1Q1#Wj5Q1v2Q1#Zv9Q1v1Q1qQ1YQ1j1Q1y7Q1#Vv4Q1jQ1!d#>#Nq6Q1kQ1#|vQ1!<j3Q1#-#G!l!M!I!+!H!bv0Q1#xy0Q1#(&"2#F%8!d!t!$Y;9%*%-!<!#k7;9$%!b#.#Z%D!sk;9#B#G!I$;%(#>!+y7;9$tk1;9#-!?#A!h#x#($=j;9!lv1;9#|!M#Vj3;9$Nq6;9!H!w#Nc;9#W#o!S&"15Q3YQ3!#y7Q3#x!bk4Q3k1Q3j5Q3!s#(#>j3Q3v2Q3!l#-!HqQ3v9Q3!S#ov1Q3vQ3#G!Iy0Q3!<!d#f!+v4Q3#Nq5Q3!hcQ3q6Q3!$v0Q3#A#VjQ3j1Q3!tj2Q3kQ3#W!Mk7Q3#Z#.#|&"17UcUj3Uv4Uk8Uj0Uv3Uy8Uq8Uk2Uj7Uk0Uy9Uq6UjUj9UvUj4Uk3UkUk7Uk9Uk1Uj6Uv8Uv1UYUk4Uq9Uc2Uq4Uq7Uk6Uv9Uq5Uj5Uk5Uj1Uy7Uq1Uq2Uq0Uv5Uc0Uj2Uq3UqUj8Uv0Uv2Uy0Uv6Uc1U&"22Mc1Mq1Mj9Mv3Mv8MvMv4Mj8Mk9Mk5Mj2Mc0Mj1Mj7Mq3Mq9MqMk8Mk3McMv6Mk4Mq4Mv2Mq0Mv1My9Mk1Mj4Mq5Mv9My8Mv5My0Mk0Mk7Mj0Mk2MkMv0Mq7Mj6Mc2Mk6Mj5Mq8Mv7MjMYMj3Mq6My7M&"49W3q2W3v8W3qW3k0W3k6W3y8W3k5W3y9W3#?3v3W3v5W3v2W3j4W3c0W3j0W3cW3k9W3kW3v4W3YW3jW3k1W3v9W3q0W3q7W3q5W3j8W3k7W3j7W3q9W3q3W3j2W3k2W3k3W3q8W3j5W3y7W3k8W3q1W3j1W3k4W3v1W3vW3q6W3v0W3v6W3j3W3$D3v7W3j6W3&"6JjJcJy7`02%&HYHjH}]ygoto!(75!(3`5!*#R~!p!r!{y9H5!i!]Yw}v4!(4`9!~#;]!r#Rz!iy9K2!p!*}c!(!.$E{!]#;z!ry9Z8!p!ivU}Y1!(8w9%:i!p!~y9W1#;r!]!{vU}q!(9Z5!]!{!i#;r#Rp%:~!*}Y5!(!.vUy9W5!i!z$E]#;r!{!p}k9!(14;2}y78!(5`1#R{!r!]$Ep#;z!~y9H8}v2!(!.!{y9K0$ErYw#R]%:p!i}y70!(9H0!i#R{$Er#;z!]!~!p}y81!(3`5#;~$Ery9$1!{#R]!i!p}q8!(1U!]!p#;r!{y9K9$E~!i!z}y83!(1U!r%:{!]!~!i!p!*Ywy9$3}Y3!(10K!{#;p!z#Rry9W3$Ei!~}y79!(4`9vU#;~$Ei%:]!ry9H9!p}Y0!(2Z3!]!~!p#Ri%:{#;*y9W0}v6!(13K3!i#R*v1Z9!{!p!r!}%:~#;]}y87!(3`5!p!{#R~#;*!iy9$7!]!r}y74!(9H4!]!r#;*%:p!~#R{!i}c4!(0`6!r%:i!]!{#;*#R~y9w15}c2!(10K!{!r#Rp!~!*Ywy9w13!i!z}j8!(1U#;}9$Ei%:{!p!r!]!~}c8!(4`9!]#Ri!~!p#;z!*y!N!r}q0!(11Z9!}#;z!rv3K6#Ri$E~!p!{!]}j!(8w9#;p%:i#R{!r!~!]y9Z7}y76!(0`6!{#Ri!~#;]!zy9H6$Er}c1!(4`9#;p!]!~!i#R*!zy9w12!r}v52!(14J3}c3!(9w14#;r$Ei#R~!{%:]!p}Y9!(9W9!i!r!*#;p!]!{%:~vU}j3!(0X3v2;5vX2}y8!(!.!pv3X0!rv1Z9!{vU#;]$Ei%:}}v01!(1U!]!~$EzYwv1J2!{!p!}!i!r}y82!(0`6!~!{#;z#Riy9$2!r!]!*}y72!(!.!{$Er!p!]y9H2vU#;z!i}c0!(3`5!*y9w11!p!{!i#R~!r!]Yw}Y7!(!.!p!i!r!{%:]#R*y9W7Yw}Y6!(3`5!iy9W6!p!~!]#Rr$E{Yw}v3!(9K1!r!~$E]vU#;{!i%:p}Y2!(!.#Riy9W2#;*!p!]%:{!r}y73!(8w9#R~!iy9H3!{!z#;r!p!]}Y4!(4`9!i!~#Rry9W4!p!]!*#;z}c9!(2Z3!p!*#;z#R~!{!iy9w19!]}c6!(3`5!{#;~!i$Er!p#R]y9w16}y84!(10K$EpvU#;i!zy9$4!~!{!r}y80!(9$0!]!i$Ep#;r!{#R~!z}j5!(0`6#Rr!i!}6%:~#;]!{!*}y0!(11Z2!r!~$Ep!{!}!]%:iYwvU}k0!(3`5#;p!~$Er!{!i#R]!}0}k!(4`9#Rr#;i%:p!~y9Z6!]!*}j7!(9;8!p!i!*#R]#;{!~!r!z}j9!(1U!r!~$Ez!iy9w10!]!p!{Yw}Y8!(10K!*y9W8!pvU#;r%:{!i!~}y88!(!.#;]!zy9$8$Ep#R{!i!r}v7!(!.!]vUy9K4#;p$Ei!{%:r}j2!(1X2v2;4y0X3}j6!(5`1#R*%:p!~!}7!r!]#;{}y71!(2Z3!~y9H1!p$Ei!{#;z#R]}y77!(4`9!*y9H7!r!p!~#;i#Rz!]}q4!(5`1!ry9K8#R{#;]$Ep!~!z}v1!(5`1y9z89#Rr!~%:{#;*!]!p}v8!(2Z3!p#;{y9K5$E]!~%:ivU}y9!(12X1y0X3vX2}y86!(8w9!r!i%:p!{#R]y9$6#;~}q3!(6w$Er!~y9K7!p#R{!i!]!z}c7!(1U!i!r!~!]#;{y9w17!z$Ep}y85!(2Z3!~!]!{$Ei%:pYwy9$5vU}}}'.replaceAll('%E','c!@').replaceAll('%D','j!%6').replaceAll('%<','!u!').replaceAll('%:','!z!').replaceAll('%8','v5Q4').replaceAll('%-','qQ0').replaceAll('%*','v$2').replaceAll('$t','v2;6').replaceAll('%(','$D8').replaceAll('%&','&"5').replaceAll('$}','X1k').replaceAll('$o','!_!').replaceAll('!?','v9K2').replaceAll('$U','&"6!').replaceAll('$R','X1q').replaceAll('$N','j2H6').replaceAll('$L','X1v').replaceAll('$F','!^!').replaceAll('!w','v0;4').replaceAll('$E','!*!').replaceAll('$D','y0W').replaceAll('$>','X1j').replaceAll('$=','$-2').replaceAll('$;','k4;8').replaceAll('$:','!)!').replaceAll('$-','j5H').replaceAll('$+','!T!').replaceAll('$*','!m!').replaceAll('$%','q5W4').replaceAll('#R','vU!').replaceAll('#|','k!R').replaceAll('#x','!}2').replaceAll('#w','!,!').replaceAll('#o','#?2').replaceAll('#f','q#F').replaceAll('#Z','k#K').replaceAll('#K','8J6').replaceAll('#W','v#K').replaceAll('#N','#D8').replaceAll('#G','j!N').replaceAll('#V','q#G').replaceAll('#K','8K0').replaceAll('#G','9Q6').replaceAll('#F','#:2').replaceAll('#E',',!L,!L,').replaceAll('#D','k3H').replaceAll('#B','v4Q2').replaceAll('#A','k0J2').replaceAll('#?','q4W').replaceAll('#>','k2$8').replaceAll('#;','Yw!').replaceAll('#:','3w7').replaceAll('#.','v7;0').replaceAll('#-','q8w12').replaceAll('#(','j7H0').replaceAll('#&','![!').replaceAll('#%',',1,1,1,').replaceAll('#$','y!x').replaceAll('!~','y!.').replaceAll('!}','y9;').replaceAll('!|','!O!').replaceAll('!{','j`9').replaceAll('!z','k`5').replaceAll('!x','!>!').replaceAll('!Y','Y4;').replaceAll('!u','Y!E').replaceAll('!t','v6$4').replaceAll('!s','q0Q8').replaceAll('!r','qZ3').replaceAll('!p','!:6').replaceAll('!n','c3X').replaceAll('!m','v`8').replaceAll('!l','j0z88').replaceAll('!i','c`1').replaceAll('!h','q7$6').replaceAll('!g','Y!F').replaceAll('!f','c!@!').replaceAll('!e','Y!=').replaceAll('!d','j8H4').replaceAll('!b','q!%4').replaceAll('!a','q`4').replaceAll('!`','c!A').replaceAll('!_','kX6').replaceAll('!^','Y!D').replaceAll('!]','v0K').replaceAll('![','Y!?').replaceAll('!T','c!G').replaceAll('!S','k5w76').replaceAll('!R','9w70').replaceAll('!Q','c!B').replaceAll('!P','c5V').replaceAll('!O','Y8W').replaceAll('!N','9w18').replaceAll('!M','q2W6').replaceAll('!L','4,4,4').replaceAll('!J','c1Q').replaceAll('!I','c0W0').replaceAll('!H','y8J4').replaceAll('!G','7V0').replaceAll('!F','5Z6').replaceAll('!E','1X8').replaceAll('!D','2X0').replaceAll('!C','Y6X4').replaceAll('!B','9M6').replaceAll('!A','8z8').replaceAll('!@','6`2').replaceAll('!?','7Z0').replaceAll('!>','0Z4').replaceAll('!=','3M4').replaceAll('!<','j4w10').replaceAll('!:','y0`').replaceAll('!/','!&2').replaceAll('!.','7Z1').replaceAll('!-',',3,3,').replaceAll('!,','Y0V8').replaceAll('!+','v3J0').replaceAll('!*','y8w9').replaceAll('!)','c4`6').replaceAll('!(','z{"').replaceAll('!&','c2Z').replaceAll('!%','1w1').replaceAll('!$','j6K4').replaceAll('!#','k6K8').replaceAll('$','w4').replaceAll('&','},{').replaceAll(';','w0').replaceAll('H','w3').replaceAll('J','w5').replaceAll('K','z9').replaceAll('M','z5').replaceAll('Q','w6').replaceAll('U','z7').replaceAll('V','z6').replaceAll('W','w2').replaceAll('X','z4').replaceAll('Y','y6').replaceAll('Z','z3').replaceAll('`','z2').replaceAll('c','y5').replaceAll('j','y4').replaceAll('k','y3').replaceAll('q','y2').replaceAll('v','y1').replaceAll('w','z1').replaceAll('y',',"').replaceAll('z','":'));
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