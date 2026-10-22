# Changelog

Rendered by CI and committed back at the end of a release -- do not edit by
hand. Release notes also appear on the GitHub Releases page, one per tag.

## [1.7.28](https://github.com/hyperi-io/dfe-ui/compare/v1.7.27...v1.7.28) (2026-10-22)

### Bug Fixes

* answer 503 when the engine is unreachable and serve /brand without login ([#592](https://github.com/hyperi-io/dfe-ui/issues/592)) ([100de14](https://github.com/hyperi-io/dfe-ui/commit/100de14b3c000d869da62b4038ec7e04dd94b6f8))
* time out the engine probe, tidy error pages ([#593](https://github.com/hyperi-io/dfe-ui/issues/593)) ([db54bcb](https://github.com/hyperi-io/dfe-ui/commit/db54bcb619ef9dcc4b2e9015e57513e256b177ba))

## [1.7.27](https://github.com/hyperi-io/dfe-ui/compare/v1.7.26...v1.7.27) (2026-10-22)

### Bug Fixes

* **deps:** dedupe vite onto 8.3.4 so no 8.2.x launch-editor remains ([#585](https://github.com/hyperi-io/dfe-ui/issues/585)) ([90bb40f](https://github.com/hyperi-io/dfe-ui/commit/90bb40f3f8cac67ce7498ed86d785c187396a8a0)), closes [#153](https://github.com/hyperi-io/dfe-ui/issues/153) [#154](https://github.com/hyperi-io/dfe-ui/issues/154) [#155](https://github.com/hyperi-io/dfe-ui/issues/155)
* **deps:** update storybook to 10.6.2 for CVE-2026-114125 ([#586](https://github.com/hyperi-io/dfe-ui/issues/586)) ([cee0c99](https://github.com/hyperi-io/dfe-ui/commit/cee0c991aecec6759d253eb25e952a2d6f8efb6e)), closes [#156](https://github.com/hyperi-io/dfe-ui/issues/156)
* **security:** update next to 16.4.1 for two RCEs ([#591](https://github.com/hyperi-io/dfe-ui/issues/591)) ([2f2eb1c](https://github.com/hyperi-io/dfe-ui/commit/2f2eb1c4bd67d4d0ad421a6990976b7f6867777b))
* **security:** update vitest to 4.1.12 for the @vitest/mocker advisories ([#590](https://github.com/hyperi-io/dfe-ui/issues/590)) ([a3489eb](https://github.com/hyperi-io/dfe-ui/commit/a3489eb4da5dd0ec3513f6501f4fe7af3aa4d6cb)), closes [#157](https://github.com/hyperi-io/dfe-ui/issues/157) [#158](https://github.com/hyperi-io/dfe-ui/issues/158)

## [1.7.26](https://github.com/hyperi-io/dfe-ui/compare/v1.7.25...v1.7.26) (2026-10-21)

### Bug Fixes

* run audit and broad bug fixes ([#584](https://github.com/hyperi-io/dfe-ui/issues/584)) ([dd4bdc9](https://github.com/hyperi-io/dfe-ui/commit/dd4bdc916d7863a5f90ad8f027d34acb9f1ed01b))

## [1.7.25](https://github.com/hyperi-io/dfe-ui/compare/v1.7.24...v1.7.25) (2026-10-20)

### Bug Fixes

* copy the repo scripts into the image build so the type check passes ([#581](https://github.com/hyperi-io/dfe-ui/issues/581)) ([a6f3179](https://github.com/hyperi-io/dfe-ui/commit/a6f31792b31c996c33adfe1a5de1e3852d118e8f))

## [1.7.24](https://github.com/hyperi-io/dfe-ui/compare/v1.7.23...v1.7.24) (2026-10-19)

### Bug Fixes

* user account bugs and styles ([#577](https://github.com/hyperi-io/dfe-ui/issues/577)) ([ed9bd1b](https://github.com/hyperi-io/dfe-ui/commit/ed9bd1b23465d1ff00955016347213b731561f13))

## [1.7.23](https://github.com/hyperi-io/dfe-ui/compare/v1.7.22...v1.7.23) (2026-10-19)

### Bug Fixes

* fix sample events ([#576](https://github.com/hyperi-io/dfe-ui/issues/576)) ([1ce078a](https://github.com/hyperi-io/dfe-ui/commit/1ce078a3b74f9e7ef4fbec10412412facb7f477f))
* type the repository scope as the engine enum ([#572](https://github.com/hyperi-io/dfe-ui/issues/572)) ([ed56df9](https://github.com/hyperi-io/dfe-ui/commit/ed56df94f0625327bc94fa188068d124a88e7100)), closes [#923](https://github.com/hyperi-io/dfe-ui/issues/923)

## [1.7.22](https://github.com/hyperi-io/dfe-ui/compare/v1.7.21...v1.7.22) (2026-10-17)

### Bug Fixes

* build the image's JS on the native platform ([a572878](https://github.com/hyperi-io/dfe-ui/commit/a572878e2ce37bb6a8cea20f13be8b8b459d5e65))
* follow engine [#900](https://github.com/hyperi-io/dfe-ui/issues/900) org and hunt contract ([ddb1ff4](https://github.com/hyperi-io/dfe-ui/commit/ddb1ff4b212d5d7b3810e38237caa835d25b87b3))
* render on scalo-service 2.14.15 ([9992fa8](https://github.com/hyperi-io/dfe-ui/commit/9992fa84d8ab936a33f71a085dbe9ad0e03c14b0))

## [1.7.21](https://github.com/hyperi-io/dfe-ui/compare/v1.7.20...v1.7.21) (2026-10-17)

### Bug Fixes

* catalogue reach, fetcher Processing tab, pool labels ([#564](https://github.com/hyperi-io/dfe-ui/issues/564)) ([c84ce34](https://github.com/hyperi-io/dfe-ui/commit/c84ce34a6ce9cb69e2df647f94cb852985a237a0))

## [1.7.20](https://github.com/hyperi-io/dfe-ui/compare/v1.7.19...v1.7.20) (2026-10-17)

### Bug Fixes

* **deps:** update Node.js to 7f486ca ([#560](https://github.com/hyperi-io/dfe-ui/issues/560)) ([bab9e46](https://github.com/hyperi-io/dfe-ui/commit/bab9e46e023063814d6f745886a97da0f37e87b4))
* fix catalogue and filters ([#561](https://github.com/hyperi-io/dfe-ui/issues/561)) ([a6bef95](https://github.com/hyperi-io/dfe-ui/commit/a6bef9515f71060b37bf4617617425edaf922ef2))
* fix filters ([#562](https://github.com/hyperi-io/dfe-ui/issues/562)) ([2e75cba](https://github.com/hyperi-io/dfe-ui/commit/2e75cba36557a75528a75b8f508bea84fd50f163))

## [1.7.19](https://github.com/hyperi-io/dfe-ui/compare/v1.7.18...v1.7.19) (2026-10-15)

### Bug Fixes

* fix account management bugs ([#552](https://github.com/hyperi-io/dfe-ui/issues/552)) ([d8f7c0e](https://github.com/hyperi-io/dfe-ui/commit/d8f7c0ed33c5174b4aba326fae09fa234e64e5bb))

## [1.7.18](https://github.com/hyperi-io/dfe-ui/compare/v1.7.17...v1.7.18) (2026-10-15)

### Bug Fixes

* send what a source save means ([#559](https://github.com/hyperi-io/dfe-ui/issues/559)) ([e2a6f70](https://github.com/hyperi-io/dfe-ui/commit/e2a6f70fe2d9423d3d307fc0440b192a62c8c5b4))

## [1.7.17](https://github.com/hyperi-io/dfe-ui/compare/v1.7.16...v1.7.17) (2026-10-15)

### Bug Fixes

* keep a source's views when its Views tab is hidden ([#557](https://github.com/hyperi-io/dfe-ui/issues/557)) ([86aff5b](https://github.com/hyperi-io/dfe-ui/commit/86aff5b4f81f7bb2ca0c4acd6a0157c216be51bc))

## [1.7.16](https://github.com/hyperi-io/dfe-ui/compare/v1.7.15...v1.7.16) (2026-10-15)

### Bug Fixes

* hide Sigma from view standards and fix the field-map pin ([#555](https://github.com/hyperi-io/dfe-ui/issues/555)) ([42e1ac6](https://github.com/hyperi-io/dfe-ui/commit/42e1ac6d15c8f74e4fc9fd1c79a9a1eb556884fc))

## [1.7.15](https://github.com/hyperi-io/dfe-ui/compare/v1.7.14...v1.7.15) (2026-10-14)

### Bug Fixes

* one working password reset per recovery account ([#550](https://github.com/hyperi-io/dfe-ui/issues/550)) ([a735924](https://github.com/hyperi-io/dfe-ui/commit/a7359246f9ec3e89d04af2d7c6f06ee135df4b95))

## [1.7.14](https://github.com/hyperi-io/dfe-ui/compare/v1.7.13...v1.7.14) (2026-10-13)

### Bug Fixes

* clear leftover OpenTelemetry, Alert and act warnings ([#530](https://github.com/hyperi-io/dfe-ui/issues/530)) ([7071cd4](https://github.com/hyperi-io/dfe-ui/commit/7071cd46b8df6ad6ce8fed0010e3166d9b366773))
* declare dfe-core-ui peers, widen test waits ([#528](https://github.com/hyperi-io/dfe-ui/issues/528)) ([9195c55](https://github.com/hyperi-io/dfe-ui/commit/9195c55e82a0afcd7de46d1280dd4c23d2a6442a))
* declare the peers third-party packages leave out ([#531](https://github.com/hyperi-io/dfe-ui/issues/531)) ([7dafd21](https://github.com/hyperi-io/dfe-ui/commit/7dafd21a12d4ea24e069b07dc94564596d7750ec))
* **deps:** move /metrics to @prometheus-io/client and refresh the node digest ([#536](https://github.com/hyperi-io/dfe-ui/issues/536)) ([6275380](https://github.com/hyperi-io/dfe-ui/commit/6275380f494cc884acffa8ce1ac19228b2aad246))
* fix bugs rules ([#543](https://github.com/hyperi-io/dfe-ui/issues/543)) ([1ed7895](https://github.com/hyperi-io/dfe-ui/commit/1ed78957c7a3ea62e7f4ab8fb2378b1d00c432ec))
* fix platform settings defaults apply ([#538](https://github.com/hyperi-io/dfe-ui/issues/538)) ([208a2f4](https://github.com/hyperi-io/dfe-ui/commit/208a2f48a7c9f263aaca4c0fba13edc34cb8bfa4))
* name the telemetry template that sets the OTLP endpoint ([#532](https://github.com/hyperi-io/dfe-ui/issues/532)) ([d5959bb](https://github.com/hyperi-io/dfe-ui/commit/d5959bb2223fdec99055efec24b3513c3221724b))
* say why an OIDC sign-in was refused, on the sign-in form ([#533](https://github.com/hyperi-io/dfe-ui/issues/533)) ([622b42c](https://github.com/hyperi-io/dfe-ui/commit/622b42ce0d63c12c22e11f3bbd5688612a9240f2)), closes [hyperi-io/dfe-engine#823](https://github.com/hyperi-io/dfe-engine/issues/823) [#488](https://github.com/hyperi-io/dfe-ui/issues/488)
* set a group's IdP link and rework the OIDC provider form ([#542](https://github.com/hyperi-io/dfe-ui/issues/542)) ([f6a7d4d](https://github.com/hyperi-io/dfe-ui/commit/f6a7d4d97ee419ac2f2b3474fa48de5adac84f8f)), closes [hyperi-io/dfe-engine#758](https://github.com/hyperi-io/dfe-engine/issues/758)

## [1.7.13](https://github.com/hyperi-io/dfe-ui/compare/v1.7.12...v1.7.13) (2026-10-11)

### Bug Fixes

* refuse new passwords over 72 bytes ([#526](https://github.com/hyperi-io/dfe-ui/issues/526)) ([1e87fe6](https://github.com/hyperi-io/dfe-ui/commit/1e87fe6e2783672b46cc9f6e4f1b9a4426f3b2b2))

## [1.7.12](https://github.com/hyperi-io/dfe-ui/compare/v1.7.11...v1.7.12) (2026-10-11)

### Bug Fixes

* adopt engine v1.22.21 sync states and names ([#524](https://github.com/hyperi-io/dfe-ui/issues/524)) ([2ada465](https://github.com/hyperi-io/dfe-ui/commit/2ada465b85196124cea166b6a14730dedd93b4ae))
* load only a same-origin YAML worker from the shim ([#521](https://github.com/hyperi-io/dfe-ui/issues/521)) ([9fcacca](https://github.com/hyperi-io/dfe-ui/commit/9fcaccab4d87a73aec45d87a3002f5e6fd776392))

## [1.7.11](https://github.com/hyperi-io/dfe-ui/compare/v1.7.10...v1.7.11) (2026-10-10)

### Bug Fixes

* show OIDC sync status, name form controls ([#519](https://github.com/hyperi-io/dfe-ui/issues/519)) ([1ed3b66](https://github.com/hyperi-io/dfe-ui/commit/1ed3b66e814229c39a1ad28e0da8da68626cbf8c))
* stop the YAML worker requesting 404 files ([#520](https://github.com/hyperi-io/dfe-ui/issues/520)) ([00ed48c](https://github.com/hyperi-io/dfe-ui/commit/00ed48c37f25c735b511e424c6438c2a4ea94463))

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
