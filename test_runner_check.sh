#!/bin/bash
OUTPUT_PATH="results.xml"
MODE="new"

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --output_path) OUTPUT_PATH="$2"; shift ;;
        base) MODE="base" ;;
        new) MODE="new" ;;
        *) ;;
    esac
    shift
done

echo "MODE: $MODE"
echo "OUTPUT_PATH: $OUTPUT_PATH"
