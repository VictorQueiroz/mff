COMPILER_NAME := GCC
CMAKE_BUILD_TYPE := Debug
PWD := $(PWD)
BUILD_FOLDER := $(PWD)/tmp/cmake-build-$(COMPILER_NAME)-$(CMAKE_BUILD_TYPE)
CMAKE_CXX_COMPILER := g++
CMAKE_C_COMPILER := gcc

docs:
	npx typedoc --out docs

configure:
	mkdir -pv $(BUILD_FOLDER) && \
	cd $(BUILD_FOLDER) && \
	cmake \
		-DCMAKE_BUILD_TYPE=$(CMAKE_BUILD_TYPE) \
		-DCMAKE_CXX_COMPILER=$(CMAKE_CXX_COMPILER) \
		-DCMAKE_C_COMPILER=$(CMAKE_C_COMPILER) \
		-DCMAKE_EXPORT_COMPILE_COMMANDS=1 \
		$(PWD) && \
	ln -svf $(BUILD_FOLDER)/compile_commands.json $(PWD)/compile_commands.json

build: configure
	cd $(BUILD_FOLDER) && \
	make

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