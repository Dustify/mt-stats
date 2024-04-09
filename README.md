# mt-stats
Meshtastic stats collection and dashboard.

## Deployment
Bring up the containers
```
./compose-up.sh
```
or
```
docker compose up --build -d
```

## Open the web app
Open the application in your browser e.g. http://localhost:3123/

## Meshtastic device MQTT config.

- Address: IP / hostname where mt-stats is deployed
- Root topic: leave as default (e.g. msh/EU_868)
- Everything else: leave blank / off
- Enabled uplink on the relevant channel(s)

## Addendum

npm might need the following option set to install packages:

```
npm config set @buf:registry https://buf.build/gen/npm/v1/
```

