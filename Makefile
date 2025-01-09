
SHELL := /bin/bash
PATH  := ./node_modules/.bin:$(PATH)

SRC_FILES := $(shell find src -name '*.ts')

define VERSION_TEMPLATE
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = '$(shell node -p 'require("./package.json").version')';
endef

all: lib bundle

export VERSION_TEMPLATE
lib: $(SRC_FILES) node_modules
	tsc -p tsconfig.json --outDir lib && \
	echo "$$VERSION_TEMPLATE" > lib/version.js
	touch lib

dist/%.js: lib
	browserify $(filter-out $<,$^) --debug --full-paths \
		--standalone ctaiyi --plugin tsify \
		--transform [ babelify --extensions .ts ] \
		| derequire > $@
	uglifyjs $@ \
		--source-map "content=inline,url=$(notdir $@).map,filename=$@.map" \
		--compress "dead_code,collapse_vars,reduce_vars,keep_infinity,drop_console,passes=2" \
		--output $@ || rm $@

dist/ctaiyi.js: src/index-browser.ts

dist/ctaiyi.d.ts: $(SRC_FILES) node_modules
	dts-generator --name ctaiyi --project . --out dist/ctaiyi.d.ts
	sed -e "s@'ctaiyi/index'@'ctaiyi'@g" -i '' dist/ctaiyi.d.ts

dist/%.gz: dist/ctaiyi.js
	gzip -9 -f -c $(basename $@) > $(basename $@).gz

bundle: dist/ctaiyi.js.gz dist/ctaiyi.d.ts

.PHONY: coverage
coverage: node_modules
	nyc -r html -r text -e .ts -i ts-node/register mocha --exit --reporter nyan --require ts-node/register test/*.ts

.PHONY: test
test: node_modules
	mocha --exit --require ts-node/register -r test/_node.js test/*.ts --grep '$(grep)'

.PHONY: ci-test
ci-test: node_modules
	tslint -p tsconfig.json -c tslint.json
	nyc -r lcov -e .ts -i ts-node/register mocha --exit --reporter tap --require ts-node/register test/*.ts

.PHONY: browser-test
browser-test: dist/ctaiyi.js
	BUILD_NUMBER="$$(git rev-parse --short HEAD)-$$(date +%s)" \
		karma start test/_karma-sauce.js

.PHONY: browser-test-local
browser-test-local: dist/ctaiyi.js
	karma start test/_karma.js

.PHONY: lint
lint: node_modules
	tslint -p tsconfig.json -c tslint.json -t stylish --fix

node_modules:
	yarn install --non-interactive --frozen-lockfile

.PHONY: clean
clean:
	rm -rf lib/
	rm -f dist/*

.PHONY: distclean
distclean: clean
	rm -rf node_modules/
