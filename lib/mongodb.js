var MongoClient = require('mongodb').MongoClient

class MongoDBPlugin {

  constructor(options) {
    options = options || { }
    this.client = null
    this.cache = true
  }

  async start(ctx, next) {
    if (!ctx.env.FUNC_MONGODB_URI) {
      ctx.logger.error("ctx.env.FUNC_MONGODB_URI is undefined")
      throw new Error("Must provide 'FUNC_MONGODB_URI' in ctx.env")
    }
    if (ctx.env.FUNC_MONGODB_CACHE_CONNECTION && ctx.env.FUNC_MONGODB_CACHE_CONNECTION.toLowerCase() == 'false') {
      ctx.logger.debug(`Connection caching turned off (${ctx.env.FUNC_MONGODB_CACHE_CONNECTION})`)
      this.cache = false
    }
    this.client = await this.createClient(ctx.env.FUNC_MONGODB_URI)
    ctx.state.mongodb = this.client.db()
    ctx.state.mongodb.client = this.client
    await next()
  }

  async request(ctx, next) {
    if (!isConnected(this.client)) { 
      // not sure if this is possible but I THINK it is possible
      // that a cached connection may no longer be connected IF
      // mongo server closes it. 
      // if this happens we reconnect
      await this.start(ctx, noop)
    }
    if (!ctx.state.mongodb) {
      ctx.state.mongodb = this.client.db()
      ctx.state.mongodb.client = this.client
    }
    await next()
    // Close the connection if caching is turned off
    if (!this.cache) {
      await this.teardown()
    }
  }

  async error(ctx, next) {
    await this.teardown(ctx, noop)
    await next()
  }

  async teardown() {
    try {
      if (isConnected(this.client)) {
        await this.client.close()
      }
    } catch (err) {
    } finally {
      this.client = null
    }
  }

  // Expose as a method so that others can 
  // create a client in unit testing
  async createClient(uri, options) {
    options = options || { useNewUrlParser: true }
    return await MongoClient.connect(uri, options)
  }
}

function isConnected(client) {
  return client && client.isConnected()
}

function noop() { }

module.exports = MongoDBPlugin