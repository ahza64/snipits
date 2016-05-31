import os, shutil
import arcpy
from util import FieldExist, DeleteIfFieldExist, config, MakeGroupLayer, makeFeatureSD

#Enterprise Geo Database
egdb = "C:\Users\Administrator\AppData\Roaming\ESRI\Desktop10.2\ArcCatalog\Connection geodata.sde"

def copy_delivery(path=None, to_path=None):        
    if(path.endswith('.gdb')):
        merge_gdb(path, to_path=to_path, ignore=ignore, overwrite=overwrite)
    else:
        if not path:
            path = util.path("Transmission/deliveries")
        directories = os.listdir(path)
        for dir in directories:        
            if os.path.isdir(path+"/"+dir):
                merge_delivery(path+"/"+dir, ignore=ignore, do_backup=False, overwrite=overwrite)            

def merge_gdb(path, to_path=None, class_prefix=None, ignore_exisiting=False, overwrite=False):
    orig_workspace = arcpy.env.workspace
    if not to_path:
        to_path = orig_workspace
    arcpy.env.workspace = path
    classes = arcpy.ListFeatureClasses()
    arcpy.env.workspace = to_path
    for clss in classes:
        fc = os.path.join(path, clss)
        
        #parse out circuit name for feature classes
        if(clss in ["Spans", "Towers", "TreeTops"]):
            circuit = path.split('/')[-1][0:-4]
            if(circuit.endswith("_Dispatchr")):
                circuit = circuit[0:-10]
            clss = circuit+"_"+clss
                    
        out = clss
        
        if class_prefix:
            out = class_prefix+"_"+out

        print fc
        print out
        if arcpy.Exists(out) and ignore_exisiting:
            print "Ignored existing feature class", out  
        else:
            if arcpy.Exists(out) and overwrite:
                arcpy.Delete_management(out)
            arcpy.CopyFeatures_management(fc, out);
            
    arcpy.env.workspace = orig_workspace



def stage_data(gdb, project, load_id, ignore_exisiting=False, overwrite=False):

    gdb = convert_path_prefix(gdb)

    if not arcpy.Exists(egdb):
        print "ERROR: Could not connect to gdb"


    arcpy.env.workspace = gdb
    classes = arcpy.ListFeatureClasses("*_Spans")
    desc = arcpy.Describe(classes[0])

    dataset_name = project.upper()+"_"+load_id.upper()    
    dataset = os.path.join(egdb, dataset_name) 
    if not arcpy.Exists(dataset):
        print "Creating load feature dataset", dataset
        arcpy.CreateFeatureDataset_management(egdb, dataset_name, desc.spatialReference)

    print "warehousing", gdb
    merge_gdb(gdb, dataset, dataset_name, ignore_exisiting, overwrite)



def transform_data(project, load_id):
    dataset_name = project.upper()+"_"+load_id.upper()    
    dataset_path = os.path.join(egdb, dataset_name) 
    arcpy.env.workspace = dataset_path

    features = arcpy.ListFeatureClasses()

    for feature_name in features:
        print "Transforming", feature_name

        DeleteIfFieldExist(feature_name,"LOAD_ID")
        arcpy.AddField_management(feature_name,"LOAD_ID","STRING")
        arcpy.CalculateField_management(feature_name,"LOAD_ID",'"'+load_id.upper()+'"',"PYTHON_9.3")

        if feature_name.endswith("_Spans"):
            base_name = feature_name[0:-6] #remove _Spans            
            trees_features = base_name+"_TreeTops"

            DeleteIfFieldExist(feature_name, "PMD_NUM")
            arcpy.AddField_management(feature_name,"PMD_NUM","STRING")
            arcpy.CalculateField_management(feature_name,"PMD_NUM","!PMD_1!","PYTHON_9.3")

            if arcpy.Exists(trees_features):
                print "              joining tables and inserting SPAN names in ",trees_features
                DeleteIfFieldExist(trees_features,"SPAN_NAME")
                DeleteIfFieldExist(trees_features,"PMD_NUM")
                arcpy.Near_analysis(trees_features, feature_name)
                arcpy.JoinField_management(in_data=trees_features, in_field="NEAR_FID", join_table=feature_name, join_field="OBJECTID", fields=["SPAN_NAME", "PMD_NUM"])


