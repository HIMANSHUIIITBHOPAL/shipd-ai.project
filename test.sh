#!/bin/bash
set -e

OUTPUT_PATH="results.xml"
MODE="new"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --output_path)
      OUTPUT_PATH="$2"
      if [[ "$OUTPUT_PATH" != /* ]]; then
        # Ensure absolute path if relative is provided, though usually --output_path is absolute
        OUTPUT_PATH="$(pwd)/$OUTPUT_PATH"
      fi
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

# Fallback empty testsuite just in case
echo '<?xml version="1.0" encoding="UTF-8"?><testsuites></testsuites>' > "$OUTPUT_PATH"

echo "Running npm install to ensure dependencies..."
npm install --save-dev vitest > /dev/null 2>&1

echo "Running vitest ($MODE)..."

# Exit code tracking disabled temporarily so we can write it properly
set +e

if [ "$MODE" = "base" ]; then
  npx vitest run spec/ --reporter=junit --outputFile="$OUTPUT_PATH" --exclude "**/*contentLinter.test.js"
else
  npx vitest run spec/lib/contentUtils/contentLinter.test.js --reporter=junit --outputFile="$OUTPUT_PATH"
fi

exit_code=$?

echo "Test runner finished with exit code $exit_code."
exit $exit_code
