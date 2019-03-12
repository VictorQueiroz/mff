docs:
	./node_modules/.bin/typedoc --out docs

release: test
	./node_modules/.bin/tsc && \
	cp -rv src/code-generator/templates lib/code-generator

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