#!/bin/sh

OUTPUT_PATH="results.xml"
MODE="new"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --output_path)
      OUTPUT_PATH="$2"
      shift
      ;;
    base)
      MODE="base"
      ;;
    new)
      MODE="new"
      ;;
  esac
  shift
done

# Ensure results directory exists
mkdir -p "$(dirname "$OUTPUT_PATH")"
# Write a dummy XML in case commands fail and exit early
echo '<?xml version="1.0" encoding="UTF-8"?><testsuites></testsuites>' > "$OUTPUT_PATH"

# Install all dependencies required for the project (vitest is in package.json devDependencies)
echo "Installing dependencies..."
npm install > /dev/null 2>&1

echo "Running tests with vitest..."
if [ "$MODE" = "base" ]; then
  npx vitest run spec/ --reporter=junit --outputFile.junit="$OUTPUT_PATH" --exclude "**/*contentLinter.test.js"
else
  npx vitest run spec/lib/contentUtils/contentLinter.test.js --reporter=junit --outputFile.junit="$OUTPUT_PATH"
fi
