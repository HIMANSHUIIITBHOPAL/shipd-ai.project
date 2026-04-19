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

if [ "$MODE" = "base" ]; then
    npx vitest run spec/ --reporter=junit --outputFile.junit="$OUTPUT_PATH" --exclude "**/*contentLinter.test.js"
elif [ "$MODE" = "new" ]; then
    npx vitest run spec/lib/contentUtils/contentLinter.test.js --reporter=junit --outputFile.junit="$OUTPUT_PATH"
fi
