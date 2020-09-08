
# Wushu Warriors Discord BOT
Discord bot developed for World of Warcraft guild (Wushu Warriors-DunModr) to manage roles, tickets, activity and include functionalities to improve entertainment between members.

> Node.js discord bot for Wushu Warriors guild



**Table of contents:**


* [Requirements](#requirements)
  * [Before you begin](#before-you-begin)
  * [Discord application credentials](#discord-application-credentials)
* [Installation](#installation)
* [Development](#development)
* [Production](#production)
* [Commands](#commands)

## Requirements

### Before you begin
1.  Node v12
2. Discord Application credentials
3.  Google Cloud hosting

### Discord application credentials

```javascript
auth.json

{
	"discord": {
		"token": "-----"
	}
}
```

## Installation
```bash
npm install
```
## Development
```bash
npm run dev
```
## Production
```bash
npm run start
```
## Commands
Some commands require specific roles or channels to work correctly
### Gambling
```javascript
w!bet {usertag} {amount}
```
Creates a bet between 2 users.
```javascript
w!bet {amount}
```
 Creates an open bet for anyone to participate in.
### Surveys
```javascript
{usertag}{usertag}
w!multiEncuesta
{title}
{time}
{option1}
{option2}
{...}
```
Multi selection survey with an specified timeout in minutes
```javascript
{usertag}{usertag}
w!encuesta
{title}
{time}
{option1}
{option2}
{...}
```
Single selection survey

## WIP
