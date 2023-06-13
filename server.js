// Imports the Google Cloud client library
import { BigQuery } from '@google-cloud/bigquery'
import * as PushAPI from '@pushprotocol/restapi'
import * as ethers from 'ethers'

const PK = 'your_channel_address_secret_key' // channel private key
const Pkey = `0x${PK}`
const _signer = new ethers.Wallet(Pkey)

/**
 * Queries Data from a Public BigQuery Database
 */
const queryData = async () => {
  // Creates a client
  const bigqueryClient = new BigQuery()
  // The SQL query to run to select gas price and transaction hash
  const sqlQuery = `SELECT \`hash\`, gas_price FROM \`bigquery-public-data.crypto_ethereum.transactions\` 
	WHERE DATE(block_timestamp) = "2023-04-24" LIMIT 10`

  const options = {
    query: sqlQuery,
    // Location must match that of the dataset(s) referenced in the query.
    location: 'US',
  }
  console.log('Rows:')
  // Run the query
  const [rows] = await bigqueryClient.query(options)
  for (const row of rows) {
    console.log(row)
    await sendNotification(row)
  }
}
queryData()

/**
 * Sends a Push Notification using Push SDK
 * @param {*} data Custom data according to usecase
 */
const sendNotification = async (data) => {
  try {
    const apiResponse = await PushAPI.payloads.sendNotification({
      signer: _signer,
      type: 1, // broadcast- sends notifications to everyone's who has opt-in
      identityType: 2, // direct payload
      notification: {
        title: `[SDK-TEST] notification TITLE:`,
        body: `[sdk-test] notification BODY`,
      },
      payload: {
        title: `Blockchain data`,
        body: `Gas Price for Trx ${data.hash} was ${data.gas_price} wei`, //taken from above example
        cta: '', //any relevant link you want them to click
        img: '', //any relevant image for better UX
      },
      channel: 'eip155:5:0xD8634C39BBFd4033c0d3289C4515275102423681', // your channel address
      env: 'staging',
    })
  } catch (err) {
    console.error('Error: ', err)
  }
}
