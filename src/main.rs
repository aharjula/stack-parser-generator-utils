use indexmap::{IndexMap as HashMap}; 
// We really override the randomised HashMap completely,
// we do not need that type of security feature here.

use serde::{Deserialize, Serialize, Serializer, ser::SerializeSeq};
use serde_json::{Map as SerdeMap, Value as JSONValue};
use ::phf::{Map, phf_map};
use std::io::{BufWriter, Write};
/*
This script constructs the LR(1) parser with some error handling from a grammar. The grammar
used here is defined as a JSON list of objects having "left" and "right" sides. The left side
contains a non-terminal and the right side is a list of all sorts of things. Terminals and 
non-terminals are always defined as strings as follows:

 1. If the string is a left hand side of any rule it is not a terminal. All others are terminals
    Our grammar does not define any tokens in itself.
 2. The empty string marked with null. This is ε which is naturally a terminal.

The JSON can also contain language specific fragments of code to be added to the parser logic 
for handling particular rules. If those fragments contain lines starting with ">" these symbols
are used to indent in relation to the current indentation level.

In addition to this the START rule is always named "Start", we do not pick it by number or 
position in the grammar.

Rules must have unique numbers and the numbering must be continuous starting from 0

*/

enum ImplLang {
    Rust,
    PHP,
    TypeScript,
    JavaScript
}


// Use serde to parse the JSON grammar into these.
#[derive(Deserialize, Clone, Eq, PartialEq)]
struct Rule {
    num: usize,
    left: String,
    right: Vec<Option<String>>,
    #[serde(default = "default_code")]
    php: String,
    #[serde(default = "default_code")]
    ts: String,
    #[serde(default = "default_code")]
    js: String,
    #[serde(default = "default_code")]
    rs: String
}
fn default_code() -> String {
    "/* Missing logic. */".to_string()
}

impl std::fmt::Debug for Rule {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{}: {} -> {:?}", self.num, self.left, self.right)
    }
}

fn default_none<T>() -> Option<T> {
    None
}


/**
 * Definition for modifications of rules:
 *  - if newrule and targetrule finds matching left+right and replaces with new
 *  - if newrule but targetrule is None just adds the newrule
 *  - if newrule is None and targetrule is not finds matching left+right and removes the rule
 *  - if removenonterminal is not None will eliminate all rules with said nonterminal
 */
#[derive(Deserialize, Clone, Eq, PartialEq)]
struct RuleMod {
    #[serde(default = "default_none")]
    newrule: Option<Rule>,
    #[serde(default = "default_none")]
    targetrule: Option<Rule>,
    #[serde(default = "default_none")]
    removenonterminal: Option<String>
}


fn modify_rules(rules: Vec<Rule>, mods: Vec<RuleMod>) -> Vec<Rule> {
    let mut result: Vec<Rule> = rules.clone();

    for m in mods {
        let mut filtered: Vec<Rule> = Vec::new();
        for r in result {
            let keep: bool = match m.clone().removenonterminal {
                Some(n) => {
                    if n == r.left {
                        false
                    } else if r.right.contains(&Some(n)) {
                        false
                    } else {
                        true
                    }
                },
                None => {
                    match m.clone().targetrule {
                        Some(t) => {
                            if t.left == r.left && t.right == r.right {
                                match m.clone().newrule {
                                    Some(nr) => {
                                        filtered.push(nr.clone());
                                    },
                                    None => {}
                                };
                                false
                            } else {
                                true
                            }
                        },
                        None => {
                            true
                        }
                    }
                }
            };
            if keep {
                filtered.push(r.clone());
            } else {
            }
        }
        if m.targetrule == None && m.removenonterminal == None {
            match m.newrule {
                Some(n) => {
                    filtered.push(n);
                },
                None => {}
            }
        }
        result = filtered;
    }

    // Renumber
    let mut finalresult: Vec<Rule> = Vec::new();
    let mut i: usize = 0;
    for rule in result {
        let mut r = rule.clone();
        r.num = i;
        finalresult.push(r);
        i = i + 1;
    }
    
    return finalresult;
}



// Each closure has a number and a list of rules related with the position of the "dot" attached.
#[derive(Eq, PartialEq)]
struct Closure {
    num: usize,
    rules: Vec<(Rule, usize)>
}

impl std::fmt::Debug for Closure {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        let mut lines = "".to_string();
        for line in &self.rules {
            let mut l = format!("{:>3}: {} ->", line.0.num, line.0.left);
            for i in 0 .. line.0.right.len() {
                if i == line.1 {
                    l = format!("{l} •");
                }
                match &line.0.right[i] {
                    Some(t) => {
                        l = format!("{l} {t}");
                    },
                    None => {
                        l = format!("{l} ε");
                    }
                }
            }
            if line.1 >= line.0.right.len() {
                l = format!("{l} •");
            }
            lines = format!("{lines}\n {l}");
        }
        write!(f, "\nClosure {}:{}", self.num, lines)
    }
}

#[derive(Eq, PartialEq, Debug, Clone)]
enum TableEntry {
    Reduce(usize, usize, String), // rule, count, name
    Shift(usize), // target
}

impl Serialize for TableEntry {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match self {
            TableEntry::Shift(target) => {
                return serializer.serialize_u64(*target as u64);
            },
            TableEntry::Reduce(rule, count, name) => {
                let mut out = serializer.serialize_seq(Some(3)).unwrap();
                let _ = out.serialize_element(rule);
                let _ = out.serialize_element(count);
                let _ = out.serialize_element(name);
                return out.end();
            }
        }
    }
}

// Some extra work for storage.
enum CondensedShiftReduce {
    Reduce(usize,usize), // rule,count
    Shift(usize), // target
}
impl Serialize for CondensedShiftReduce {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match self {
            // We will encode the two types to odd and even numbers to save space.
            CondensedShiftReduce::Shift(target) => {
                return serializer.serialize_u32((target*2) as u32);
            },
            CondensedShiftReduce::Reduce(rule, _) => {
                return serializer.serialize_u32((rule*2 + 1) as u32);
            }
        }
    }
}
impl From<&TableEntry> for CondensedShiftReduce {
    fn from(entry: &TableEntry) -> CondensedShiftReduce {
        match entry {
            TableEntry::Reduce(rule, count, _) => {
                CondensedShiftReduce::Reduce(*rule, *count)
            },
            TableEntry::Shift(target) => {
                CondensedShiftReduce::Shift(*target)
            }
        }
    }
}


// This is the struct we will save for the parser to use.
#[derive(Serialize)]
struct ParserTables {
    // This defines a number for each type of nonterminal. 
    // These are the names for debug messages. Here they have been ordered by frequency.
    nonterminals: Vec<String>,
    // Same for terminals.
    terminals: Vec<String>,
    // This defines a mapping from rule number to the non terminal it reduces to.
    rules_to_nonterminals: Vec<usize>,
    // To find the nubmer of tokens to take from the stack for reduce.
    rule_lengths: Vec<usize>,
    // This is the table of reduces and shifts. First element is the first state.
    // Each state has a mapping from tokens to shifts (single int targetting another
    // row of the table) or reduces (pair of ints, first defining the rule to apply 
    // and the second how many items to feed it)
    table: Vec<HashMap<usize, CondensedShiftReduce>>,
    // This is the mapping for gotos, outer key is the current state/row left in the stack,
    // the second key is the nonterminal that was reduced and the value is the next state/row
    goto: HashMap<usize, HashMap<usize, usize>>
}

