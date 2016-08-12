import arcpy
import csv
import crud
from util import lookup_grid_id
from util import DeleteIfFieldExist
from util import sanitizeLineName


#Enterprise Geo Database
egdb = "C:\Users\Administrator\AppData\Roaming\ESRI\Desktop10.2\ArcCatalog\Connection geodata.sde"

ignore_spans = [
    "geodata.DBO.TRANSMISSION_2015_TRANS_70_DELIVERY_All_Spans"
]
done_names = []#"OLEUM-MARTINEZ","SIERRA PACIFIC IND TAP","OLEUM-G #1","OLEUM-G #2","SOBRANTE-GRIZZLY-CLAREMONT #1","SOBRANTE-GRIZZLY-CLAREMONT #2","SOBRANTE-G #1","SOBRANTE-G #2","SOBRANTE-R #1","SOBRANTE-R #2","PALERMO-OROVILLE #2","COTTONWOOD-BENTON #2","APPLE HILL #1 TAP","APPLE HILL #2 TAP","AUBURN TAP","BEARDSLEY TAP","BELL-PLACER","BOGUE-RIO OSO","BRIDGEVILLE-COTTONWOOD","BRIGHTON-GRAND ISLAND #1","BRIGHTON-GRAND ISLAND #2","BRIGHTON-OLEUM JCT (IDLE)","CARIBOU-PALERMO","CRAG VIEW-CASCADE","DEEPWATER #1 TAP","DONNELLS-CURTIS","EL DORADO-MISSOURI FLAT #1","EL DORADO-MISSOURI FLAT #2","GOLD HILL-CLARKSVILLE","HALSEY-PLACER","HIGGINS-BELL","HUMBOLDT-BRIDGEVILLE","HUMBOLDT-TRINITY","IGNACIO-SAN RAFAEL #1","JESSUP TAP","KANAKA TAP","LINCOLN-PLEASANT GROVE","LOWER LAKE-HOMESTAKE","MADISON-VACA","MELONES-CURTIS","MENDOCINO-REDBUD","MENDOCINO-UKIAH","MORAGA-CLAREMONT #1","MORAGA-CLAREMONT #2","MORAGA-OAKLAND #1","MORAGA-OAKLAND #2","MORAGA-OAKLAND #3","MORAGA-OAKLAND #4","MTN QUARRIES TAP","OAKHURST TAP","PALERMO-NICOLAUS","PALERMO-PEASE","PEASE-RIO OSO","POST OFFICE TAP","RIO BRAVO (ROCKLIN) TAP","RIO OSO-LINCOLN","RIO OSO-NICOLAUS","RIO OSO-WOODLAND #1","SANTA ROSA-CORONA","SEMITROPIC-MIDWAY #2","SLY CREEK TAP","SMYRNA-SEMITROPIC-MIDWAY","SPRING GAP TAP","TRINITY-COTTONWOOD","UC DAVIS #1 TAP","UC DAVIS #2 TAP","VACA-PLAINFIELD","VACA-SUISUN","VACA-VACAVILLE-JAMESON-NORTH TOWER","WEST SACRAMENTO-BRIGHTON","WEST SACRAMENTO-DAVIS","WOODLAND BIOMASS TAP","WOODLAND-DAVIS","WOODLEAF-PALERMO","VACA-SUISUN-JAMESON","VACA-VACAVILLE-CORDELIA","NICOLAUS-CATLETT JCT","ATLANTIC-GOLD HILL","ATLANTIC-PLEASANT GROVE #2","BELLOTA-COTTLE","BELLOTA-RIVERBANK-MELONES SW STA","BELLOTA-WARNERVILLE","BRIGHTON-CLAYTON #1 (IDLE)","BRIGHTON-CLAYTON #2 (IDLE)","CALLENDAR SW STA-MESA","CONTRA COSTA #1","COTTLE-MELONES","DIABLO-GATES #1","DIABLO-MESA","DRUM-HIGGINS","DRUM-RIO OSO #1","DRUM-RIO OSO #2","DRUM-SPAULDING","PITTSBURG-CLAYTON #1","PITTSBURG-CLAYTON #3","PITTSBURG-CLAYTON #4","PITTSBURG-COLUMBIA STEEL","PITTSBURG-EASTSHORE","PITTSBURG-KIRKER-COLUMBIA STEEL","PITTSBURG-TESLA #1","PITTSBURG-TESLA #2","PITTSBURG-TESORO","PITTSBURG-TIDEWATER","PLACER-GOLD HILL #1","PLACER-GOLD HILL #2","RAVENSWOOD-SAN MATEO #1","RAVENSWOOD-SAN MATEO #2","RIO OSO-ATLANTIC","RIO OSO-GOLD HILL","RIVERBANK JCT SW STA-MANTECA","ROUND MTN-TABLE MTN #1","ROUND MTN-TABLE MTN #2","SAN LUIS OBISPO-CAYUCOS","SAN LUIS OBISPO-SANTA MARIA","SAN MATEO-BAIR","SAN RAMON-MORAGA","SPAULDING-SUMMIT","STANISLAUS-MANTECA #2","STANISLAUS-MELONES SW STA-MANTECA #1","STANISLAUS-MELONES SW STA-RIVERBANK JCT SW STA","SYCAMORE CREEK-NOTRE DAME-TABLE MTN","TABLE MTN-BUTTE #2","WARNERVILLE-WILSON","WILSON-ATWATER #2","DUTCH FLAT #2 TAP","EL CAPITAN-WILSON","FLINT TAP","FRENCH MEADOWS-MIDDLE FORK","GWF #2 TAP","LAKEWOOD-CLAYTON","MELONES-WILSON","MIDDLE FORK-GOLD HILL","MORRO BAY-DIABLO","MORRO BAY-GATES #2","MORRO BAY-MESA","MORRO BAY-SAN LUIS OBISPO #1","MORRO BAY-SAN LUIS OBISPO #2","MORRO BAY-TEMPLETON","FIBREBOARD TAP","DRUM-SUMMIT #1","DRUM-SUMMIT #2","PITTSBURG-MARTINEZ #2","ATLANTIC-PLEASANT GROVE #1","MISSOURI FLAT-GOLD HILL #1","MISSOURI FLAT-GOLD HILL #2","DRUM-GRASS VALLEY-WEIMAR","LAKEWOOD-MEADOW LANE-CLAYTON","MIDDLE FORK #1","CRAZY HORSE CANYON-SALINAS-SOLEDAD #1","CRAZY HORSE CANYON-SALINAS-SOLEDAD #2","MOSS LANDING-CRAZY HORSE CANYON #1","MOSS LANDING-CRAZY HORSE CANYON #2","SALINAS-FORT ORD #1","CAMP EVERS-PAUL SWEET","CHINESE CAMP (ULTRA POWER) TAP","COBURN-PANOCHE","COLGATE-ALLEGHANY","COLGATE-GRASS VALLEY","COTTONWOOD-BENTON #1","COTTONWOOD-PANORAMA","GREEN VALLEY-CAMP EVERS","GREEN VALLEY-LLAGAS","HONCUT TAP","HUMBOLDT BAY-HUMBOLDT #1 115","HUMBOLDT BAY-HUMBOLDT #1 60","HUMBOLDT-MAPLE CREEK","IGNACIO-ALTO","IGNACIO-ALTO-SAUSALITO #1","IGNACIO-ALTO-SAUSALITO #2","MARTINEZ-SOBRANTE","MENDOCINO #1","MENDOCINO-PHILO JCT-HOPLAND","METCALF-GREEN VALLEY","METCALF-MORGAN HILL","METCALF-MOSS LANDING #1","METCALF-MOSS LANDING #2","MORGAN HILL-LLAGAS","MOSS LANDING-COBURN","MOSS LANDING-DEL MONTE #1","MOSS LANDING-DEL MONTE #2","MOSS LANDING-GREEN VALLEY #1","MOSS LANDING-GREEN VALLEY #2","MOSS LANDING-METCALF","MOSS LANDING-PANOCHE #2","MOSS LANDING-SALINAS #1","MOSS LANDING-SALINAS #2","PALERMO-BOGUE","PALERMO-WYANDOTTE","PARDEE #1 TAP","PEORIA TAP","OLEUM-NORTH TOWER-CHRISTIE","RIO OSO-WEST SACRAMENTO","SMARTVILLE-NICOLAUS #2","WEIMAR-HALSEY","WOODLAND POLY TAP","CASCADE-BENTON-DESCHUTES","BELLOTA-RIVERBANK","BALCH-MCCALL","BALCH-SANGER","HAAS-MCCALL","HAAS-WOODCHUCK","KERCKHOFF-CLOVIS-SANGER #2","KINGS RIVER-SANGER-REEDLEY","MCCALL-KINGSBURG #1","MCCALL-KINGSBURG #2","MCCALL-REEDLEY","MCCALL-SANGER #1","MCCALL-SANGER #2","MCCALL-SANGER #3","ARCO-MIDWAY","DOS AMIGOS PUMPING PLANT-PANOCHE","GATES-ARCO","GATES-MIDWAY 500","GATES-MIDWAY 230","GATES-PANOCHE #1","GATES-PANOCHE #2","LOS BANOS-CANAL-ORO LOMA","LOS BANOS-DOS AMIGOS","LOS BANOS-GATES #1","LOS BANOS-LIVINGSTON JCT-CANAL","LOS BANOS-MIDWAY #2","LOS BANOS-O'NEILL PGP","LOS BANOS-PACHECO","LOS BANOS-PANOCHE #1","LOS BANOS-PANOCHE #2","LOS BANOS-QUINTO SW STA","MILLER #1 TAP","PANOCHE-ORO LOMA","PANOCHE-SCHINDLER #1","PANOCHE-SCHINDLER #2","QUINTO SW STA-WESTLEY","SAN LUIS #3 TAP","TESLA-LOS BANOS #1","TESLA-SALADO #1","TESLA-SALADO-MANTECA","TESLA-TRACY #1","TESLA-TRACY #2","TESLA_TRACY_500","TESLA-WESTLEY","TRACY-LOS BANOS","EIGHT MILE ROAD-STAGG","EIGHT MILE ROAD-TESLA","STAGG-TESLA","BELLOTA-TESLA #2","BELLOTA-WEBER","KYOHO TAP","STOCKTON A-LOCKEFORD-BELLOTA #1","STOCKTON A-LOCKEFORD-BELLOTA #2","TESLA_TRACY_115","WEBER #1","WEBER-MORMON JCT","WEBER-TESLA","CAMANCHE PUMPING PLANT TAP","CAMANCHE TAP","ELECTRA-BELLOTA","RANCHO SECO-BELLOTA #1","RANCHO SECO-BELLOTA #2","SALT SPRINGS-TIGER CREEK","TIGER CREEK-ELECTRA","TIGER CREEK-VALLEY SPRINGS","VALLEY SPRINGS-BELLOTA","WEST POINT-VALLEY SPRINGS","CASTRO VALLEY-NEWARK","LAS POSITAS-NEWARK","LAWRENCE LIVERMORE LAB #1 TAP","LOS ESTEROS-METCALF","NEWARK-DIXON LANDING","NEWARK-JARVIS #1","NEWARK-JARVIS #2","NEWARK-LAWRENCE LAB","NEWARK-LIVERMORE","NEWARK-LOS ESTEROS","NEWARK-MILPITAS #1","NEWARK-MILPITAS #2","NEWARK-NUMMI","NEWARK-RAVENSWOOD","NORTH DUBLIN-VINEYARD","TESLA-METCALF","TESLA-NEWARK #1","TESLA-NEWARK #2","TESLA-RAVENSWOOD","VINEYARD-NEWARK","BORDEN-GREGG","WILSON-BORDEN","WILSON-GREGG","WILSON-LE GRAND","WILSON-MERCED #1","WILSON-MERCED #2","WILSON-ORO LOMA","BRENTWOOD-KELSO","CONTRA-COSTA-BRENTWOOD","CONTRA-COSTA-DELTA SWITCHYARD","CONTRA COSTA-LAS POSITAS","CONTRA COSTA-LONE TREE","CONTRA COSTA-MORAGA #1","CONTRA COSTA-MORAGA #2","LONE TREE-CAYETANO","SIERRA PACIFIC IND TAP","BRIGHTON-DAVIS","BRUNSWICK #1 TAP","BRUNSWICK #2 TAP","CASCADE-COTTONWOOD","CORTINA-MENDOCINO #1","EAGLE ROCK-CORTINA","EAGLE ROCK-REDBUD","FULTON JCT-VACA","GOLD HILL #1","KESWICK-TRINITY","MELONES-RACETRACK","NICOLAUS-WILKINS SLOUGH","RACETRACK TAP","RIO OSO-WOODLAND #2","UKIAH-HOPLAND-CLOVERDALE","NICOLAUS-PLAINFIELD","DEER CREEK-DRUM","COLGATE-PALERMO","COLGATE-RIO OSO","COLGATE-SMARTVILLE #1","COLGATE-SMARTVILLE #2"]
done = []
for name in done_names:
    done.append(sanitizeLineName(name))


