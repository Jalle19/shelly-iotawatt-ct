# shelly-iotawatt-ct

So you've got yourself a [IotaWatt](http://iotawatt.com/) energy monitor, but you still have unmonitored circuits 
because the IotaWatt only has so many inputs? Now you've installed a bunch of [Shelly](https://shelly.cloud/) relays, 
some of which can monitor electricity usage? And now you want to extend your fancy graphs to include the energy 
readings from the relays? Look no further!

The application assumes you have your IotaWatt configured to save data to InfluxDB. The application will augment the 
database IotaWatt uses and emulate current transformers. The `device` tag will be set to the device name, while the 
`ct` tag will be set to the relay channel's name.

The application auto-discovers your Shelly devices using mDNS, then it queries each device for settings in order to 
retrieve device and channel names. Finally, if the device is supported, the application subscribes to the relevant 
MQTT topics for each device. Received values are then converted to InfluxDB data points and ingested there.

## Requirements

Infrastructure requirements:

* InfluxDB with a IotaWatt-compatible database schema
* An MQTT broker

Application requirements:

* Node.js >= 12.x

Shelly configuration requirements:

* MQTT enabled
* Accessible over HTTP on port 80
* A supported relay (unsupported will be ignored gracefully)

### Supported relays

* Shelly 2.5
* Shelly 1 PM

## Usage

The application is configured via environment variables and should be run with `--unhandled-rejections=strict` for 
proper operation:

```bash
$ MQTT_URL=mqtt://localhost \
INFLUX_HOST=localhost \
INFLUX_DATABASE=iotawatt \
INFLUX_USERNAME=iotawatt \
INFLUX_PASSWORD=iotawatt \
node --unhandled-rejections=strict ./shelly-iotawatt-ct.mjs
```

During normal operation, the application prints which devices it has discovered, after which it goes silent, e.g. like 
this:

```bash
$ MQTT_URL=mqtt://localhost INFLUX_HOST=localhost INFLUX_DATABASE=iotawatt INFLUX_USERNAME=iotawatt INFLUX_PASSWORD=iotawatt node --unhandled-rejections=strict ./shelly-iotawatt-ct.mjs
Discovered new device BedroomLights
Discovered new device Office
Discovered new device HallLights
Discovered new device KitchenSinkAndWindow
Discovered new device KitchenTableLight
Discovered new device LivingRoomWall
Discovered new device LivingRoomCrown
```

### Running as a systemd service

1. Clone the repository to `/opt/shelly-iotawatt-ct`
2. Run `npm install`
2. Copy `systemd/shelly-iotawatt-ct.service` to `/etc/systemd/system/shelly-iotawatt-ct.service`
3. Copy `systemd/shelly-iotawatt-ct` to `/etc/shelly-iotawatt-ct` and modify it to match your environment
4. Run the following commands to enable and start the service:

```bash
sudo systemctl enable shelly-iotawatt-ct.service
sudo systemctl start shelly-iotawatt-ct.service
```

Check that the service is working:

```bash
$ sudo systemctl status shelly-iotawatt-ct
● shelly-iotawatt-ct.service - Allows emulating IotaWatt devices in InfluxDB using Shelly relays
   Loaded: loaded (/etc/systemd/system/shelly-iotawatt-ct.service; enabled; vendor preset: enabled)
   Active: active (running) since Fri 2021-06-11 17:25:34 EEST; 4s ago
 Main PID: 14505 (node)
    Tasks: 11 (limit: 2335)
   CGroup: /system.slice/shelly-iotawatt-ct.service
           └─14505 /usr/bin/node --unhandled-rejections=strict /opt/shelly-iotawatt-ct/shelly-iotawatt-ct

Jun 11 17:25:34 influxdb-grafana systemd[1]: Started Allows emulating IotaWatt devices in InfluxDB using Shelly 
Jun 11 17:25:37 influxdb-grafana node[14505]: Discovered new device KitchenTableLight
Jun 11 17:25:37 influxdb-grafana node[14505]: Discovered new device LivingRoomCrown
Jun 11 17:25:38 influxdb-grafana node[14505]: Discovered new device HallLights
Jun 11 17:25:38 influxdb-grafana node[14505]: Discovered new device KitchenSinkAndWindow
Jun 11 17:25:38 influxdb-grafana node[14505]: Discovered new device LivingRoomWall
Jun 11 17:25:38 influxdb-grafana node[14505]: Discovered new device BedroomLights
Jun 11 17:25:38 influxdb-grafana node[14505]: Discovered new device Office
```

## Technicalities

The data stored in InfluxDB will look like this:

```
> select * from iotawatt where device = 'Office' or ct = 'BedroomLights' limit 10
name: iotawatt
time                Hz Volts Watts ct            device        units
----                -- ----- ----- --            ------        -----
1623417611449518081          0     OfficeCeiling Office        Watts
1623417611449964609          11.41 OfficeWindow  Office        Watts
1623417630424973560          0     BedroomLights BedroomLights Watts
1623417641450168992          11.4  OfficeWindow  Office        Watts
1623417641450173691          0     OfficeCeiling Office        Watts
1623417660431382032          0     BedroomLights BedroomLights Watts
1623417671452443069          0     OfficeCeiling Office        Watts
1623417671452631663          11.4  OfficeWindow  Office        Watts
1623417690437183778          0     BedroomLights BedroomLights Watts
1623417701457451053          11.39 OfficeWindow  Office        Watts
```

## License

GNU GENERAL PUBLIC LICENSE Version 3
