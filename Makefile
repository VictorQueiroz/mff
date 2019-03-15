docs:
	./node_modules/.bin/typedoc --out docs

release: test
	npx tsc

coverage:
	npx nyc --report-dir dist/coverage --reporter html make test

generate_schemas:
	npx ts-node scripts/generate-schemas.ts

test: generate_schemas
	npx sarg \
	--require=ts-node/register \
	--bail \
	--ignore "test/utilities.ts" \
	"test/**/*.ts"

.PHONY: test release docs