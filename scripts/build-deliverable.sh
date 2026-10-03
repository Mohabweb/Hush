#!/bin/sh
# Build the official ZIP deliverable from the project root.
# Usage: sh scripts/build-deliverable.sh <output-dir>
OUT="${1:-hush-delivery}"
rm -rf "$OUT"
mkdir -p "$OUT"
# Copy the project tree, excluding node_modules, dist, data, uploads, cookie/log files
cd /c/Users/Mega\ Store/Documents/New\ folder
find . -type d \( -name node_modules -o -name dist -o -name data -o -name uploads \) -prune -o -type f \
  -not \( -name 'cookies.txt' -o -name 'cookies2.txt' -o -name 'cookies3.txt' -o -name 'cookies4.txt' -o -name 'server.log' -o -name 'sheet.html' \) \
  -print | grep -vE '/node_modules|/dist/|/data/|/uploads/' \
  | cpio -o -H newc 2>/dev/null | gzip > "$OUT/hush-delivery.tar.gz" || true
echo "Deliverable archive: $OUT/hush-delivery.tar.gz"
echo "To make the ZIP: cd <project-root> && zip -r hush-delivery.zip hush-delivery"
