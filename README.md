# WarOwl subgame system
An integration between a community server for CS:GO and Twitch channel subscribers. Subscribers can enter a list from where the admin can select people and send them the server information required to enter a CS:GO match.

This was made for the streamer [WarOwl](https://twitch.tv/warowl), and by me, Luiz Pontes (luiz_eldorado).

## Installation

1. Copy the contents of the `src` folder to a place in your webserver.

2. Open `CONFIG.php` in a text editor and configure everything accordingly. You will need:
- **An admin password.** Set this to something really secure.
- **Database host, username and password.** If you don't know how to get these, I don't think I can really help you.
- **Twitch client ID and Twitch redirect URL.** Create a cliend ID in <https://dev.twitch.tv/dashboard/apps>. The redirect URL should be the home page in your website (i.e. index.html).
- **Twitch channel ID**. By default, it uses WarOwl's id.

3. In your server, run (which generally means open it on a browser) the file `INSTALL.php?password=<admin password>`. The "admin password" is the same you set in the `CONFIG.php` file.

4. If everything goes right, "Done!!1" will appear on the screen. Then, you can go to the control panel and change other stuff as the CS:GO server information. If it doesn't, well... it's gonna take a lot of work from me to fix it, probably.

## Live version

<http://luizpontes.000webhostapp.com/w/pages/warowlsubgames/> contains the whole system. It is intended to be used by WarOwl in case he cannot host this for whatever reason.

## Additional info

- You can select a config file by adding a `f` parameter in `INSTALL.php`.
- The installation process deletes the selected database if it exists, before recreating it again. Because of that, you might have to manually create a database in your server.
- I separated what is front-end and back-end. You can create your own user interface if you want using the API.
