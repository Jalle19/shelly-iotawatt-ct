export class Shelly {
    constructor(name, ipAddress) {
        this.name = name
        this.ipAddress = ipAddress
        this.settings = null
    }

    getType() {
        return this.name.split('-')[0]
    }

    getName() {
        return this.settings.name ?? this.name
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
                    name: this.settings.relays[0].name ?? `${this.name} channel 0`,
                }, {
                    topic: createFullTopicName('relay/1/power'),
                    name: this.settings.relays[1].name ?? `${this.name} channel 1`,
                })
                break
            default:
                return []
        }

        return topics
    }
}
