# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial release of RecuRun
- `run()` function for general recursion with stack simulation
- `runTail()` function for tail recursion optimization
- `isGenerator()` utility function
- Full TypeScript type support
- Zero dependencies
- Comprehensive documentation in English and Chinese

## [0.1.0] - 2025-02-26

### Added

- Initial release
- Support for arbitrary recursive functions using `run()`
- Tail recursion optimization using `runTail()`
- Can handle recursion depths of 100,000+ without stack overflow
- Complete TypeScript type definitions
- Comprehensive examples and documentation

### Performance

- `run()`: Handles ~10,000 depth recursion
- `runTail()`: Handles 100,000+ depth recursion with O(1) stack space
- Benchmarks:
  - factorial(10000): 4ms
  - factorial(50000): 4ms
  - factorial(100000): 9ms

### Documentation

- English README with comprehensive examples
- Chinese README (中文文档)
- API documentation for all exported functions
- Performance benchmarks
- Usage guide and best practices

[Unreleased]: https://github.com/your-org/recurun/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/your-org/recurun/releases/tag/v0.1.0
