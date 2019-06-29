# mongodb-plugin
Funcmatic plugin that creates and manages a MongoDB connection

## Install

```
$> npm install --save @funcmaticjs/mongodb-plugin
```

## Use

```js
const func = require('@funcmaticjs/funcmatic')
const MongoDBPlugin = require('@funcmaticjs/mongodb-plugin')
...
func.use(new MongoDBPlugin())
```

## Environment

The following variables must exist in `ctx.env` during the env handler:

- `FUNC_MONGODB_URI`: A MongoDB [connection string](https://docs.mongodb.com/manual/reference/connection-string/).
- `FUNC_MONGODB_CACHE_CONNECTION` (OPTIONAL): If it is set to the string 'false', then the plugin will establish and close a connection on every request.

## Side Effects

- `ctx.state.mongodb`: The MongoDB [DB instance](https://mongodb.github.io/node-mongodb-native/3.2/api/Db.html).
