import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extlib import *  # noqa
from grass import grass_object, grass_helper_function

HERE = os.path.dirname(__file__)
OBJECT_TYPE = "Terrain3D::Terrain3D"
OUTPUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "..", "extensions", "community", "Terrain3D.json")

helper_code = open(os.path.join(HERE, "helper.js")).read()


def terrain_code(body):
    return js_event("/** @type {gdjs.CustomRuntimeObject3D} */\nconst object = objects[0];\n" + body)


def args(*names):
    return "".join(
        'const %s = eventsFunctionContext.getArgument("%s");\n' % (name[0].lower() + name[1:], name) for name in names
    )


position_params = [
    param("X", "X position of the center"),
    param("Y", "Y position of the center"),
    param("Radius", "Radius", long_description="The effect fades out smoothly up to this distance."),
]
line_params = [
    param("X1", "X position of the start"),
    param("Y1", "Y position of the start"),
    param("X2", "X position of the end"),
    param("Y2", "Y position of the end"),
    param("Radius", "Radius", long_description="The effect fades out smoothly up to this distance from the line."),
]
layer_param = param("Layer", "Layer (1 to 4)")

functions = [
    object_function(OBJECT_TYPE, "onCreated", "Action", [
        call_action("Terrain3D::DefineHelperClasses", ["", ""]),
        terrain_code(
            REMOVE_AREA_PLACEHOLDER_CODE +
            "if (object.__terrain3D) object.__terrain3D.dispose();\n"
            "object.__terrain3D = new gdjs.__terrain3DExtension.Terrain(object);"
        ),
    ]),
    object_function(OBJECT_TYPE, "onDestroy", "Action", [terrain_code("object.__terrain3D.dispose();")]),
    object_function(OBJECT_TYPE, "doStepPostEvents", "Action", [terrain_code("object.__terrain3D.update();")]),
    object_function(OBJECT_TYPE, "onHotReloading", "Action", [terrain_code("object.__terrain3D.onHotReloading();")]),

    object_function(
        OBJECT_TYPE, "RaiseGround", "Action",
        [terrain_code(args("X", "Y", "Radius", "Height") + "object.__terrain3D.raise(x, y, x, y, radius, height);")],
        position_params + [param("Height", "Height to add (negative to lower the ground)")],
        full_name="Raise or lower the ground",
        description="Raise the ground around a position (or lower it with a negative height). "
                    "It's raised the most at the center and less and less up to the radius.",
        sentence="Raise the ground of _PARAM0_ by _PARAM4_ at _PARAM1_; _PARAM2_ with a radius of _PARAM3_",
        group="Sculpt",
    ),
    object_function(
        OBJECT_TYPE, "RaiseGroundAlongLine", "Action",
        [terrain_code(args("X1", "Y1", "X2", "Y2", "Radius", "Height") +
                      "object.__terrain3D.raise(x1, y1, x2, y2, radius, height);")],
        line_params + [param("Height", "Height to add (negative to lower the ground)")],
        full_name="Raise or lower the ground along a line",
        description="Raise the ground along a line, for example for a ridge, or lower it with a negative height "
                    "to dig a river bed or a valley.",
        sentence="Raise the ground of _PARAM0_ by _PARAM6_ from _PARAM1_; _PARAM2_ to _PARAM3_; _PARAM4_ "
                 "with a radius of _PARAM5_",
        group="Sculpt",
    ),
    object_function(
        OBJECT_TYPE, "FlattenGround", "Action",
        [terrain_code(args("X", "Y", "Radius", "Z") + "object.__terrain3D.flatten(x, y, x, y, radius, z, 1);")],
        position_params + [param("Z", "Z position of the flat ground")],
        full_name="Flatten the ground",
        description="Flatten the ground around a position to a given height, for example to place a building.",
        sentence="Flatten the ground of _PARAM0_ to a Z of _PARAM4_ at _PARAM1_; _PARAM2_ with a radius of _PARAM3_",
        group="Sculpt",
    ),
    object_function(
        OBJECT_TYPE, "SmoothGround", "Action",
        [terrain_code(args("X", "Y", "Radius", "Strength") +
                      "object.__terrain3D.smooth(x, y, x, y, radius, strength);")],
        position_params + [param("Strength", "Strength (between 0 and 1)")],
        full_name="Smooth the ground",
        description="Smooth the ground around a position, softening bumps and cliffs.",
        sentence="Smooth the ground of _PARAM0_ at _PARAM1_; _PARAM2_ with a radius of _PARAM3_ "
                 "(strength: _PARAM4_)",
        group="Sculpt",
    ),
    object_function(
        OBJECT_TYPE, "PaintLayer", "Action",
        [terrain_code(args("X", "Y", "Radius", "Layer") + "object.__terrain3D.paint(x, y, x, y, radius, layer, 1);")],
        position_params + [layer_param],
        full_name="Paint a layer",
        description="Paint a layer (like grass, dirt, rock or sand) on the ground around a position.",
        sentence="Paint layer _PARAM4_ on _PARAM0_ at _PARAM1_; _PARAM2_ with a radius of _PARAM3_",
        group="Paint",
    ),
    object_function(
        OBJECT_TYPE, "PaintLayerAlongLine", "Action",
        [terrain_code(args("X1", "Y1", "X2", "Y2", "Radius", "Layer") +
                      "object.__terrain3D.paint(x1, y1, x2, y2, radius, layer, 1);")],
        line_params + [layer_param],
        full_name="Paint a layer along a line",
        description="Paint a layer on the ground along a line, for example for a path or a road.",
        sentence="Paint layer _PARAM6_ on _PARAM0_ from _PARAM1_; _PARAM2_ to _PARAM3_; _PARAM4_ "
                 "with a radius of _PARAM5_",
        group="Paint",
    ),
    object_function(
        OBJECT_TYPE, "GenerateRelief", "Action",
        [terrain_code(args("Relief", "Seed") + "object.__terrain3D.generate(relief, seed);")],
        [
            param("Relief", "Relief", "stringWithSelector", ["Flat", "Hills", "Mountains", "Island"]),
            param("Seed", "Seed", long_description="Each seed gives a different terrain with the same relief."),
        ],
        full_name="Generate a relief",
        description="Replace the ground with a generated relief. Painted layers are reset.",
        sentence="Generate a relief of _PARAM1_ on _PARAM0_ with seed _PARAM2_",
        group="Generation",
    ),
    object_function(
        OBJECT_TYPE, "LoadHeightmap", "Action",
        [terrain_code(args("Image") + "object.__terrain3D.loadHeightmap(image);")],
        [param("Image", "Heightmap image", "imageResource",
               long_description="Black is the lowest, white the highest. For more precision, store the height "
                                "on 16 bits in the red (most significant byte) and green channels.")],
        full_name="Load a heightmap",
        description="Replace the ground with the heights of an image. Painted layers are kept.",
        sentence="Load the heights of _PARAM0_ from _PARAM1_",
        group="Generation",
    ),
    object_function(
        OBJECT_TYPE, "PutOnGround", "Action",
        [terrain_code('object.__terrain3D.placeOnGround(eventsFunctionContext.getObjects("Objects"));')],
        [param("Objects", "Objects to put on the ground", "objectList")],
        full_name="Put objects on the ground",
        description="Move objects up or down so that their bottom is on the ground, under their center. "
                    "Useful to place trees, rocks or characters on a terrain.",
        sentence="Put _PARAM1_ on the ground of _PARAM0_",
        group="Position",
    ),
    object_function(
        OBJECT_TYPE, "GroundZ", "ExpressionAndCondition",
        [terrain_code(args("X", "Y") + "eventsFunctionContext.returnValue = object.__terrain3D.getHeightAt(x, y);")],
        [param("X", "X position"), param("Y", "Y position")],
        full_name="Ground Z position",
        description="the Z position of the ground at a position of the scene.",
        sentence="the ground Z position at _PARAM1_; _PARAM2_",
        group="Position",
        expression_type="expression",
    ),
    object_function(
        OBJECT_TYPE, "GroundSlope", "ExpressionAndCondition",
        [terrain_code(args("X", "Y") + "eventsFunctionContext.returnValue = object.__terrain3D.getSlopeAt(x, y);")],
        [param("X", "X position"), param("Y", "Y position")],
        full_name="Ground slope",
        description="the slope of the ground (angle with the horizontal, in degrees) at a position of the scene.",
        sentence="the ground slope at _PARAM1_; _PARAM2_",
        group="Position",
        expression_type="expression",
    ),
    object_function(
        OBJECT_TYPE, "GroundLayer", "ExpressionAndCondition",
        [terrain_code(args("X", "Y") + "eventsFunctionContext.returnValue = object.__terrain3D.getLayerAt(x, y);")],
        [param("X", "X position"), param("Y", "Y position")],
        full_name="Ground layer",
        description="the layer (from 1 to 4) painted the most at a position of the scene. "
                    "Useful to play footstep sounds or to slow down characters in water or mud.",
        sentence="the ground layer at _PARAM1_; _PARAM2_",
        group="Paint",
        expression_type="expression",
    ),
]

