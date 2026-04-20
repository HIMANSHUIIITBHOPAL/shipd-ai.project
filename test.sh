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

# Always run from /app where node_modules lives
cd /app

mkdir -p "$(dirname "$OUTPUT_PATH")"
echo '<?xml version="1.0" encoding="UTF-8"?><testsuites></testsuites>' > "$OUTPUT_PATH"

# Find vitest: check /app explicitly, then CWD, then PATH
if [ -f "/app/node_modules/.bin/vitest" ]; then
  VITEST="/app/node_modules/.bin/vitest"
elif [ -f "./node_modules/.bin/vitest" ]; then
  VITEST="./node_modules/.bin/vitest"
elif command -v vitest > /dev/null 2>&1; then
  VITEST="vitest"
else
  echo "ERROR: vitest not found" >&2
  exit 1
fi

if [ "$MODE" = "base" ]; then
  $VITEST run spec/ --reporter=junit --outputFile.junit="$OUTPUT_PATH" --exclude "**/*contentLinter.test.js"
else
  $VITEST run spec/lib/contentUtils/contentLinter.test.js --reporter=junit --outputFile.junit="$OUTPUT_PATH"
fi