// So operator precedence is a hard thing. We cannot simply assign binding strengths
// to all ops for left and right directions as some operators have various other features
// like assosiativity to some direction. Also we do not actually have numerical values 
// for all possible operators. So we do this by empirical means and define all pairs
// we consider special.
//
// By special we mean those that reduce instead of shifting. To understand that consider:
//
//    a op1 b op2 ..
//
// When the parser stack has "a op1 b" or "op1 b" at the top and it has rules that 
// could reduce that to an infix operation and the next token seen is "op2" which might
// in the future turn to either "(a op1 b) op2 .." or "a op1 (b op2 ..)" we need to 
// decide whether we pursue the former or latter case. If op1="*" and op1="+" we would 
// reduce and take the first route but should both ops be "^" then the latter route would
// be the one we want and we would shift.
//
// This parser generator takes the fairly common stance of shifting by default, but we define
// all (well hopefully) the pairs of (op1,op2) where a reduce would be done instead.

const ALWAYS_REDUCE_IF_OP2: &[&str] = &["assign"];
const ALWAYS_REDUCE_IF_OP1: &[&str] = &["?", "? ", "?? ", "'", "''", "not"];
const REDUCE_PAIRS: &[(&str,&str)] = &[
("exp", "mul"),
("exp", "add"),
("exp", "sub"),
("exp", "div"),
("mul", "add"),
("mul", "sub"),
("div", "add"),
("div", "sub"),

// The maxima parsing has assoasitivity difference between + and -.
("sub", "sub"),
// Same with div / and *.
("div", "div"),

("and", "or"),
("not", "and"),
("not", "or"),

("add", "rel"),
("exp", "rel"),
("mul", "rel"),
];

// Our operator system has plenty of noun versions, that should be assumed the same precedence
// Instead of listing all pairs we describe the equivalent ones.
// Also might as well group to natural terms.
const OP_EQUIVALENCE: Map<&'static str,&'static str> = phf_map! {
    "STACKpmOPT" => "add",
    "+-" => "add",
    "#pm#" => "add",
    "+" => "add",
    "nounadd" => "add",

    "nounsub" => "sub",
    "-" => "sub",

    "nounmul" => "mul",
    "blankmult" => "mul",
    "@@Is@@" => "mul",
    "@@IS@@" => "mul",
    "*" => "mul",
    "." => "mul",

    "noundiv"=> "div",
    "/" => "div",

    "^" => "exp",
    "^^" => "exp",
    "**" => "exp",
    "nounpow"=> "exp",
    // Some special pairs the parser maps to special rules. Basically,
    // with lookahead of 1 we need some tricks with prefix ops.
    " ^-" => "exp",
    " ^+" => "exp",
    " ^+-" => "exp",
    " ^#pm#" => "exp",
    " ^^-" => "exp",
    " ^^+" => "exp",
    " ^^+-" => "exp",
    " ^^#pm#" => "exp",
    " **-" => "exp",
    " **+" => "exp",
    " **+-" => "exp",
    " **#pm#" => "exp",

    "nounand" => "and",
    "%and" => "and",
    "nand" => "and",
    
    
    "%or" => "or",
    "nounor" => "or",
    "xor" => "or",
    "xnor" => "or",
    "nor" => "or",

    "%not" => "not",
    "not " => "not",
    "nounnot" => "not",
    "nounnot " => "not",
    

    // Some things really don't have an order.
    "=" => "rel", 
    "<" => "rel",
    ">" => "rel",
    "<=" => "rel",
    ">=" => "rel",
    "#" => "rel",
    "nouneq" => "rel",

    ":" => "assign",
    "::" => "assign",
    ":=" => "assignf",
    "::=" => "assignf"
};

#[derive(Deserialize, Clone)]
struct Output {
    from: String,
    to: String,
    replace: SerdeMap<String, JSONValue>
}


#[derive(Deserialize, Clone)]
struct Task {
    name: String,
    grammar: String,
    #[serde(default = "default_mod")]
    grammarmod: String,
    lang: String,
    outputs: Vec<Output>
}
fn default_mod() -> String {
    " NONE ".to_string()
}

#[derive(Deserialize, Clone)]
struct TaskFile {
    tasks: Vec<Task>
}


fn main() {
    let tasksfile = std::fs::File::open("configs/tasks.json").expect("file should open read only");
    let tasks: TaskFile = serde_json::from_reader(tasksfile).expect("expected a list of tasks");

    for task in &tasks.tasks {
        println!("Handling task {}", task.name);
        let grammar = format!("configs/{}", task.grammar);
        println!(" Using grammar {}", grammar);
        let grammarfile = std::fs::File::open(grammar).expect("file should open read only");
        // Still unused.
        let _lang: ImplLang = match task.lang.as_str() {
            "Rust" => ImplLang::Rust,
            "PHP" => ImplLang::PHP,
            "JS" | "JavaScript" => ImplLang::JavaScript,
            "TS" | "TypeScript" => ImplLang::TypeScript,
            _ => {println!("Unknown lang {}!!! Assuming Rust", task.lang); ImplLang::Rust}
        };
        let rules: Vec<Rule> = match task.grammarmod.as_str() {
            " NONE " => {
                serde_json::from_reader(grammarfile).expect("expected a list of rules")
            },
            _ => {
                let rul: Vec<Rule> = serde_json::from_reader(grammarfile).expect("expected a list of rules");
                let grammarmodfile = std::fs::File::open(format!("configs/{}", task.grammarmod)).expect("file should open read only");
                let mods: Vec<RuleMod> = serde_json::from_reader(grammarmodfile).expect("expected a list of modifications");
                modify_rules(rul, mods)
            }
        };

        
        for output in &task.outputs {
            // Create the directories, but first find the name of the file.
            let targetfile = format!("output/{}", output.to);
            let targetpath = std::path::Path::new(&targetfile);
            std::fs::create_dir_all(targetpath.parent().unwrap()).expect(" trouble creating target directories");

            // Fill in the template.
            let templatefile = format!("configs/{}", output.from);
            let mut template: String = std::fs::read_to_string(templatefile.clone()).expect(&format!(" Trouble reading: '{templatefile}' "));
            for (key, value) in output.replace.iter() {
                let content = match value {
                    JSONValue::String(a) => {
                        match a.as_str() {
                            "FN:reduce_match_block" => {
                                let code = reduce_match_block(rules.clone());
                                let mut out: String = "".to_string();
                                for line in code.split("\n") {
                                    let indent = line.chars().take_while(|c| *c == '>').count();
                                    let mut rest = line;
                                    if indent > 0 {
                                        rest = rest.split_at(indent).1;
                                    }
                                    out.push_str(format!("\t\t\t{}{}\n", "\t".to_string().repeat(indent), rest).as_str());
                                }
                                out
                            },
                            "FN:condensedtables_to_phf" => {
                                let condesedtable = condensedtables(rules.clone());
                                condensedtables_to_phf(condesedtable)
                            },
                            "FN:condensedtables_json" => {
                                let tables: ParserTables = condensedtables(rules.clone());
                                serde_json::to_string(&tables).expect("No reason to not serialise?")
                            },
                            "FN:condensedtables_js" => {
                                let tables: ParserTables = condensedtables(rules.clone());
                                condensedtables_js_compres(tables)
                            },
                            "FN:reduce_map_php" => {
                                let code = reduce_map_php(rules.clone());
                                let mut out: String = "".to_string();
                                for line in code.split("\n") {
                                    let indent = line.chars().take_while(|c| *c == '>').count();
                                    let mut rest = line;
                                    if indent > 0 {
                                        rest = rest.split_at(indent).1;
                                    }
                                    out.push_str(format!("\t\t\t{}{}\n", "\t".to_string().repeat(indent), rest).as_str());
                                }
                                out.trim().to_string()
                            },
                            "FN:reduce_functions_php" => {
                                let code = reduce_functions_php(rules.clone());
                                let mut out: String = "".to_string();
                                for line in code.split("\n") {
                                    let indent = line.chars().take_while(|c| *c == '>').count();
                                    let mut rest = line;
                                    if indent > 0 {
                                        rest = rest.split_at(indent).1;
                                    }
                                    out.push_str(format!("\t{}{}\n", "\t".to_string().repeat(indent), rest).as_str());
                                }
                                out.trim().to_string()
                            },
                            "FN:reduce_map_js" => {
                                let code = reduce_map_js(rules.clone());
                                let mut out: String = "".to_string();
                                for line in code.split("\n") {
                                    let indent = line.chars().take_while(|c| *c == '>').count();
                                    let mut rest = line;
                                    if indent > 0 {
                                        rest = rest.split_at(indent).1;
                                    }
                                    out.push_str(format!("\t{}{}\n", "\t".to_string().repeat(indent), rest).as_str());
                                }
                                out.trim().to_string()
                            },
                            _ => {
                                if a.starts_with("STR:") {
                                    a.as_str()[4..].to_string()
                                } else {
                                    "".to_string()    
                                }
                            }
                        }

                    },
                    _ => {
                        "".to_string()
                    }
                };
                template = template.replace(format!("###{}###", key).as_str(), &content);
            }


            // Write it out.
            let target = if targetpath.exists() {
                std::fs::OpenOptions::new().write(true).truncate(true).open(targetfile.clone()).unwrap()
            } else {
                std::fs::File::create(targetfile.clone()).unwrap()
            };
            let mut writer = BufWriter::new(target);
            writer.write(template.as_bytes()).expect(&format!(" Trouble writing: '{targetfile}' "));
            writer.flush().expect(&format!(" Trouble flushing: '{targetfile}' "));
            println!(" Generated {}", targetfile);
        }
    }
}