status_code = {
    "0": "ignored",
    "1": "left",
    "2": "allgood",
    "3": "not ready",
    "4": "ready",
    "5": "worked",
    "6": "deleted"
}
priority_code = {
    "0": None,
    "1": "routine",
    "2": "accelerate",
    "3": "immediate"
}

map_line_name = {
    "7TH_STANDARD_SUB": "SEVENTH_STANDARD_SUB",
    "7TH_STANDARD_KERN": "SEVENTH_STANDARD_KERN",
    "COYOTE_SW_STA_METCALF": "COYOTE_METCALF"
}

def span_report(output_file, aggragation_file=None, lines=None):
    print "CREATING SPAN REPORT"
    if not lines:
        lines = arcpy.ListFeatureClasses("*_Spans")
    elif isinstance(lines, basestring):
        lines = lines.split(',')

    if not arcpy.Exists(egdb):
        print "ERROR: Could not connect to gdb"

    csvfile = open(output_file,'wb') 
    fieldnames = ['LINE_NAME', 'LINE_NBR', 'VOLTAGE', 'SPAN_NAME', 'SPAN_LEN_MI', 'NO_WORK', 'WORKED', 'UNWORKED']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()

    api_trees_by_id = {}
    # batch tree request
    for tree in crud.resources("tree", parse_json=True, verbose=True):
        atree = dict(qsi_id= tree.get('qsi_id'), status=tree["status"])
        status = status_code[tree["status"][0]]
        if status not in ["ignored", "deleted"] and tree.get('span_name'):
            #print atree, tree['circuit_name'], tree['span_name']
            if tree.get('qsi_id'):
                api_trees_by_id[tree['qsi_id']] = atree

    count = 0
    aggragations = {}

    arcpy.env.workspace = egdb  
    #groups = arcpy.ListDatasets()
    groups = arcpy.ListDatasets("geodata.DBO.TRANSMISSION_2015*") 

    for group in groups:
        print "group", group
        if("SPRING_30" in group or group.endswith("TRANS_70_DELIVERY")):
            arcpy.env.workspace = egdb+"/"+group  
            classes = arcpy.ListFeatureClasses()
            for feature_name in classes:
                if(feature_name.endswith("_Spans") or feature_name.endswith("_SpansDepricated")):
                    line_name = '_'.join(feature_name.split('_')[:-2]) #remove _{x}kV_Spans
                    line_name = line_name[len(group+"_"):]

                    if(feature_name in ignore_spans):
                        continue

                    grid_id = lookup_grid_id(line_name)
                    trees_features = feature_name.replace("Spans", "TreeTops") 
                    print "Tree Feature Layer", trees_features
                    if not arcpy.Exists(trees_features):
                        grid_id = "NO_TREES"
                    print feature_name, grid_id
                    assert(grid_id)

                    api_trees_by_span = {}        
                    api_trees_by_span.setdefault(line_name, {})
                    for tree in crud.resources("tree", circuit_name=line_name, parse_json=True, verbose=True):
                        atree = dict(qsi_id= tree.get('qsi_id'), status= tree.get('status'))
                        if tree.get('status') != "deleted" and tree.get('span_name'):
                            api_trees_by_span[tree['circuit_name']].setdefault(tree['span_name'], [])
                            api_trees_by_span[tree['circuit_name']][tree['span_name']].append(tree)

                    print "Processing", line_name, grid_id
                    span_trees = {}
                    if(grid_id != "NO_TREES"):
                    #    DeleteIfFieldExist(trees_features,"SPAN_NAME")
                     #     DeleteIfFieldExist(trees_features,"PMD_NUM")
                    #    arcpy.Near_analysis(trees_features, line)
                     #     arcpy.JoinField_management(in_data=trees_features, in_field="NEAR_FID", join_table=line, join_field="OBJECTID", fields=["SPAN_NAME", "PMD_NUM"])
                        for row in arcpy.SearchCursor(trees_features):
                            span_trees.setdefault(row.SPAN_NAME, [])
                            span_trees[row.SPAN_NAME].append(row.TREEID)


                    # DeleteIfFieldExist(line, "SHAPE_LEN_MI")
                    # arcpy.AddField_management(line, "SHAPE_LEN_MI", "DOUBLE")
                    # arcpy.CalculateField_management(line, "SHAPE_LEN_MI", "!SHAPE.LENGTH@MILES!", "PYTHON")
                    agg = {"WORKED_MILES": 0, "NO_WORK_MILES": 0, "UNWORKED_MILES": 0, "NO_TREE_MILES": 0}
                    for row in arcpy.SearchCursor(feature_name):
                        agg["LINE_NAME"] = row.LINE_NAME
                        agg["VOLTAGE"] = row.VOLTAGE
                        span_name = row.SPAN_NAME;
                        line_name = sanitizeLineName(row.LINE_NAME)
                        line_name = map_line_name.get(line_name, line_name)
                        print line_name
                        print api_trees_by_span[line_name].get(span_name)

                        trees = getTrees(span_name, line_name, span_trees.get(span_name, []), api_trees_by_id, api_trees_by_span)
                        allgood, unworked, worked = countTrees(trees)
                        span_len = row.SHAPE.getLength(units="MILES")
                        csv_row = dict(LINE_NAME= row.LINE_NAME, LINE_NBR= row.LINE_NBR, SPAN_NAME= span_name, SPAN_LEN_MI=span_len ,
                                NO_WORK=allgood, WORKED=worked, UNWORKED=unworked, VOLTAGE=row.VOLTAGE)
                        print "  ", csv_row 
                        writer.writerow(csv_row)

                        if(unworked == 0 and worked == 0 and allgood == 0):
                            agg["NO_TREE_MILES"] += span_len 
                        elif (unworked != 0 ):
                            agg["UNWORKED_MILES"] += span_len 
                        elif (worked != 0):
                            agg["WORKED_MILES"] += span_len 
                        elif (allgood != 0):
                            agg["NO_WORK_MILES"] += span_len

                    aggragations[agg["LINE_NAME"]] = agg
                    csvfile.flush()    

    total_worked = 0
    total_unwworked = 0
    total_no_work = 0    
    total_no_tree = 0

    csvfile = open(aggragation_file,'wb') 
    fieldnames = ['LINE_NAME', 'VOLTAGE', 'NO_WORK_MILES', 'WORKED_MILES', 'UNWORKED_MILES', 'NO_TREE_MILES']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()

    api_trees_by_id = {}

    for line in aggragations:
        total_worked += aggragations[line]["WORKED_MILES"]
        total_unwworked += aggragations[line]["UNWORKED_MILES"]
        total_no_work += aggragations[line]["NO_WORK_MILES"]
        total_no_tree += aggragations[line]["NO_TREE_MILES"]
        writer.writerow(aggragations[line])
        csvfile.flush()

    print "WORKED_MILES", total_worked
    print "UNWORKED_MILES", total_unwworked
    print "NO_WORK_MILES", total_no_work
    print "NO_TREE_MILES", total_no_tree


