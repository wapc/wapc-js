# Typescript boilerplate

This is a boilerplate typescript project that incorporates fixes and best practices I come across as I build new projects.

If you extend this via a fork or otherwise, please let me know so I can check out your changes!

## Who is this for?

Anyone who uses TypeScript with Visual Studio Code and writes tests with Mocha.

## Features

- Build and watch with tolerable TS presets.
- Testing with mocha & chai.
- @types definitions for mocha, chai, node, and other dependencies included.
- Local HTTP test server preconfigured in tests.
- Visual Studio Code project settigns preconfigured for
  - Test Explorer UI recognizing Typescript tests
  - Debugging Typescript tests within the IDE
- Adds `__projectroot` as an alternative to `__dirname` to avoid lookup problems from compiled files.
- Configuration and rc files:
  - One configuration location for mocha, prettier, eslint & typescript so CLI programs and IDEs/extensions reuse configuration.
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

## Bash kickstart function

```bash
kickstart () {
  # clone repo into directory passed as arg 1
  git clone --depth 1 --branch master git@github.com:jsoverson/typescript-boilerplate.git $1
  # cd into directory
  cd $1
  # change the "name" field in packcage.json to arg 1
  jq --arg name "$1" '.name = $name' package.json > package.json.tmp
  mv package.json.tmp package.json
  # remove the origin of the original git repo
  git remote remove origin
  # install dependencies
  npm install
  # echo node and typescript version
  echo "Node version: `node -v`"
  echo "Typescript version: `npx tsc -v`"
  # open VS Code
  code .
  # give yourself a pat on the back
  echo "You're awesome 🤘"
}
```

## FAQ 

### ESLint warnings

The included eslint plugin for typescript has some very good defaults but they can be a little much for every project.

To disable them, add the warning ID to a `"rules"` property in `etc/.eslintrc.json`. For example, the warning *`Unexpected any. Specify a different type.eslint@typescript-eslint/no-explicit-any`* can be disabled with the following rule:

```
"rules": {
  "@typescript-eslint/no-explicit-any": 0
},
```