fn identify_terminals(rules: Vec<Rule>) -> HashMap<String,bool> {
    let mut result: HashMap<String,bool> = HashMap::new();
    // All the things in the rules.
    for rule in &rules {
        for i in &rule.right.clone() {
            match i {
                Some(t) => {
                    result.insert(t.clone(), true);
                },
                None => {}
            }
        }

    }
    // All the left hand sides are non-terminals.
    for rule in &rules {
        result.insert(rule.left.clone(), false);
    }
    return result;
}


fn first_sets(rules: Vec<Rule>) -> HashMap<String,Vec<Option<String>>> {
    let mut result: HashMap<String,Vec<Option<String>>> = HashMap::new();
    let terminals: HashMap<String,bool> = identify_terminals(rules.clone());

    // Our grammar does not define the lexemes so all rules are non-terminals
    for rule in &rules {
        if !result.contains_key(&rule.left) {
            result.insert(rule.left.clone(), Vec::new());
        }
    }

    let mut otherrules: Vec<Rule> = Vec::new();

    // Direct terminal population. Can ignore these rules later on.
    for r in &rules {
        if r.right[0] == None || *terminals.get(&r.right[0].clone().unwrap()).unwrap() {
            let existing: &mut Vec<Option<String>> = result.get_mut(&r.left.clone()).unwrap();
            if !existing.contains(&(r.right[0].clone())) {
                existing.push(r.right[0].clone());
            }
        } else {
            otherrules.push(r.clone());
        }
    }

    // Then repeat the others untill no changes are happening
    let mut changes: bool = true;
    while changes {
        changes = false;
        for r in &otherrules {
            let roc = Some(r.left.clone());
            let mut rc = 1;
            for i in r.right.clone() {
                if i == None || *terminals.get(&i.clone().unwrap()).unwrap() {
                    let existing: &mut Vec<Option<String>> = result.get_mut(&r.left.clone()).unwrap();
                    if !existing.contains(&i.clone()) {
                        existing.push(i.clone());
                        changes = true;
                    }
                    break; // Any terminals stop processing that rule.
                } else if i == None {
                    // We don't care about these.
                } else if i != roc {
                    let first_i: Vec<Option<String>> = result.get(&i.unwrap()).unwrap().clone();
                    let existing: &mut Vec<Option<String>> = result.get_mut(&r.left.clone()).unwrap();
                    // If not the last one ignore Nones, but take others and continue.
                    if first_i.contains(&None) && rc < r.right.len() {
                        for j in first_i {
                            if j != None && !existing.contains(&j.clone()) {
                                existing.push(j.clone());
                                changes = true;
                            }
                        }
                    } else {
                        for j in first_i {
                            if !existing.contains(&j.clone()) {
                                existing.push(j.clone());
                                changes = true;
                            }
                        }
                        break; // If no Nones stop.
                    }
                }
                rc += 1;
            }
        }
    }
    return result;
}

fn follow_sets(rules: Vec<Rule>) -> HashMap<String,Vec<String>> {
    let mut result: HashMap<String,Vec<String>> = HashMap::new();
    let mut lastresult: HashMap<String,Vec<String>>;
    let mut unique_rule_names: Vec<String> = Vec::new();
    let terminals: HashMap<String,bool> = identify_terminals(rules.clone());


    let firsts = first_sets(rules.clone());

    // Our grammar does not define the lexemes so all rules are for non-terminals
    for rule in &rules {
        if !result.contains_key(&rule.left) {
            result.insert(rule.left.clone(), Vec::new());
            unique_rule_names.push(rule.left.clone());
        }
    }

    // Special "Start" rule
    if result.contains_key(&"Start".to_string()) {
        let existing: &mut Vec<String> = result.get_mut(&"Start".to_string()).unwrap();
        existing.push("END OF FILE".to_string()); // Our end of string token.
    }

    let mut changes: bool = true;
    while changes {
        lastresult = result.clone();
        changes = false;
        for un in &unique_rule_names {
            let existing: &mut Vec<String> = result.get_mut(&un.clone()).unwrap();
            for r in &rules {
                if r.right.contains(&Some(un.clone())) {
                    // End of rule
                    if r.right[r.right.len() - 1] == Some(un.clone()) {
                        for fol in lastresult.get(&r.left.clone()).unwrap() {
                            if !existing.contains(&fol.clone()) {
                                changes = true;
                                existing.push(fol.clone());
                            }
                        }
                    }
                    // Before something?
                    for (i, t) in r.right.iter().enumerate() {
                        if t == &Some(un.clone()) && (i < r.right.len() - 1) {
                            let next = r.right[i + 1].clone();
                            if !(next == None || *terminals.get(&next.clone().unwrap()).unwrap()) {
                                // Before other non-terminal.
                                let mut hasempty = false;
                                for frst in firsts.get(&next.clone().unwrap()).unwrap() {
                                    if *frst != None && !existing.contains(&frst.clone().unwrap()) {
                                        changes = true;
                                        existing.push(frst.clone().unwrap());
                                    } else if *frst == None {
                                        hasempty = true;
                                    }
                                }
                                if hasempty {
                                    for fol in lastresult.get(&r.left.clone()).unwrap() {
                                        if !existing.contains(&fol.clone()) {
                                            changes = true;
                                            existing.push(fol.clone());
                                        }
                                    }           
                                }
                            } else if next != None {
                                if !existing.contains(&next.clone().unwrap()) {
                                    changes = true;
                                    existing.push(next.clone().unwrap());
                                }
                            } else {
                                // Followed by empty? Makes no sense.
                            }
                        }
                    }
                }
            }

        }
    }

    return result;
}


