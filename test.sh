#!/bin/bash

# Configuration
OUTPUT_PATH="results.xml"
MODE="new"

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --output_path) OUTPUT_PATH="$2"; shift ;;
        base) MODE="base" ;;
        new) MODE="new" ;;
        *) ;;
    esac
    shift
done

# We use the local vitest binary directly to avoid npx registry check hits (403 errors in offline envs)
VITEST="./node_modules/.bin/vitest"

if [ "$MODE" = "base" ]; then
    $VITEST run spec/ --reporter=junit --outputFile.junit="$OUTPUT_PATH" --exclude "**/*contentLinter.test.js"
elif [ "$MODE" = "new" ]; then
    $VITEST run spec/lib/contentUtils/contentLinter.test.js --reporter=junit --outputFile.junit="$OUTPUT_PATH"
fi
