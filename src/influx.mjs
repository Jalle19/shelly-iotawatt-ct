export const createWattDataPoint = (device, channelName, mqttValue) => {
    return {
        measurement: 'iotawatt',
        fields: {
            'Watts': parseFloat(mqttValue)
        },
        tags: {
            'ct': channelName,
            'device': device.getName(),
            'units': 'Watts',
        }
    }
}