fn closures_and_transitions(rules: Vec<Rule>) -> (Vec<Closure>,HashMap<usize,HashMap<String,usize>>) {
    let terminals: HashMap<String,bool> = identify_terminals(rules.clone());
    let mut closures: Vec<Closure> = Vec::new();
    let mut transitions: HashMap<usize,HashMap<String,usize>> = HashMap::new();

    // Init the first closure.
    let mut first_closure = Closure {num: 0, rules: Vec::new()};
    // Find the start rule and add it to that first closure.
    for rule in &rules {
        if rule.left == "Start" {
            first_closure.rules.push((rule.clone(), 0));
            break;
        }
    }
    // Then find the ones with suitable next step untill no new ones are found.
    let mut grew = true;
    let mut handled_non_terminals: Vec<String> = Vec::new();
    while grew {
        grew = false;
        let mut non_terminals_after_the_dot: Vec<String> = Vec::new();
        for (rule, dp) in &first_closure.rules {
            if *dp < rule.right.len() {
                let tok: Option<String> = rule.right[*dp].clone();
                if tok != None && !*terminals.get(&tok.clone().unwrap()).unwrap() &&
                    !non_terminals_after_the_dot.contains(&tok.clone().unwrap()) &&
                    !handled_non_terminals.contains(&tok.clone().unwrap()) {
                    non_terminals_after_the_dot.push(tok.clone().unwrap());
                }
            }
        }
        for nt in non_terminals_after_the_dot {
            handled_non_terminals.push(nt.clone());
            for rule in &rules {
                if rule.left == nt {
                    first_closure.rules.push((rule.clone(), 0));
                    grew = true;
                }
            }
        }
    }

    closures.push(first_closure);

    let mut next_split_state = 0;
    while closures.len() > next_split_state {
        let mut splits: HashMap<String,Vec<(Rule, usize)>> = HashMap::new();
        for (rule, pos) in &closures[next_split_state].rules {
            if *pos == rule.right.len() {
                // Reducing here.
                continue;
            }
            let next: Option<String> = rule.right[*pos].clone();
            match next {
                Some(n) => {
                    if !splits.contains_key(&n.clone()) {
                        splits.insert(n.clone(), Vec::new());
                    }
                    splits.get_mut(&n.clone()).unwrap().push((rule.clone(), pos + 1));
                },
                None => {
                    // Reducing here.
                    continue;
                }
            }
        }
        transitions.insert(next_split_state, HashMap::new());
        for (split, proposed) in splits.into_iter() {
            let mut target = 99999;
            // Do we have an equivalent closure among our existing ones?
            for (i, closure) in closures.iter().enumerate() { 
                if closure.rules.len() >= proposed.len() {
                    // Due to the algorithm the rules are in the same order no need
                    // to compare as sets but we need to note that after expansion 
                    // the other one might be longer.
                    let mut same = true;
                    for i in 0..proposed.len() {
                        if closure.rules[i] != proposed[i] {
                            same = false;
                            break;
                        }
                    }
                    if same {
                        target = i;
                        break;
                    }
                }
            }

            if target == 99999 {
                // We did not have a matching closure, create a new one.
                let mut new_closure = Closure {num: closures.len(), rules: proposed.clone()};

                grew = true;
                handled_non_terminals.clear();
                while grew {
                    grew = false;
                    let mut non_terminals_after_the_dot: Vec<String> = Vec::new();
                    for (rule,dp) in &new_closure.rules {
                        if *dp < rule.right.len() {
                            let tok: Option<String> = rule.right[*dp].clone();
                            if tok != None && !*terminals.get(&tok.clone().unwrap()).unwrap() &&
                                !non_terminals_after_the_dot.contains(&tok.clone().unwrap()) &&
                                !handled_non_terminals.contains(&tok.clone().unwrap()) {
                                non_terminals_after_the_dot.push(tok.clone().unwrap());
                            }
                        }
                    }
                    for nt in non_terminals_after_the_dot {
                        handled_non_terminals.push(nt.clone());
                        for rule in &rules {
                            if rule.left == nt {
                                new_closure.rules.push((rule.clone(), 0));
                                grew = true;
                            }
                        }
                    }
                }

                target = new_closure.num;
                closures.push(new_closure);
            }

            transitions.get_mut(&next_split_state).unwrap().insert(split, target);
        }


        next_split_state = next_split_state + 1;
    }


    return (closures, transitions);
}