layer_defaults = [
    ("Grass", "96;160;64"),
    ("Dirt", "150;112;72"),
    ("Rock", "124;118;112"),
    ("Sand", "224;204;148"),
]
layer_properties = []
for index, (layer_name, color) in enumerate(layer_defaults):
    number = index + 1
    layer_properties.append(prop("Layer%dColor" % number, "Color", color, "Layer %d color (%s)" % (number, layer_name.lower()),
                                 group="Layers"))
    layer_properties.append(prop("Layer%dTexture" % number, "Resource", "", "Layer %d texture" % number,
                                 description="Optional. Tinted by the layer color.", group="Layers", extra=["image"]))
    layer_properties.append(prop("Layer%dNormalMap" % number, "Resource", "", "Layer %d normal map" % number,
                                 description="Optional. The bumps of the texture, lit by the lights "
                                             "(an OpenGL normal map, like the textures of ambientCG).",
                                 group="Layers", extra=["image"]))

properties = [
    prop("Relief", "Choice", "Hills", "Relief", group="Shape",
         description="The initial shape, before sculpting.",
         choices=[("Flat", "Flat"), ("Hills", "Hills"), ("Mountains", "Mountains"), ("Island", "Island")]),
    prop("Seed", "Number", 1, "Seed", group="Shape",
         description="Each seed gives a different terrain with the same relief."),
    prop("HeightmapImage", "Resource", "", "Heightmap image", group="Shape", extra=["image"],
         description="Optional. Replaces the relief: black is the lowest, white the highest (the object depth)."),
    prop("Edits", "MultilineString", "", "Edits", group="Shape", advanced=True,
         description="Changes of the relief or heightmap, as a JSON list, for example "
                     '[{"tool": "raise", "x": 0.3, "y": 0.4, "radius": 0.15, "height": 0.4}, '
                     '{"tool": "paint", "x": 0.1, "y": 0.9, "toX": 0.8, "toY": 0.2, "radius": 0.02, "layer": 2}]. '
                     "Tools: raise (height, negative to lower), flatten (z), smooth (strength) and paint (layer, "
                     "from 1 to 4, and strength). x, y and radius are fractions (0 to 1) of the terrain size "
                     "(x is (scene X - terrain X) / terrain width), height and z fractions of its depth. Add toX and "
                     "toY to change the ground along a line (paths, rivers, ridges). An object put on an area "
                     "flattened at z stands on the ground at Z = terrain Z + z * terrain depth (useful for "
                     "buildings). Shown in the scene editor."),
    prop("Resolution", "Choice", "256", "Resolution", group="Shape",
         description="The number of cells on each side of the terrain. Higher is more detailed but slower.",
         choices=[("64", "64 x 64"), ("128", "128 x 128"), ("256", "256 x 256"), ("512", "512 x 512"),
                  ("1024", "1024 x 1024")]),
] + layer_properties + [
    prop("NormalMapStrength", "Number", 1, "Normal map strength", group="Layers",
         description="How much the normal maps bump the ground: 0 for none, 1 as they are, more to "
                     "exaggerate them."),
    prop("TextureSize", "Number", 256, "Texture size", group="Layers", unit="Pixel",
         description="The size, in the scene, of one repetition of the layer textures."),
    prop("CliffLayer", "Choice", "3", "Layer on steep slopes", group="Layers",
         description="This layer is shown where the ground is steep, whatever is painted.",
         choices=[("0", "None"), ("1", "Layer 1"), ("2", "Layer 2"), ("3", "Layer 3"), ("4", "Layer 4")]),
    prop("CliffAngle", "Number", 45, "Steep slope angle", group="Layers", unit="DegreeAngle"),
    prop("CastShadow", "Boolean", True, "Cast shadows", group="Rendering"),
    prop("ReceiveShadow", "Boolean", True, "Receive shadows", group="Rendering"),
    prop("SculptData", "String", "", "Sculpted and painted data", advanced=True,
         description="Written by the sculpt and paint tools of the scene editor, in a compact format not meant to be "
                     "read or written by hand: use Edits instead. Clear it to go back to the relief, heightmap and "
                     "edits."),
]

