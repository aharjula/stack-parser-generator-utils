# Maxima as the oracle for the lexer

`run.py` reads every string of up to N characters over a set of characters (by default
digits, `.`, exponent letters, signs, a letter and a space; `--chars`, `--max-len`) with
Maxima's reader and with the Rust parser (`../maxima_oracle/dump`), normalises both trees
(numbers by their value) and writes the differences to `diffs.txt`, grouped by kind.

```
python3 -I run.py                                   # 19 008 number-like inputs
python3 -I run.py --chars "015.eEbd+-x " --max-len 5  # 228 096
python3 -I run.py --chars "1.ex_%a"                 # names next to the dot operator
```

Three kinds of difference are intended and reported as such: STACK's `+-` operator,
bigfloats (`1b3`) read as FLOAT tokens whose original text keeps the `b`, and floats too
large for a double, which Maxima rejects but STACK rewrites from their text (as
`1.0*10^500`). Strings, several statements (`;`, `$`) and top-level evaluation flags (`,`)
are beyond what the dump prints, so character sets with those show differences that are
the oracle's, not the parser's.

Copy `output/stack_maxima_parser-crate/src/*.rs` into `../../../stack_maxima_parser` first;
the dump builds against that crate. Maxima is the STACK-Maxima image
`../../../stack-maxima/STACK-maxima`, or `TAV_MAXIMA`.
