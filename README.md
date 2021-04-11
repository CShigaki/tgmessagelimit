# Telegram Message Limiter

This was made to stop content leechers and encourage content sharing.

## How to use
Add the bot to a group, give it permission and type /config. This will open a configuration panel where you can configure the amount of text messages the members and send and wheter or not they can still send medias or not.

Currently the bot resets the limits every 24 hours and for now that is only possible to configure via code.

Requires mongodb.

## How to run
```
yarn install

// For development, has hot reload
yarn dev

// For actually running the bot
yarn start
```