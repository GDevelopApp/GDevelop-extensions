import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from extlib import *  # noqa

HERE = os.path.dirname(__file__)
OBJECT_TYPE = "Grass3D::Grass3D"
OUTPUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "..", "extensions", "community", "Grass3D.json")

helper_code = open(os.path.join(HERE, "helper.js")).read()


def grass_code(body):
    return js_event("/** @type {gdjs.CustomRuntimeObject3D} */\nconst object = objects[0];\n" + body)


functions = [
    object_function(OBJECT_TYPE, "onCreated", "Action", [
        call_action("Grass3D::DefineHelperClasses", ["", ""]),
        grass_code(
            REMOVE_AREA_PLACEHOLDER_CODE +
            "if (object.__grass3D) object.__grass3D.dispose();\n"
            "object.__grass3D = new gdjs.__grass3DExtension.Grass(object);"
        ),
    ]),
    object_function(OBJECT_TYPE, "onDestroy", "Action", [grass_code("object.__grass3D.dispose();")]),
    object_function(OBJECT_TYPE, "doStepPostEvents", "Action", [grass_code(
        "const game = runtimeScene.getGame();\n"
        "// Time doesn't pass in the scene editor: real time is used to show the wind.\n"
        "const isInGameEdition = game.isInGameEdition && game.isInGameEdition();\n"
        "const elapsedTime = isInGameEdition ? 1 / 60 : object.getElapsedTime() / 1000;\n"
        "const time = isInGameEdition\n"
        "    ? performance.now() / 1000\n"
        "    : object.getRuntimeScene().getTimeManager().getTimeFromStart() / 1000;\n"
        "const layer = object.getInstanceContainer().getLayer(object.getLayer());\n"
        "object.__grass3D.update(elapsedTime, time, layer.getRenderer().getThreeCamera());"
    )]),
    object_function(OBJECT_TYPE, "onHotReloading", "Action", [grass_code("object.__grass3D.updateFromProperties();")]),
]

properties = [
    prop("Density", "Number", 60, "Density", group="Blades",
         description="The number of blades in a square of 100 x 100 pixels."),
    prop("BaseColor", "Color", "52;104;36", "Base color", group="Blades"),
    prop("TipColor", "Color", "150;196;82", "Tip color", group="Blades"),
    prop("Seed", "Number", 1, "Seed", group="Blades", description="Each seed places blades differently."),
    prop("GroundLayer", "Choice", "1", "Grows on terrain layer", group="Ground",
         description="On a 3D terrain, blades only grow where this layer is painted.",
         choices=[("0", "Any"), ("1", "Layer 1"), ("2", "Layer 2"), ("3", "Layer 3"), ("4", "Layer 4")]),
    prop("MaxSlope", "Number", 40, "Maximum slope", group="Ground", unit="DegreeAngle",
         description="No blades grow on steeper ground."),
    prop("WindStrength", "Number", 1, "Wind strength", group="Wind", description="0 for no wind."),
    prop("WindSpeed", "Number", 2, "Wind speed", group="Wind"),
    prop("BendingObject", "String", "", "Object bending the grass", group="Wind",
         description="The name of an object pushing blades aside when walking through the grass, like the player. "
                     "The 8 first instances are used."),
    prop("FadeDistance", "Number", 2500, "Fade distance", group="Rendering", unit="Pixel",
         description="Blades are less and less dense up to this distance from the camera, and hidden after."),
]

GRASS_ICON = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#5da83c" d="M3 21c1-5 1-9 0-13 2 3 3 7 3 13zm4 0c0-6 1-11 4-16-1 5-1 10 0 16zm5 0c0-5 2-9 5-12-2 4-2 8-1 12zm5 0c1-4 2-6 4-8-1 3-1 5-1 8z"/></svg>"""
PREVIEW_ICON_URL = "https://asset-resources.gdevelop.io/public-resources/Icons/732ef90b7fcf5dd9171fe95d0cf262e09159b487304915a4693baa893d9ce16c_grass.svg"

grass_object = events_based_object(
    "Grass3D",
    "3D grass",
    "A field of grass blades swaying in the wind, growing on 3D terrains and pushed aside by characters.",
    functions,
    properties,
    area=(1000, 1000, 40),
    default_name="Grass",
    icon_url=svg_data_url(GRASS_ICON),
    preview_icon_url=PREVIEW_ICON_URL,
)

description = """
Thousands of grass blades swaying in the wind, drawn in a single pass by the graphics card.

- Resize the object to cover a field. Its depth is the height of the blades.
- On a **3D terrain**, grass follows the ground and only grows where a layer (like grass) is painted and where the ground is not too steep. Sculpt or paint the terrain in the editor and the grass follows.
- Characters **push the grass aside** when walking through it: set the name of their object in the properties.
- Made for large fields: grass is split in chunks, hidden when off-screen, and thinned out with the distance.
"""

extension_data = extension(
    "Grass3D",
    "3D grass",
    "Fields of grass swaying in the wind, growing on 3D terrains and pushed aside by characters.",
    description,
    "0.1.0",
    "Visual effect",
    ["3d", "grass", "foliage", "vegetation", "wind", "field"],
    GRASS_ICON,
    PREVIEW_ICON_URL,
    [
        extension_function(
            "DefineHelperClasses", "Action", [js_event(helper_code, parameter_objects="")],
            full_name="Define helper classes",
            description="Define helper classes JavaScript code.",
            sentence="Define helper classes JavaScript code",
            private=True,
        )
    ],
    objects=[grass_object],
    gdevelop_version=">=5.5.222",
)

write(OUTPUT, extension_data)
print("Written", OUTPUT)