def countTrees(trees):
    worked = 0
    allgood = 0
    unworked = 0

    for tree in trees:
        tree_status = status_code[tree["status"][0]]

        if tree_status == "allgood":
            allgood+=1
        elif tree_status == "worked":
            worked+=1
        else:
            unworked+=1
    return allgood, unworked, worked

def getTrees(span_name, line_name, span_trees, api_trees_by_id, api_trees_by_span):
    api_trees = {}
    api_trees.setdefault('added', [])
    #print api_trees_by_span[grid_id]
    for tree in api_trees_by_span.get(line_name, {}).get(span_name, []):
        #print tree
        if tree.get('qsi_id'):
            api_trees[tree['qsi_id']] = tree
        else:
            api_trees['added'].append(tree)

    for tree_id in span_trees:                    
        if not api_trees.get(tree_id):
            tree = api_trees_by_id.get(tree_id)
            if tree:
                print "    Included tree", tree_id
                api_trees[tree_id] = tree
            else:
                print "    Tree not found", tree_id
        else:
            print "    Tree exists", tree_id

    print "    Inpsector Added: ", len(api_trees['added']) 
    trees = api_trees['added']
    del api_trees['added']
    trees = trees + api_trees.values()

    return trees

if __name__ == '__main__':    
    import baker

    baker.command(span_report)
    baker.run()