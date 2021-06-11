import mdns from 'multicast-dns'
import mqtt from 'async-mqtt'
import Influx from 'influx'
import {run} from './src/app.mjs'

(async () => {
    // Check that we have all environment variables we need
    const requiredEnvs = [
        'MQTT_URL',
        'INFLUX_HOST',
        'INFLUX_DATABASE',
        'INFLUX_USERNAME',
        'INFLUX_PASSWORD',
    ]

    for (const requiredEnv of requiredEnvs) {
        if (process.env[requiredEnv] === undefined) {
            console.error(`You must define the ${requiredEnv} environment variable`)
            process.exit(1)
        }
    }

    // Create mDNS, MQTT and Influx clients
    const mdnsBrowser = mdns()
    const mqttClient = await mqtt.connectAsync(process.env.MQTT_URL)
    const influxClient = new Influx.InfluxDB({
        host: process.env.INFLUX_HOST,
        database: process.env.INFLUX_DATABASE,
        username: process.env.INFLUX_USERNAME,
        password: process.env.INFLUX_PASSWORD,
    })

    // Check that the configured Influx database actually exists
    // Check that the configured Influx database actually exists
    const databaseNames = await influxClient.getDatabaseNames()

    if (!databaseNames.includes(process.env.INFLUX_DATABASE)) {
        throw new Error(`The database ${process.env.INFLUX_DATABASE} doesn't exist`)
    }

    // Run the app
    await run(mdnsBrowser, mqttClient, influxClient)
})()
