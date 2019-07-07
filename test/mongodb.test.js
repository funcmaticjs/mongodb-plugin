require('dotenv').config()
const MongoDBPlugin = require('../lib/mongodb')

describe('Start Handler', () => {
  let ctx = null
  let plugin = null 
  beforeEach(() => {
    ctx = {
      env: { },
      state: { },
      logger: console
    }
    plugin = new MongoDBPlugin()
  })
  afterEach(async () => {
    await plugin.teardown()
  })
  it ('should throw if FUNC_MONGODB_URI is not defined', async () => {
    let error = null
    try {
      await plugin.start(ctx, noop)
    } catch (err) {
      error = err
    }
    expect(error).toBeTruthy()
    expect(error.message).toEqual(expect.stringContaining("FUNC_MONGODB_URI"))
  })
  it ('should create a connection with a valid FUNC_MONGODB_URI', async () => {
    ctx.env.FUNC_MONGODB_URI = process.env.FUNC_MONGODB_URI
    await plugin.start(ctx, noop)
    expect(ctx.state.mongodb).toBeTruthy()
    expect(ctx.state.mongodb.client.isConnected()).toBeTruthy()
  })
}) 

describe('Request Handler', () => {
  let ctx = null
  let plugin = null 
  beforeEach(() => {
    ctx = {
      env: { 
        FUNC_MONGODB_URI: process.env.FUNC_MONGODB_URI
      },
      state: { },
      logger: console
    }
    plugin = new MongoDBPlugin()
  })
  afterEach(async () => {
    await plugin.teardown()
  })
  it ('should set ctx.state.mongodb in a coldstart request', async () => {
    await plugin.start(ctx, noop)
    await plugin.request(ctx, noop)
    expect(ctx.state.mongodb).toBeTruthy()
    expect(ctx.state.mongodb.client.isConnected()).toBeTruthy()
  })
  it ('should set ctx.state.mongodb for a warm request', async () => {
    await plugin.start(ctx, noop)
    ctx = {
      env: { },
      state: { },
      logger: console
    }
    await plugin.request(ctx, noop)
    expect(ctx.state.mongodb).toBeTruthy()
    expect(ctx.state.mongodb.client.isConnected()).toBeTruthy()
  })
  it ('should reconnect if client is disconnected after coldstart', async () => {
    await plugin.start(ctx, noop)
    await plugin.client.close() // manually close it
    expect(plugin.client.isConnected()).toBeFalsy()
    ctx.state = { }
    await plugin.request(ctx, noop)
    expect(ctx.state.mongodb).toBeTruthy()
    expect(ctx.state.mongodb.client.isConnected()).toBeTruthy()
  })
})

describe('Error Handler', () => {
  let ctx = null
  let plugin = null 
  beforeEach(() => {
    ctx = {
      env: { 
        FUNC_MONGODB_URI: process.env.FUNC_MONGODB_URI
      },
      state: { },
      logger: console
    }
    plugin = new MongoDBPlugin()
  })
  afterEach(async () => {
    await plugin.teardown()
  })
  it ('should close connection on unhandled error', async () => {
    await plugin.start(ctx, noop)
    expect(ctx.state.mongodb).toBeTruthy()
    expect(ctx.state.mongodb.client.isConnected()).toBeTruthy()
    await plugin.error(ctx, noop)
    expect(ctx.state.mongodb.client.isConnected()).toBeFalsy()
    expect(plugin.client).toBeFalsy()
  })
})

describe('createClient', () => {
  let plugin = null 
  beforeEach(() => {
    plugin = new MongoDBPlugin()
  })
  afterEach(async () => {
    await plugin.teardown()
  })
  it ('should expose createClient for unit testing', async () => {
    let client = await plugin.createClient(process.env.FUNC_MONGODB_URI)
    expect(client.isConnected()).toBe(true)
    expect(client.db()).toBeTruthy()
    await client.close()
    expect(client.isConnected()).toBe(false)
  })
})

function noop() { }
