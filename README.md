![GDevelop logo](https://raw.githubusercontent.com/4ian/GDevelop/master/newIDE/GDevelop%20banner.png 'GDevelop logo')

GDevelop is a **full-featured, no-code, open-source** game development software. You can build **2D, 3D and multiplayer games** for mobile (iOS, Android), desktop and the web. GDevelop is fast and easy to use: the game logic is built up using an intuitive and powerful event-based system and reusable behaviors.

# GDevelop Official and Experimental Extensions

This repository hosts official and experimental extensions for GDevelop. Extensions can provide new behaviors for objects, actions, conditions or expressions.

## Getting started

| ❔ I want to...                 | 🚀 What to do                                                         |
| ------------------------------- | --------------------------------------------------------------------- |
| 🎮 Use GDevelop to make games   | Go to [GDevelop homepage](https://gdevelop.io) to download the app!   |
| Use an extension                | Extensions can be **searched and downloaded** directly from GDevelop. |
| Contribute to GDevelop itself   | Visit [GDevelop GitHub repository](https://github.com/4ian/GDevelop). |
| Create/improve an extension     | Read below.                                                           |

### 🚀 Discover more extensions on the [GDevelop Community List](https://github.com/GDevelopApp/GDevelop-community-list).

The [GDevelop Community List](https://github.com/GDevelopApp/GDevelop-community-list) is where extensions built by the whole GDevelop community can be found. Check it out!

## Submit an extension

This repository only contains official and experimental extensions: the GDevelop team is responsible for their code. Extensions are submitted with a pull request and reviewed by the _GDevelop Extensions Team_.

> [!TIP]
> Not comfortable with Git, or want to keep improving your extension before a review? Add it to the **[GDevelop Community List](https://github.com/GDevelopApp/GDevelop-community-list)** instead. Any extension can be listed there, and this gives it visibility in the GDevelop ecosystem.

Read the documentation about [functions](https://wiki.gdevelop.io/gdevelop5/events/functions), [custom behaviors](https://wiki.gdevelop.io/gdevelop5/behaviors/events-based-behaviors) and [custom objects](https://wiki.gdevelop.io/gdevelop5/objects/custom-objects-prefab-template/) to build an extension for GDevelop. Then:

1. Follow the [best practices](https://wiki.gdevelop.io/gdevelop5/extensions/best-practices): fill the **descriptions**, **tags** and **names** in the options of your extension, its functions and its behaviors.
2. **Export** your extension to a _.json file_ from GDevelop ("Export extension" in the extension options, then "Export to a file"). The file must be named after the extension, for example `Flash.json`.
3. [Fork this repository](https://github.com/GDevelopApp/GDevelop-extensions/fork) and add the file to your fork. A **new extension** goes in `extensions/community/`. An **update** replaces the existing file in `extensions/community/` or `extensions/reviewed/`. You can do this from GitHub in your browser, with "Add file" > "Upload files" in the folder of your fork: no need to install Git.
4. [Open a pull request](https://github.com/GDevelopApp/GDevelop-extensions/compare) and fill in the template. Attach an example project, as a zip, showing how to use the extension.
5. The checks of the pull request verify that the extension follows the best practices. If they fail, click "Details" next to the "Check extensions" check to see the errors. Fix them in GDevelop, export the extension again and upload the new file to the same branch: the pull request is updated.
6. A member of the _GDevelop Extensions Team_ then reviews the extension. When it's ready, it's merged and becomes available in GDevelop.

> [!NOTE]
> When your extension gets reviewed, the extension team will ask you to adapt your extension to reach a fairly high quality bar. This is normal! The feedback is here to help get the extension in a state where it's super flexible and useful for all users.

To report a bug or get help with an extension, use the [GDevelop forum](https://forum.gdevelop.io).

### Run the checks locally

If you cloned the repository, run `npm install` then `npm run build` to check all the extensions. Some errors can be fixed automatically with `npm run build -- --fix`.

## License

All extensions provided on this repository are MIT licensed.