// Shift/reduce table and the goto-table
fn tables(rules: Vec<Rule>) -> (Vec<HashMap<String, TableEntry>>, HashMap<usize, HashMap<String, usize>>) {
    let terminals: HashMap<String,bool> = identify_terminals(rules.clone());
    let follow_sets: HashMap<String,Vec<String>> = follow_sets(rules.clone());
    // closures: Vec<Closure>, transitions: HashMap<usize,HashMap<String,usize>>
    let (closures, transitions) = closures_and_transitions(rules.clone());

    // First construct a version of the shift/reduce assuming multiple items in cells
    // then look if it can be fixed.
    let mut worktable: Vec<HashMap<String, Vec<TableEntry>>> = Vec::new();
    let mut goto: HashMap<usize, HashMap<String, usize>> = HashMap::new();

    for closure in &closures {
        let mut table_line: HashMap<String, Vec<TableEntry>> = HashMap::new();
        // Reduces, items in closures that end with "dot".
        for (rule, pos) in &closure.rules {
            if *pos == rule.right.len() || rule.right[0] == None {
                for f in follow_sets.get(&rule.left).unwrap() {
                    if !table_line.contains_key(&f.clone()) {
                        table_line.insert(f.clone(), Vec::new());
                    }
                    if rule.right[0] == None {
                        table_line.get_mut(f).unwrap().push(TableEntry::Reduce(rule.num, 0, rule.left.clone()));
                    } else {
                        table_line.get_mut(f).unwrap().push(TableEntry::Reduce(rule.num, rule.right.len(), rule.left.clone()));
                    }
                }
            }
        }
        // Shifts
        for (tok, target) in transitions.get(&closure.num).unwrap() {
            if !terminals.get(&tok.clone()).unwrap() {
                if !goto.contains_key(&closure.num) {
                    goto.insert(closure.num, HashMap::new());
                }
                goto.get_mut(&closure.num).unwrap().insert(tok.clone(), *target);
            } else {
                if !table_line.contains_key(&tok.clone()) {
                    table_line.insert(tok.clone(), Vec::new());
                }
                table_line.get_mut(tok).unwrap().push(TableEntry::Shift(*target));
            }
        }

        worktable.push(table_line);
    }

    // Then check for conflicts and unwrap to single entries.
    let mut realtable: Vec<HashMap<String, TableEntry>> = Vec::new();
    for table_line in worktable {
        let mut real_line: HashMap<String, TableEntry> = HashMap::new();
        for (tok, options) in table_line {
            if options.len() == 1 {
                // The no conflicts case.
                real_line.insert(tok, options[0].clone());
            } else if options.len() == 2 {
                // So we have an issue. Either we have operator precedence issues or
                // we need to choose between shift and reduce (default shift).
                let mut shift: Option::<TableEntry> = None;
                let mut op: Option::<TableEntry> = None;
                let mut opcase = false;
                for option in &options {
                    match option {
                        TableEntry::Shift(_) => {
                            if shift == None {
                                shift = Some(option.clone());
                            } else {
                                panic!("More than two candidates for shift");
                            }
                        },
                        TableEntry::Reduce(_, _, _) => {
                            if op == None {
                                op = Some(option.clone());
                            }
                        }
                    }
                }
                // So if we have op and it is an operator
                match op {
                    Some(ref o) => {
                        match o {
                            TableEntry::Reduce(_,_,name) => {
                                if name == "OpInfix" || name == "OpPrefix" {
                                    opcase = true;
                                }
                            },
                            TableEntry::Shift(_) => {}
                        }
                    },
                    None => {}
                }

                if opcase {
                    match op.clone().unwrap() {
                        TableEntry::Reduce(rule,_ , name) => {
                            let mut op2 = tok.clone();
                            let mut op1;
                            if name == "OpInfix" || name == "OpSuffix" {
                                op1 = rules[rule].right[1].clone().unwrap();
                            } else {
                                op1 = rules[rule].right[0].clone().unwrap();
                            }
                            if OP_EQUIVALENCE.contains_key(&op1) {
                                op1 = OP_EQUIVALENCE.get(&op1).unwrap().to_string();
                            }
                            if OP_EQUIVALENCE.contains_key(&op2) {
                                op2 = OP_EQUIVALENCE.get(&op2).unwrap().to_string();
                            }

                            // Now do we have an op that we know must reduce or a shift case?
                            if ALWAYS_REDUCE_IF_OP1.contains(&&*op1) {
                                real_line.insert(tok.clone(), op.unwrap().clone());
                            } else if ALWAYS_REDUCE_IF_OP2.contains(&&*op2) {
                                real_line.insert(tok.clone(), op.unwrap().clone());
                            } else if REDUCE_PAIRS.contains(&(&*op1,&*op2)) {
                                real_line.insert(tok.clone(), op.unwrap().clone());
                            } else {
                                opcase = false;
                            }
                        },
                        TableEntry::Shift(_) => {
                            panic!("How did we even get here!?");
                        }
                    }
                }
                if !opcase {
                    real_line.insert(tok.clone(), shift.expect(&format!("{:?} No shift when trying to solve shift-reduce, i.e., reduce-reduce", options)));
                }
            } else {
                panic!("{:?} Too many options.", options)
            }
        }
        realtable.push(real_line);
    }

    return (realtable, goto);
}

fn condensedtables(rules: Vec<Rule>) -> ParserTables {
    // This constructs a condensed version suitable for use and storage.
    let mut result = ParserTables {
        nonterminals: Vec::new(),
        terminals: Vec::new(),
        rules_to_nonterminals: Vec::new(),
        rule_lengths: Vec::new(),
        table: Vec::new(),
        goto: HashMap::new()
    };

    // Basic operations.
    let terminals: HashMap<String,bool> = identify_terminals(rules.clone());
    let (extendedtable,goto) = tables(rules.clone());

    // Lets name all the nonterminals, try to identify how common they 
    // are and pick the numbering accordingly. 
    // Single digits take less room than two digits in the JSON goto table. 
    let mut token_counts: HashMap<String,u32> = HashMap::new();
    let mut nt_to_id: HashMap<String,usize> = HashMap::new();
    for (_state, moves) in goto.clone().into_iter() {
        for (nonterminal_token, _target) in moves.into_iter() {
            match token_counts.get(&nonterminal_token) {
                None => {
                    token_counts.insert(nonterminal_token, 1);
                },
                Some(c) => {
                    token_counts.insert(nonterminal_token, c + 1);
                }
            }
        }
    }
    let mut c = 1;
    while c > 0 {
        let mut max = 0;
        let mut item: String = "".to_string();
        for (token, count) in token_counts.clone().into_iter() {
            if count > max {
                max = count;
                item = token;
            }
        }
        nt_to_id.insert(item.clone(), result.nonterminals.len());
        result.nonterminals.push(item.clone());
        token_counts.shift_remove(&item);
        c = token_counts.len();
    }

    // Same for terminals.
    token_counts = HashMap::new();
    let mut t_to_id: HashMap<String,usize> = HashMap::new();
    for line in &extendedtable {
        for (token, _) in line.into_iter() {
            match token_counts.get(&token.clone()) {
                None => {
                    token_counts.insert(token.to_string(), 1);
                },
                Some(c) => {
                    token_counts.insert(token.to_string(), c + 1);
                }
            }
        }
    }
    c = 1;
    while c > 0 {
        let mut max = 0;
        let mut item: String = "".to_string();
        for (token, count) in token_counts.clone().into_iter() {
            if count > max {
                max = count;
                item = token;
            }
        }
        t_to_id.insert(item.clone(), result.terminals.len());
        result.terminals.push(item.clone());
        token_counts.shift_remove(&item);
        c = token_counts.len();
    }

    // Ensure that should any be missed it will be added as well. Basically the Start rule.
    for (token, is_termimal) in terminals.into_iter() {
        if !is_termimal && !nt_to_id.contains_key(&token) {
            nt_to_id.insert(token.clone(), result.nonterminals.len());
            result.nonterminals.push(token.clone());
        }
    }

    let mut sort_rules: HashMap<usize,usize> = HashMap::new();
    // Then the mapping from rules to them.
    for rule in &rules {
        sort_rules.insert(rule.num, *nt_to_id.get(&rule.left).unwrap());
        if rule.right[0] == None {
            result.rule_lengths.push(0);
        } else {
            result.rule_lengths.push(rule.right.len());
        }
    }
    for i in 0..sort_rules.len() {
        result.rules_to_nonterminals.push(*sort_rules.get(&i).unwrap());
    }

    // Tables.
    for line in &extendedtable {
        let mut new_line: HashMap<usize,CondensedShiftReduce> = HashMap::new();
        for (token, action) in line.into_iter() {
            new_line.insert(*t_to_id.get(token).unwrap(), CondensedShiftReduce::from(action));
        }
        result.table.push(new_line);
    }
    // Basically we are mapping the old nonterminal names to numbers to save space.
    for (state, moves) in goto.into_iter() {
        let mut new_moves: HashMap<usize, usize> = HashMap::new();
        for (nonterminal_token, target) in moves.into_iter() {
            new_moves.insert(*nt_to_id.get(&nonterminal_token).unwrap(), target);
        }
        result.goto.insert(state, new_moves);
    }


    return result;
}


