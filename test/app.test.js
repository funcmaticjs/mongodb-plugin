require('dotenv').config()
const f = require('@funcmaticjs/funcmatic')
const MongoDBPlugin = require('../lib/mongodb')

describe('Funcmatic Plugin', () => {
  let func = null
  let ctx = null
  let mongodb = null
  beforeEach(async () => {
    mongodb = new MongoDBPlugin()
    func = f.create()
    func.plugin(mongodb)
    ctx = { 
      env: { 
        FUNC_MONGODB_URI: process.env.FUNC_MONGODB_URI
      } 
    }
  })
  afterEach(async () => {
    await mongodb.teardown()
  })
  it ('should connect on coldstart', async () => {
    func.start(async (ctx) => {
      expect(ctx.state.mongodb).toBeTruthy()
      expect(ctx.state.mongodb.client.isConnected()).toBeTruthy()
    })
    await func.invokeStart(ctx)
  })
})
