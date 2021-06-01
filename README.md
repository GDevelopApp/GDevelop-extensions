![GDevelop logo](https://raw.githubusercontent.com/4ian/GDevelop/master/Core/docs/images/gdlogo.png 'GDevelop logo')

GDevelop is a full-featured, open-source game development software, allowing to create desktop and mobile games without any knowledge in a specific programming language. All the game logic is built up using an intuitive and powerful event-based system.

# GDevelop Community Extensions

This repository hosts community made extensions for GDevelop. Extensions can provide new behaviors for objects, actions, conditions or expressions.

## Getting started

| ❔ I want to...                 | 🚀 What to do                                                         |
| ------------------------------- | --------------------------------------------------------------------- |
| Download GDevelop to make games | Go on [GDevelop website](https://gdevelop-app.com) to download GD!    |
| Use an extension                | Extensions can be **searched and downloaded** directly from GDevelop. |
| Contribute to GDevelop itself   | Visit [GDevelop GitHub repository](https://github.com/4ian/GDevelop). |
| Create/improve an extension     | Read below.                                                           |

## Submit your extension

If you've created an extension with GDevelop, you can submit it to be shared with the rest of the community. This [Trello board has the extensions that are being worked on](https://trello.com/b/AftjL2v1/gdevelop-extensions) by the community.

1. **Create your extension** in your game with GDevelop: see the documentation about [functions](http://wiki.compilgames.net/doku.php/gdevelop5/events/functions) and [custom behaviors](http://wiki.compilgames.net/doku.php/gdevelop5/behaviors/events-based-behaviors).
2. Make sure the **descriptions**, **tags**, **names** are properly filled in the options of the extension. Check that you have followed all [the best practices that are listed here](http://wiki.compilgames.net/doku.php/gdevelop5/extensions/best-practices).
3. **Export** your extension to a _.json file_ from GDevelop.
4. Submit it! You can either:
   - **Easy**: [submit it here](https://github.com/4ian/GDevelop-extensions/issues/new/choose), attaching the _.json file_ (as a zip, because GitHub won't accept json files directly).
   - **Faster to review**: fork this repository, clone the git, add your .json file in `Extensions` folder, then run the update script with [Node.js](https://nodejs.org): `cd scripts && node update-extensions-registry.js`. Finally [open a Pull Request](https://github.com/4ian/GDevelop-extensions/compare).

## License

All extensions provided on this repository are MIT licensed.
