"""Makes a test project from the 3D platformer starter: its ground is replaced
by a Terrain3D object, and gameplay tests check rendering, collisions and
performance."""
import json
import os
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SOURCE = os.environ.get("STARTER", os.path.join(HERE, "..", "..", "..", "GDevelop-examples", "examples", "starting-3D-platformer"))
DESTINATION = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "terrain-demo")
EXTENSIONS = sys.argv[2:] or [
    os.path.join(HERE, "..", "..", "extensions", "community", name + ".json") for name in ("Terrain3D", "Water3D", "Grass3D")
]

if not os.path.exists(DESTINATION):
    shutil.copytree(SOURCE, DESTINATION)
project_path = os.path.join(DESTINATION, os.environ.get("PROJECT_FILE", "game.json"))
project = json.load(open(os.path.join(SOURCE, "starting-3D-platformer.json")))

IS_EXAMPLE = bool(os.environ.get("EXAMPLE"))
if IS_EXAMPLE:
    project["properties"]["name"] = "3D island terrain"
    project["properties"]["description"] = (
        "A 3D island made with a terrain that can be sculpted and painted in the editor, "
        "with water, grass swaying in the wind and a character walking on the hills."
    )
    project["properties"]["projectUuid"] = "5f0b6b1e-8c1d-4b9a-a3f6-2d7c4e9a1b30"
# Faster in the software renderer used by headless tests (examples keep their
# settings: their tests change them when they start).
if not IS_EXAMPLE:
    project["properties"]["windowWidth"] = 480
    project["properties"]["windowHeight"] = 270

scene = project["layouts"][0]
# Shadows are the slowest part in the software renderer: showcase tests enable them.
for layer in (scene["layers"] if not IS_EXAMPLE else []):
    for effect in layer["effects"]:
        if effect["effectType"] == "Scene3D::DirectionalLight":
            effect["booleanParameters"]["isCastingShadow"] = False
removed_instances = {"Ground", "Obstacle", "PushableBox", "Coin"}
scene["instances"] = [i for i in scene["instances"] if i["name"] not in removed_instances]
scene["objects"] = [o for o in scene["objects"] if o["name"] != "Ground"]

terrain_object = {
    "assetStoreId": "",
    "name": "Terrain",
    "type": "Terrain3D::Terrain3D",
    "variables": [],
    "effects": [],
    "behaviors": [{
        "name": "Physics3D", "type": "Physics3D::Physics3DBehavior", "object3D": "Object3D",
        "bodyType": "Static", "bullet": False, "fixedRotation": False, "shape": "Box",
        "shapeOrientation": "Z", "shapeDimensionA": 0, "shapeDimensionB": 0, "shapeDimensionC": 0,
        "density": 1, "friction": 0.5, "restitution": 0, "linearDamping": 0.1, "angularDamping": 0.1,
        "gravityScale": 1, "layers": 1, "masks": 1, "shapeOffsetX": 0, "shapeOffsetY": 0,
        "shapeOffsetZ": 0, "massCenterOffsetX": 0, "massCenterOffsetY": 0, "massCenterOffsetZ": 0,
        "massOverride": 0,
    }],
    "content": {"Relief": "Island", "Seed": 3, "Resolution": "256"},
}
scene["objects"].append(terrain_object)
scene["instances"].append({
    "angle": 0, "customSize": True, "width": 4096, "height": 4096, "depth": 600,
    "layer": "", "name": "Terrain", "persistentUuid": "0a7c3d57-7a53-4e7c-8f55-0d5d7d4e1a01",
    "x": 640 - 2048, "y": 750 - 2048, "z": -100, "zOrder": 1,
    "numberProperties": [], "stringProperties": [], "initialVariables": [],
})
def add_object(name, object_type, content, instance):
    scene["objects"].append({"assetStoreId": "", "name": name, "type": object_type, "variables": [],
                             "effects": [], "behaviors": [], "content": content})
    scene["instances"].append(dict({
        "angle": 0, "customSize": True, "layer": "", "name": name, "zOrder": 2,
        "persistentUuid": "0a7c3d57-7a53-4e7c-8f55-0d5d7d4e1a" + str(len(scene["instances"])).zfill(2),
        "numberProperties": [], "stringProperties": [], "initialVariables": [],
    }, **instance))


add_object("Water", "Water3D::Water3D", {"WaveHeight": 4},
           {"x": 640 - 4096, "y": 750 - 4096, "z": -38, "width": 8192, "height": 8192, "depth": 1})
add_object("Grass", "Grass3D::Grass3D", {"Density": 12, "BendingObject": "Player"},
           {"x": 640 - 1024, "y": 750 - 1024, "z": -100, "width": 2048, "height": 2048, "depth": 40})

def replace_in_folders(folder):
    children = folder.get("children", [])
    folder["children"] = [child for child in children if child.get("objectName") != "Ground"]
    for child in folder["children"]:
        if "children" in child:
            replace_in_folders(child)


replace_in_folders(scene["objectsFolderStructure"])
scene["objectsFolderStructure"]["children"] += [{"objectName": name} for name in ("Terrain", "Water", "Grass")]

for instance in scene["instances"]:
    if instance["name"] == "Player":
        instance["z"] = 2000

# The player starts on the ground.
scene["events"].insert(0, {
    "type": "BuiltinCommonInstructions::Standard",
    "conditions": [{"type": {"value": "DepartScene"}, "parameters": [""]}],
    "actions": [
        # A dirt path from the player to the sea, and a flat plaza around the player.
        {"type": {"value": "Terrain3D::Terrain3D::PaintLayerAlongLine"},
         "parameters": ["Terrain", "640", "750", "1900", "1600", "40", "2", ""]},
        {"type": {"value": "Terrain3D::Terrain3D::FlattenGround"},
         "parameters": ["Terrain", "640", "750", "150", "Terrain.GroundZ(640, 750)", ""]},
        {"type": {"value": "Terrain3D::Terrain3D::PaintLayer"},
         "parameters": ["Terrain", "640", "750", "110", "2", ""]},
        {"type": {"value": "Terrain3D::Terrain3D::PutOnGround"}, "parameters": ["Terrain", "Player", ""]},
    ],
})

for extension_path in EXTENSIONS:
    extension = json.load(open(extension_path))
    project["eventsFunctionsExtensions"] = [
        e for e in project["eventsFunctionsExtensions"] if e["name"] != extension["name"]
    ] + [extension]

tests_folder = os.path.join(HERE, "gameplay-tests")
project["tests"] = []
for file_name in sorted(os.listdir(tests_folder)):
    if not file_name.endswith(".js"):
        continue
    source = open(os.path.join(tests_folder, file_name)).read()
    first_line, _, body = source.partition("\n")
    if IS_EXAMPLE:
        body = body.replace(
            "await harness.goToScene('Game Scene');\n",
            "await harness.goToScene('Game Scene');\n"
            "// Faster in the software renderer used to run tests.\n"
            "harness.setGameResolutionSize(480, 270);\n"
            "harness.getCurrentRuntimeScene().getLayer('').setEffectBooleanParameter('Effect', 'isCastingShadow', false);\n",
            1,
        )
    project["tests"].append({
        "name": first_line.lstrip("/ ").strip(),
        "type": "gameplay",
        "description": "",
        "source": body.strip("\n").split("\n"),
    })

with open(project_path, "w") as file:
    json.dump(project, file, indent=2)
print("Written", project_path)
