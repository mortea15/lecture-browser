var config = {}

config.dbstring = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_COLL}`
config.fileTypes = ['text/markdown']

module.exports = config
