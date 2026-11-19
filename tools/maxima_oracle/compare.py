import re, sys, collections
NARY = {"+", "*", "and", "or", "nand", "nor", "xor", "xnor", "nounadd", "nounmul", "nouneq", "nounand", "nounor", "#pm#"}
MAX = {"MPLUS": "+", "MMINUS": "neg", "MTIMES": "*", "MQUOTIENT": "/", "MEXPT": "^", "MNCEXPT": "^^",
       "MNCTIMES": ".", "MEQUAL": "=", "MNOTEQUAL": "#", "MLESSP": "<", "MLEQP": "<=", "MGREATERP": ">",
       "MGEQP": ">=", "MAND": "and", "MOR": "or", "MNOT": "not", "MSETQ": ":", "MSET": "::", "MDEFINE": ":=",
       "MDEFMACRO": "::=", "MFACTORIAL": "!", "MQUOTE": "'", "%GENFACT": "!!"}
OURS = {"-": None, "**": "^", "pre-": "neg", "pre'": "'", "postx!": "!", "post!": "!", "post!!": "!!",
        "prenot": "not", "prenounnot": "nounnot", "prenounsub": "nounsub", "pre#pm#": "#pm#",
        "preUNARY_RECIP": "unary_recip"}

def tokens(s):
    return re.findall(r'"[^"]*"|\(|\)|\|[^|]*\||[^\s()]+', s)

def parse(toks):
    t = toks.pop(0)
    if t == "(":
        out = []
        while toks[0] != ")":
            out.append(parse(toks))
        toks.pop(0)
        return out
    return t

def norm_max(x):
    if isinstance(x, str):
        return x.strip("|").lstrip("$").lower()
    head = x[0][0] if isinstance(x[0], list) else x[0]
    name = MAX.get(head, head.strip("|").lstrip("$").lower())
    args = [norm_max(a) for a in x[1:]]
    if name == "!!":
        args = args[:1]
    if name == "+" and len(args) == 1:
        return args[0]
    return flat(name, args)

def norm_ours(x):
    if isinstance(x, str):
        return x.lower()
    op = x[0].strip('"')
    args = [norm_ours(a) for a in x[1:]]
    if op == "-" and len(args) == 2:
        return flat("+", [args[0], ("neg", args[1])])
    if op == "pre+":
        return args[0]
    name = OURS.get(op, op[3:] if op.startswith("pre") else op[4:] if op.startswith("post") else op)
    return flat(name.lower() if name != "UNARY_RECIP" else "unary_recip", args)

def flat(name, args):
    if name in NARY:
        out = []
        for a in args:
            if isinstance(a, tuple) and a[0] == name:
                out.extend(a[1:])
            else:
                out.append(a)
        args = out
    return (name, *args)

def show(t):
    if isinstance(t, str):
        return t
    return "(" + " ".join([t[0]] + [show(a) for a in t[1:]]) + ")"

def main():
    cases = open("cases.txt").read().splitlines()
    mx = open("maxima.txt").read().splitlines()
    us = open("ours.txt").read().splitlines()
    stats = collections.Counter()
    diffs = []
    for c, m, u in zip(cases, mx, us):
        if m == "SYNTAXERROR" and u == "SYNTAXERROR":
            stats["both reject"] += 1; continue
        if m == "SYNTAXERROR":
            stats["only Maxima rejects"] += 1; continue
        if u == "SYNTAXERROR":
            stats["only we reject"] += 1; diffs.append(("reject", c, show(norm_max(parse(tokens(m)))), "SYNTAXERROR")); continue
        a = norm_max(parse(tokens(m))); b = norm_ours(parse(tokens(u)))
        if a == b:
            stats["same"] += 1
        else:
            stats["DIFFERENT"] += 1; diffs.append(("diff", c, show(a), show(b)))
    print(dict(stats))
    with open("diffs.txt", "w") as f:
        for d in diffs:
            f.write("%s | %-28s | maxima %-40s | ours %s\n" % d)


if __name__ == "__main__":
    main()
