"""Helpers to write GDevelop extension JSON files from JavaScript sources.

Extensions are stored as JSON with JavaScript inlined as "JsCode" events.
Writing the helper classes in a .js file and generating the JSON keeps them
readable and testable.
"""
import base64
import json


def js_event(code, parameter_objects="Object"):
    return {
        "type": "BuiltinCommonInstructions::JsCode",
        "inlineCode": code.strip("\n").split("\n"),
        "parameterObjects": parameter_objects,
        "useStrict": True,
        "eventsSheetExpanded": False,
    }


def call_action(action_type, parameters):
    return {
        "type": "BuiltinCommonInstructions::Standard",
        "conditions": [],
        "actions": [{"type": {"value": action_type}, "parameters": parameters}],
    }


def param(name, description, type="expression", extra=None, long_description=None, default=None, optional=False):
    parameter = {"description": description, "name": name, "type": type}
    if extra is not None:
        parameter["supplementaryInformation"] = extra if isinstance(extra, str) else json.dumps(extra)
    if long_description:
        parameter["longDescription"] = long_description
    if default is not None:
        parameter["defaultValue"] = default
    if optional:
        parameter["optional"] = True
    return parameter


def object_function(object_type, name, function_type, events, parameters=(), full_name="", description="",
                    sentence="", group="", expression_type=None, private=False):
    function = {
        "fullName": full_name,
        "functionType": function_type,
        "name": name,
        "sentence": sentence,
        "events": events,
        "parameters": [param("Object", "Object", "object", object_type)] + list(parameters),
        "objectGroups": [],
    }
    if description:
        function["description"] = description
    if group:
        function["group"] = group
    if expression_type:
        function["expressionType"] = {"type": expression_type}
    if private:
        function["private"] = True
    return function


def extension_function(name, function_type, events, parameters=(), full_name="", description="", sentence="",
                       private=False):
    function = {
        "fullName": full_name,
        "functionType": function_type,
        "name": name,
        "sentence": sentence,
        "events": events,
        "parameters": list(parameters),
        "objectGroups": [],
    }
    if description:
        function["description"] = description
    if private:
        function["private"] = True
    return function


def prop(name, type, value, label, description="", group="", extra=None, choices=None, unit=None,
         advanced=False, hidden=False):
    descriptor = {"value": str(value).lower() if isinstance(value, bool) else str(value), "type": type,
                  "label": label}
    if unit:
        descriptor["unit"] = unit
    if description:
        descriptor["description"] = description
    if group:
        descriptor["group"] = group
    if extra is not None:
        descriptor["extraInformation"] = extra
    if choices is not None:
        descriptor["choices"] = [{"label": label, "value": value} for value, label in choices]
    if advanced:
        descriptor["advanced"] = True
    if hidden:
        descriptor["hidden"] = True
    descriptor["name"] = name
    return descriptor


def svg_data_url(svg):
    return "data:image/svg+xml;base64," + base64.b64encode(svg.encode()).decode()


def default_layer():
    return {
        "ambientLightColorB": 200, "ambientLightColorG": 200, "ambientLightColorR": 200,
        "camera2DPlaneMaxDrawingDistance": 5000, "camera3DFarPlaneDistance": 10000,
        "camera3DFieldOfView": 45, "camera3DNearPlaneDistance": 3, "cameraType": "",
        "followBaseLayerCamera": False, "isLightingLayer": False, "isLocked": False, "name": "",
        "renderingType": "", "visibility": True,
        "cameras": [{"defaultSize": True, "defaultViewport": True, "height": 0, "viewportBottom": 1,
                     "viewportLeft": 0, "viewportRight": 1, "viewportTop": 0, "width": 0}],
        "effects": [],
    }


# Once the object is created, its inner area is known: the placeholder is
# removed, so that it doesn't catch clicks in the editor.
REMOVE_AREA_PLACEHOLDER_CODE = """for (const child of object.getChildrenContainer().getAdhocListOfAllInstances()) {
    child.deleteFromScene();
}
"""


def area_placeholder_object(area):
    faces = ["front", "back", "left", "right", "top", "bottom"]
    content = {"width": area[0], "height": area[1], "depth": area[2], "enableTextureTransparency": False,
               "facesOrientation": "Y", "backFaceUpThroughWhichAxisRotation": "X", "materialType": "Basic",
               "tint": "255;255;255"}
    for face in faces:
        content[face + "FaceResourceName"] = ""
        content[face + "FaceVisible"] = False
        content[face + "FaceResourceRepeat"] = False
    return {"assetStoreId": "", "name": "AreaPlaceholder", "type": "Scene3D::Cube3DObject", "variables": [],
            "effects": [], "behaviors": [], "content": content}


def events_based_object(name, full_name, description, functions, properties, area, default_name="",
                        icon_url="", preview_icon_url="", asset_store_tag=""):
    obj = {
        "areaMaxX": area[0], "areaMaxY": area[1], "areaMaxZ": area[2],
        "areaMinX": 0, "areaMinY": 0, "areaMinZ": 0,
        "defaultName": default_name,
        "description": description,
        "fullName": full_name,
        "iconUrl": icon_url,
        "is3D": True,
        "isUsingLegacyInstancesRenderer": True,
        "name": name,
        "previewIconUrl": preview_icon_url,
        # The inner area is only used when there is a child instance: this
        # cube has no visible faces and only gives the object its default size.
        "objects": [area_placeholder_object(area)],
        "objectsFolderStructure": {"folderName": "__ROOT", "children": [{"objectName": "AreaPlaceholder"}]},
        "objectsGroups": [],
        "layers": [default_layer()],
        "instances": [{
            "angle": 0, "customSize": True, "width": area[0], "height": area[1], "depth": area[2],
            "keepRatio": True, "layer": "", "name": "AreaPlaceholder",
            "persistentUuid": "5d7a8b1e-3c2f-4e6a-9b1d-" + str(area[0]).zfill(6) + str(area[1]).zfill(6),
            "x": 0, "y": 0, "z": 0, "zOrder": 1,
            "numberProperties": [], "stringProperties": [], "initialVariables": [],
        }],
        "editionSettings": {},
        "eventsFunctions": functions,
        "propertyDescriptors": properties,
    }
    if asset_store_tag:
        obj["assetStoreTag"] = asset_store_tag
    return obj


def extension(name, full_name, short_description, description, version, category, tags, icon_svg,
              preview_icon_url, functions, objects=(), behaviors=(), gdevelop_version=">=5.5.230",
              help_path="", dependencies=()):
    return {
        "author": "",
        "category": category,
        "dimension": "3D",
        "extensionNamespace": "",
        "fullName": full_name,
        "gdevelopVersion": gdevelop_version,
        "helpPath": help_path,
        "iconUrl": svg_data_url(icon_svg),
        "name": name,
        "previewIconUrl": preview_icon_url,
        "shortDescription": short_description,
        "version": version,
        "description": description.strip("\n").split("\n"),
        "origin": {"identifier": name, "name": "gdevelop-extension-store"},
        "tags": list(tags),
        "authorIds": [],
        "dependencies": list(dependencies),
        "globalVariables": [],
        "sceneVariables": [],
        "eventsFunctions": list(functions),
        "eventsBasedBehaviors": list(behaviors),
        "eventsBasedObjects": list(objects),
    }


def write(path, data):
    with open(path, "w") as file:
        json.dump(data, file, indent=2, ensure_ascii=False)
        file.write("\n")
