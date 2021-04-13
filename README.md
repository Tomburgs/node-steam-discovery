# node-steam-discovery

This is an automated Node.js script for farming Steam's trading cards during their special sale events.

## 1. NodeJS Version
  To get started, you want to install NodeJS.

  On Mac:
  ```bash
  brew install node
  ```

  Linux (Ubuntu):
  ```
  apt install node
  ```

  On Windows you can go [here](https://nodejs.org/en/).

## 2. Downloading The Files
  `git clone git@github.com:Tomburgs/node-steam-discovery.git`

## 3. Opening The Downloaded Folder
  Navigate to the folder, either using `cd <file-directory>` or by opening the folder.

## 4. Installing Dependencies
  Type `npm i`, this will download all the necessary libraries. This may take a minute or two.

  Or just launch the install.bat file, if future me will ever add one.

## 5. Updating Configurations
  If you got this far and had no idea what you were doing - good job!

  You can now follow the steps bellow to fill out the cfg.json file and run it.

## 6. Starting The Bot
  You can run it by typing `npm start` in the console,

  or by launching the start.bat file, if, again, future me will add one.

# Accounts

You have to go to cfg.json and add each account you wish to queue under the "profiles" key.

```json
{
  "username": "account_username",
  "password": "account_password",
  "secrets": {
    "identity": "identity_secret",
    "shared": "shared_secret"
  }
}
```

# Getting the cards

All you want to do is enter your SteamID64 in the cfg.json file.
Once the bot is done farming the cards, each bot will automatically send you your cards.

```json
{
  "admin": "76561198190043849"
}
```

# How do I contribute?

If you're good with JavaScript and are willing to waste your time, feel free to do so!

This project could easily use a few more features.
