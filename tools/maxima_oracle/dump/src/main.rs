use std::io::BufRead;
use stack_maxima_parser::parser::{MPNode, MPNodeType, StackMaximaParser};
fn sx(n: &MPNode) -> String {
    match &n.value {
        MPNodeType::Identifier(s) => s.clone(),
        MPNodeType::Integer(s, _) | MPNodeType::Float(s, _) => s.clone(),
        MPNodeType::Operation(l, op, r, _) => format!("(\"{}\" {} {})", op.trim(), sx(l), sx(r)),
        MPNodeType::PrefixOperation(op, x) => format!("(\"pre{}\" {})", op.trim(), sx(x)),
        MPNodeType::PostfixOperation(x, op) => format!("(\"post{}\" {})", op.trim(), sx(x)),
        MPNodeType::Group(xs) if xs.len() == 1 => sx(&xs[0]),
        MPNodeType::Statement(x, _) => sx(x),
        MPNodeType::Root(s, _, _) if s.len() == 1 => sx(&s[0]),
        _ => format!("<{}>", n.type_short()),
    }
}
fn main() {
    std::panic::set_hook(Box::new(|_| {}));
    for line in std::io::stdin().lock().lines() {
        let src = line.unwrap();
        let s2 = src.clone();
        let r = std::panic::catch_unwind(move || {
            let mut p = StackMaximaParser::new_no_insertions();
            p.parse(format!("{s2};")).map(|r| sx(&r))
        });
        match r {
            Ok(Some(t)) => println!("{t}"),
            Ok(None) => println!("SYNTAXERROR"),
            Err(_) => println!("PANIC"),
        }
    }
}
