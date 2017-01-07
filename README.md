# Project Name

FBot

## Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Creating a module](#creating-a-module)
    2. [Installing Dependencies](#installing-dependencies)
    1. [Credited Dependencies](#credited-dependencies)


## Usage

After installing all dependencies (npm install), run nodemon in SimpleBot folder.  

## Requirements

- Node 0.10.x
- NPM

## Development

### Creating a module

See botModules/yomomma for an example

Load module in loader.init() - See bot.js

Module is passed the args object defined in loader, and the message api. See facebook-chat-api

### Installing Dependencies

Uncomment dotenv in bot.js, then set up .env in root folder.

From within the root directory:

```sh
npm install
```

### Credited Dependencies

- facebook-chat-api (npm)

Important Module Dependencies

- cleverbot: cleverbot-node (npm)
- yomomma: api.yomomma.info
- define: WordNik API
- quizzer: jetpunk.com
- speak: Google TTS
- translate: api.mymemory.translated.net

## License

The content of this project itself is licensed under the MIT License
