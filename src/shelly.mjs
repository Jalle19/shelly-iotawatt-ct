export class Shelly {
    constructor(name, ipAddress) {
        this.name = name
        this.ipAddress = ipAddress
        this.settings = null
    }

    getType() {
        return this.name.substring(0, this.name.lastIndexOf('-'))
    }

    getName() {
        return this.settings.name || this.name
    }

    getHttpSettingsUrl() {
        // noinspection HttpUrlsUsage
        return `http://${this.ipAddress}/settings`
    }

    getChannelNameTopicMaps() {
        const topics = []

        const createFullTopicName = (topic) => {
            return `shellies/${this.name}/${topic}`
        }

        switch (this.getType()) {
            case 'shellyswitch25':
                // Shelly 2.5 has two channels that may have user-configured names
                topics.push({
                    topic: createFullTopicName('relay/0/power'),
                    name: this.settings.relays[0].name || `${this.name} channel 0`,
                }, {
                    topic: createFullTopicName('relay/1/power'),
                    name: this.settings.relays[1].name || `${this.name} channel 1`,
                })
                break
            case 'shelly1pm':
            case 'shellyplug':
            case 'shellyplug-s':
                topics.push({
                    topic: createFullTopicName('relay/0/power'),
                    name: this.settings.relays[0].name || `${this.name} channel 0`,
                })
                break
            case 'shellydimmer2':
                topics.push({
                    topic: createFullTopicName('light/0/power'),
                    name: this.settings.lights[0].name || `${this.name} light 0`,
                })
                break
            default:
                return []
        }

        return topics
    }
}
