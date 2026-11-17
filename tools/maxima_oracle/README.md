# Maxima as the oracle for operator precedence

`run.sh` generates about 10 000 expressions (`gen.py`): every pair of binary operators the
grammar knows (`a op1 b op2 c`), each prefix operator in front and inside, and the postfix
operators. Maxima reads them with STACK's operator declarations loaded
(`stack_operators.mac`, from `stack/maxima/noun_simp.mac`, `assessment.mac` and
`stack_logic.lisp`), and the Rust parser reads them too (`dump/`). `compare.py` normalises
both trees (binary `-` as `+` of a negation, Maxima's n-ary operators flattened, `!!` as
Maxima's `genfact`) and writes every difference to `diffs.txt`.

Maxima's reader also checks that logical operators get logical operands, so it rejects
`a+b and c`; the parser accepts those, which is counted as "only Maxima rejects" and is fine.

The binding powers the generator uses are in `INFIX_POWERS` and `PREFIX_POWERS` in
`src/main.rs`. Rerun this after changing them or adding an operator, and add the new
operator to `gen.py` (and its declaration to `stack_operators.mac` if STACK declares it).
