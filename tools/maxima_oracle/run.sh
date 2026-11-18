#!/bin/sh
# Compares the Rust parser's operator grouping with Maxima's own reader.
#
# Maxima is the STACK-Maxima image ../../../stack-maxima/STACK-maxima when it exists, which
# has STACK's operator declarations loaded; otherwise `maxima`, with the declarations from
# stack_operators.mac. Set TAV_MAXIMA to choose another (the declarations are then loaded).
# Copy output/stack_maxima_parser-crate/src/*.rs into ../stack_maxima_parser first; the
# dumper builds against that crate (the /opt/eleaga-dev-root layout).
set -e
cd "$(dirname "$0")"
IMAGE="$(cd ../../.. && pwd)/stack-maxima/STACK-maxima"
if [ -n "$TAV_MAXIMA" ]; then
    MAXIMA="$TAV_MAXIMA"; cat stack_operators.mac read.mac > run.mac
elif [ -x "$IMAGE" ]; then
    MAXIMA="$IMAGE"; cp read.mac run.mac
else
    MAXIMA=maxima; cat stack_operators.mac read.mac > run.mac
fi
python3 -I gen.py
"$MAXIMA" --very-quiet --batch=run.mac < /dev/null > maxima.log 2>&1
cargo build -q --manifest-path dump/Cargo.toml
dump/target/debug/dump < cases.txt > ours.txt
python3 -I compare.py
echo "Differences, if any, are in diffs.txt."
