export class Shelly {
    constructor(ipAddress) {
        this.ipAddress = ipAddress
        this.settings = null
    }

    getHostname() {
        return this.settings.device.hostname
    }

    getType() {
        const hostname = this.getHostname()
        return hostname.substring(0, hostname.lastIndexOf('-'))
    }

    getName() {
        return this.settings.name || this.getHostname()
    }

    getHttpSettingsUrl() {
        // noinspection HttpUrlsUsage
        return `http://${this.ipAddress}/settings`
    }

    getChannelNameTopicMaps() {
        const topics = []

        const createFullTopicName = (topic) => {
            return `shellies/${this.getHostname()}/${topic}`
        }

        switch (this.getType()) {
            case 'shellyswitch25':
                // Shelly 2.5 has two channels that may have user-configured names
                topics.push({
                    topic: createFullTopicName('relay/0/power'),
                    name: this.settings.relays[0].name || `${this.getName()} channel 0`,
                }, {
                    topic: createFullTopicName('relay/1/power'),
                    name: this.settings.relays[1].name || `${this.getName()} channel 1`,
                })
                break
            case 'shelly1pm':
            case 'shellyplug':
            case 'shellyplug-s':
                topics.push({
                    topic: createFullTopicName('relay/0/power'),
                    name: this.settings.relays[0].name || `${this.getName()} channel 0`,
                })
                break
            case 'shellydimmer2':
                topics.push({
                    topic: createFullTopicName('light/0/power'),
                    name: this.settings.lights[0].name || `${this.getName()} light 0`,
                })
                break
            default:
                return []
        }

        return topics
    }
}
