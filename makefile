SHELL := /bin/bash
#
# Makefile
#

.PHONY: help
.DEFAULT_GOAL := help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# ------------------------------------------------------------------------------------------------------------

install: ## Installs everything
	pnpm install

update: ## Updates all packages from package.json
	pnpm update

dev: ## Starts playground in development mode
	pnpm dev

clean: ## Cleans all dependencies
	rm -rf node_modules

# ------------------------------------------------------------------------------------------------------------

pr: ## Runs all pr scripts
	make vitest
	make lint

vitest: ## Runs all unit tests
	pnpm test

lint: ## Runs the linter
	pnpm lint

lint-fix: ## Runs the linter and fixes all fixable problems
	pnpm pnpm lint --fix
