#!/bin/bash
cd "$(dirname "$0")"
[ -f config.json ] || cp config.exemplo.json config.json
while true; do node index.js; [ $? -ne 42 ] && break; done
