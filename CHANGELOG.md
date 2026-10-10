# Changelog

Rendered by CI and committed back at the end of a release -- do not edit by
hand. Release notes also appear on the GitHub Releases page, one per tag.

## [1.7.10](https://github.com/hyperi-io/dfe-ui/compare/v1.7.9...v1.7.10) (2026-10-10)

### Bug Fixes

* link errors to fields, mark required ones ([#518](https://github.com/hyperi-io/dfe-ui/issues/518)) ([dc285ed](https://github.com/hyperi-io/dfe-ui/commit/dc285eda3f1264956977e75e114b4c102c567e44)), closes [#516](https://github.com/hyperi-io/dfe-ui/issues/516)
* show form errors beside hints and make the hunt target table optional ([#516](https://github.com/hyperi-io/dfe-ui/issues/516)) ([bbae391](https://github.com/hyperi-io/dfe-ui/commit/bbae391111b64cef1f7361900a0b113f624dbed2))

## [1.7.9](https://github.com/hyperi-io/dfe-ui/compare/v1.7.8...v1.7.9) (2026-10-10)

### Bug Fixes

* accept the lint-only braces advisory with its reason ([#514](https://github.com/hyperi-io/dfe-ui/issues/514)) ([95e24ad](https://github.com/hyperi-io/dfe-ui/commit/95e24ad21f407c7ea38893bab1d89d37b5a3ac7f))
* match name fields to the engine's rules ([#515](https://github.com/hyperi-io/dfe-ui/issues/515)) ([e8950fd](https://github.com/hyperi-io/dfe-ui/commit/e8950fd7114eae15013e4e2696ce2950e366e058))

## [1.7.8](https://github.com/hyperi-io/dfe-ui/compare/v1.7.7...v1.7.8) (2026-10-10)

### Bug Fixes

* drop the Google admin email from the OIDC provider forms ([#512](https://github.com/hyperi-io/dfe-ui/issues/512)) ([fc6fb38](https://github.com/hyperi-io/dfe-ui/commit/fc6fb3824d951227a183fb032704d4e407dc9708))
* give the CI workflow an explicit permissions ceiling ([#509](https://github.com/hyperi-io/dfe-ui/issues/509)) ([5db7a49](https://github.com/hyperi-io/dfe-ui/commit/5db7a49ceeda38e76d5bba72efb790998a5637f5))
* match the OIDC provider forms to the engine ([#513](https://github.com/hyperi-io/dfe-ui/issues/513)) ([02049f2](https://github.com/hyperi-io/dfe-ui/commit/02049f2762aa58ace387051f8e44641d0b79e7e7))

## [1.7.7](https://github.com/hyperi-io/dfe-ui/compare/v1.7.6...v1.7.7) (2026-10-09)

### Bug Fixes

* clear next, sharp and source-map-js security advisories ([#502](https://github.com/hyperi-io/dfe-ui/issues/502)) ([a82a9d0](https://github.com/hyperi-io/dfe-ui/commit/a82a9d09f0978dcc3a6680e17648067d57b0934e))
* commit dfe-ui's deployment contract ([#501](https://github.com/hyperi-io/dfe-ui/issues/501)) ([4e2118c](https://github.com/hyperi-io/dfe-ui/commit/4e2118c17a5aec55f573d522dd0897e0cb9e5fd2))
* fix OIDC delete and soft delete users ([#507](https://github.com/hyperi-io/dfe-ui/issues/507)) ([2fdf52c](https://github.com/hyperi-io/dfe-ui/commit/2fdf52ce42e2f5f116b06d2dedf4fec5c59ef8e4))
* high priority issues asst ([#505](https://github.com/hyperi-io/dfe-ui/issues/505)) ([1125181](https://github.com/hyperi-io/dfe-ui/commit/11251811dc0df0262aa28f6254c89aa9ab904da6))

## [1.4.0](https://github.com/hyperi-io/dfe-ui/compare/v1.3.9...v1.4.0) (2026-08-31)

### Features

* app-management and library engine seam ([e6eb78e](https://github.com/hyperi-io/dfe-ui/commit/e6eb78e7871c206efc5a3953908061469359788f))
* backing-service dials on the Components page ([bc379c1](https://github.com/hyperi-io/dfe-ui/commit/bc379c15909719ae98a1724cd70a8da914314580))
* consume the five app-management contract additions ([d5f3d44](https://github.com/hyperi-io/dfe-ui/commit/d5f3d44daf7d3a3e3d25f2297a101cc027b55a46))
* Playwright cover for the app-management surfaces ([b213419](https://github.com/hyperi-io/dfe-ui/commit/b213419146eded87e56953aebec9dcdce0f92131))
* tests for the app-management areas ([5f26213](https://github.com/hyperi-io/dfe-ui/commit/5f2621335367bb9f4f3e321b2ada735dd4d55360))
* the app-management specs run live against a gitops engine ([2438e42](https://github.com/hyperi-io/dfe-ui/commit/2438e423f7350dd9a1ba5c9216ec55310ad0046c))
* the three app-management areas ([d3f99f9](https://github.com/hyperi-io/dfe-ui/commit/d3f99f9cf4fd80228a2fb385f77305b0ae3c4558))

### Bug Fixes

* clone source 183 ([#184](https://github.com/hyperi-io/dfe-ui/issues/184)) ([52d698c](https://github.com/hyperi-io/dfe-ui/commit/52d698c0e4772fd7e3cedcb5cb5711c1b9aae53c))
* dfe-ui-version-172 ([#179](https://github.com/hyperi-io/dfe-ui/issues/179)) ([2bb1413](https://github.com/hyperi-io/dfe-ui/commit/2bb14131aa31bb85d8b6a541b2246eb0015299af))
* **observe:** give hunt results its own sidebar entry ([8a06473](https://github.com/hyperi-io/dfe-ui/commit/8a06473a66f30ad0632912d38002ebbf1ef93619))
* **test:** size the library scene's first-paint waits for a loaded runner ([72b3161](https://github.com/hyperi-io/dfe-ui/commit/72b316120758d5280abe4ed1065723678df5a255))
* **test:** the library scene waits take prettier's expanded call shape ([47925f0](https://github.com/hyperi-io/dfe-ui/commit/47925f05cd2f6c9773fd052b20384fcdbe339819))
* the schema list stops claiming to be empty while it loads ([b04e4cd](https://github.com/hyperi-io/dfe-ui/commit/b04e4cd87ebca2c30a84c457c3aa50eeed2a6c8a))

## [1.3.9](https://github.com/hyperi-io/dfe-ui/compare/v1.3.8...v1.3.9) (2026-08-23)

### Bug Fixes

* **setup-wizard:** advance break-glass step on completed_steps, not merged ([c8e654e](https://github.com/hyperi-io/dfe-ui/commit/c8e654ec3757dbf2743a7299ca81e27efbae198b)), closes [#170](https://github.com/hyperi-io/dfe-ui/issues/170)

## [1.3.8](https://github.com/hyperi-io/dfe-ui/compare/v1.3.7...v1.3.8) (2026-08-21)

### Bug Fixes

* break glass account auto merge ([#165](https://github.com/hyperi-io/dfe-ui/issues/165)) ([0a08507](https://github.com/hyperi-io/dfe-ui/commit/0a0850765db2629b50245269c29dc397a1ec5e44))
* **ui:** DFE-branded colour logo in the sidebar, right-justified ([#168](https://github.com/hyperi-io/dfe-ui/issues/168)) ([f2b1a52](https://github.com/hyperi-io/dfe-ui/commit/f2b1a52469c36a5b1d37e593f51b61354c5f6189))

## [1.3.7](https://github.com/hyperi-io/dfe-ui/compare/v1.3.6...v1.3.7) (2026-08-20)

### Bug Fixes

* **orgs:** the Organisation IDs field takes tenant IDs, not other orgs ([#152](https://github.com/hyperi-io/dfe-ui/issues/152)) ([9625044](https://github.com/hyperi-io/dfe-ui/commit/9625044fcdac9bb637868626b640270d0ac61330)), closes [dfe-engine#155](https://github.com/hyperi-io/dfe-engine/issues/155)
* **ui:** break-glass reset uses a valid username (405) + skippable step ([#161](https://github.com/hyperi-io/dfe-ui/issues/161)) ([d790d8a](https://github.com/hyperi-io/dfe-ui/commit/d790d8ac6238c3b4e7bb995c6861db059848b013))
* **ui:** drop the stale bundled-dex reference in the proxy comment ([#162](https://github.com/hyperi-io/dfe-ui/issues/162)) ([31e8ad9](https://github.com/hyperi-io/dfe-ui/commit/31e8ad99029779bb6f053798b319ed04974e070d))
* **ui:** label the schemas nav item 'Meta Schemas' ([#163](https://github.com/hyperi-io/dfe-ui/issues/163)) ([eedbf1b](https://github.com/hyperi-io/dfe-ui/commit/eedbf1b26509b09b9710b54a017a8aa3efae744d))

## [1.3.6](https://github.com/hyperi-io/dfe-ui/compare/v1.3.5...v1.3.6) (2026-08-19)

### Bug Fixes

- **ui:** hide unpermitted functions + friendly no-access page ([4d4c6c9](https://github.com/hyperi-io/dfe-ui/commit/4d4c6c915327b6860595633e3b8e6f81b41ace6b))

## [1.3.5](https://github.com/hyperi-io/dfe-ui/compare/v1.3.4...v1.3.5) (2026-08-18)

## [1.3.4](https://github.com/hyperi-io/dfe-ui/compare/v1.3.3...v1.3.4) (2026-08-17)

## [1.3.3](https://github.com/hyperi-io/dfe-ui/compare/v1.3.2...v1.3.3) (2026-08-17)

## [1.3.2](https://github.com/hyperi-io/dfe-ui/compare/v1.3.1...v1.3.2) (2026-08-17)

## [1.3.1](https://github.com/hyperi-io/dfe-ui/compare/v1.3.0...v1.3.1) (2026-08-17)

## [1.3.0](https://github.com/hyperi-io/dfe-ui/compare/v1.2.0...v1.3.0) (2026-08-17)
