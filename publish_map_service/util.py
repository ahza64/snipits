
import arcpy
import os

config = {
    "root_dir": "d:/gis_data"
}

def FieldExist(featureclass, fieldname):
    fieldList = arcpy.ListFields(featureclass, fieldname)

    fieldCount = len(fieldList)

    if (fieldCount == 1):
        return True
    else:
        return False


def DeleteIfFieldExist(featureclass, fieldname):
	fieldList = arcpy.ListFields(featureclass)

	for field in fieldList:
		if field.name.startswith(fieldname):
			print "    deleting column from ", featureclass, field.name
			arcpy.DeleteField_management(featureclass, [field.name])


def sanitizeLineName(str):
    str = str.strip()
    str = re.sub(r'[#\(\)\.]', "", str);
    str = str.strip();
    str = re.sub(r'[\s-]', '_', str);
    str = re.sub(r'&', "_", str);
    str = re.sub(r"'", "_", str);
    str = re.sub(r'_+', "_", str);
    str = str.upper();
    return str;


def MakeGroupLayer(mxd, dataFrame, layer_name, add_possition):
    groupLayer = arcpy.mapping.ListLayers(mxd, layer_name, dataFrame)
    if len(groupLayer) > 0:
        groupLayer =  groupLayer[0]
    else:
        file_path = os.path.join(config["root_dir"], "EmptyGroupLayer.lyr") 
        groupLayer = arcpy.mapping.Layer(file_path)
        groupLayer.name = layer_name
        arcpy.mapping.AddLayer(dataFrame, groupLayer, add_possition)
        groupLayer = arcpy.mapping.ListLayers(mxd, groupLayer, dataFrame)[0]
    return groupLayer

from xml.etree import ElementTree as ET
import sys
# Function from: https://github.com/arcapy/update-hosted-feature-service/blob/master/update.py
def makeFeatureSD(MXD, serviceName, connection, tempDir, outputSD, maxRecords, tags, summary):
    """ create a draft SD and modify the properties to overwrite an existing FS
    """
    maxRecords = str(maxRecords)
    arcpy.env.overwriteOutput = True
    # All paths are built by joining names to the tempPath
    SDdraft = os.path.join(tempDir, "tempdraft.sddraft")
    newSDdraft = os.path.join(tempDir, "updatedDraft.sddraft")

    # # Check the MXD for summary and tags, if empty, push them in.
    try:
        mappingMXD = arcpy.mapping.MapDocument(MXD)
        if mappingMXD.tags == "":
            mappingMXD.tags = tags
            mappingMXD.save()
        if mappingMXD.summary == "":
            mappingMXD.summary = summary
            mappingMXD.save()
    except IOError:
        print("IOError on save, do you have the MXD open? Summary/tag info not pushed to MXD, publishing may fail.")

    print (MXD, SDdraft, serviceName, 'ARCGIS_SERVER', connection)
    arcpy.mapping.CreateMapSDDraft(MXD, SDdraft, serviceName, 'ARCGIS_SERVER', connection, False, None)

    # Read the contents of the original SDDraft into an xml parser
    doc = ET.parse(SDdraft)

    root_elem = doc.getroot()
    if root_elem.tag != "SVCManifest":
        raise ValueError("Root tag is incorrect. Is {} a .sddraft file?".format(SDDraft))

    # The following 6 code pieces modify the SDDraft from a new MapService
    # with caching capabilities to a FeatureService with Query,Create,
    # Update,Delete,Uploads,Editing capabilities as well as the ability
    # to set the max records on the service.
    # The first two lines (commented out) are no longer necessary as the FS
    # is now being deleted and re-published, not truly overwritten as is the
    # case when publishing from Desktop.
    # The last three pieces change Map to Feature Service, disable caching
    # and set appropriate capabilities. You can customize the capabilities by
    # removing items.
    # Note you cannot disable Query from a Feature Service.

    doc.find("./Type").text = "esriServiceDefinitionType_Replacement"
    doc.find("./State").text = "esriSDState_Published"

    # Change service type from map service to feature service
    for config in doc.findall("./Configurations/SVCConfiguration/TypeName"):
        if config.text == "MapServer":
            config.text = "FeatureServer"

    # Turn off caching
    for prop in doc.findall("./Configurations/SVCConfiguration/Definition/" +
                            "ConfigurationProperties/PropertyArray/" +
                            "PropertySetProperty"):
        if prop.find("Key").text == 'isCached':
            prop.find("Value").text = "false"
        if prop.find("Key").text == 'maxRecordCount':
            prop.find("Value").text = maxRecords

    # Turn on feature access capabilities
    for prop in doc.findall("./Configurations/SVCConfiguration/Definition/Info/PropertyArray/PropertySetProperty"):
        if prop.find("Key").text == 'WebCapabilities':
            prop.find("Value").text = "Query,Create,Update,Delete,Uploads,Editing"

    # Add the namespaces which get stripped, back into the .SD
    root_elem.attrib["xmlns:typens"] = 'http://www.esri.com/schemas/ArcGIS/10.1'
    root_elem.attrib["xmlns:xs"] = 'http://www.w3.org/2001/XMLSchema'

    # Write the new draft to disk
    with open(newSDdraft, 'w') as f:
        doc.write(f, 'utf-8')

    # Analyze the service
    analysis = arcpy.mapping.AnalyzeForSD(newSDdraft)

    if analysis['errors'] == {}:
        # Stage the service
        print (newSDdraft, outputSD)
        arcpy.StageService_server(newSDdraft, outputSD)
        print("Created {}".format(outputSD))

    else:
        # If the sddraft analysis contained errors, display them and quit.
        print("Errors in analyze: \n {}".format(analysis['errors']))
        sys.exit()