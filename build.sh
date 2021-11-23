rm -rf dist
rm -rf dist-web
rm -rf dist-node

echo ">> Building node version"

#./node_modules/.bin/tsdx build --tsconfig tsconfig.node.json --target node

./node_modules/.bin/tsc --build tsconfig.node.json

#mv dist/ dist-node/

echo ">> Building web version"

#./node_modules/.bin/tsdx build --tsconfig tsconfig.json --target web

./node_modules/.bin/tsc --build tsconfig.web.json

#mv dist/ dist-web/

echo ">> Generating types"

./node_modules/.bin/tsc --build tsconfig.declarations.json

#echo ">> Restructuring files..."

#mkdir dist

#mv dist-web/ dist/web/
#mv dist-node/ dist/node/
#mv dist-types/ dist/types/



echo ">> All done."
