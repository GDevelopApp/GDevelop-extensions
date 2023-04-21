![GDevelop logo](https://raw.githubusercontent.com/4ian/GDevelop/master/Core/docs/images/gdlogo.png 'GDevelop logo')

GDevelop is a full-featured, open-source game development software, allowing to create desktop and mobile games without any knowledge in a specific programming language. All the game logic is built up using an intuitive and powerful event-based system.

# GDevelop Community Extensions

This repository hosts community made extensions for GDevelop. Extensions can provide new behaviors for objects, actions, conditions or expressions.

## Getting started

| ❔ I want to...                 | 🚀 What to do                                                         |
| ------------------------------- | --------------------------------------------------------------------- |
| Download GDevelop to make games | Go on [GDevelop website](https://gdevelop.io) to download GD!    |
| Use an extension                | Extensions can be **searched and downloaded** directly from GDevelop. |
| Contribute to GDevelop itself   | Visit [GDevelop GitHub repository](https://github.com/4ian/GDevelop). |
| Create/improve an extension     | Read below.                                                           |

## Submit your extension to community extensions

If you've created an extension with GDevelop, you can submit it to be shared with the rest of the community. This [Trello board has the extensions that are being worked on](https://trello.com/b/AftjL2v1/gdevelop-extensions) by the community.

1. **Create your extension** in your game with GDevelop: see the documentation about [functions](https://wiki.gdevelop.io/gdevelop5/events/functions) and [custom behaviors](https://wiki.gdevelop.io/gdevelop5/behaviors/events-based-behaviors).
2. Make sure the **descriptions**, **tags**, **names** are properly filled in the options of the extension.
3. **Export** your extension to a _.json file_ from GDevelop.
4. Submit it! You can either:
   - **Easy**: [submit it here](https://github.com/4ian/GDevelop-extensions/issues/new/choose), attaching the _.json file_ (as a zip, because GitHub won't accept json files directly).
   - **If you know how to use git**: fork this repository, clone the git, add your .json file in `extensions/community` folder. Finally [open a Pull Request](https://github.com/4ian/GDevelop-extensions/compare).
5. Your extension will be added after a automated checks and a _quick safety check_. 🚀

  > **Note**: If automated checks are failing, please adapt your extension and submit it again to get it added! Even if we don't do a full review of all extensions, just safety checks, the automated checks must pass. Look at automated comments that will be added to the _Pull Request_ corresponding to your submission.

## Get your extension (reviewed extensions)

Reviewed extensions are community extensions that got reviewed and adapted to meet all **[the best practices that are listed here](https://wiki.gdevelop.io/gdevelop5/extensions/best-practices)**.

If your community extension is very useful and you think its quality is good enough:

1. open a _Pull Request_ to move it from the `community` folder to the `reviewed` folder.
2. A member of the _GDevelop Extensions Team_ will then review it and give you feedback on what to do to have it reviewed.
3. When it's ready, it will be merged and the extension now accessible in the "reviewed" extensions.

> **Note**: When your extension gets reviewed, the extension team will ask you to adapt your extension to reach a fairly high quality bar. It's normal! The feedback is here to help get the extension in a state where it's super flexible and useful for all users.

## License

All extensions provided on this repository are MIT licensed.
