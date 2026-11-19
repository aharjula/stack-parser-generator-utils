"""Compares how the Rust parser and Maxima's reader read short number-like inputs.

    python3 -I run.py [--chars CHARS] [--max-len N]

Every string of up to N characters (default 4) over CHARS (default digits, `.`, exponent
letters, signs, a letter and a space) goes to Maxima's reader (the STACK-Maxima image, or
TAV_MAXIMA) and to the parser (`../maxima_oracle/dump`). Both trees are normalised, numbers
by their value, and every difference is written to diffs.txt, grouped by kind. Three kinds
are intended: STACK's `+-` operator, bigfloats (`1b3`) read as FLOAT tokens, and floats too
large for a double, which Maxima rejects but STACK rewrites from their text.
"""
import argparse
import collections
import itertools
import os
import re
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
IMAGE = ROOT / "stack-maxima" / "STACK-maxima"
DUMP = HERE.parent / "maxima_oracle" / "dump"
sys.path.insert(0, str(HERE.parent / "maxima_oracle"))
import compare as trees  # noqa: E402  (the parser oracle's tree normalisation)

READ = r''':lisp (defun rt (s) (let ((r (catch 'macsyma-quit (handler-case (list 'ok (macsyma-read-string (concatenate 'string s "$"))) (error () nil))))) (if (and (consp r) (eq (car r) 'ok)) (write-to-string (cadr r) :pretty nil) "SYNTAXERROR")))
:lisp (with-open-file (in "cases.txt") (with-open-file (out "maxima.txt" :direction :output :if-exists :supersede) (loop for line = (read-line in nil) while line do (write-line (rt line) out))))
'''


def number(x):
    """A number's value as a comparable string, or None for anything else."""
    if isinstance(x, str):
        try:
            if re.fullmatch(r"[0-9]+", x):
                return f"int:{int(x)}"
            return f"float:{float(x)!r}"
        except ValueError:
            return None
    return None


def norm(t):
    """Numbers by value; bigfloats as such; everything else as it is."""
    if isinstance(t, tuple):
        if t and t[0] == "bigfloat":
            return "bigfloat"
        return tuple(norm(a) for a in t)
    n = number(t)
    return n if n is not None else t


def bigfloats(t):
    """Our floats as bigfloats, for inputs written with a `b` exponent."""
    if isinstance(t, tuple):
        return tuple(bigfloats(a) for a in t)
    return "bigfloat" if isinstance(t, str) and t.startswith("float:") else t


def overflows(ours):
    """Our tree has a float that is infinite as a double."""
    return any(t == "inf" or re.fullmatch(r"[0-9.]+[eE][+]?[0-9]+", t) and float(t) == float("inf")
               for t in trees.tokens(ours))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--chars", default="015.eEbd+-x ")
    ap.add_argument("--max-len", type=int, default=4)
    args = ap.parse_args()
    cases = []
    for n in range(1, args.max_len + 1):
        for t in itertools.product(args.chars, repeat=n):
            s = "".join(t)
            if s.strip() == s:  # no leading or trailing spaces
                cases.append(s)
    os.chdir(HERE)
    Path("cases.txt").write_text("\n".join(cases) + "\n")
    Path("run.mac").write_text(READ)
    maxima = os.environ.get("TAV_MAXIMA") or str(IMAGE)
    subprocess.run([maxima, "--very-quiet", "--batch=run.mac"], stdin=subprocess.DEVNULL,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    subprocess.run(["cargo", "build", "-q", "--manifest-path", str(DUMP / "Cargo.toml")], check=True)
    with open("cases.txt") as cin, open("ours.txt", "w") as cout:
        subprocess.run([str(DUMP / "target" / "debug" / "dump")], stdin=cin, stdout=cout, check=True)
    theirs = Path("maxima.txt").read_text().splitlines()
    ours = Path("ours.txt").read_text().splitlines()
    kinds = collections.defaultdict(list)
    for src, m, o in zip(cases, theirs, ours):
        if m == "SYNTAXERROR" or o in ("SYNTAXERROR", "PANIC"):
            if m == "SYNTAXERROR" and o not in ("SYNTAXERROR", "PANIC") and overflows(o):
                # Floats too large for a double stay FLOAT tokens: STACK rewrites them from
                # their text (as 1.0*10^500), so the parser leaves them to its users.
                kinds["float too large for Maxima (intended)"].append(f"{src!r}")
                continue
            if (m == "SYNTAXERROR") != (o == "SYNTAXERROR"):
                kind = "panic" if o == "PANIC" else ("only Maxima rejects" if m == "SYNTAXERROR" else "only ours rejects")
                kinds[kind].append(f"{src!r}: Maxima {m} | ours {o}")
            continue
        try:
            a = norm(trees.norm_max(trees.parse(trees.tokens(m))))
            b = norm(trees.norm_ours(trees.parse(trees.tokens(o))))
        except Exception as e:  # noqa: BLE001
            kinds["could not compare"].append(f"{src!r}: {e} | {m} | {o}")
            continue
        if a != b and re.search(r"[0-9.][bB][+-]?[0-9]", src) and a == bigfloats(b):
            # A bigfloat is a FLOAT token whose original text keeps the `b`.
            kinds["bigfloat as FLOAT (intended)"].append(f"{src!r}")
            continue
        if a != b and "+-" in src:
            # STACK reads `+-` as its plus-or-minus operator (the lexer's `pm` option).
            kinds["STACK's +- (intended)"].append(f"{src!r}")
            continue
        if a != b:
            kinds["read differently"].append(f"{src!r}: Maxima {trees.show(a)} | ours {trees.show(b)}")
    with open("diffs.txt", "w") as out:
        for k, xs in kinds.items():
            out.write(f"== {k}: {len(xs)}\n" + "\n".join(xs) + "\n")
    print(f"{len(cases)} inputs; " + ", ".join(f"{k}: {len(v)}" for k, v in kinds.items()))


if __name__ == "__main__":
    main()
