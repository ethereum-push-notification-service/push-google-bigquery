// Imports the Google Cloud client library
import {BigQuery} from '@google-cloud/bigquery';
import * as PushAPI from "@pushprotocol/restapi";
import * as ethers from "ethers";
// Queries a public Blockchain dataset.

const PK = 'your_channel_address_secret_key'; // channel private key
const Pkey = `0x${PK}`;
const _signer = new ethers.Wallet(Pkey);
async function queryData() {
  // Creates a client
  const bigqueryClient = new BigQuery();
	
	// The SQL query to run to select the value of Bitcoin
        const sqlQuery = `SELECT value FROM \`bigquery-public-data.crypto_ethereum.transactions\` 
									WHERE DATE(block_timestamp) = "2023-04-24" LIMIT 1000`;


const options = {
        query: sqlQuery,
        // Location must match that of the dataset(s) referenced in the query.
        location: 'US',
     }
	console.log('Rows:');
// Run the query
        const [rows] = await bigqueryClient.query(options);
        rows.forEach(row => {
          console.log(row)
          sendNotification(row);
        });
}
queryData();

const sendNotification = async() => {
  try {
    const apiResponse = await PushAPI.payloads.sendNotification({
      signer: _signer,
      type: 1, // broadcast- sends notifications to everyone's who has opt-in
      identityType: 2, // direct payload
      notification: {
        title: `[SDK-TEST] notification TITLE:`,
        body: `[sdk-test] notification BODY`
      },
      payload: {
        title: `Blockchain data`,
        body: `Here are the fluctuations in Data in Bitcoin ${filteredData}`, //taken from above example
        cta: '', //any relevant link you want them to click
        img: '' //any relevant image for better UX
      },
      channel: 'eip155:5:0xD8634C39BBFd4033c0d3289C4515275102423681', // your channel address
      env: 'staging'
    });
  } catch (err) {
    console.error('Error: ', err);
  }
}