fn condensedtables_to_phf(tables: ParserTables) -> String {
    let mut result: String = String::new();
    result.push_str("//! This is a code generated LALR parser table, do not modify.\n");
    result.push_str("//! Exists to avoid having to parse the JSON version and to use\n");
    result.push_str("//! compile-time perfect hash-maps.\n");
    result.push_str("use phf::phf_map;\n\n");
    result.push_str("pub struct ParserTables<'a> {
    pub nonterminals: &'a[&'a str],
    pub terminals: phf::Map<&'static str, usize>,
    pub rules_to_nonterminals: &'a[usize],
    pub rule_lengths: &'a[usize],
    pub table: &'a[phf::Map<usize, usize>],
    pub goto: phf::Map<usize, &'static phf::Map<usize, usize>>
}\n\n");
    result.push_str("#[derive(PartialEq)]
pub enum TableAction {
    Reduce(usize, usize, String, usize), // rule, count, and name and id of nonterminal
    Shift(usize), // Target state number
    None // No match
}\n\n");

    // Note that this is till using the odd/even encoding of the condenced tables
    // Mapping to something less evaluation heavy might make sense.
    result.push_str("impl ParserTables<'_> {
    // Decodes an action from the table.
    pub fn get_action(&self, state: usize, token: String) -> TableAction {
        if state > self.table.len() {
            // Maybe we should have a more specific return for this.
            println!(\"Something is wrong, you are looking for state {} when there is no such state\", state);
            return TableAction::None;
        }
        // TODO: maybe this list should be a map here.
        let t: &usize = self.terminals.get(&token).expect(\"Unknown token!\");
        let val = self.table[state].get(t);
        match val {
            None => {
                TableAction::None
            },
            Some(v) => {
                if v % 2 == 0 {
                    // Even ones are shifts.
                    TableAction::Shift(v/2)
                } else {
                    let rule = (v-1)/2;
                    let nt_id: usize = self.rules_to_nonterminals[rule];
                    TableAction::Reduce(rule, self.rule_lengths[rule], self.nonterminals[nt_id].to_string(), nt_id)
                }
            }
        }
    }
}\n\n");

    // So nested phf_maps don't exist at the time of this writing.
    // https://github.com/rust-phf/rust-phf/issues/183
    // thus we write these here.
    result.push_str("type NestedMap = phf::Map<usize, usize>;");
    for (state, table) in tables.goto.clone().into_iter() {
        result.push_str(&format!("static NESTED_GOTO_{state}: NestedMap = phf_map!{{\n"));
        for (k,v) in table.into_iter() {
            result.push_str(&format!("  {k}usize => {v}usize,\n"));
        }
        let _ = result.pop();
        let _ = result.pop();
        result.push_str("\n};\n\n");
    }


    // Then the table.
    result.push_str("pub static PARSERTABLES: ParserTables = ParserTables {\n");
    result.push_str("   nonterminals: &[");
    let mut first: bool = true;
    for nt in tables.nonterminals {
        if first {
            first = false;
            result.push_str(&format!("{:?}", nt));
        } else {
            result.push_str(&format!(",{:?}", nt));
        }
    }
    result.push_str("],\n");
    result.push_str("   terminals: phf_map! {");
    let mut first: bool = true;
    let mut i = 0;
    for nt in tables.terminals {
        if first {
            first = false;
            result.push_str(&format!("{:?} => {}usize", nt, i));
        } else {
            result.push_str(&format!(",{:?} => {}usize", nt, i));
        }
        i = i + 1;
    }
    result.push_str("},\n");
    result.push_str("   rules_to_nonterminals: &[");
    first = true;
    for rt in tables.rules_to_nonterminals {
        if first {
            first = false;
            result.push_str(&format!("{}", rt));
        } else {
            result.push_str(&format!(",{}", rt));
        }
    }
    result.push_str("],\n");
    result.push_str("   rule_lengths: &[");
    first = true;
    for rl in tables.rule_lengths {
        if first {
            first = false;
            result.push_str(&format!("{}", rl));
        } else {
            result.push_str(&format!(",{}", rl));
        }
    }
    result.push_str("],\n");
    result.push_str("   table: &[");
    first = true;
    for (i, table) in tables.table.into_iter().enumerate() {
        if !first {
            result.push_str(",\n")
        } else {
            first = false;
        }
        result.push_str(&format!("phf_map! {{ /* {i} */\n"));
        for (k,v) in table.into_iter() {
            match v {
                CondensedShiftReduce::Shift(s) => {
                    let vv: usize = s*2;
                    result.push_str(&format!("{}usize => {}usize,\n", k, vv));
                },
                CondensedShiftReduce::Reduce(r,_) => {
                    let vv: usize = r*2+1;
                    result.push_str(&format!("{}usize => {}usize,\n", k, vv));
                }
            }
        }
        // Undo the last comma.
        let _ = result.pop();
        let _ = result.pop();
        result.push_str("\n}");
    }
    result.push_str("],\n");

    result.push_str("   goto: phf_map! {");
    for (state, _) in tables.goto.into_iter() {
        result.push_str(&format!("   {state}usize => &NESTED_GOTO_{state},\n"));
    }
    // Undo the last comma.
    let _ = result.pop();
    let _ = result.pop();
    result.push_str("\n}\n");
    result.push_str("};\n\n");

    return result;
}


fn reduce_match_block(rules: Vec<Rule>) -> String {
    let mut result: String = "\n>match rule {\n".to_string();

    #[derive(Debug, Clone, Eq, PartialEq)]
    enum Val {
        Range(usize,usize),
        Single(usize)
    }

    // First identify common code using rules.
    let mut codes: HashMap<String,Vec<usize>> = HashMap::new();

    for rule in &rules {
        match codes.get(&rule.rs) {
            None => {
                codes.insert(rule.rs.clone(), vec![rule.num]);
            },
            Some(v) => {
                let mut newv: Vec<usize> = v.clone();
                newv.push(rule.num);
                codes.insert(rule.rs.clone(), newv);
            }
        }
    }

    // Then combine those to ranges
    let mut codesm: HashMap<String,Vec<Val>> = HashMap::new();
    for (code,items) in codes.into_iter() {
        let mut work: Vec<Val> = Vec::new();    
        let mut sorted = items.clone();
        sorted.sort();
        // Assume maximum rule number is smaller than this.
        let mut last: Val = Val::Single(99999);
        for v in sorted.clone() {
            if last == Val::Single(99999) {
                last = Val::Single(v);
            } else {
                match last {
                    Val::Single(n) => {
                        if n == v - 1 {
                            last = Val::Range(n, v);
                        } else {
                            work.push(last);
                            last = Val::Single(v);
                        }
                    },
                    Val::Range(l,u) => {
                        if u == v - 1 {
                            last = Val::Range(l, v);
                        } else {
                            work.push(last);
                            last = Val::Single(v);
                        }
                    }
                }
            }
        }
        work.push(last);
        codesm.insert(code.clone(), work);
    }

    let mut items: Vec<String> = Vec::new();
    for (code,matches) in codesm.into_iter() {
        let mut mitem: String = ">>".to_string();
        let mut first = true;
        for item in &matches {
            match item {
                Val::Single(n) => {
                    if first {
                        mitem.push_str(format!("{n} ").as_str());
                    } else {
                        mitem.push_str(format!("| {n} ").as_str());
                    }
                },
                Val::Range(l,u) => {
                    if first {
                        mitem.push_str(format!("{l}..={u} ").as_str());
                    } else {
                        mitem.push_str(format!("| {l}..={u} ").as_str());
                    }
                }
            }
            first = false;
        }
        mitem.push_str("=> {\n");
        // Generate the code to extract the terms from the stack in the correct format.
        let mut pop_lower = false;
        if code.contains("term4dv") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let term4dv = if let ParserStackItem::DualList(a,b) = stack.pop().unwrap() {(a,b)} else {panic!(\"Unexpected item in stack.\");};\n");
            pop_lower = true;
        } else if code.contains("term4v") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let term4v = if let ParserStackItem::List(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
            pop_lower = true;
        } else if code.contains("term4t") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let term4t = if let ParserStackItem::Token(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
            pop_lower = true;
        } else if code.contains("term4n") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let term4n = if let ParserStackItem::Node(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
            pop_lower = true;
        } else if code.contains("term4mn") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let mut term4mn = if let ParserStackItem::Node(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
            pop_lower = true;
        } else if code.contains("term4mv") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let mut term4mv = if let ParserStackItem::List(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
            pop_lower = true;
        }

        if code.contains("term3dv") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let term3dv = if let ParserStackItem::DualList(a,b) = stack.pop().unwrap() {(a,b)} else {panic!(\"Unexpected item in stack.\");};\n");
            pop_lower = true;
        } else if code.contains("term3v") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let term3v = if let ParserStackItem::List(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
            pop_lower = true;
        } else if code.contains("term3t") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let term3t = if let ParserStackItem::Token(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
            pop_lower = true;
        } else if code.contains("term3n") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let term3n = if let ParserStackItem::Node(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
            pop_lower = true;
        } else if code.contains("term3mn") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let mut term3mn = if let ParserStackItem::Node(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
            pop_lower = true;
        } else if code.contains("term3mv") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let mut term3mv = if let ParserStackItem::List(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
            pop_lower = true;
        } else if pop_lower {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop some unused token
        }

        if code.contains("term2dv") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let term2dv = if let ParserStackItem::DualList(a,b) = stack.pop().unwrap() {(a,b)} else {panic!(\"Unexpected item in stack.\");};\n");
            pop_lower = true;
        } else if code.contains("term2v") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let term2v = if let ParserStackItem::List(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
            pop_lower = true;
        } else if code.contains("term2t") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let term2t = if let ParserStackItem::Token(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
            pop_lower = true;
        } else if code.contains("term2n") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let term2n = if let ParserStackItem::Node(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
            pop_lower = true;
        } else if code.contains("term2mn") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let mut term2mn = if let ParserStackItem::Node(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
            pop_lower = true;
        } else if code.contains("term2mv") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let mut term2mv = if let ParserStackItem::List(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
            pop_lower = true;
        } else if pop_lower {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop some unused token
        }

        if code.contains("term1dv") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let term1dv = if let ParserStackItem::DualList(a,b) = stack.pop().unwrap() {(a,b)} else {panic!(\"Unexpected item in stack.\");};\n");
            pop_lower = true;
        } else if code.contains("term1v") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let term1v = if let ParserStackItem::List(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
            pop_lower = true;
        } else if code.contains("term1t") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let term1t = if let ParserStackItem::Token(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
            pop_lower = true;
        } else if code.contains("term1n") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let term1n = if let ParserStackItem::Node(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
            pop_lower = true;
        } else if code.contains("term1mn") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let mut term1mn = if let ParserStackItem::Node(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
            pop_lower = true;
        } else if code.contains("term1mv") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let mut term1mv = if let ParserStackItem::List(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
            pop_lower = true;
        } else if pop_lower {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop some unused token
        }

        if code.contains("term0dv") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let term0dv = if let ParserStackItem::DualList(a,b) = stack.pop().unwrap() {(a,b)} else {panic!(\"Unexpected item in stack.\");};\n");
        } else if code.contains("term0v") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let term0v = if let ParserStackItem::List(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
        } else if code.contains("term0t") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let term0t = if let ParserStackItem::Token(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
        } else if code.contains("term0n") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let term0n = if let ParserStackItem::Node(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
        } else if code.contains("term0mn") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let mut term0mn = if let ParserStackItem::Node(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
        } else if code.contains("term0mv") {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let mut term0mv = if let ParserStackItem::List(a) = stack.pop().unwrap() {a} else {panic!(\"Unexpected item in stack.\");};\n");
        } else if pop_lower {
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop the state.
            mitem.push_str(">>>let _ = stack.pop();\n"); // Pop some unused token
        }

        for line in code.split("\n") {
            mitem.push_str(">>>");
            mitem.push_str(line);
            mitem.push_str("\n");
        }
        mitem.push_str(">>}");
        items.push(mitem);
    }
    items.sort();
    result.push_str(items.join(",\n").as_str());


    result.push_str(",\n>>_ => {\n>>>panic!(\"Unknown rule.\");\n>>}\n");

    result.push_str(">}");

    return result;
}

fn reduce_map_php(rules: Vec<Rule>) -> String {
    let mut result: String = "[\n".to_string();
    let mut codes: HashMap<(usize,String),usize> = HashMap::new();

    for rule in &rules {
        let rl: usize = if rule.right.contains(&None) { 0 } else {rule.right.len()};

        match codes.get(&(rl, rule.php.clone())) {
            None => {
                if codes.len() > 0 {
                    result.push_str(",\n");
                }
                result.push_str(&format!(">[{},{}]", rl, rule.num));
                codes.insert((rl, rule.php.clone()), rule.num);
            },
            Some(v) => {
                result.push_str(&format!(",\n>[{},{}]", rl, v));
            }
        }
    }

    result.push_str("\n]");
    return result;
}

fn reduce_functions_php(rules: Vec<Rule>) -> String {
    let mut result: String = "".to_string();
    // First identify common code using rules.
    let mut codes: HashMap<(usize,String),Vec<Rule>> = HashMap::new();

    let mut order: Vec<(usize, String)> = Vec::new();

    for rule in &rules {
        let rl: usize = if rule.right.contains(&None) { 0 } else {rule.right.len()};

        match codes.get(&(rl, rule.php.clone())) {
            None => {
                order.push((rl, rule.php.clone()));
                codes.insert((rl, rule.php.clone()), vec![rule.clone()]);
            },
            Some(v) => {
                let mut newv: Vec<Rule> = v.clone();
                newv.push(rule.clone());
                codes.insert((rl, rule.php.clone()), newv);
            }
        }
    }

    for (rl, code) in &order {
        result.push_str("\n/**");
        result.push_str("\n * Reduce logic for rules:");
        for rule in codes.get(&(*rl, code.clone())).expect("Must have rules.") {
            result.push_str(&format!("\n * {}: {} -> ", rule.num, rule.left));
            for i in &rule.right {
                match i {
                    None => {
                        result.push_str("  END OF FILE");
                    },
                    Some(v) => {
                        result.push_str(&format!("  {}", v));
                    }
                }
            }
        }
        result.push_str("\n */");
        let firstnum = codes.get(&(*rl, code.clone())).expect("Must have rules.")[0].num;
        result.push_str(&format!("\nprivate function r{}(", firstnum));
        let mut first = true;
        let mut length: usize = *rl;
        while length > 0 {
            if first {
                first = false;
            } else {
                result.push_str(", ");
            }
            length = length - 1;
            result.push_str(&format!("$term{}", length));
        }
        result.push_str(") {\n");

        for line in code.split("\n") {
            result.push_str(">");
            result.push_str(line);
            result.push_str("\n");
        }

        result.push_str("\n>return $term;\n}\n");
    }


    result.push_str("");
    return result;
}


fn reduce_map_js(rules: Vec<Rule>) -> String {
    let mut result: String = "[\n".to_string();
    let mut codes: HashMap<(usize,String),usize> = HashMap::new();

    for rule in &rules {
        let rl: usize = if rule.right.contains(&None) { 0 } else {rule.right.len()};

        let mut code: String = "(".to_string();
        let mut length: usize = rl;
        let mut first = true;
        while length > 0 {
            if first {
                first = false;
            } else {
                code.push_str(", ");
            }
            length = length - 1;
            code.push_str(&format!("term{}", length));
        }
        if rule.js.find(';') == None {
            code.push_str(") => ");
            code.push_str(&rule.js.clone());
        } else {
            code.push_str(") => {\n");
            code.push_str(&rule.js.clone());
            code.push_str("}");
        }

        match codes.get(&(rl, code.clone())) {
            None => {
                if codes.len() > 0 {
                    result.push_str(",\n");
                }
                result.push_str(&format!(">[{},{}]", rl, code));
                codes.insert((rl, code), rule.num);
            },
            Some(v) => {
                result.push_str(&format!(",\n>[{},{}]", rl, v));
            }
        }
    }

    result.push_str("\n]");
    return result;
}


fn compress_to_js_string(raw: String) -> String {
    // Identifies unused sequences and replaces most common ones,
    // As long as the resulting string with the replacement commands
    // is shorter than the original. Will pick between "" and '' strings,
    // and returns fully escaped and wrapped version.
    // NOTE! Assumes that the string is ASCII.
    let mut work: String = raw;

    let mut replaces: String = "".to_string();
    let mut freechars: Vec<char> = Vec::new();
    for i in 32..=126 { // Visible, ASCII-7bit
        // ", ', and \
        if i != 34 && i != 39 && i != 92 && work.chars().position(|c| c == (i as u8 as char)) == None {
            freechars.push(i as u8 as char);
        }
    }

    // First figure out if we want '' or "" string?
    let mut single_count: usize = 0;
    let mut double_count: usize = 0;
    for i in 0..work.len() {
        if work.as_bytes()[i] == 39 {
            single_count = single_count + 1;
        } else if work.as_bytes()[i] == 34 {
            double_count = double_count + 1;
        }
    }
    let wrap_single: bool = double_count > single_count;
    if wrap_single && single_count > 11 {
        // More escaping than replace.
        let used = freechars.pop().expect("Expected there to be some chars.");
        work = work.replace('\'', &used.to_string());
        replaces.push_str(&format!(".replaceAll('{}',\"'\"){}", used, replaces));
    }
    if !wrap_single && double_count > 11 {
        // More escaping than replace.
        let used = freechars.pop().expect("Expected there to be some chars.");
        work = work.replace('"', &used.to_string());
        replaces.push_str(&format!(".replaceAll('{}','\"'){}", used, replaces));
    }

    let mut bestscore: usize = 0;

    // Single char cases.
    while freechars.len() > 0 {
        let used = freechars.pop().unwrap();
        // Find the most repeated substring of atleast two chars.
        // Also no unicode here so bytes are fine.
        let mut counts: HashMap<String,usize> = HashMap::new();
        for len in (2..8).rev() {
            for i in 0..(work.chars().count()-len) {
                let subs: String = work[i..i+len].to_string();
                match counts.get(&subs) {
                    Some(n) => counts.insert(subs, n + 1),
                    None => counts.insert(subs, 1)
                };
            }
        }

        bestscore = 0;
        let mut bestsubs: String = "NO SUCH STRING".to_string();
        for (subs, count) in counts.into_iter() {
            let score: usize = (subs.len()-1)*count;
            if count > bestscore {
                bestscore = score;
                bestsubs = subs.clone();
            }
        }
        if bestscore < format!(".replaceAll('{}','{}')", used, bestsubs).len() + 1 {
            break;
        }

        work = work.replace(&bestsubs, &used.to_string());
        replaces = format!(".replaceAll('{}','{}'){}", used, bestsubs, replaces);
    }

    while bestscore > 25 {
        // First find a pairing not present in any permutation.
        let mut pair: Option<String> = None;

        for i in 33..=126 { // Visible, ASCII-7bit
            // ", ', and \
            if i != 34 && i != 39 && i != 92 {
                for j in 33..=126 { // Visible, ASCII-7bit
                    // ", ', and \
                    if i != j && j != 34 && j != 39 && j != 92 {
                        let test1 = format!("{}{}", i as u8 as char, j as u8 as char);
                        let test2 = format!("{}{}", j as u8 as char, i as u8 as char);
                        if !(work.contains(&test1) || work.contains(&test2)) {
                            pair = Some(test1);
                            break;
                        }
                    }
                }
            }
            if pair != None {
                break;
            }
        }

        if pair == None {
            break;
        }
        // Find the most repeated substring of atleast three chars.
        // Also no unicode here so bytes are fine.
        let mut counts: HashMap<String,usize> = HashMap::new();
        for len in (3..8).rev() {
            for i in 0..(work.chars().count()-len) {
                let subs: String = work[i..i+len].to_string();
                match counts.get(&subs) {
                    Some(n) => counts.insert(subs, n + 1),
                    None => counts.insert(subs, 1)
                };
            }
        }

        bestscore = 0;
        let mut bestsubs: String = "NO SUCH STRING".to_string();
        for (subs, count) in counts.into_iter() {
            let score: usize = (subs.len()-2)*count;
            if count > bestscore {
                bestscore = score;
                bestsubs = subs.clone();
            }
        }
        if bestscore < format!(".replaceAll('{}','{}')", pair.clone().unwrap(), bestsubs).len() + 1 {
            break;
        }

        work = work.replace(&bestsubs, &pair.clone().unwrap().to_string());
        replaces = format!(".replaceAll('{}','{}'){}", pair.clone().unwrap(), bestsubs, replaces);
    }


    // Finally escape if need be and join the replacements to the output.
    if wrap_single {
        work = work.replace('\'', "\\'");
        work = format!("'{}'{}", work, replaces);
    } else {
        work = work.replace('"', "\\\"");
        work = format!("'{}'{}", work, replaces);
    }

    return work;
}


fn condensedtables_js_compres(tables: ParserTables) -> String {
    // Does some work to make the JSON format tables fit into a "String" within the JS-code.
    // Replaces some chars to make things more compact. Saves 30-50% depending on grammar variant.
    let work: String = serde_json::to_string(&tables).expect("No reason to not serialise?");

    return compress_to_js_string(work);
}