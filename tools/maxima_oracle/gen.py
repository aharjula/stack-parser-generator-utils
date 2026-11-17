B = "+ - * / ^ ** ^^ . = # < <= > >= and or : :: := ::= nand nor xor xnor implies nounadd nounmul noundiv nounpow nouneq nounand nounor #pm#".split()
P = ["-", "+", "not ", "nounnot ", "nounsub ", "#pm#", "'", "UNARY_RECIP "]
POST = ["!", "!!"]
cases = []
for o1 in B:
    for o2 in B:
        cases.append(f"a {o1} b {o2} c")
for p in P:
    for o in B:
        cases.append(f"{p}a {o} b")
        cases.append(f"a {o} {p}b")
        for o2 in B:
            cases.append(f"a {o} {p}b {o2} c")
for q in POST:
    for o in B:
        cases.append(f"a{q} {o} b")
        cases.append(f"a {o} b{q}")
    for p in P:
        cases.append(f"{p}a{q}")
open("cases.txt", "w").write("\n".join(cases) + "\n")
print(len(cases))
