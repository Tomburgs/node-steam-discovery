# How-to-use this magic

1.
  To get started, you want to install NodeJS.

  Which version? I don't know. You can never go wrong with the [latest-stable](https://nodejs.org/en/), I guess.

  (If you were not smart enough to click the latest-stable link, [this](https://nodejs.org/en/) is another link to the NodeJS website)

2.
  Download the files (in-case you already didn't figure it out)!

  Have git installed? Great!

  just type `git clone https://github.com/TomYoki/node-steam-discovery`

  Don't have it?

  There's a 'download files' button...

3.
  Navigate to the folder, either using `cd <file-directory>` or by opening the folder.

4.
  Type `npm i`, this will download all the necessary libraries. This may take a minute or two.

  Or just launch the install.bat file, if future me will ever add one.

5.
  If you got this far and had no idea what you were doing - good job!

  You can now follow the steps bellow to fill out the cfg.json file and run it.

6.
  You can run it by typing `npm start` in the console,

  or by launching the start.bat file, if, again, future me will add one.

# Accounts

To add accounts that will be getting trading cards for your lazy ass,
you have to go to cfg.json and add each account you wish to queue MANUALLY.
We at 'Yoki Co.' are no god damn wizards. To be entirely honest, we have no clue how our code even works.
So, please, if you want your trading cards just fill out that magical form, located in cfg.json file.
It will be under "profiles".

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

Woah! Did you really thought we would leave the job only half-done?
If you did then you are SUPER DUPER MEGA wrong, you can easily make the bot
send you your cards! In-fact you should, because we're honestly not sure what would happen
if you won't enter your SteamID64. It might be fine, it might murder your entire family!
If you're that tough, go ahead and find out, till then just fill out the configuration file.
All you want to do is enter your SteamID64 in the cfg.json file.
Once the bot is done farming the cards, each bot will automatically send you your cards!

```json
{
  "admin": "76561198190043849"
}
```

# How do I contribute?

If you're good with JavaScript and are willing to waste your time, feel free to do so!

This project could easily use a few more features.
