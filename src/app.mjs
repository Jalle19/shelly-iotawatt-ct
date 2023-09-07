import axios from 'axios'
import {Shelly} from './shelly.mjs'
import {createWattDataPoint} from './influx.mjs'

const discoveredShellies = []
const topicChannelNameDeviceMap = {}

const getManuallyDefinedDevices = () => {
    const devices = process.env.SHELLY_DEVICES || []

    return devices.split(',')
}

const discoverDevice = async (ipAddress, mqttClient) => {
    const device = new Shelly(ipAddress)

    // Attempt to resolve the device's settings
    try {
        const settingsResponse = await axios.get(device.getHttpSettingsUrl())
        device.settings = settingsResponse.data
    } catch (e) {
        console.error('Failed to query device for settings', e)
    }

    discoveredShellies.push(device)
    console.log(`Discovered new device ${device.getName()}`)

    // Subscribe to relevant MQTT topics, keep a map of which topic belongs to
    // which device and what channel
    device.getChannelNameTopicMaps().map((topicMap) => {
        topicChannelNameDeviceMap[topicMap.topic] = {
            device: device,
            channelName: topicMap.name,
        }

        mqttClient.subscribe(topicMap.topic)
    })
}

export const run = async (mdnsBrowser, mqttClient, influxClient) => {
    // Populate manually defined devices
    const manuallyDefinedDevices = getManuallyDefinedDevices()

    for (const ipAddress of manuallyDefinedDevices) {
        await discoverDevice(ipAddress, mqttClient)
    }

    // Populates discoveredShellies eventually by listening to mDNS responses
    mdnsBrowser.on('response', (response) => {
        response.answers.filter((answer) => {
            // Filter out A answers since we just want the device name really
            return answer.name.startsWith('shelly') && answer.type === 'A'
        }).map(async (answer) => {
            const ipAddress = answer.data
            const hostname = answer.name.substring(0, answer.name.length - '.local'.length)

            // Mark the device as discovered if we haven't seen it before
            if (discoveredShellies.filter((shelly) => {
                return shelly.getHostname() === hostname
            }).length === 0) {
                await discoverDevice(ipAddress, mqttClient)
            }
        })
    })

    mqttClient.on('message', (topic, message) => {
        // Determine which device and channel we're dealing with
        const {device, channelName} = topicChannelNameDeviceMap[topic]

        if (channelName === undefined) {
            console.error(`Got message to unmapped topic ${topic}, discarding`)
            return
        }

        // Store the data in Influx
        const dataPoint = createWattDataPoint(device, channelName, message.toString())
        influxClient.writePoints([dataPoint])
    })
}
