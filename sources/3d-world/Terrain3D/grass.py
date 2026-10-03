"""The terrain grass object of the Terrain3D extension."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from extlib import *  # noqa

HERE = os.path.dirname(__file__)
OBJECT_TYPE = "Terrain3D::TerrainGrass"

grass_helper_code = open(os.path.join(HERE, "grass-helper.js")).read()


def grass_code(body):
    return js_event("/** @type {gdjs.CustomRuntimeObject3D} */\nconst object = objects[0];\n" + body)


functions = [
    object_function(OBJECT_TYPE, "onCreated", "Action", [
        call_action("Terrain3D::DefineHelperClasses", ["", ""]),
        call_action("Terrain3D::DefineGrassHelperClasses", ["", ""]),
        grass_code(
            REMOVE_AREA_PLACEHOLDER_CODE +
            "if (object.__terrainGrass) object.__terrainGrass.dispose();\n"
            "object.__terrainGrass = new gdjs.__terrainGrassExtension.Grass(object);"
        ),
    ]),
    object_function(OBJECT_TYPE, "onDestroy", "Action", [grass_code("object.__terrainGrass.dispose();")]),
    object_function(OBJECT_TYPE, "doStepPostEvents", "Action", [grass_code(
        "const game = runtimeScene.getGame();\n"
        "// Time doesn't pass in the scene editor: real time is used to show the wind.\n"
        "const isInGameEdition = game.isInGameEdition && game.isInGameEdition();\n"
        "const elapsedTime = isInGameEdition ? 1 / 60 : object.getElapsedTime() / 1000;\n"
        "const time = isInGameEdition\n"
        "    ? performance.now() / 1000\n"
        "    : object.getRuntimeScene().getTimeManager().getTimeFromStart() / 1000;\n"
        "const layer = object.getInstanceContainer().getLayer(object.getLayer());\n"
        "object.__terrainGrass.update(elapsedTime, time, layer.getRenderer().getThreeCamera());"
    )]),
    object_function(OBJECT_TYPE, "onHotReloading", "Action", [
        grass_code("object.__terrainGrass.updateFromProperties();"),
    ]),
]

properties = [
    prop("Density", "Number", 60, "Density", group="Blades",
         description="The number of blades in a square of 100 x 100 pixels."),
    prop("BladeHeight", "Number", 36, "Blade height", group="Blades", unit="Pixel",
         description="The average height of blades (each blade is between 60% and 140% of it)."),
    prop("BladeWidth", "Number", 5, "Blade width", group="Blades", unit="Pixel"),
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

grass_object = events_based_object(
    "TerrainGrass",
    "Terrain grass",
    "A field of grass blades swaying in the wind, growing on 3D terrains where a layer is painted, "
    "and pushed aside by characters.",
    functions,
    properties,
    area=(1000, 1000, 40),
    default_name="Grass",
    icon_url=svg_data_url(GRASS_ICON),
    preview_icon_url="https://asset-resources.gdevelop.io/public-resources/Icons/"
                     "732ef90b7fcf5dd9171fe95d0cf262e09159b487304915a4693baa893d9ce16c_grass.svg",
)

grass_helper_function = extension_function(
    "DefineGrassHelperClasses", "Action", [js_event(grass_helper_code, parameter_objects="")],
    full_name="Define grass helper classes",
    description="Define grass helper classes JavaScript code.",
    sentence="Define grass helper classes JavaScript code",
    private=True,
)
