import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from extlib import *  # noqa

HERE = os.path.dirname(__file__)
OBJECT_TYPE = "Water3D::Water3D"
OUTPUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "..", "extensions", "community", "Water3D.json")

helper_code = open(os.path.join(HERE, "helper.js")).read()


def water_code(body):
    return js_event("/** @type {gdjs.CustomRuntimeObject3D} */\nconst object = objects[0];\n" + body)


functions = [
    object_function(OBJECT_TYPE, "onCreated", "Action", [
        call_action("Water3D::DefineHelperClasses", ["", ""]),
        water_code(
            REMOVE_AREA_PLACEHOLDER_CODE +
            "if (object.__water3D) object.__water3D.dispose();\n"
            "object.__water3D = new gdjs.__water3DExtension.Water(object);"
        ),
    ]),
    object_function(OBJECT_TYPE, "onDestroy", "Action", [water_code("object.__water3D.dispose();")]),
    object_function(OBJECT_TYPE, "doStepPostEvents", "Action", [water_code(
        "const game = runtimeScene.getGame();\n"
        "// Time doesn't pass in the scene editor: real time is used to show the waves.\n"
        "const time = game.isInGameEdition && game.isInGameEdition()\n"
        "    ? performance.now() / 1000\n"
        "    : object.getRuntimeScene().getTimeManager().getTimeFromStart() / 1000;\n"
        "object.__water3D.update(time);"
    )]),
    object_function(OBJECT_TYPE, "onHotReloading", "Action", [water_code("object.__water3D.updateFromProperties();")]),
    object_function(
        OBJECT_TYPE, "SurfaceZ", "ExpressionAndCondition",
        [water_code(
            'const x = eventsFunctionContext.getArgument("X");\n'
            'const y = eventsFunctionContext.getArgument("Y");\n'
            "eventsFunctionContext.returnValue = object.__water3D.getSurfaceZ(x, y);"
        )],
        [param("X", "X position"), param("Y", "Y position")],
        full_name="Water surface Z position",
        description="the Z position of the water surface, with the waves, at a position of the scene.",
        sentence="the water surface Z position at _PARAM1_; _PARAM2_",
        expression_type="expression",
    ),
    object_function(
        OBJECT_TYPE, "IsUnderwater", "Condition",
        [water_code(
            "const water = object.__water3D;\n"
            "eventsFunctionContext.returnValue = gdjs.evtTools.object.pickObjectsIf(\n"
            "    (objectToCheck) => water.isUnderwater(objectToCheck),\n"
            '    eventsFunctionContext.getObjectsLists("Objects"),\n'
            "    false,\n"
            "    null\n"
            ");"
        )],
        [param("Objects", "Objects", "objectList")],
        full_name="Object is underwater",
        description="Check if the center of an object is under the water surface.",
        sentence="_PARAM1_ is under the water of _PARAM0_",
    ),
    object_function(
        OBJECT_TYPE, "ApplyBuoyancy", "Action",
        [water_code(
            'const objectsToFloat = eventsFunctionContext.getObjects("Objects");\n'
            'const behaviorName = eventsFunctionContext.getBehaviorName("Physics3D");\n'
            'const buoyancy = eventsFunctionContext.getArgument("Buoyancy");\n'
            "object.__water3D.applyBuoyancy(objectsToFloat, behaviorName, buoyancy);"
        )],
        [
            param("Objects", "Objects to make float", "objectList"),
            param("Physics3D", "3D physics behavior", "behavior", "Physics3D::Physics3DBehavior"),
            param("Buoyancy", "Buoyancy", long_description="1 makes objects float half submerged. "
                  "Lower values make them sink, higher values float higher.", default="1"),
        ],
        full_name="Make objects float",
        description="Push objects with the 3D physics behavior up when they are in the water, and slow them "
                    "down. Run this action every frame.",
        sentence="Make _PARAM1_ float on _PARAM0_ with a buoyancy of _PARAM3_",
    ),
]

properties = [
    prop("Color", "Color", "40;120;170", "Color", group="Color"),
    prop("Opacity", "Number", 200, "Opacity", group="Color", description="From 0 (invisible) to 255 (opaque)."),
    prop("CrestColor", "Color", "140;210;220", "Color of wave crests", group="Color",
         description="Also the color of the sky reflected on the water, seen from the side."),
    prop("Foam", "Number", 0.3, "Foam", group="Color", description="From 0 (no foam) to 1 (a lot)."),
    prop("WaveHeight", "Number", 6, "Wave height", group="Waves", unit="Pixel",
         description="0 for flat water."),
    prop("WaveLength", "Number", 300, "Wave length", group="Waves", unit="Pixel"),
    prop("WaveSpeed", "Number", 1.5, "Wave speed", group="Waves"),
    prop("NormalMap", "Resource", "", "Ripples normal map", group="Ripples", extra=["image"],
         description="Optional. A seamless normal map of small waves, moving on the surface to reflect the light "
                     "like real water."),
    prop("NormalMapSize", "Number", 600, "Ripples size", group="Ripples", unit="Pixel",
         description="The size of the normal map on the surface."),
]

WATER_ICON = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#3a9bd9" d="M2 9c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2v12H2z"/><path fill="none" stroke="#bfe8ff" stroke-width="1.5" stroke-linecap="round" d="M4 14c1.5 0 1.5-1 3-1s1.5 1 3 1M14 17c1.5 0 1.5-1 3-1s1.5 1 3 1"/></svg>"""
PREVIEW_ICON_URL = "https://resources.gdevelop-app.com/assets/Icons/waves.svg"

water_object = events_based_object(
    "Water3D",
    "3D water",
    "A water surface with waves, for seas, lakes and rivers. Objects can float on it.",
    functions,
    properties,
    area=(1000, 1000, 1),
    default_name="Water",
    icon_url=svg_data_url(WATER_ICON),
    preview_icon_url=PREVIEW_ICON_URL,
)

description = """
A 3D water surface for seas, lakes and rivers, with animated waves, light reflections and foam on wave crests.

- Resize it to cover a sea or a lake: waves follow its size. Put it at the Z position of the water level.
- **Make objects float** with an action (for objects with the 3D physics behavior), and check if an object is **underwater**.
- Read the height of the waves anywhere with an expression, for example to move a boat.
- For more realistic ripples, set a seamless **normal map** of water waves in the properties.
- Works well with the 3D terrain extension: place the water between hills or around an island.
"""

extension_data = extension(
    "Water3D",
    "3D water",
    "A water surface with waves for seas, lakes and rivers, where objects can float.",
    description,
    "0.1.0",
    "Visual effect",
    ["3d", "water", "sea", "lake", "ocean", "waves", "buoyancy"],
    WATER_ICON,
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
    objects=[water_object],
    gdevelop_version=">=5.5.222",
)

write(OUTPUT, extension_data)
print("Written", OUTPUT)
