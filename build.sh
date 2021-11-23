#./node_modules/.bin/babel src --out-dir babel-dist --out-file babel-dist/index.js --extensions ".ts" --delete-dir-on-start

rm -rf dist

#./node_modules/.bin/tsup
#
#./node_modules/.bin/babel src --out-file dist/index.module.js --extensions ".ts"

#./node_modules/.bin/tsdx build --entry src/index.ts --target node --tsconfig ./tsconfig.node.json
./node_modules/.bin/tsdx build --entry src/index.ts --target web --tsconfig ./tsconfig.web.json

