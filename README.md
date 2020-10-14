# Typescript boilerplate

This is a boilerplate typescript project that incorporates fixes and best practices I come across as I build new projects.

If you extend this via a fork or otherwise, please let me know so I can check out your changes!

## Who is this for?

Anyone who uses TypeScript with Visual Studio Code and writes tests with Mocha.

## Features

- Build and watch with tolerable TS presets.
- Testing with mocha & chai.
- @types definitions for mocha, chai, node, and other dependencies included.
- Visual Studio Code project settigns preconfigured for
  - Test Explorer UI recognizing Typescript tests
  - Debugging Typescript tests within the IDE
- Configuration and rc files:
  - Reusable configuration for mocha, prettier, eslint & typescript so CLI programs and IDEs/extensions reuse configuration.
  - Config files whose path can be configured from a central location have been moved to `etc/`
  - Minimal .gitignore

## Core npm scripts

- `build`: build typescript
- `compile`: clean & build
- `clean`: remove build folder
- `prepublishOnly`: compile
- `format`: format source files inline with prettier
- `watch`: clean && continuously build files on change
- `lint`: lint src && test
- `test:unit`: mocha tests
- `test`: lint && test:unit

## Visual Studio Code extensions

### Testing and debugging

Debugging within Visual Studio Code requires

- [Test Explorer UI](https://marketplace.visualstudio.com/items?itemName=hbenl.vscode-test-explorer)
- [Mocha Test Explorer](https://marketplace.visualstudio.com/items?itemName=hbenl.vscode-mocha-test-adapter)

`.vscode/settings.json` is set up to parse Typescript files and to wire Mocha Test Explorer to the appropriate launch configuration in `.vscode/launch.json`. This wiring depends on the name of the launch configuration, do not change!

### Recommended plugins

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

The ESLint plugin is preconfigured for typescript in `.vscode/settings.json`.

### Additional Configuration

Additional settings in `.vscode/settings.json`

- `editor.formatOnSave : true` to keep manual autoformatting to a minimum
- `debug.javascript.usePreview : false` to address debugging issues from [microsoft/vscode#102834](https://github.com/microsoft/vscode/issues/102834). This should be removed eventually.
