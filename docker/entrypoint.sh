#!/bin/sh
set -e
node_modules/.bin/typeorm migration:run -d dist/database/data-source.js
exec node dist/main.js
