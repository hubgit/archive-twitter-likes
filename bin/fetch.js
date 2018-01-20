require('dotenv').config()

const program = require('commander')
const fs = require('fs-extra')
const ndjson = require('ndjson')
const Twitter = require('twitter')

const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

const run = screen_name => {
  let total = 0

  fs.ensureDirSync('data')

  const output = fs.createWriteStream(`data/${screen_name}-${Date.now()}.ndjson`)
  const transformStream = ndjson.stringify()
  const outputStream = transformStream.pipe(output)

  const fetch = async max_id => {
    const data = await client.get('favorites/list', { screen_name, max_id, count: 200 })

    const items = max_id ? data.slice(1) : data

    if (!items.length) {
      return null
    }

    for (let item of items) {
      transformStream.write(item)
      total++
    }

    console.log(`Fetched ${total} tweets`)

    return items[items.length - 1]['id_str']
  }

  return new Promise(async (resolve, reject) => {
    try {
      let max_id = undefined

      do {
        max_id = await fetch(max_id)
      } while (max_id)

      transformStream.end()
      
      outputStream.on('finish', () => {
        resolve(total)
      })
    } catch (e) {
      reject(e)
    }
  })
}

program
  .version(require('../package').version)
  .arguments('<screen_name>')
  .action(screen_name => {
    run(screen_name)
      .then(() => console.log('Finished'))
      .catch(error => console.log(error))
  })

if (!process.argv.slice(2).length) {
  program.outputHelp()
}

program.parse(process.argv)

