# Changelog

## [0.2.0] - 2020-01-10

- Include file name in error reporting.
- Added support for formatters that apply to globbing patterns. ⚠️ **TAKE NOTE** ⚠️ 
  implementing this feature forced a change in the configuration schema. The
  extension will try its best to automatically update your configuration
  (globally, for the active workspace(s), and folder-specific) to
  this new schema. If it doesn't succeed, please refer to the README.

## [0.1.3] - 2020-01-05

- Better error reporting
- Icon tweaks

## [0.1.1] - 2019-12-29

- Fancy icon
- Slight edits to readme

## [0.1.0] - 2019-12-28

- Dedicated output channel for external formatter stdout and stderr
- Improved logging
- Re-register language formatter upon config changes

## [0.0.2] - 2019-12-23

- Initial release
