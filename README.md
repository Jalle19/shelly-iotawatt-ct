# shelly-mqtt-influxdb

## Requirements

* Node.js 14.x
* `libavahi-compat-libdnssd-dev` installed

Shelly configuration requirements:

* MQTT enabled
* Accessible over HTTP on port 80

## Usage

The application is configured via environment variables

```bash
MQTT_URL=mqtt://localhost \
INFLUX_HOST=10.110.1.6 \
INFLUX_DATABASE=iotawatt \
INFLUX_USERNAME=iotawatt \
INFLUX_PASSWORD=iotawatt \
node --unhandled-rejections=strict ./shelly-iotawatt-ct.mjs
```

During normal operation, the application prints which devices it has discovered, after which it goes silent.

### Running as a systemd service

TODO

## License

GNU GENERAL PUBLIC LICENSE Version 3
