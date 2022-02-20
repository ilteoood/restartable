'use strict'

const { test } = require('tap')
const { start } = require('.')
const { request, setGlobalDispatcher, Agent } = require('undici')
const path = require('path')
const { readFile } = require('fs').promises

setGlobalDispatcher(new Agent({
  keepAliveTimeout: 10,
  keepAliveMaxTimeout: 10,
  tls: {
    rejectUnauthorized: false
  }
}))

test('restart fastify', async ({ pass, teardown, plan, same, equal }) => {
  plan(5)

  async function myApp (app, opts) {
    pass('application loaded')
    app.get('/', async (req, reply) => {
      return { hello: 'world' }
    })
  }

  const { stop, restart, port, address } = await start({
    port: 0,
    app: myApp
  })
  teardown(stop)

  equal(address, '127.0.0.1')

  {
    const res = await request(`http://localhost:${port}`)
    same(await res.body.json(), { hello: 'world' })
  }

  await restart()

  {
    const res = await request(`http://localhost:${port}`)
    same(await res.body.json(), { hello: 'world' })
  }
})

test('https', async ({ pass, teardown, plan, same, equal }) => {
  plan(5)

  async function myApp (app, opts) {
    pass('application loaded')
    app.get('/', async (req, reply) => {
      return { hello: 'world' }
    })
  }

  const { stop, restart, port, address } = await start({
    port: 0,
    protocol: 'https',
    key: await readFile(path.join(__dirname, 'fixtures', 'key.pem')),
    cert: await readFile(path.join(__dirname, 'fixtures', 'cert.pem')),
    app: myApp
  })
  teardown(stop)

  equal(address, '127.0.0.1')

  {
    const res = await request(`https://localhost:${port}`)
    same(await res.body.json(), { hello: 'world' })
  }

  await restart()

  {
    const res = await request(`https://localhost:${port}`)
    same(await res.body.json(), { hello: 'world' })
  }
})

test('wrong protocol', async function (t) {
  await t.rejects(() => {
    return start({
      port: 0,
      protocol: 'foobar',
      app: () => {}
    })
  }, /Unknown Protocol foobar/)
})