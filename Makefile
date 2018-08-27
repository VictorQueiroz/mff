docs:
	./node_modules/.bin/typedoc --out docs

release: test
	./node_modules/.bin/tsc && \
	cp -rv src/code-generator/templates lib/code-generator

test:
	./node_modules/.bin/sarg \
	--require=ts-node/register \
	--bail \
	--ignore "test/utilities.ts" \
	"test/**/*.ts"

.PHONY: test release docs