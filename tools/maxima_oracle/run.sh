#!/bin/sh
# Compares the Rust parser's operator grouping with Maxima's own reader (needs `maxima`).
# Copy output/stack_maxima_parser-crate/src/*.rs into ../stack_maxima_parser first; the
# dumper builds against that crate (the /opt/eleaga-dev-root layout).
set -e
cd "$(dirname "$0")"
python3 -I gen.py
maxima --very-quiet --batch=stack_operators.mac > maxima.log 2>&1
cargo build -q --manifest-path dump/Cargo.toml
dump/target/debug/dump < cases.txt > ours.txt
python3 -I compare.py
echo "Differences, if any, are in diffs.txt."