def load_data(project, load_id):
    pass

data_dir = config['root_dir'] 
mxd_tmpl = os.path.join(data_dir, "MXDTmpl.mxd")

def publish_data(project, load_id):
    dataset_name = project.upper()+"_"+load_id.upper()    
    dataset_path = os.path.join(egdb, dataset_name) 
    arcpy.env.workspace = dataset_path


    mxd_file = os.path.join(data_dir, project.upper()+"_AUTO.mxd")

    if(not os.path.exists(mxd_file)):
        shutil.copyfile(mxd_tmpl, mxd_file)

    classes = arcpy.ListFeatureClasses()
    mxd = arcpy.mapping.MapDocument(mxd_file)

    for cls in classes:
        print "Creating Layer", cls
        prefix_len = len(" geodata.DBO.")
        prefix_len += len(dataset_name)
        layer_name = cls[prefix_len: ]

        data_frame = arcpy.mapping.ListDataFrames(mxd)[0]
        if not getLayer(mxd, layer_name, data_frame):
            arcpy.MakeFeatureLayer_management(cls, "temp_feature_layer")
            layer = arcpy.mapping.Layer("temp_feature_layer")
            layer.name = layer_name
            groupLayer = MakeGroupLayer(mxd, data_frame, load_id.upper(), "AUTO_ARRANGE")
            arcpy.mapping.AddLayerToGroup(data_frame, groupLayer, layer, "AUTO_ARRANGE")
            mxd.save()
            del groupLayer
            del layer
            arcpy.Delete_management("temp_feature_layer")
    del mxd 



def publish_ms(project, load_id, push=False):

    filename = project.upper()+"_AUTO"


    mxd_file = os.path.join(data_dir, filename+".mxd")
    sddraft = os.path.join(data_dir, filename+".sddraft")
    sd = os.path.join(data_dir, filename+".sd")
    mapDoc = arcpy.mapping.MapDocument(mxd_file) 
    connection = data_dir+"/arcgis_publish.ags"
    
    arcpy.mapping.CreateMapSDDraft(mapDoc, sddraft, project.upper(), 'ARCGIS_SERVER', connection, False, None, "transmission", "Transmissions")

    analysis = analayze(sddraft)
    if push:
        if analysis['errors'] == {}:
            if(os.path.exists(sd)):
                os.remove(sd)
            arcpy.StageService_server(sddraft, sd)
            arcpy.UploadServiceDefinition_server(sd, connection)
            print "Service successfully published"
        else: 
            print "Service could not be published because errors were found during analysis."

def publish_fs(project, load_id, push=False):

    filename = project.upper()+"_AUTO"
    mxd_file = os.path.join(data_dir, filename+".mxd")
    sddraft = os.path.join(data_dir, filename+".sddraft")
    sd = os.path.join(data_dir, filename+".sd")
    connection = data_dir+"/arcgis_publish.ags"
    
    if push:
        if(os.path.exists(sd)):
            os.remove(sd)
        makeFeatureSD(mxd_file, project.upper(), connection, data_dir+"/tmp", sd, 1000, "transmission", "Transmission")
        arcpy.UploadServiceDefinition_server(sd, connection)
        print "Service successfully published"

def analayze(sddraft):
    analysis = arcpy.mapping.AnalyzeForSD(sddraft)

    # Print errors, warnings, and messages returned from the analysis
    print "The following information was returned during analysis of the MXD:"
    for key in ('messages', 'warnings', 'errors'):
      print '----' + key.upper() + '---'
      vars = analysis[key]
      for ((message, code), layerlist) in vars.iteritems():
        print '    ', message, ' (CODE %i)' % code
        print '       applies to:',
        for layer in layerlist:
            print layer.name,
        print
    return analysis
def getLayer(mxd, layer_name, dataFrame):
    layer = arcpy.mapping.ListLayers(mxd, layer_name, dataFrame)
    if(len(layer) > 0):
        return layer[0]
    return None


def convert_path_prefix(path):
    if(path.startswith("/cygdrive")):
        path = path[10]+":/"+path[12:]
    return path  

if __name__ == '__main__':    
    import baker

    baker.command(stage_data)
    baker.command(transform_data)
    baker.command(publish_data)
    baker.command(publish_ms)
    baker.command(publish_fs)
    baker.run()
 