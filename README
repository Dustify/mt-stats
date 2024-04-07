# mt-stats
Meshtastic stats collection and dashboard.

## Deployment
1. If accessing the dashboard directly (i.e. without nginx or equivalent), uncomment the ports section in the "web" service of compose.yaml, set the host port as required.

2. Update DEFAULT_STATS_GATEWAYID and DEFAULT_VOLTAGE_ID in compose.yaml.

3. Bring up the containers
```
./compose-up.sh
```

## Meshtastic device MQTT config.

- Address: IP / hostname where mt-stats is deployed
- Root topic: leave as default (e.g. msh/EU_868)
- Everything else: leave blank / off
- Enabled uplink on the relevant channel(s)

## Addendum

```
npm config set @buf:registry https://buf.
build/gen/npm/v1/
```