TERRAIN_ICON = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#6dbb58" d="M1 20 L8 9 L12 14 L16 7 L23 20 Z"/><path fill="#fff" d="M8 9 L10 12 L8.6 12.8 L6.9 10.8 Z M16 7 L18.5 11.5 L16.5 12.5 L14.6 10 Z"/></svg>"""
PREVIEW_ICON_URL = "https://asset-resources.gdevelop.io/public-resources/Icons/10e0a26c0d500830dfe23b94138beb0ef61607ba62bca05a5aa5c849777f1b06_terrain.svg"

terrain_object = events_based_object(
    "Terrain3D",
    "3D terrain",
    "A ground with hills, mountains or valleys that can be sculpted and painted in the scene editor, "
    "or changed with events. Add the 3D physics behavior to it to make objects walk or roll on it.",
    functions,
    properties,
    area=(4096, 4096, 600),
    default_name="Terrain",
    icon_url=svg_data_url(TERRAIN_ICON),
    preview_icon_url=PREVIEW_ICON_URL,
)

description = """
A 3D terrain object for open worlds, adventure or racing games: hills, mountains, islands or valleys, with painted layers of grass, dirt, rock or sand.

- **Sculpt and paint in the scene editor**: select a terrain to show the tools (raise, lower, smooth, flatten and paint 4 layers).
- **Start from a relief** (hills, mountains, island) or **from a heightmap image**.
- **Steep slopes automatically show rock** (or any layer).
- **Physics**: add the **3D physics** behavior to the terrain. Characters and objects collide with the ground exactly. The terrain is always static.
- **Pathfinding**: add the **floor/obstacle for pathfinding (navmesh based)** behavior to the terrain, so that characters with the navmesh pathfinding behavior walk on its hills and around its cliffs (in recent GDevelop versions).
- **Shape it with the Edits property**: a list of raise, flatten, smooth and paint strokes written in JSON, shown in the scene editor. It's readable and can be changed by hand or by an AI agent, like the relief, the heightmap and the other properties. Actions only change the terrain during the game.
- **Change it during the game** with actions (raise, lower, flatten, smooth, paint, along a line for paths and rivers) and read the ground height, slope or layer with expressions.
- **Grass**: add a **terrain grass** object over the terrain. Thousands of blades sway in the wind, grow where a layer (like grass) is painted and where the ground is not too steep, and are pushed aside by characters. Sculpt or paint the terrain and the grass follows.
- **Made for large worlds**: the terrain is split in chunks that are hidden when off-screen and simplified when far away, and collisions are updated only where the ground changes.
"""

extension_data = extension(
    "Terrain3D",
    "3D terrain",
    "A ground with hills and valleys that can be sculpted and painted in the editor, with collisions.",
    description,
    "0.1.0",
    "General",
    ["3d", "terrain", "ground", "heightmap", "landscape", "open world", "grass", "foliage"],
    TERRAIN_ICON,
    PREVIEW_ICON_URL,
    [
        extension_function(
            "DefineHelperClasses", "Action", [js_event(helper_code, parameter_objects="")],
            full_name="Define helper classes",
            description="Define helper classes JavaScript code.",
            sentence="Define helper classes JavaScript code",
            private=True,
        ),
        grass_helper_function,
    ],
    objects=[terrain_object, grass_object],
    gdevelop_version=">=5.5.222",
)

write(OUTPUT, extension_data)
print("Written", OUTPUT)
