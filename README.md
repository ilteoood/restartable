# @fastify/restartable

[![NPM version](https://img.shields.io/npm/v/@fastify/restartable.svg?style=flat)](https://www.npmjs.com/package/@fastify/restartable)
[![CI](https://github.com/fastify/restartable/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/fastify/restartable/actions/workflows/ci.yml)
[![neostandard javascript style](https://img.shields.io/badge/code_style-neostandard-brightgreen?style=flat)](https://github.com/neostandard/neostandard)

Restart Fastify without losing a request.

This module is useful if you want to compose the
fastify routes dynamically or you need some remote
config. In case of a change, you can restart Fastify.

## Install

```bash
npm i @fastify/restartable
```

## Usage

```js
import { restartable } from '@fastify/restartable'

async function createApp (fastify, opts) {
  const app = fastify(opts)

  app.get('/restart', async () => {
    await app.restart()
    return { status: 'ok' }
  })

  app.addHook('onClose', async () => {
    if(!app.closingRestartable) {
      console.log('closing the app because of restart')
    }
    else{
      console.log('closing the app because server is stopping')
    }
  })

  return app
}

const app = await restartable(createApp, { logger: true })
const host = await app.listen({ port: 3000 })

console.log('server listening on', host)

// call restart() if you want to restart
process.on('SIGUSR1', () => {
  console.log('Restarting the server')
  app.restart()
})

process.once('SIGINT', () => {
  console.log('Stopping the server')
  app.close()
})

```

## Hooks

- `preRestart` - called before creating a new app instance and closing an
existing one. The hook is called with the current app instance as an argument.
Use it to close any resources that you don't want to be shared between the
app instances.

- `onRestart` - called after the new app instance is created and the old one
is closed. The hook is called with the new app instance as an argument.

**Example**:

```js
  async function createApplication (fastify, opts) {
    console.log('creating new app instance')
    return fastify(opts)
  }
  const app = await restartable(createApplication)

  app.addPreRestartHook(async (app) => {
    console.log('preRestart hook called')
  })

  app.addOnRestartHook(async (app) => {
    console.log('onRestart hook called')
  })

  await app.restart()
```

**Output**:

```bash
preRestart hook called
creating new app instance
onRestart hook called
```

## License

Licensed under [MIT](./LICENSE).
