var _ = require('underscore');
var division_codes = {
  "Yosemite":      "YO",
  "Central Coast": "CC",
  "De Anza":       "DA",
  "Diablo":        "DI",
  "East Bay":      "EB",
  "Fresno":        "FR",
  "Kern":          "KE",
  "Los Padres":    "LP",
  "Mission":       "MI",
  "North Bay":     "NB",
  "North Coast":   "NC",
  "North Valley":  "NV",
  "Peninsula":     "PE",
  "Sacramento":    "SA",
  "San Francisco": "SF",
  "Sierra":        "SI",
  "San Jose":      "SJ",
  "Stockton":      "ST"
};
	   
var account_types = {
  "GO165":        "A",                            
  "Capital":      "C",                            
  "CEMA":         "E",                            
  "Maintenance":  "M",                            
  "Other":        "O",                            
  "TROW":         "W",                            
  "Reliability":  "Y",                            
  "Orchard":      "Z"
};                           
  
var tag_types = {
	"Cycle Buster":  "B",  //?
	"Cntr Asst":     "C",  //?
	"Project":       "D",  //Used to pick out locations that were in a special project (probably should not be the default.  
                         //        Josh is researching if we want to add a new default tag type (with a blank value).
	"Non-Essential": "E",  //?
	"No Work":       "N",  //?
	"Poor Clear":    "P",  //?
	"QA Location":   "Q",  //Used by QA team to identify tree was part of a QC audit
	"Refusal":       "R",  //Tree needs trimming/removal, but customer will not allow crews to do the work
	"Storm":         "S",  //Indicates tree needed trimming/removal during a storm.  User entered inspection record after the fact.
	"Unforeseen":    "U",  //?
	"Missed Tree":   "X",  //?
	"Reliability":   "Y",  //Used for PS&R program (account type = Y)
	"Orchard":       "Z"   //Used for orchard work (account type = O)
};


// Mike Morely Email: The most common values selected are CA and LA:
var crew_type = {
  climb:              "CA", // CA: Climb Crew D/Truck w/Tools, T/Chipper        
  climb_chiper2:      "CB", // CB: Climb Crew Truck-Mtd Chipper-Dump/Body w/Tools
  pickup_4wd:         "CC", // CC: 4 wd Pickup And Tools                        
  dump_4wd_chipper:   "CD", // CD: 4 wd Dump Truck, Trailer Chipper, Tools      
  pickup_4wd_bikes:   "CT", // CT: 4 wd Pickup, Trail Bikes, Tools              
  field_ispector:     "FI", // FI: Field Inspector P/U                          
  field_supervisor:   "FS", // FS: Field Supervisor P/U                         
  gr_crew_spray:      "GB", // GB: Gr Crew P/U Bp/Spray-Equip                   
  gr_crew_inject:     "GI", // GI: Gr Crew P/U Inject w/Tools                    
  gr_crew_lift_spray: "GS", // GS: Gr Crew Lift Spray-Tank                      
  lift:               "LA", // LA: Lift Crew D/Body w/Tools, T/Chipper          
  lift_dump:          "LB", // LB: Lift Crew D/Trk w/Tools, Lift w/Tolls, T/Chppr
  super_crew:         "LD", // LD: Super Crew 2 Air Lifts, Trail-Chip D/Trk w/Tls
  lift_crew_t:        "LC", // LC: Lift Crew T-Mtd Chip-D/Body w/Tls, Lift W/Tls
  lift_rear:          "LR", // LR: Lift Crew/Rear Esmnt Lift/D Body-Tls-Trail-Chp
  pre_inspect_pickup: "PI", // PI: Pre-Inspector Pickup                         
  patrolman_pickup:   "PT", // PT: Patrolman Pickup                             
  rc_4wd_pickup:      "RC", // RC: 4 wd/Hd Pickup and Tools                     
  r_of_w_crew:        "RW", // RW: R-of-W Crew P/U (1-Ton Hd 4wd) w/Tls, T/Chppr
  veg_crew:           "VC", // VC: Veg Crew P/U w/Spray-Tank w/Tools 
};



var circuit_numbers = { 
  "LOS GATOS 1107":               "0082021107", //CC	& DA
  "INDUSTRIAL ACRES 0414":        "0082300414", //CC	
  "PACHECO 1101":                 "0082511101", //CC	
  "BIG BASIN 1101":               "0082841101", //CC	
  "BIG BASIN 1102":               "0082841102", //CC & DA
  "POINT MORETTI 1101":           "0082941101", //CC	
  "ARANA 0401":                   "0083010401", //CC	
  "ARANA 0402":                   "0083010402", //CC	
  "BEN LOMOND 0401":              "0083040401", //CC	
  "BEN LOMOND 1101":              "0083041101", //CC	
  "BIG TREES 0402":               "0083050402", //CC	
  "BLAINE STREET 0401":           "0083060401", //CC	
  "BLAINE STREET 0403":           "0083060403", //CC	
  "BLAINE STREET 0405":           "0083060405", //CC	
  "BLAINE STREET 0406":           "0083060406", //CC	
  "BLAINE STREET 0407":           "0083060407", //CC	
  "CASSERLY 0401":                "0083110401", //CC	
  "EAST LAKE AVENUE 0401":        "0083130401", //CC	
  "EAST LAKE AVENUE 0402":        "0083130402", //CC	
  "FELTON 0401":                  "0083140401", //CC	
  "FREEDOM 0401":                 "0083160401", //CC	
  "GREEN VALLEY 2101":            "0083192101", //CC	
  "GREEN VALLEY 2102":            "0083192102", //CC	
  "GREEN VALLEY 2103":            "0083192103", //CC	
  "GREEN VALLEY 2104":            "0083192104", //CC	
  "CAPITOLA 0401":                "0083200401", //CC	
  "CAPITOLA 0402":                "0083200402", //CC	
  "CLIFF DRIVE 0401":             "0083230401", //CC	
  "CLIFF DRIVE 0402":             "0083230402", //CC	
  "CLIFF DRIVE 0403":             "0083230403", //CC	
  "PAUL SWEET 2102":              "0083252102", //CC	
  "PAUL SWEET 2103":              "0083252103", //CC	
  "PAUL SWEET 2104":              "0083252104", //CC	
  "PAUL SWEET 2105":              "0083252105", //CC	
  "PAUL SWEET 2106":              "0083252106", //CC	
  "PAUL SWEET 2107":              "0083252107", //CC	
  "RIO DEL MAR 0401":             "0083260401", //CC	
  "RIO DEL MAR 0402":             "0083260402", //CC	
  "SOQUEL 0401":                  "0083300401", //CC	
  "SOQUEL 0402":                  "0083300402", //CC	
  "PAJARO 0401":                  "0083320401", //CC	
  "WATSONVILLE 0401":             "0083330401", //CC	
  "WATSONVILLE 0411":             "0083330411", //CC	
  "WATSONVILLE 0412":             "0083330412", //CC	
  "WATSONVILLE 0413":             "0083330413", //CC	
  "WATSONVILLE 0414":             "0083330414", //CC	
  "WATSONVILLE 2101":             "0083332101", //CC	
  "OPAL CLIFFS 0401":             "0083450401", //CC	
  "OPAL CLIFFS 0402":             "0083450402", //CC	
  "SEACLIFF 0401":                "0083500401", //CC	
  "SEACLIFF 0402":                "0083500402", //CC	
  "ERTA 0401":                    "0083510401", //CC	
  "ERTA 0403":                    "0083510403", //CC	
  "ERTA 0404":                    "0083510404", //CC	
  "MEDER 0401":                   "0083550401", //CC	
  "BURNS 2401":                   "0083582401", //CC	
  "CAMP EVERS 2104":              "0083622104", //CC	
  "CAMP EVERS 2105":              "0083622105", //CC	& DA
  "CAMP EVERS 2106":              "0083622106", //CC	& DA
  "ROB ROY 2104":                 "0083692104", //CC	
  "ROB ROY 2105":                 "0083692105", //CC	
  "ROLAND SUB 0401":              "0083750401", //CC	
  "ROLAND SUB 0402":              "0083750402", //CC	
  "COAST RD. 0401":               "0088820401", //CC	
  "STRUVE RD. 1101":              "0088831101", //CC	
  "QUARRY RD. 0401":              "0088870401", //CC	
  "LOMPICO 0401":                 "0088880401", //CC	
  "SALINAS 0402":                 "0182010402", //CC	
  "SALINAS 0403":                 "0182010403", //CC	
  "SALINAS 0406":                 "0182010406", //CC	
  "SALINAS 0407":                 "0182010407", //CC	
  "SALINAS 0408":                 "0182010408", //CC	
  "SALINAS 0412":                 "0182010412", //CC	
  "SALINAS 1101":                 "0182011101", //CC	
  "SALINAS 1102":                 "0182011102", //CC	
  "SALINAS 1103":                 "0182011103", //CC	
  "SALINAS 1104":                 "0182011104", //CC	
  "SALINAS 1105":                 "0182011105", //CC	
  "SALINAS 1106":                 "0182011106", //CC	
  "SALINAS 1107":                 "0182011107", //CC	
  "KING CITY 1101":               "0182031101", //CC	
  "KING CITY 1102":               "0182031102", //CC	
  "KING CITY 1103":               "0182031103", //CC	
  "KING CITY 1104":               "0182031104", //CC	
  "KING CITY 1105":               "0182031105", //CC	
  "KING CITY 1106":               "0182031106", //CC	
  "CARMEL 0401":                  "0182040401", //CC	
  "CARMEL 0402":                  "0182040402", //CC	
  "CARMEL 0403":                  "0182040403", //CC	
  "CARMEL 0405":                  "0182040405", //CC	
  "SOLEDAD 1114":                 "0182051114", //CC	
  "SOLEDAD 2101":                 "0182052101", //CC	
  "CAMPHORA 0401":                "0182070401", //CC	
  "CAMPHORA 1101":                "0182071101", //CC	
  "LOS OSITOS 2101":              "0182082101", //CC	
  "MONTEREY 0401":                "0182090401", //CC	
  "MONTEREY 0402":                "0182090402", //CC	
  "GONZALES 1101":                "0182131101", //CC	
  "GONZALES 1102":                "0182131102", //CC	
  "GONZALES 1103":                "0182131103", //CC	
  "GONZALES 1104":                "0182131104", //CC	
  "LOS COCHES 1101":              "0182151101", //CC	
  "LOS COCHES 1102":              "0182151102", //CC	
  "SAN ARDO 1101":                "0182191101", //CC	
  "SAN ARDO 1102":                "0182191102", //CC	
  "SPENCE 1121":                  "0182201121", //CC	
  "SPENCE 1122":                  "0182201122", //CC	
  "SPENCE 1123":                  "0182201123", //CC	
  "DEL MONTE 1101":               "0182221101", //CC	
  "DEL MONTE 2102":               "0182222102", //CC	
  "DEL MONTE 2103":               "0182222103", //CC	
  "DEL MONTE 2104":               "0182222104", //CC	
  "DEL MONTE 2105":               "0182222105", //CC	
  "BUENA VISTA 0401":             "0182260401", //CC	
  "BUENA VISTA 0402":             "0182260402", //CC	
  "BUENA VISTA 1101":             "0182261101", //CC	
  "BUENA VISTA 1102":             "0182261102", //CC	
  "BUENA VISTA 1103":             "0182261103", //CC	
  "BUENA VISTA 1104":             "0182261104", //CC	
  "HATTON 1101":                  "0182291101", //CC	
  "HATTON 1102":                  "0182291102", //CC	
  "INDUSTRIAL ACRES 0411":        "0182300411", //CC	
  "INDUSTRIAL ACRES 0412":        "0182300412", //CC	
  "INDUSTRIAL ACRES 0413":        "0182300413", //CC	
  "INDUSTRIAL ACRES 0415":        "0182300415", //CC	
  "GABILAN 1101":                 "0182331101", //CC	
  "GABILAN 1102":                 "0182331102", //CC	
  "CASTROVILLE 2103":             "0182352103", //CC	
  "CASTROVILLE 2104":             "0182352104", //CC	
  "LAURELES 1111":                "0182371111", //CC	
  "LAURELES 1112":                "0182371112", //CC	
  "DOLAN ROAD 1101":              "0182381101", //CC	
  "DOLAN ROAD 1102":              "0182381102", //CC	
  "DOLAN ROAD 1103":              "0182381103", //CC	
  "DOLAN ROAD 1104":              "0182381104", //CC	
  "OILFIELDS 1102":               "0182391102", //CC	
  "OILFIELDS 1103":               "0182391103", //CC	& LP
  "OILFIELDS 1104":               "0182391104", //CC	
  "FORT ORD 1101":                "0182401101", //CC	
  "FORT ORD 1102":                "0182401102", //CC	
  "FORT ORD 1103":                "0182401103", //CC	
  "FORT ORD 1104":                "0182401104", //CC	
  "FORT ORD 1105":                "0182401105", //CC	
  "FORT ORD 1106":                "0182401106", //CC	
  "FORT ORD 1107":                "0182401107", //CC	
  "FORT ORD 1108":                "0182401108", //CC	
  "FORT ORD 1109":                "0182401109", //CC	
  "FOREST 0422":                  "0182420422", //CC	
  "PACIFIC GROVE 0421":           "0182440421", //CC	
  "PACIFIC GROVE 0422":           "0182440422", //CC	
  "PACIFIC GROVE 0423":           "0182440423", //CC	
  "PACIFIC GROVE 0424":           "0182440424", //CC	
  "BORONDA 1101":                 "0182461101", //CC	
  "BORONDA 1102":                 "0182461102", //CC	
  "HOLLISTER 2101":               "0182492101", //CC	
  "HOLLISTER 2102":               "0182492102", //CC	
  "HOLLISTER 2103":               "0182492103", //CC	
  "HOLLISTER 2104":               "0182492104", //CC	
  "HOLLISTER 2105":               "0182492105", //CC	
  "TRES PINOS 1111":              "0182531111", //CC	
  "MANZANITA 0402":               "0182700402", //CC	
  "MANZANITA 0403":               "0182700403", //CC	
  "SAN JUSTO 1101":               "0182711101", //CC	
  "RESERVATION ROAD 1101":        "0182731101", //CC	
  "RESERVATION ROAD 1102":        "0182731102", //CC	
  "VIEJO 2201":                   "0182852201", //CC	
  "VIEJO 2202":                   "0182852202", //CC	
  "VIEJO 2203":                   "0182852203", //CC	
  "VIEJO 2204":                   "0182852204", //CC	
  "OTTER 1101":                   "0182941101", //CC	
  "OTTER 1102":                   "0182941102", //CC	
  "PRUNEDALE 1107":               "0182961107", //CC	
  "PRUNEDALE 1110":               "0182961110", //CC	
  "JOLON 1102":                   "0182981102", //CC	
  "PANOCHE VALLEY 1103":          "0188001103", //CC	
  "ASBESTOS 1101":                "0188051101", //CC	
  "Cal-Trans Hwy 9":              "018HW09001", //CC	
  "TRAN - CC 60Kv":               "TR00806001", //CC	
  "TRAN - CC 70Kv":               "TR00807001", //CC	
  "TRAN - CC 115Kv":              "TR00811501", //CC	
  "TRAN - CC 230Kv":              "TR00823001", //CC	
  "TRAN - CC 500Kv":              "TR00850001", //CC	
  "CR-Aerial Patrol CC":            "TRC2301111", //CC	
  "LOS GATOS 1101":               "0082021101", //DA	
  "LOS GATOS 1102":               "0082021102", //DA	
  "LOS GATOS 1106":               "0082021106", //DA	
  "LOS GATOS 1108":               "0082021108", //DA	
  "MOUNTAIN VIEW 1102":           "0082031102", //DA	
  "MOUNTAIN VIEW 1103":           "0082031103", //DA	
  "MOUNTAIN VIEW 1104":           "0082031104", //DA	
  "MOUNTAIN VIEW 1105":           "0082031105", //DA	
  "MOUNTAIN VIEW 1106":           "0082031106", //DA	
  "MOUNTAIN VIEW 1107":           "0082031107", //DA	
  "MOUNTAIN VIEW 1108":           "0082031108", //DA	
  "MOUNTAIN VIEW 1109":           "0082031109", //DA	
  "MOUNTAIN VIEW 1110":           "0082031110", //DA	
  "MOUNTAIN VIEW 1111":           "0082031111", //DA	
  "MOUNTAIN VIEW 1112":           "0082031112", //DA	
  "MOUNTAIN VIEW 1113":           "0082031113", //DA	
  "MOUNTAIN VIEW 1114":           "0082031114", //DA	
  "LOYOLA 0401":                  "0082160401", //DA	
  "LOYOLA 0403":                  "0082160403", //DA	
  "LOYOLA 1101":                  "0082161101", //DA	
  "LOYOLA 1102":                  "0082161102", //DA	
  "LOS ALTOS 0403":               "0082240403", //DA	
  "LOS ALTOS 1103":               "0082241103", //DA	
  "LOS ALTOS 1104":               "0082241104", //DA	
  "LOS ALTOS 1105":               "0082241105", //DA	
  "LOS ALTOS 1106":               "0082241106", //DA	
  "LOS ALTOS 1107":               "0082241107", //DA	
  "River Oaks 2102":              "0082342102", //DA	
  "MENLO 1103 DA":                   "0082481103", //DA	
  "MILPITAS 1103":                "0082831103", //DA	& SJ
  "MILPITAS 2104":                "0082832104", //DA	& SJ
  "EL PATIO 1101":                "0082921101", //DA	
  "EL PATIO 1102":                "0082921102", //DA	& SJ
  "EL PATIO 1103":                "0082921103", //DA	& SJ
  "EL PATIO 1104":                "0082921104", //DA	& SJ
  "EL PATIO 1106":                "0082921106", //DA	& SJ
  "EL PATIO 1107":                "0082921107", //DA	& SJ
  "EL PATIO 1108":                "0082921108", //DA	& SJ
  "EL PATIO 1109":                "0082921109", //DA	& SJ
  "EL PATIO 1110":                "0082921110", //DA	& SJ
  "EL PATIO 1111":                "0082921111", //DA	
  "EL PATIO 1112":                "0082921112", //DA	& SJ
  "EL PATIO 1113":                "0082921113", //DA	
  "EL PATIO 1114":                "0082921114", //DA	
  "EL PATIO 1115":                "0082921115", //DA	
  "EDENVALE 2111":                "0082952111", //DA	& SJ
  "EDENVALE 2112":                "0082952112", //DA	& SJ
  "EDENVALE 2113":                "0082952113", //DA	& SJ
  "LOCKHEED NO.1 1101":           "0082991101", //DA	
  "LOCKHEED NO.1 1103":           "0082991103", //DA	
  "LOCKHEED NO.2 1102":           "0083001102", //DA	
  "LOCKHEED NO.2 1103":           "0083001103", //DA	
  "LOCKHEED NO.2 1106":           "0083001106", //DA	
  "LOCKHEED NO.2 1107":           "0083001107", //DA	
  "SARATOGA 1103":                "0083371103", //DA	
  "SARATOGA 1104":                "0083371104", //DA	
  "SARATOGA 1105":                "0083371105", //DA	
  "SARATOGA 1106":                "0083371106", //DA	
  "SARATOGA 1107":                "0083371107", //DA	
  "SARATOGA 1108":                "0083371108", //DA	
  "SARATOGA 1109":                "0083371109", //DA	
  "SARATOGA 1110":                "0083371110", //DA	& SJ
  "SARATOGA 1111":                "0083371111", //DA	& SJ
  "SARATOGA 1112":                "0083371112", //DA	& SJ
  "SARATOGA 1113":                "0083371113", //DA	& SJ
  "SARATOGA 1114":                "0083371114", //DA	& SJ
  "SARATOGA 1115":                "0083371115", //DA	
  "LAWRENCE 1102":                "0083421102", //DA	
  "LAWRENCE 1103":                "0083421103", //DA	
  "LAWRENCE 1104":                "0083421104", //DA	
  "LAWRENCE 1105":                "0083421105", //DA	
  "LAWRENCE 1106":                "0083421106", //DA	
  "LAWRENCE 1107":                "0083421107", //DA	
  "LAWRENCE 1108":                "0083421108", //DA	
  "LAWRENCE 1109":                "0083421109", //DA	
  "LAWRENCE 1110":                "0083421110", //DA	& SJ
  "LAWRENCE 1111":                "0083421111", //DA	
  "LAWRENCE 1112":                "0083421112", //DA	
  "LAWRENCE 1113":                "0083421113", //DA	
  "HICKS 1109":                   "0083431109", //DA	& SJ
  "HICKS 1111":                   "0083431111", //DA	& SJ
  "HICKS 1113":                   "0083431113", //DA	& SJ
  "HICKS 1114":                   "0083431114", //DA	& SJ
  "HICKS 1115":                   "0083431115", //DA	& SJ
  "HICKS 1116":                   "0083431116", //DA	& SJ
  "HICKS 1117":                   "0083431117", //DA	& SJ
  "HICKS 2103":                   "0083432103", //DA	& SJ
  "STELLING 1102":                "0083481102", //DA	
  "STELLING 1103":                "0083481103", //DA	
  "STELLING 1104":                "0083481104", //DA	
  "STELLING 1105":                "0083481105", //DA	
  "STELLING 1106":                "0083481106", //DA	
  "STELLING 1107":                "0083481107", //DA	
  "STELLING 1108":                "0083481108", //DA	
  "STELLING 1109":                "0083481109", //DA	
  "STELLING 1110":                "0083481110", //DA	
  "STELLING 1111":                "0083481111", //DA	
  "STELLING 1112":                "0083481112", //DA	
  "STELLING 1113":                "0083481113", //DA	
  "BRITTON 1104":                 "0083611104", //DA	
  "BRITTON 1105":                 "0083611105", //DA	
  "BRITTON 1106":                 "0083611106", //DA	
  "BRITTON 1107":                 "0083611107", //DA	
  "BRITTON 1108":                 "0083611108", //DA	
  "BRITTON 1109":                 "0083611109", //DA	
  "BRITTON 1110":                 "0083611110", //DA	
  "BRITTON 1111":                 "0083611111", //DA	
  "BRITTON 1112":                 "0083611112", //DA	
  "BRITTON 1113":                 "0083611113", //DA	
  "BRITTON 1114":                 "0083611114", //DA	
  "BRITTON 1115":                 "0083611115", //DA	
  "WHISMAN 1101":                 "0083631101", //DA	
  "WHISMAN 1102":                 "0083631102", //DA	
  "WHISMAN 1103":                 "0083631103", //DA	
  "WHISMAN 1104":                 "0083631104", //DA	
  "WHISMAN 1105":                 "0083631105", //DA	
  "WHISMAN 1106":                 "0083631106", //DA	
  "WHISMAN 1107":                 "0083631107", //DA	
  "WHISMAN 1108":                 "0083631108", //DA	
  "WHISMAN 1109":                 "0083631109", //DA	
  "WHISMAN 1110":                 "0083631110", //DA	
  "WHISMAN 1111":                 "0083631111", //DA	
  "WOLFE 1103":                   "0083671103", //DA	
  "WOLFE 1104":                   "0083671104", //DA	
  "WOLFE 1105":                   "0083671105", //DA	
  "WOLFE 1107":                   "0083671107", //DA	
  "WOLFE 1108":                   "0083671108", //DA	
  "WOLFE 1109":                   "0083671109", //DA	
  "WOLFE 1110":                   "0083671110", //DA	
  "WOLFE 1113":                   "0083671113", //DA	
  "WOLFE 1114":                   "0083671114", //DA	
  "VASONA 1101":                  "0083771101", //DA	
  "VASONA 1102":                  "0083771102", //DA	
  "VASONA 1103":                  "0083771103", //DA	
  "VASONA 1104":                  "0083771104", //DA	
  "VASONA 1105":                  "0083771105", //DA	
  "VASONA 1108":                  "0083771108", //DA	
  "AMD 1101":                     "0083851101", //DA	
  "FMC 1109":                     "0083871109", //DA	& SJ
  "FMC 1110":                     "0083871110", //DA	& SJ
  "FMC 1111":                     "0083871111", //DA	& SJ
  "Ames 1101":                    "0083901101", //DA	
  "Ames 1102":                    "0083901102", //DA	
  "CALTRANS PROJECT":             "008HW0001 ", //DA	
  "TRAN - DA 60Kv":               "TR00806002", //DA	
  "TRAN - DA 70Kv":               "TR00807002", //DA	
  "TRAN - DA 115Kv":              "TR00811502", //DA	
  "TRAN - DA 230Kv":              "TR00823002", //DA	
  "TRAN - DA 500Kv":              "TR00850002", //DA	
  "CLAYTON 1103":                 "0012021103", //DI	
  "CLAYTON 1104":                 "0012021104", //DI	
  "CLAYTON 2211":                 "0012022211", //DI	
  "CLAYTON 2212":                 "0012022212", //DI	
  "CLAYTON 2213":                 "0012022213", //DI	
  "CLAYTON 2214":                 "0012022214", //DI	
  "CLAYTON 2215":                 "0012022215", //DI	
  "CLAYTON 2216":                 "0012022216", //DI	
  "CLAYTON 2217":                 "0012022217", //DI	
  "SUBSTATION K 1102":            "0012101102", //DI	& EB
  "ANTIOCH 0401":                 "0012130401", //DI	
  "ANTIOCH 0402":                 "0012130402", //DI	
  "ANTIOCH 0403":                 "0012130403", //DI	
  "ANTIOCH 0404":                 "0012130404", //DI	
  "PITTSBURG 0401":               "0012160401", //DI	
  "PITTSBURG 0402":               "0012160402", //DI	
  "WALNUT CREEK 0403":            "0012200403", //DI	
  "WALNUT CREEK 0404":            "0012200404", //DI	
  "ORINDA 0401":                  "0012350401", //DI	
  "CONCORD NO 1 0401":            "0012960401", //DI	
  "CONCORD NO 1 0402":            "0012960402", //DI	
  "BRYANT 0401":                  "0013090401", //DI	
  "BRYANT 0402":                  "0013090402", //DI	
  "LONE TREE 2101":               "0013232101", //DI	
  "LONE TREE 2102":               "0013232102", //DI	
  "LONE TREE 2105":               "0013232105", //DI	
  "WHITNEY 0402":                 "0013240402", //DI	
  "PLEASANT HILL 0401":           "0013300401", //DI	
  "FAIRVIEW 2206":                "0013432206", //DI	
  "FAIRVIEW 2207":                "0013432207", //DI	
  "FAIRVIEW 2208":                "0013432208", //DI	
  "LAKEWOOD 1101":                "0013531101", //DI	
  "LAKEWOOD 1102":                "0013531102", //DI	
  "LAKEWOOD 1103":                "0013531103", //DI	
  "LAKEWOOD 1104":                "0013531104", //DI	
  "LAKEWOOD 2107":                "0013532107", //DI	
  "LAKEWOOD 2108":                "0013532108", //DI	
  "LAKEWOOD 2109":                "0013532109", //DI	
  "LAKEWOOD 2110":                "0013532110", //DI	
  "LAKEWOOD 2111":                "0013532111", //DI	
  "LAKEWOOD 2112":                "0013532112", //DI	
  "LAKEWOOD 2223":                "0013532223", //DI	
  "LAKEWOOD 2224":                "0013532224", //DI	
  "LAKEWOOD 2225":                "0013532225", //DI	
  "LAKEWOOD 2226":                "0013532226", //DI	
  "GILL 0401":                    "0013550401", //DI	
  "GILL 0402":                    "0013550402", //DI	
  "SARANAP 0401":                 "0013560401", //DI	
  "ROBLES 0401":                  "0013580401", //DI	
  "GEARY 0401":                   "0013590401", //DI	
  "LAS AROMAS 0401":              "0013600401", //DI	
  "CONTRA COSTA 1102":            "0013651102", //DI	
  "CONTRA COSTA 2106":            "0013652106", //DI	
  "CONTRA COSTA 2107":            "0013652107", //DI	
  "CONTRA COSTA 2108":            "0013652108", //DI	
  "CONTRA COSTA 2109":            "0013652109", //DI	
  "CONTRA COSTA 2110":            "0013652110", //DI	
  "CONTRA COSTA 2111":            "0013652111", //DI	
  "CONTRA COSTA 2112":            "0013652112", //DI	
  "CONTRA COSTA 2113":            "0013652113", //DI	
  "CONTRA COSTA 2203":            "0013652203", //DI	
  "CONTRA COSTA 2204":            "0013652204", //DI	
  "CONTRA COSTA 2205":            "0013652205", //DI	
  "MORAGA 1101":                  "0013801101", //DI	
  "MORAGA 1102":                  "0013801102", //DI	
  "MORAGA 1103":                  "0013801103", //DI	
  "MORAGA 1104":                  "0013801104", //DI	
  "MORAGA 1105":                  "0013801105", //DI	
  "WAYNE 0401":                   "0013810401", //DI	
  "BABEL 0401":                   "0013850401", //DI	
  "WILLOW PASS 1101":             "0013911101", //DI	
  "WILLOW PASS 1102":             "0013911102", //DI	
  "WILLOW PASS 2107":             "0013912107", //DI	
  "ALHAMBRA 1101":                "0014101101", //DI	
  "ALHAMBRA 1102":                "0014101102", //DI	
  "ALHAMBRA 1105":                "0014101105", //DI	
  "SINCLAIR 0401":                "0014150401", //DI	
  "ROSSMOOR 1101":                "0014161101", //DI	
  "ROSSMOOR 1102":                "0014161102", //DI	
  "ROSSMOOR 1103":                "0014161103", //DI	
  "ROSSMOOR 1104":                "0014161104", //DI	
  "ROSSMOOR 1105":                "0014161105", //DI	
  "ROSSMOOR 1106":                "0014161106", //DI	
  "ROSSMOOR 1107":                "0014161107", //DI	
  "ROSSMOOR 1108":                "0014161108", //DI	
  "SAN RAMON 2102":               "0014232102", //DI	& MI
  "MEADOW LANE 2102":             "0014302102", //DI	
  "MEADOW LANE 2103":             "0014302103", //DI	
  "MEADOW LANE 2104":             "0014302104", //DI	
  "MEADOW LANE 2105":             "0014302105", //DI	
  "MEADOW LANE 2106":             "0014302106", //DI	
  "MEADOW LANE 2107":             "0014302107", //DI	
  "MEADOW LANE 2108":             "0014302108", //DI	
  "MEADOW LANE 2109":             "0014302109", //DI	
  "MEADOW LANE 2110":             "0014302110", //DI	
  "BALFOUR 1101":                 "0014321101", //DI	
  "KIRKER SUB 2103":              "0014452103", //DI	
  "KIRKER SUB 2104":              "0014452104", //DI	
  "KIRKER SUB 2105":              "0014452105", //DI	
  "KIRKER SUB 2106":              "0014452106", //DI	
  "KIRKER SUB 2107":              "0014452107", //DI	
  "KIRKER SUB 2108":              "0014452108", //DI	
  "KIRKER SUB 2109":              "0014452109", //DI	
  "BRENTWOOD SUB 2105":           "0014592105", //DI	
  "BRENTWOOD SUB 2106":           "0014592106", //DI	
  "BRENTWOOD SUB 2108":           "0014592108", //DI	
  "BRENTWOOD SUB 2109":           "0014592109", //DI	
  "BRENTWOOD SUB 2110":           "0014592110", //DI	
  "BRENTWOOD SUB 2111":           "0014592111", //DI	
  "BRENTWOOD SUB 2112":           "0014592112", //DI	
  "BRENTWOOD SUB 2113":           "0014592113", //DI	
  "TIDE WATER 2104":              "0014652104", //DI	
  "TIDE WATER 2105":              "0014652105", //DI	
  "TIDE WATER 2106":              "0014652106", //DI	
  "TIDE WATER 2107":              "0014652107", //DI	
  "TIDE WATER 2108":              "0014652108", //DI	
  "TIDE WATER 2109":              "0014652109", //DI	
  "TASSAJARA 2103":               "0014662103", //DI	
  "TASSAJARA 2104":               "0014662104", //DI	
  "TASSAJARA 2105":               "0014662105", //DI	
  "TASSAJARA 2106":               "0014662106", //DI	& MI
  "TASSAJARA 2107":               "0014662107", //DI	
  "TASSAJARA 2108":               "0014662108", //DI	
  "TASSAJARA 2109":               "0014662109", //DI	
  "TASSAJARA 2110":               "0014662110", //DI	
  "SOBRANTE 1101":                "0014671101", //DI	
  "SOBRANTE 1102":                "0014671102", //DI	
  "SOBRANTE 1103":                "0014671103", //DI	
  "RESEARCH SUB 2101":            "0014692101", //DI	
  "RESEARCH SUB 2102":            "0014692102", //DI	& MI
  "FRASER 0401":                  "0018020401", //DI	& EB
  "HERDLYN 1102 DI":                 "0018031102", //DI	
  "MCAVOY TAP 0401":              "0018090401", //DI	
  "SHORE ACRES BANK 0401":        "0018100401", //DI	
  "PIPER BANK 0401":              "0018120401", //DI	
  "BETHEL BANK 0401":             "0018150401", //DI	
  "HOLLAND TRACT TAP 1101":       "0018211101", //DI	
  "WEBB TRACT TAP 1101":          "0018221101", //DI	
  "ORWOOD TRACT TAP 1101":        "0018231101", //DI	
  "JERSEY ISLAND 0401":           "0018320401", //DI	
  "BAY POINT 0401":               "0018330401", //DI	
  "Cal Trans":                    "001HWCTR01", //DI	
  "OAKLAND 1109":                 "0012011109", //EB	
  "OAKLAND 1110":                 "0012011110", //EB	
  "OAKLAND 1111":                 "0012011111", //EB	
  "OAKLAND 1112":                 "0012011112", //EB	
  "OAKLAND 1113":                 "0012011113", //EB	
  "OAKLAND 1114":                 "0012011114", //EB	
  "OAKLAND 1115":                 "0012011115", //EB	
  "OAKLAND 1116":                 "0012011116", //EB	
  "OAKLAND 1117":                 "0012011117", //EB	
  "OAKLAND 1118":                 "0012011118", //EB	
  "OAKLAND 1119":                 "0012011119", //EB	
  "OAKLAND 1120":                 "0012011120", //EB	
  "OAKLAND 1121":                 "0012011121", //EB	
  "OAKLAND 1132":                 "0012011132", //EB	
  "OAKLAND 1133":                 "0012011133", //EB	
  "OAKLAND 1151":                 "0012011151", //EB	
  "SUBSTATION D 0406":            "0012040406", //EB	
  "SUBSTATION D 0407":            "0012040407", //EB	
  "SUBSTATION D 0408":            "0012040408", //EB	
  "SUBSTATION D 0410":            "0012040410", //EB	
  "SUBSTATION D 0412":            "0012040412", //EB	
  "SUBSTATION D 1101":            "0012041101", //EB	
  "SUBSTATION D 1102":            "0012041102", //EB	
  "SUBSTATION D 1103":            "0012041103", //EB	
  "SUBSTATION D 1104":            "0012041104", //EB	
  "SUBSTATION D 1105":            "0012041105", //EB	
  "SUBSTATION D 1106":            "0012041106", //EB	
  "SUBSTATION D 1107":            "0012041107", //EB	
  "SUBSTATION D 1108":            "0012041108", //EB	
  "SUBSTATION D 1109":            "0012041109", //EB	
  "SUBSTATION D 1110":            "0012041110", //EB	
  "SUBSTATION D 1111":            "0012041111", //EB	
  "SUBSTATION D 1112":            "0012041112", //EB	
  "SUBSTATION D 1113":            "0012041113", //EB	
  "SUBSTATION D 1114":            "0012041114", //EB	
  "SUBSTATION D 1115":            "0012041115", //EB	
  "SUBSTATION D 1116":            "0012041116", //EB	
  "SUBSTATION D 1117":            "0012041117", //EB	
  "SUBSTATION F 0401":            "0012060401", //EB	
  "SUBSTATION F 0402":            "0012060402", //EB	
  "SUBSTATION F 0403":            "0012060403", //EB	
  "SUBSTATION F 0404":            "0012060404", //EB	
  "SUBSTATION F 0405":            "0012060405", //EB	
  "SUBSTATION F 0406":            "0012060406", //EB	
  "SUBSTATION F 0407":            "0012060407", //EB	
  "SUBSTATION F 0408":            "0012060408", //EB	
  "SUBSTATION F 0409":            "0012060409", //EB	
  "SUBSTATION F 0410":            "0012060410", //EB	
  "SUBSTATION F 0411":            "0012060411", //EB	
  "SUBSTATION F 0412":            "0012060412", //EB	
  "SUBSTATION F 1102":            "0012061102", //EB	
  "SUBSTATION F 1103":            "0012061103", //EB	
  "SUBSTATION F 1105":            "0012061105", //EB	
  "SUBSTATION F 1151":            "0012061151", //EB	
  "SUBSTATION F 1152":            "0012061152", //EB	
  "SUBSTATION I 0401":            "0012080401", //EB	
  "SUBSTATION I 0402":            "0012080402", //EB	
  "SUBSTATION J 0401":            "0012090401", //EB	
  "SUBSTATION J 0403":            "0012090403", //EB	
  "SUBSTATION J 0408":            "0012090408", //EB	
  "SUBSTATION J 0409 EB":            "0012090409", //EB	
  "SUBSTATION J 1101 EB":            "0012091101", //EB	
  "SUBSTATION J 1102 EB":            "0012091102", //EB	
  "SUBSTATION J 1103":            "0012091103", //EB	
  "SUBSTATION J 1104":            "0012091104", //EB	
  "SUBSTATION J 1105 EB":            "0012091105", //EB	
  "SUBSTATION J 1106 EB":            "0012091106", //EB	
  "SUBSTATION J 1108":            "0012091108", //EB	
  "SUBSTATION J 1109":            "0012091109", //EB	
  "SUBSTATION J 1110":            "0012091110", //EB	
  "SUBSTATION J 1111":            "0012091111", //EB	
  "SUBSTATION J 1112":            "0012091112", //EB	
  "SUBSTATION J 1113":            "0012091113", //EB	
  "SUBSTATION J 1114":            "0012091114", //EB	
  "SUBSTATION J 1115":            "0012091115", //EB	
  "SUBSTATION J 1116":            "0012091116", //EB	
  "SUBSTATION J 1117":            "0012091117", //EB	
  "SUBSTATION J 1118":            "0012091118", //EB	& MI
  "SUBSTATION K 1101 EB":            "0012101101", //EB	
  "SUBSTATION K 1103":            "0012101103", //EB	
  "SUBSTATION K 1104":            "0012101104", //EB	
  "SUBSTATION L 0401 EB":            "0012110401", //EB	
  "SUBSTATION L 0405 EB":            "0012110405", //EB	
  "SUBSTATION L 0406 EB":            "0012110406", //EB	
  "SUBSTATION L 0407 EB":            "0012110407", //EB	
  "SUBSTATION L 0408 EB":            "0012110408", //EB	
  "SUBSTATION L 0409 EB":            "0012110409", //EB	
  "SUBSTATION L 1101 EB":            "0012111101", //EB	
  "SUBSTATION L 1102 EB":            "0012111102", //EB	
  "SUBSTATION L 1104":            "0012111104", //EB	
  "SUBSTATION L 1105":            "0012111105", //EB	
  "SUBSTATION L 1107":            "0012111107", //EB	
  "MIRA VISTA 0401":              "0012330401", //EB	
  "MIRA VISTA 0403":              "0012330403", //EB	
  "SUBSTATION G 1101 EB":            "0012501101", //EB	
  "SUBSTATION G 1102 EB":            "0012501102", //EB	
  "SUBSTATION G 1103":            "0012501103", //EB	
  "SUBSTATION G 1104":            "0012501104", //EB	
  "SUBSTATION G 1105":            "0012501105", //EB	
  "SUBSTATION G 1106":            "0012501106", //EB	
  "SUBSTATION G 1107":            "0012501107", //EB	
  "SUBSTATION G 1108":            "0012501108", //EB	
  "SUBSTATION G 1109":            "0012501109", //EB	
  "SUBSTATION G 1110":            "0012501110", //EB	
  "SUBSTATION G 1111":            "0012501111", //EB	
  "SUBSTATION G 1112":            "0012501112", //EB	
  "SUBSTATION G 1113":            "0012501113", //EB	
  "SUBSTATION G 1114":            "0012501114", //EB	
  "SUBSTATION Q 0401":            "0012520401", //EB	
  "SUBSTATION Q 0402":            "0012520402", //EB	
  "SUBSTATION X 0401":            "0012540401", //EB	
  "SUBSTATION X 0402":            "0012540402", //EB	
  "SUBSTATION X 1101":            "0012541101", //EB	
  "SUBSTATION X 1102":            "0012541102", //EB	
  "SUBSTATION X 1103":            "0012541103", //EB	
  "SUBSTATION X 1104":            "0012541104", //EB	
  "SUBSTATION X 1105":            "0012541105", //EB	
  "SUBSTATION X 1106":            "0012541106", //EB	
  "SUBSTATION X 1107":            "0012541107", //EB	
  "SUBSTATION X 1108":            "0012541108", //EB	
  "SUBSTATION X 1109":            "0012541109", //EB	
  "SUBSTATION X 1110":            "0012541110", //EB	
  "SUBSTATION X 1111":            "0012541111", //EB	
  "SUBSTATION X 1112":            "0012541112", //EB	
  "SUBSTATION X 1114":            "0012541114", //EB	
  "SUBSTATION X 1115":            "0012541115", //EB	
  "OAK 0401":                     "0012600401", //EB	
  "BECK STREET 0401":             "0012640401", //EB	
  "FAIRMONT 0401":                "0012650401", //EB	
  "FAIRMONT 0402":                "0012650402", //EB	
  "SUBSTATION T 0401":            "0012660401", //EB	
  "SUBSTATION T 0402":            "0012660402", //EB	
  "SUBSTATION T 0403":            "0012660403", //EB	
  "SUBSTATION T 0404":            "0012660404", //EB	
  "8TH AVENUE 0401":              "0012670401", //EB	
  "FLORENCE 0401":                "0012690401", //EB	
  "RIDGE 0401":                   "0012840401", //EB	
  "RIDGE 0402":                   "0012840402", //EB	
  "BARRETT 0401":                 "0013020401", //EB	
  "BARRETT 0402":                 "0013020402", //EB	
  "BANCROFT 0401":                "0013030401", //EB	& MI
  "BANCROFT 0402":                "0013030402", //EB	& MI
  "SAN LEANDRO 1109":             "0013111109", //EB	& MI
  "SAN LEANDRO 1114":             "0013111114", //EB	& MI
  "SAN LEANDRO 1116":             "0013111116", //EB	& MI
  "SOLANO 0401":                  "0013140401", //EB	
  "SOLANO 0402":                  "0013140402", //EB	
  "HOLLYWOOD 0401":               "0013170401", //EB	
  "PALO SECO 0401":               "0013180401", //EB	
  "BROOKSIDE 0401":               "0013210401", //EB	
  "RUSSELL 0401":                 "0013310401", //EB	
  "RUSSELL 0402":                 "0013310402", //EB	
  "BOSTON 0401":                  "0013320401", //EB	
  "CROCKETT 0401":                "0013330401", //EB	
  "SPRUCE 0401":                  "0013340401", //EB	
  "SPRUCE 0402":                  "0013340402", //EB	
  "WALDO 0401":                   "0013350401", //EB	
  "WALDO 0402":                   "0013350402", //EB	
  "WOOD 0401":                    "0013380401", //EB	
  "RICHMOND 1119":                "0013471119", //EB	
  "RICHMOND 1120":                "0013471120", //EB	
  "RICHMOND 1121":                "0013471121", //EB	
  "RICHMOND 1122":                "0013471122", //EB	
  "RICHMOND 1123":                "0013471123", //EB	
  "RICHMOND 1124":                "0013471124", //EB	
  "RICHMOND 1125":                "0013471125", //EB	
  "RICHMOND 1126":                "0013471126", //EB	
  "RICHMOND 1127":                "0013471127", //EB	
  "RICHMOND 1128":                "0013471128", //EB	
  "RICHMOND 1129":                "0013471129", //EB	
  "RICHMOND 1130":                "0013471130", //EB	
  "ESTUDILLO 0401":               "0013480401", //EB	& MI
  "MAPLE 0401":                   "0013520401", //EB	
  "EDES 1101":                    "0013681101", //EB	
  "EDES 1103":                    "0013681103", //EB	& MI
  "EDES 1104":                    "0013681104", //EB	
  "EDES 1105":                    "0013681105", //EB	& MI
  "EDES 1110":                    "0013681110", //EB	& MI
  "EDES 1111":                    "0013681111", //EB	& MI
  "EDES 1112":                    "0013681112", //EB	
  "EDES 1113":                    "0013681113", //EB	
  "EDES 1114":                    "0013681114", //EB	
  "EDES 1115":                    "0013681115", //EB	
  "ARLINGTON 0401":               "0013700401", //EB	
  "WALL 0401":                    "0013740401", //EB	
  "VIRGINIA 0401":                "0013780401", //EB	
  "STUART 0401":                  "0013840401", //EB	
  "STUART 0402":                  "0013840402", //EB	
  "STUART 0403":                  "0013840403", //EB	
  "STUART 0405":                  "0013840405", //EB	
  "STUART 0406":                  "0013840406", //EB	
  "STUART 0408":                  "0013840408", //EB	
  "FRANKLIN 1101":                "0013921101", //EB	
  "FRANKLIN 1102":                "0013921102", //EB	
  "FRANKLIN 1103":                "0013921103", //EB	
  "FRANKLIN 1104":                "0013921104", //EB	
  "POINT PINOLE 1101":            "0014261101", //EB	
  "POINT PINOLE 1102":            "0014261102", //EB	
  "POINT PINOLE 1103":            "0014261103", //EB	
  "VALLEY VIEW 1103":             "0014341103", //EB	
  "VALLEY VIEW 1105":             "0014341105", //EB	
  "VALLEY VIEW 1106":             "0014341106", //EB	
  "SAN PABLO 1105":               "0014371105", //EB	
  "SAN PABLO 1106":               "0014371106", //EB	
  "NORTH TOWER 2201 EB":             "0018512201", //EB	
  "FAIRVIEW (DIST.28) 2207":      "0018522207", //EB	
  "TRAN - EB 60Kv":               "TR00106002", //EB	
  "TRAN - EB 70Kv":               "TR00107002", //EB	
  "TRAN - EB 115Kv":              "TR00111502", //EB	
  "TRAN - EB 230Kv":              "TR00123002", //EB	
  "TRAN - EB 500Kv":              "TR00150002", //EB	
  "CR-PITTSBURG-STONEMAN JCT":    "TRC0010001", //EB	
  "CR-TESLA-NEWARK":              "TRC0010002", //EB	
  "CR-CROCKETT-SOBRANTE":         "TRC0010003", //EB	
  "CR-PITTSBURG-CLAYTON":         "TRC0010004", //EB	
  "CR-MORAGA-OAKLAND":            "TRC0010005", //EB	
  "CR-MORAGA SUB":                "TRC0010006", //EB	
  "CR-PITTSBURG-SOBRANTE":        "TRC0010007", //EB	
  "CR-MARTINEZ-SOBRANTE":         "TRC0010008", //EB	
  "CR-SOBRANTE-SUB G":            "TRC0010009", //EB	
  "CR-SOBRANTE-CLAREMONT":        "TRC0010010", //EB	
  "CR-MORAGA-CASTRO VALLEY":      "TRC0010011", //EB	
  "CR-CASTRO VALLEY-NEWARK":      "TRC0010012", //EB	
  "CR-CONTRACOSTA-TESLA":         "TRC0010013", //EB	
  "CR-PITTSBURG-EASTSHORE":       "TRC0010014", //EB	
  "CR-VACA-TESLA 500KV":          "TRC0010015", //EB	
  "CR-CONTRACOSTA PP/SUB 230KV":  "TRC0010016", //EB	
  "CR-MORAGA-OAKPORT":            "TRC0010017", //EB	
  "CR-NEWARK-FREMONT-JARVIS":     "TRC0010018", //EB	
  "CR-Columbia Steel":            "TRC0010019", //EB	
  "CR-Brighton Clayton":          "TRC0010020", //EB	
  "CR-ContraCosta Livermore":     "TRC0010021", //EB	
  "CR-Oakland Newark":            "TRC0010022", //EB	
  "CR-Oakland Ports":             "TRC0010023", //EB	
  "CR-Meadowlane Triangle":       "TRC0010024", //EB	
  "CR-Pittsburg Martinez":        "TRC0010025", //EB	
  "CR-SobranteStandard Oil":      "TRC0010026", //EB	
  "CR-Oleum Moeser":              "TRC0010027", //EB	
  "CR-Franklin 60KV":             "TRC0010028", //EB	
  "CR-Willow Pass 60KV":          "TRC0010029", //EB	
  "CR-ContraCosta Moraga":        "TRC0010030", //EB	
  "CR-East ContraCosta":          "TRC0010031", //EB	
  "CR-Pittsburg 60KV":            "TRC0010032", //EB	
  "CR-East Alameda 60KV":         "TRC0010033", //EB	
  "CR-Stanislaus Livermore":      "TRC0010034", //EB	
  "CR-Pleasanton 60KV":           "TRC0010035", //EB	
  "CR-Aerial Patrol EB":            "TRC0011111", //EB	
  "GO 165 Pilot - Hardwick1101":  "0000000000", //FR	
  "GO 165 Pilot - Huron 1116":    "0000000005", //FR	
  "ORCHARD 1101":                 "0250OR1101", //FR	
  "ORCHARD 1102":                 "0250OR1102", //FR	
  "ORCHARD 1103":                 "0250OR1103", //FR	
  "Sierra Forest":                "025101111F", //FR	
  "Sequoia Forest":               "025101112F", //FR	
  "WISHON 1101":                  "0251511101", //FR	& YO
  "AIRWAYS 1101":                 "0252041101", //FR	
  "AIRWAYS 1102":                 "0252041102", //FR	
  "AIRWAYS 1103":                 "0252041103", //FR	
  "ASHLAN AVENUE 1102":           "0252051102", //FR	
  "ASHLAN AVENUE 1103":           "0252051103", //FR	
  "ASHLAN AVENUE 1104":           "0252051104", //FR	
  "ASHLAN AVENUE 1106":           "0252051106", //FR	
  "ASHLAN AVENUE 1107":           "0252051107", //FR	
  "ASHLAN AVENUE 1108":           "0252051108", //FR	
  "ASHLAN AVENUE 1109":           "0252051109", //FR	
  "ASHLAN AVENUE 1111":           "0252051111", //FR	
  "ASHLAN AVENUE 1112":           "0252051112", //FR	
  "ASHLAN AVENUE 1113":           "0252051113", //FR	
  "ASHLAN AVENUE 1114":           "0252051114", //FR	
  "ASHLAN AVENUE 1116":           "0252051116", //FR	
  "ASHLAN AVENUE 2101":           "0252052101", //FR	
  "ASHLAN AVENUE 2105":           "0252052105", //FR	
  "ASHLAN AVENUE 2110":           "0252052110", //FR	
  "ASHLAN AVENUE 2115":           "0252052115", //FR	
  "ASHLAN AVENUE 2117":           "0252052117", //FR	
  "ASHLAN AVENUE 2118":           "0252052118", //FR	
  "ASHLAN AVENUE 2119":           "0252052119", //FR	
  "ANGIOLA 1102":                 "0252151102", //FR	
  "ANGIOLA 1103":                 "0252151103", //FR	
  "ANGIOLA 1104":                 "0252151104", //FR	
  "COALINGA NO 1 1106":           "0252161106", //FR	
  "COALINGA NO 1 1107":           "0252161107", //FR	
  "COALINGA NO 1 1108":           "0252161108", //FR	
  "COALINGA NO 1 1109":           "0252161109", //FR	
  "CORCORAN 1106":                "0252171106", //FR	
  "CORCORAN 1108":                "0252171108", //FR	
  "CORCORAN 1112":                "0252171112", //FR	
  "CORCORAN 1116":                "0252171116", //FR	
  "CORCORAN 1118":                "0252171118", //FR	
  "BIOLA 1101":                   "0252211101", //FR	& YO
  "BIOLA 1102":                   "0252211102", //FR	& YO
  "BIOLA 1103":                   "0252211103", //FR	
  "BIOLA 1104":                   "0252211104", //FR	& YO
  "KINGSBURG 1102":               "0252241102", //FR	
  "KINGSBURG 1108":               "0252241108", //FR	
  "KINGSBURG 1110":               "0252241110", //FR	
  "KINGSBURG 1112":               "0252241112", //FR	
  "KINGSBURG 1113":               "0252241113", //FR	
  "KINGSBURG 1114":               "0252241114", //FR	
  "KINGSBURG 1116":               "0252241116", //FR	
  "CALIFORNIA AVE 1102":          "0252281102", //FR	
  "CALIFORNIA AVE 1103":          "0252281103", //FR	
  "CALIFORNIA AVE 1104":          "0252281104", //FR	
  "CALIFORNIA AVE 1106":          "0252281106", //FR	
  "CALIFORNIA AVE 1108":          "0252281108", //FR	
  "CALIFORNIA AVE 1110":          "0252281110", //FR	
  "CALIFORNIA AVE 1111":          "0252281111", //FR	
  "CALIFORNIA AVE 1112":          "0252281112", //FR	
  "CALIFORNIA AVE 1113":          "0252281113", //FR	
  "CALIFORNIA AVE 1114":          "0252281114", //FR	
  "CALIFORNIA AVE 1116":          "0252281116", //FR	
  "CALIFORNIA AVE 1117":          "0252281117", //FR	
  "PARLIER 1102":                 "0252291102", //FR	
  "PARLIER 1103":                 "0252291103", //FR	
  "PARLIER 1104":                 "0252291104", //FR	
  "CAMDEN 1102":                  "0252301102", //FR	
  "CAMDEN 1103":                  "0252301103", //FR	
  "CAMDEN 1104":                  "0252301104", //FR	
  "CAMDEN 1105":                  "0252301105", //FR	
  "MENDOTA 1104":                 "0252311104", //FR	& YO
  "REEDLEY 1101":                 "0252341101", //FR	
  "REEDLEY 1104":                 "0252341104", //FR	
  "REEDLEY 1106":                 "0252341106", //FR	
  "REEDLEY 1110":                 "0252341110", //FR	
  "REEDLEY 1112":                 "0252341112", //FR	
  "SANGER 1104":                  "0252351104", //FR	
  "SANGER 1106":                  "0252351106", //FR	
  "SANGER 1108":                  "0252351108", //FR	
  "SANGER 1110":                  "0252351110", //FR	
  "SANGER 1112":                  "0252351112", //FR	
  "SANGER 1114":                  "0252351114", //FR	
  "SANGER 1116":                  "0252351116", //FR	
  "SANGER 1118":                  "0252351118", //FR	
  "SAN JOAQUIN 1106":             "0252361106", //FR	
  "SAN JOAQUIN 1108":             "0252361108", //FR	
  "SAN JOAQUIN 1110":             "0252361110", //FR	
  "SAN JOAQUIN 1112":             "0252361112", //FR	& YO
  "CARUTHERS 1101":               "0252371101", //FR	
  "CARUTHERS 1102":               "0252371102", //FR	
  "CARUTHERS 1103":               "0252371103", //FR	
  "CARUTHERS 1104":               "0252371104", //FR	
  "COALINGA NO 2 1104":           "0252381104", //FR	
  "COALINGA NO 2 1105":           "0252381105", //FR	
  "COALINGA NO 2 1106":           "0252381106", //FR	
  "COALINGA NO 2 1107":           "0252381107", //FR	
  "COPPERMINE 1102":              "0252411102", //FR	& YO
  "COPPERMINE 1104":              "0252411104", //FR	
  "COPPERMINE 1106":              "0252411106", //FR	
  "COPPERMINE 1112":              "0252411112", //FR	
  "COPPERMINE 2110":              "0252412110", //FR	
  "BALCH NO 1 1101":              "0252501101", //FR	
  "KERCKHOFF 1101":               "0252561101", //FR	& YO
  "GUERNSEY 1101":                "0252661101", //FR	
  "GUERNSEY 1102":                "0252661102", //FR	
  "GUERNSEY 1103":                "0252661103", //FR	
  "GUERNSEY 1104":                "0252661104", //FR	
  "HENRIETTA 1104":               "0252681104", //FR	
  "HENRIETTA 1106":               "0252681106", //FR	
  "HENRIETTA 1108":               "0252681108", //FR	
  "HENRIETTA 1110":               "0252681110", //FR	
  "KEARNEY 1104":                 "0252701104", //FR	
  "KEARNEY 1106":                 "0252701106", //FR	
  "KEARNEY 1108":                 "0252701108", //FR	
  "KEARNEY 1110":                 "0252701110", //FR	
  "KEARNEY 1113":                 "0252701113", //FR	
  "KEARNEY 1114":                 "0252701114", //FR	
  "KERMAN 1101":                  "0252711101", //FR	
  "KERMAN 1103":                  "0252711103", //FR	
  "KERMAN 1104":                  "0252711104", //FR	
  "KERMAN 1106":                  "0252711106", //FR	
  "KERMAN 1108":                  "0252711108", //FR	
  "KETTLEMAN HILLS 1101":         "0252731101", //FR	
  "KETTLEMAN HILLS 2104":         "0252732104", //FR	
  "OROSI 1101":                   "0252841101", //FR	
  "OROSI 1102":                   "0252841102", //FR	
  "OROSI 1103":                   "0252841103", //FR	
  "OROSI 1104":                   "0252841104", //FR	
  "Pinedale 2105":                "0252852105", //FR	
  "Pinedale 2106":                "0252852106", //FR	
  "Pinedale 2107":                "0252852107", //FR	
  "Pinedale 2109":                "0252852109", //FR	
  "Pinedale 2110":                "0252852110", //FR	
  "Pinedale 2111":                "0252852111", //FR	
  "SCHINDLER 1104":               "0252891104", //FR	
  "SCHINDLER 1105":               "0252891105", //FR	
  "SCHINDLER 1112":               "0252891112", //FR	
  "SCHINDLER 1114":               "0252891114", //FR	
  "SCHINDLER 1116":               "0252891116", //FR	
  "STONE CORRAL 1108":            "0252921108", //FR	
  "STONE CORRAL 1109":            "0252921109", //FR	
  "STONE CORRAL 1110":            "0252921110", //FR	
  "TIVY VALLEY 1106":             "0252941106", //FR	
  "TIVY VALLEY 1107":             "0252941107", //FR	
  "TULARE LAKE 1104":             "0252951104", //FR	
  "TULARE LAKE 1106":             "0252951106", //FR	
  "TULARE LAKE 2108":             "0252952108", //FR	
  "GIFFEN 1102":                  "0253151102", //FR	& YO
  "GIFFEN 1103":                  "0253151103", //FR	
  "HURON 1106":                   "0253161106", //FR	
  "HURON 1108":                   "0253161108", //FR	
  "HURON 1110":                   "0253161110", //FR	
  "HURON 1112":                   "0253161112", //FR	
  "HURON 1116":                   "0253161116", //FR	
  "CALFLAX 1101":                 "0253441101", //FR	
  "CALFLAX 1102":                 "0253441102", //FR	
  "CALFLAX 1103":                 "0253441103", //FR	
  "CALFLAX 1104":                 "0253441104", //FR	
  "DEVILS DEN 1101":              "0253451101", //FR	& KE
  "DEVILS DEN 1102":              "0253451102", //FR	& KE
  "BOWLES 1101":                  "0253531101", //FR	
  "BOWLES 1102":                  "0253531102", //FR	
  "BOWLES 1103":                  "0253531103", //FR	
  "BOWLES 1104":                  "0253531104", //FR	
  "SMYRNA 1101":                  "0253551101", //FR	& KE
  "BARTON 1101":                  "0253571101", //FR	
  "BARTON 1102":                  "0253571102", //FR	
  "BARTON 1104":                  "0253571104", //FR	
  "BARTON 1105":                  "0253571105", //FR	
  "BARTON 1106":                  "0253571106", //FR	
  "BARTON 1108":                  "0253571108", //FR	
  "BARTON 1109":                  "0253571109", //FR	
  "BARTON 1110":                  "0253571110", //FR	
  "BARTON 1111":                  "0253571111", //FR	
  "BARTON 1112":                  "0253571112", //FR	
  "BARTON 1114":                  "0253571114", //FR	
  "BARTON 1115":                  "0253571115", //FR	
  "BARTON 1116":                  "0253571116", //FR	
  "CANTUA 1101":                  "0253591101", //FR	
  "CANTUA 1102":                  "0253591102", //FR	
  "CANTUA 1103":                  "0253591103", //FR	
  "CANTUA 1105":                  "0253591105", //FR	
  "LEMOORE 1101":                 "0253601101", //FR	
  "LEMOORE 1102":                 "0253601102", //FR	
  "LEMOORE 1103":                 "0253601103", //FR	
  "LEMOORE 1104":                 "0253601104", //FR	
  "LEMOORE 1105":                 "0253601105", //FR	
  "STROUD 1101":                  "0253661101", //FR	
  "STROUD 1102":                  "0253661102", //FR	
  "STROUD 1104":                  "0253661104", //FR	
  "HARDWICK 1101":                "0253711101", //FR	
  "HARDWICK 1102":                "0253711102", //FR	
  "WEST FRESNO 1101":             "0253731101", //FR	
  "WEST FRESNO 1102":             "0253731102", //FR	
  "WEST FRESNO 1103":             "0253731103", //FR	
  "WEST FRESNO 1104":             "0253731104", //FR	
  "WEST FRESNO 1105":             "0253731105", //FR	
  "WEST FRESNO 1106":             "0253731106", //FR	
  "WEST FRESNO 1107":             "0253731107", //FR	
  "WEST FRESNO 1108":             "0253731108", //FR	
  "WEST FRESNO 1109":             "0253731109", //FR	
  "WEST FRESNO 1110":             "0253731110", //FR	
  "VALLEY NITROGEN 0401":         "0253850401", //FR	
  "MANCHESTER 1101":              "0253921101", //FR	
  "MANCHESTER 1102":              "0253921102", //FR	
  "MANCHESTER 1103":              "0253921103", //FR	
  "MANCHESTER 1104":              "0253921104", //FR	
  "MANCHESTER 1105":              "0253921105", //FR	
  "MANCHESTER 1106":              "0253921106", //FR	
  "MANCHESTER 1107":              "0253921107", //FR	
  "MANCHESTER 1108":              "0253921108", //FR	
  "MANCHESTER 1109":              "0253921109", //FR	
  "MANCHESTER 1110":              "0253921110", //FR	
  "MANCHESTER 1111":              "0253921111", //FR	
  "MANCHESTER 1112":              "0253921112", //FR	
  "GATES 1101":                   "0253931101", //FR	
  "GATES 1102":                   "0253931102", //FR	
  "GATES 1103":                   "0253931103", //FR	
  "ARMSTRONG 1101":               "0253941101", //FR	
  "BULLARD 1101":                 "0253961101", //FR	
  "BULLARD 1102":                 "0253961102", //FR	
  "BULLARD 1103":                 "0253961103", //FR	
  "BULLARD 1104":                 "0253961104", //FR	
  "BULLARD 1105":                 "0253961105", //FR	
  "BULLARD 1106":                 "0253961106", //FR	
  "BULLARD 1107":                 "0253961107", //FR	
  "BULLARD 1108":                 "0253961108", //FR	
  "BULLARD 1109":                 "0253961109", //FR	
  "BULLARD 1110":                 "0253961110", //FR	
  "BULLARD 1113":                 "0253961113", //FR	
  "BULLARD 2111":                 "0253962111", //FR	
  "BULLARD 2112":                 "0253962112", //FR	
  "BULLARD 2114":                 "0253962114", //FR	
  "BULLARD 2115":                 "0253962115", //FR	
  "ALPAUGH 1105":                 "0254001105", //FR	
  "ALPAUGH 1106":                 "0254001106", //FR	
  "DUNLAP 1102":                  "0254061102", //FR	
  "DUNLAP 1103":                  "0254061103", //FR	
  "CLOVIS 1101":                  "0254081101", //FR	
  "CLOVIS 1102":                  "0254081102", //FR	
  "CLOVIS 1103":                  "0254081103", //FR	
  "CLOVIS 1104":                  "0254081104", //FR	
  "CLOVIS 1105":                  "0254081105", //FR	
  "CLOVIS 1106":                  "0254081106", //FR	
  "CLOVIS 1107":                  "0254081107", //FR	
  "CLOVIS 1108":                  "0254081108", //FR	
  "CLOVIS 2109":                  "0254082109", //FR	
  "CLOVIS 2110":                  "0254082110", //FR	
  "CLOVIS 2111":                  "0254082111", //FR	
  "DINUBA 1102":                  "0254091102", //FR	
  "DINUBA 1104":                  "0254091104", //FR	
  "DINUBA 1105":                  "0254091105", //FR	
  "MC CALL 1101":                 "0254121101", //FR	
  "MC CALL 1102":                 "0254121102", //FR	
  "MC CALL 1103":                 "0254121103", //FR	
  "MC CALL 1104":                 "0254121104", //FR	
  "MC CALL 1105":                 "0254121105", //FR	
  "MC CALL 1106":                 "0254121106", //FR	
  "AUBERRY 1101":                 "0254151101", //FR	
  "AUBERRY 1102":                 "0254151102", //FR	
  "RESERVE OIL 1101":             "0254181101", //FR	
  "MALAGA 1101":                  "0254251101", //FR	
  "MALAGA 1102":                  "0254251102", //FR	
  "MALAGA 1103":                  "0254251103", //FR	
  "MALAGA 1104":                  "0254251104", //FR	
  "MALAGA 1105":                  "0254251105", //FR	
  "MALAGA 1106":                  "0254251106", //FR	
  "MALAGA 1107":                  "0254251107", //FR	
  "MALAGA 1108":                  "0254251108", //FR	
  "MALAGA 1109":                  "0254251109", //FR	
  "MALAGA 1110":                  "0254251110", //FR	
  "MALAGA 1111":                  "0254251111", //FR	
  "MALAGA 1113":                  "0254251113", //FR	
  "CASSIDY 1103":                 "0254271103", //FR	& YO
  "TWISSELMAN 1102":              "0254401102", //FR	& KE
  "MC MULLIN SUB 1104":           "0254411104", //FR	
  "MC MULLIN SUB 1105":           "0254411105", //FR	
  "MC MULLIN SUB 1106":           "0254411106", //FR	
  "RAINBOW SUB 1105":             "0254441105", //FR	
  "RAINBOW SUB 1106":             "0254441106", //FR	
  "WAHTOKE SUB 1106":             "0254531106", //FR	
  "WAHTOKE SUB 1107":             "0254531107", //FR	
  "WAHTOKE SUB 1108":             "0254531108", //FR	
  "WAHTOKE SUB 1109":             "0254531109", //FR	
  "WAHTOKE SUB 1110":             "0254531110", //FR	
  "FIGARDEN SUB. 2102":           "0254552102", //FR	
  "FIGARDEN SUB. 2103":           "0254552103", //FR	
  "FIGARDEN SUB. 2104":           "0254552104", //FR	& YO
  "FIGARDEN SUB. 2105":           "0254552105", //FR	
  "FIGARDEN SUB. 2107":           "0254552107", //FR	
  "FIGARDEN SUB. 2108":           "0254552108", //FR	
  "FIGARDEN SUB. 2109":           "0254552109", //FR	& YO
  "FIGARDEN SUB. 2110":           "0254552110", //FR	
  "SAND CREEK 1103":              "0254601103", //FR	
  "JACOBS CORNER SUB 1101":       "0254771101", //FR	
  "JACOBS CORNER SUB 1102":       "0254771102", //FR	
  "RANCHERS COTTON 1101":         "0254801101", //FR	
  "WOODCHUCK 2101":               "0254912101", //FR	
  "Las Palmas 1101":              "0254921101", //FR	
  "Las Palmas 1102":              "0254921102", //FR	
  "BOSWELL 1101":                 "0254941101", //FR	
  "AVENAL 2101":                  "0255002101", //FR	
  "RIVER ROCK 1101":              "0255251101", //FR	
  "WOODWARD 2101":                "0255292101", //FR	& YO
  "WOODWARD 2102":                "0255292102", //FR	
  "WOODWARD 2103":                "0255292103", //FR	
  "WOODWARD 2104":                "0255292104", //FR	
  "WOODWARD 2105":                "0255292105", //FR	
  "WOODWARD 2106":                "0255292106", //FR	
  "WOODWARD 2107":                "0255292107", //FR	
  "WOODWARD 2108":                "0255292108", //FR	& YO
  "WOODWARD 2109":                "0255292109", //FR	
  "TULE POWER HOUSE 1101":        "0258591101", //FR	
  "SO. CAL. EDISON 1001":         "0258881001", //FR	
  "FR HCP MBZ 2103":              "025HCP2103", //FR	
  "FR HCP MBZ 2105":              "025HCP2105", //FR	
  "FR HCP MBZ 2501":              "025HCP2501", //FR	
  "FR HCP MBZ 2502":              "025HCP2502", //FR	
  "FR HCP MBZ 2503":              "025HCP2503", //FR	
  "FR HCP MBZ 2504":              "025HCP2504", //FR	
  "FR HCP MBZ 2505":              "025HCP2505", //FR	
  "Interstate 5":                 "025HW00501", //FR	
  "Hwy 41":                       "025HW04101", //FR	
  "Hwy 99 (North)":               "025HW09901", //FR	
  "Hwy 99 (South)":               "025HW09902", //FR	
  "Hwy 168":                      "025HW16801", //FR	
  "Hwy 180":                      "025HW18001", //FR	
  "TRAN - FR 60Kv":               "TR02506001", //FR	
  "TRAN - FR 70Kv":               "TR02507001", //FR	
  "TRAN - FR 115Kv":              "TR02511501", //FR	
  "TRAN - FR 230Kv":              "TR02523001", //FR	
  "TRAN - FR 500Kv":              "TR02550001", //FR	
  "CR-Los Banos-Midway":          "TRC0251001", //FR	
  "CR-Gates Panoche":             "TRC0251002", //FR	
  "CR-Gates-Barton":              "TRC0251003", //FR	
  "CR-Raisin City":               "TRC0251004", //FR	
  "CR-Baker Farms":               "TRC0251005", //FR	
  "CR Hwy 99":                    "TRC0251006", //FR	
  "CR-Gates Gregg McCall":        "TRC0251007", //FR	
  "CR-Panoche McCall":            "TRC0251008", //FR	
  "CR-Balch Sanger":              "TRC0251009", //FR	
  "CR-Diablo Gates":              "TRC0251010", //FR	
  "CR-Helms Gregg":               "TRC0251011", //FR	
  "CR Herndon Ashlan":            "TRC0251012", //FR	
  "CR-Aerial Patrol FR":            "TRC4601111", //FR	
  "CR-FR HCP MBZ 2501":           "TRCHCP2501", //FR	
  "CR-FR HCP MBZ 2502":           "TRCHCP2502", //FR	
  "CR-FR HCP MBZ 2503":           "TRCHCP2503", //FR	
  "CR-FR HCP MBZ 2504":           "TRCHCP2504", //FR	
  "CR-FR HCP MBZ 2505":           "TRCHCP2505", //FR	
  "CR-Orchards Transmission":     "TRCOR00001", //FR & KE
  "SISQUOC 1102":                 "0182811102", //KE & LP
  "ORCHARD 1110":                 "0250OR1110", //KE	
  "ORCHARD 1111":                 "0250OR1111", //KE	
  "ANTELOPE 1101":                "0252021101", //KE	
  "ANTELOPE 1102":                "0252021102", //KE	
  "TAFT 1101":                    "0252081101", //KE	
  "TAFT 1102":                    "0252081102", //KE	
  "TAFT 1103":                    "0252081103", //KE	
  "TAFT 1104":                    "0252081104", //KE	
  "TAFT 1106":                    "0252081106", //KE	
  "TAFT 1108":                    "0252081108", //KE	
  "CARNERAS 1102":                "0252321102", //KE	
  "CARNERAS 1103":                "0252321103", //KE	
  "ELK HILLS 1104":               "0252441104", //KE	
  "ELK HILLS 1106":               "0252441106", //KE	
  "FAMOSO 1101":                  "0252461101", //KE	
  "FAMOSO 1102":                  "0252461102", //KE	
  "FAMOSO 1103":                  "0252461103", //KE	
  "FAMOSO 1105":                  "0252461105", //KE	
  "FAMOSO 1107":                  "0252461107", //KE	
  "TEMBLOR 1104":                 "0252551104", //KE	
  "TEMBLOR 2103":                 "0252552103", //KE	
  "MIDWAY 1101":                  "0252611101", //KE	
  "MIDWAY 1102":                  "0252611102", //KE	
  "MIDWAY 1103":                  "0252611103", //KE	
  "MIDWAY 1104":                  "0252611104", //KE	
  "CAWELO B 1101":                "0252621101", //KE	
  "KERN OIL 1103":                "0252721103", //KE	
  "KERN OIL 1104":                "0252721104", //KE	
  "KERN OIL 1106":                "0252721106", //KE	
  "KERN OIL 1107":                "0252721107", //KE	
  "KERN OIL 1108":                "0252721108", //KE	
  "KERN OIL 1109":                "0252721109", //KE	
  "KERN OIL 1110":                "0252721110", //KE	
  "KERN OIL 1112":                "0252721112", //KE	
  "KERN OIL 1114":                "0252721114", //KE	
  "KERN OIL 1116":                "0252721116", //KE	
  "MAGUNDEN 1101":                "0252771101", //KE	
  "MAGUNDEN 1104":                "0252771104", //KE	
  "MAGUNDEN 1105":                "0252771105", //KE	
  "MAGUNDEN 1106":                "0252771106", //KE	
  "MAGUNDEN 1108":                "0252771108", //KE	
  "MAGUNDEN 2108":                "0252772108", //KE	
  "MAGUNDEN 2109":                "0252772109", //KE	
  "MC KITTRICK 1106":             "0252781106", //KE	
  "MC KITTRICK 1107":             "0252781107", //KE	
  "OLD RIVER 1101":               "0252821101", //KE	
  "OLD RIVER 1102":               "0252821102", //KE	
  "OLD RIVER 1103":               "0252821103", //KE	
  "RIO BRAVO 1101":               "0252861101", //KE	
  "RIO BRAVO 1102":               "0252861102", //KE	
  "RIO BRAVO 1103":               "0252861103", //KE	
  "RIO BRAVO 1106":               "0252861106", //KE	
  "SEMITROPIC 1104":              "0252901104", //KE	
  "SEMITROPIC 1106":              "0252901106", //KE	
  "SEMITROPIC 1108":              "0252901108", //KE	
  "SEMITROPIC 1110":              "0252901110", //KE	
  "SEMITROPIC 1112":              "0252901112", //KE	
  "TEJON 1101":                   "0252931101", //KE	
  "TEJON 1102":                   "0252931102", //KE	
  "TEJON 1103":                   "0252931103", //KE	
  "TEJON 1104":                   "0252931104", //KE	
  "WASCO 1101":                   "0252961101", //KE	
  "WASCO 1102":                   "0252961102", //KE	
  "WASCO 1104":                   "0252961104", //KE	
  "WEEDPATCH 1101":               "0252971101", //KE	
  "WEEDPATCH 1102":               "0252971102", //KE	
  "WEEDPATCH 1103":               "0252971103", //KE	
  "WEEDPATCH 1105":               "0252971105", //KE	
  "WEEDPATCH 1106":               "0252971106", //KE	
  "CUYAMA 1103":                  "0253141103", //KE	
  "CUYAMA 1104":                  "0253141104", //KE	
  "CUYAMA 2102":                  "0253142102", //KE	
  "MC FARLAND 1101":              "0253181101", //KE	
  "MC FARLAND 1102":              "0253181102", //KE	
  "MC FARLAND 1104":              "0253181104", //KE	
  "MC FARLAND 1105":              "0253181105", //KE	
  "SAN BERNARD 1101":             "0253191101", //KE	
  "SAN BERNARD 1102":             "0253191102", //KE	
  "SAN BERNARD 1103":             "0253191103", //KE	
  "SAN BERNARD 1104":             "0253191104", //KE	
  "SAN BERNARD 1105":             "0253191105", //KE	
  "BAKERSFIELD 1101":             "0253371101", //KE	
  "BAKERSFIELD 1102":             "0253371102", //KE	
  "BAKERSFIELD 1105":             "0253371105", //KE	
  "BAKERSFIELD 1106":             "0253371106", //KE	
  "BAKERSFIELD 1107":             "0253371107", //KE	
  "BAKERSFIELD 1108":             "0253371108", //KE	
  "BAKERSFIELD 1110":             "0253371110", //KE	
  "BAKERSFIELD 1114":             "0253371114", //KE	
  "BAKERSFIELD 1115":             "0253371115", //KE	
  "BAKERSFIELD 1116":             "0253371116", //KE	
  "BAKERSFIELD 1118":             "0253371118", //KE	
  "BAKERSFIELD 2106":             "0253372106", //KE	
  "BAKERSFIELD 2107":             "0253372107", //KE	
  "BAKERSFIELD 2108":             "0253372108", //KE	
  "FRUITVALE 1101":               "0253391101", //KE	
  "FRUITVALE 1103":               "0253391103", //KE	
  "FRUITVALE 1104":               "0253391104", //KE	
  "FRUITVALE 1105":               "0253391105", //KE	
  "FRUITVALE 1108":               "0253391108", //KE	
  "FRUITVALE 2106":               "0253392106", //KE	
  "LAKEVIEW 1101":                "0253411101", //KE	
  "LAKEVIEW 1102":                "0253411102", //KE	
  "LAKEVIEW 1103":                "0253411103", //KE	
  "PANAMA 2101":                  "0253422101", //KE	
  "CARRIZO PLAINS 1101":          "0253461101", //KE	
  "WHEELER RIDGE 1101":           "0253481101", //KE	
  "WHEELER RIDGE 1102":           "0253481102", //KE	
  "WHEELER RIDGE 1103":           "0253481103", //KE	
  "LERDO 1103":                   "0253491103", //KE	
  "LERDO 1104":                   "0253491104", //KE	
  "LERDO 1105":                   "0253491105", //KE	
  "LERDO 1106":                   "0253491106", //KE	
  "LERDO 1107":                   "0253491107", //KE	
  "LERDO 1108":                   "0253491108", //KE	
  "LERDO 1109":                   "0253491109", //KE	
  "SMYRNA 1102":                  "0253551102", //KE	
  "SMYRNA 1103":                  "0253551103", //KE	
  "POSO MOUNTAIN 2101":           "0253642101", //KE	
  "SHAFTER 1101":                 "0253651101", //KE	
  "SHAFTER 1102":                 "0253651102", //KE	
  "SHAFTER 1103":                 "0253651103", //KE	
  "SHAFTER 1104":                 "0253651104", //KE	
  "WESTPARK 1101":                "0253701101", //KE	
  "WESTPARK 1102":                "0253701102", //KE	
  "WESTPARK 1103":                "0253701103", //KE	
  "WESTPARK 1104":                "0253701104", //KE	
  "WESTPARK 1105":                "0253701105", //KE	
  "WESTPARK 1106":                "0253701106", //KE	
  "WESTPARK 1107":                "0253701107", //KE	
  "WESTPARK 1108":                "0253701108", //KE	
  "WESTPARK 1109":                "0253701109", //KE	
  "WESTPARK 1110":                "0253701110", //KE	
  "WESTPARK 1111":                "0253701111", //KE	
  "WESTPARK 1112":                "0253701112", //KE	
  "ARVIN 1101":                   "0253801101", //KE	
  "ARVIN 1102":                   "0253801102", //KE	
  "ARVIN 1103":                   "0253801103", //KE	
  "COPUS 1102":                   "0253871102", //KE	
  "COPUS 1103":                   "0253871103", //KE	
  "LAMONT 1102":                  "0253911102", //KE	
  "LAMONT 1103":                  "0253911103", //KE	
  "LAMONT 1104":                  "0253911104", //KE	
  "LAMONT 1105":                  "0253911105", //KE	
  "LAMONT 1106":                  "0253911106", //KE	
  "LAMONT 1107":                  "0253911107", //KE	
  "COLUMBUS 1103":                "0253951103", //KE	
  "COLUMBUS 1104":                "0253951104", //KE	
  "COLUMBUS 1105":                "0253951105", //KE	
  "COLUMBUS 1106":                "0253951106", //KE	
  "COLUMBUS 1109":                "0253951109", //KE	
  "COLUMBUS 1110":                "0253951110", //KE	
  "STOCKDALE 1105":               "0254071105", //KE	
  "STOCKDALE 1106":               "0254071106", //KE	
  "STOCKDALE 1108":               "0254071108", //KE	
  "STOCKDALE 1109":               "0254071109", //KE	
  "STOCKDALE 1110":               "0254071110", //KE	
  "STOCKDALE 1111":               "0254071111", //KE	
  "STOCKDALE 2106":               "0254072106", //KE	
  "STOCKDALE 2107":               "0254072107", //KE	
  "STOCKDALE 2108":               "0254072108", //KE	
  "STOCKDALE 2109":               "0254072109", //KE	
  "STOCKDALE 2110":               "0254072110", //KE	
  "STOCKDALE 2111":               "0254072111", //KE	
  "STOCKDALE 2112":               "0254072112", //KE	
  "STOCKDALE 2113":               "0254072113", //KE	
  "STOCKDALE 2114":               "0254072114", //KE	
  "STOCKDALE 2115":               "0254072115", //KE	
  "GOOSE LAKE 1103":              "0254201103", //KE	
  "GOOSE LAKE 1106":              "0254201106", //KE	
  "GOOSE LAKE 2104":              "0254202104", //KE	
  "MARICOPA 1101":                "0254211101", //KE	
  "MARICOPA 1102":                "0254211102", //KE	
  "EISEN 1101":                   "0254231101", //KE	
  "FELLOWS 2103":                 "0254242103", //KE	
  "FELLOWS 2104":                 "0254242104", //KE	
  "WELLFIELD 1102":               "0254291102", //KE	
  "WELLFIELD 1103":               "0254291103", //KE	
  "WELLFIELD 1104":               "0254291104", //KE	
  "LEBEC 1101":                   "0254351101", //KE	
  "ROSE 1101":                    "0254361101", //KE	
  "BELRIDGE 1A 1101":             "0254371101", //KE	
  "TWISSELMAN 2105":              "0254402105", //KE	
  "BERRENDA C 1101":              "0254481101", //KE	
  "CHARCA SUB 1106":              "0254501106", //KE	
  "GANSO 1103":                   "0254541103", //KE	
  "GANSO 1104":                   "0254541104", //KE	
  "TUPMAN 1103":                  "0254561103", //KE	
  "TUPMAN 1104":                  "0254561104", //KE	
  "RENFRO 2101":                  "0254572101", //KE	
  "RENFRO 2102":                  "0254572102", //KE	
  "RENFRO 2103":                  "0254572103", //KE	
  "BLACKWELL 1102":               "0254681102", //KE	
  "BLACKWELL 2101":               "0254682101", //KE	
  "NORCO 1101":                   "0254691101", //KE	
  "NORCO 1102":                   "0254691102", //KE	
  "ROSEDALE SUB 1101":            "0254761101", //KE	
  "ROSEDALE SUB 2102":            "0254762102", //KE	
  "CADET 1101":                   "0254821101", //KE	
  "KERN POWER 2101":              "0255262101", //KE	
  "KERN POWER 2102":              "0255262102", //KE	
  "KERN POWER 2103":              "0255262103", //KE	
  "KERN POWER 2104":              "0255262104", //KE	
  "KERN POWER 2105":              "0255262105", //KE	
  "CELERON 1101":                 "0255271101", //KE	
  "TEVIS 2101":                   "0255322101", //KE	
  "TEVIS 2102":                   "0255322102", //KE	
  "TEVIS 2103":                   "0255322103", //KE	
  "CAL WATER 1102":               "0255451102", //KE	
  "SO. CAL. EDISON #11 1101":     "0258111101", //KE	
  "S.C.E. 13 1101":               "0258131101", //KE	
  "Cal Trans 1101":               "025HW1101 ", //KE	
  "State Highway-1":              "025HW11011", //KE	
  "State Highway-2":              "025HW11012", //KE	
  "State Highway-3":              "025HW11013", //KE	
  "State Highway-4":              "025HW11014", //KE	
  "KE HCP MBZ 2601":              "026HCP2601", //KE	
  "KE HCP MBZ 2602":              "026HCP2602", //KE	
  "KE HCP MBZ 2603":              "026HCP2603", //KE	
  "KE HCP MBZ 2604":              "026HCP2604", //KE	
  "KE HCP MBZ 2605":              "026HCP2605", //KE	
  "TRAN - KE 60Kv":               "TR02506002", //KE	
  "TRAN - KE 70Kv":               "TR02507002", //KE	
  "TRAN - KE 115Kv":              "TR02511502", //KE	
  "TRAN - KE 230Kv":              "TR02523002", //KE	
  "TRAN - KE 500Kv":              "TR02550002", //KE	
  "CR-MW KE RioB Renfro":         "TRC0250001", //KE	
  "CR-Gates Arco LB MW":          "TRC0250002", //KE	
  "CR-Arco MW Gates LB":          "TRC0250003", //KE	
  "CR-Kern Old River":            "TRC0250004", //KE	
  "CR-Buena Vista":               "TRC0250005", //KE	
  "CR-MW Wheeler Ridge":          "TRC0250006", //KE	
  "CR-Tevis":                     "TRC0250007", //KE	
  "CR-Wind Gap PP":               "TRC0250008", //KE	
  "CR-Wheeler Ridge PP":          "TRC0250009", //KE	
  "CR-Cal Trans Transmission 1":  "TRC0250010", //KE	
  "CR-Cal Trans Transmission 2":  "TRC0250011", //KE	
  "CR-Aerial Patrol KE":            "TRC0251111", //KE	
  "CR-Aerial Patrol NON NERC":    "TRC0251112", //KE	
  "CR-Lerdo Cawelo":              "TRC0251113", //KE	
  "CR-Shafter RB MW":             "TRC0251114", //KE	
  "CR-7th Standard Kern":         "TRC0251115", //KE	
  "CR-Midway Hub":                "TRC0251116", //KE	
  "CR-Kern-Stockdale":            "TRC0251117", //KE	
  "CR-KE HCP MBZ 2601":           "TRCHCP2601", //KE	
  "CR-KE HCP MBZ 2602":           "TRCHCP2602", //KE	
  "CR-KE HCP MBZ 2603":           "TRCHCP2603", //KE	
  "CR-KE HCP MBZ 2605":           "TRCHCP2605", //KE	
  "D - SANTA YNEZ RIVER":         "0180000001", //LP	
  "FAIRWAY 1104":                 "0182061104", //LP	
  "FAIRWAY 1106":                 "0182061106", //LP	
  "FAIRWAY 1107":                 "0182061107", //LP	
  "FAIRWAY 1108":                 "0182061108", //LP	
  "ATASCADERO 1101":              "0182541101", //LP	
  "ATASCADERO 1102":              "0182541102", //LP	
  "ATASCADERO 1103":              "0182541103", //LP	
  "CAYUCOS 1101":                 "0182551101", //LP	
  "CAYUCOS 1102":                 "0182551102", //LP	
  "CHOLAME 1101":                 "0182561101", //LP	
  "CHOLAME 2102":                 "0182562102", //LP	
  "DIVIDE 1101":                  "0182571101", //LP	
  "DIVIDE 1102":                  "0182571102", //LP	
  "DIVIDE 1103":                  "0182571103", //LP	
  "GOLDTREE 1105":                "0182581105", //LP	
  "GOLDTREE 1107":                "0182581107", //LP	
  "GOLDTREE 1108":                "0182581108", //LP	
  "OCEANO 1101":                  "0182601101", //LP	
  "OCEANO 1102":                  "0182601102", //LP	
  "OCEANO 1103":                  "0182601103", //LP	
  "OCEANO 1104":                  "0182601104", //LP	
  "OCEANO 1105":                  "0182601105", //LP	
  "OCEANO 1106":                  "0182601106", //LP	
  "PASO ROBLES 1101":             "0182611101", //LP	
  "PASO ROBLES 1102":             "0182611102", //LP	
  "PASO ROBLES 1103":             "0182611103", //LP	
  "PASO ROBLES 1104":             "0182611104", //LP	
  "SAN LUIS OBISPO 1101":         "0182631101", //LP	
  "SAN LUIS OBISPO 1102":         "0182631102", //LP	
  "SAN LUIS OBISPO 1104":         "0182631104", //LP	
  "SAN LUIS OBISPO 1105":         "0182631105", //LP	
  "SAN LUIS OBISPO 1107":         "0182631107", //LP	
  "SAN LUIS OBISPO 1108":         "0182631108", //LP	
  "SAN MIGUEL 1104":              "0182661104", //LP	
  "SAN MIGUEL 1105":              "0182661105", //LP	
  "SAN MIGUEL 1106":              "0182661106", //LP	
  "SAN MIGUEL 1107":              "0182661107", //LP	
  "SANTA MARIA 1105":             "0182671105", //LP	
  "SANTA MARIA 1106":             "0182671106", //LP	
  "SANTA MARIA 1107":             "0182671107", //LP	
  "SANTA MARIA 1108":             "0182671108", //LP	
  "SANTA MARIA 1109":             "0182671109", //LP	
  "SANTA MARIA 1110":             "0182671110", //LP	
  "SANTA MARIA 1111":             "0182671111", //LP	
  "SANTA MARIA 1112":             "0182671112", //LP	
  "ZACA 1101":                    "0182681101", //LP	
  "ZACA 1102":                    "0182681102", //LP	
  "SANTA YNEZ 1101":              "0182721101", //LP	
  "SANTA YNEZ 1102":              "0182721102", //LP	
  "CAMBRIA 1101":                 "0182771101", //LP	
  "CAMBRIA 1102":                 "0182771102", //LP	
  "BAYWOOD 1101":                 "0182801101", //LP	
  "BAYWOOD 1102":                 "0182801102", //LP	
  "SISQUOC 1101":                 "0182811101", //LP	
  "SISQUOC 1103":                 "0182811103", //LP	
  "SISQUOC 1104":                 "0182811104", //LP	
  "FOOTHILLS 1101":               "0182951101", //LP	
  "FOOTHILLS 1102":               "0182951102", //LP	
  "PURISIMA SUB 1101":            "0182971101", //LP	
  "MORRO BAY 1101":               "0183011101", //LP	
  "MORRO BAY 1102":               "0183011102", //LP	
  "PALMER 1101":                  "0183031101", //LP	
  "BUELLTON 1101":                "0183041101", //LP	
  "BUELLTON 1102":                "0183041102", //LP	
  "TEMPLETON 2108":               "0183052108", //LP	
  "TEMPLETON 2109":               "0183052109", //LP	
  "TEMPLETON 2110":               "0183052110", //LP	
  "TEMPLETON 2111":               "0183052111", //LP	
  "TEMPLETON 2112":               "0183052112", //LP	
  "PERRY 1101":                   "0183071101", //LP	
  "CABRILLO 1103":                "0183101103", //LP	
  "CABRILLO 1104":                "0183101104", //LP	
  "DIABLO CANYON":                "0189001102", //LP	
  "CAL TRANS 101 NORTH":          "018HW10101", //LP	
  "CAL TRANS 101 SOUTH":          "018HW10102", //LP	
  "CR-Santa Ynez River CORDR":    "TR01800001", //LP	
  "TRAN - LP 60Kv":               "TR01806001", //LP	
  "TRAN - LP 70Kv":               "TR01807001", //LP	
  "TRAN - LP 115Kv":              "TR01811501", //LP	
  "TRAN - LP 230Kv":              "TR01823001", //LP	
  "TRAN - LP 500Kv":              "TR01850001", //LP	
  "CR-PILITAS CORRIDOR":          "TRC1800104", //LP	
  "CR-MARGARITA CORRIDOR":        "TRC1800106", //LP	
  "CR-JOHNSON CORRIDOR":          "TRC1800201", //LP	
  "CR-HOLLISTER CORRIDOR":        "TRC1800202", //LP	
  "CR-GOLDTREE CORRIDOR":         "TRC1800203", //LP	
  "CR-MIDWAY CORRIDOR":           "TRC1800212", //LP	
  "CR-NIPOMO CORRIDOR":           "TRC1800213", //LP	
  "CR-LOPEZ CORRIDOR":            "TRC1800214", //LP	
  "CR-PEREIRA CORRIDOR":          "TRC1800216", //LP	
  "CR-MESA CORRIDOR":             "TRC1800217", //LP	
  "CR-MESA - MIDWAY CORRIDOR":    "TRC1800218", //LP	
  "CR-ORCUTT CORRIDOR":           "TRC1800305", //LP	
  "CR-FAIRWAY CORRIDOR":          "TRC1800307", //LP	
  "CR-SISQUOC CORRIDOR":          "TRC1800308", //LP	
  "CR-VANDENBERG CORRIDOR":       "TRC1800309", //LP	
  "CR-DIVIDE CORRIDOR":           "TRC1800311", //LP	
  "CR-CLARK CORRIDOR":            "TRC1800315", //LP	
  "CR-Aerial Patrol NERC":        "TRC1800316", //LP	
  "CR-Aerial Patrol Non NERC":    "TRC1800317", //LP	
  "CR-Cuesta":                    "TRC1800318", //LP	
  "CR-Aerial Patrol LP":            "TRC1801111", //LP	
  "GO 165 Pilot Jarvis 1111":     "0000000001", //MI	
  "GO 165 Pilot Dumbarton 1107":  "0000000003", //MI	
  "GO 165 Pilot Newark 1103":     "0000000004", //MI	
  "LIVERMORE 1101":               "0012141101", //MI	
  "LIVERMORE 1102":               "0012141102", //MI	
  "LIVERMORE 1103":               "0012141103", //MI	
  "LIVERMORE 1104":               "0012141104", //MI	
  "NEWARK 1101":                  "0012221101", //MI	
  "NEWARK 1102":                  "0012221102", //MI	
  "NEWARK 1103":                  "0012221103", //MI	
  "NEWARK 1104":                  "0012221104", //MI	
  "NEWARK 1105":                  "0012221105", //MI	
  "NEWARK 1108":                  "0012221108", //MI	
  "NEWARK 1109":                  "0012221109", //MI	
  "NEWARK 2102":                  "0012222102", //MI	
  "NEWARK 2103":                  "0012222103", //MI	
  "NEWARK 2104":                  "0012222104", //MI	
  "NEWARK 2105":                  "0012222105", //MI	
  "NEWARK 2107":                  "0012222107", //MI	
  "NEWARK 2108":                  "0012222108", //MI	
  "NEWARK 2109":                  "0012222109", //MI	
  "NEWARK 2110":                  "0012222110", //MI	
  "SUBSTATION O 0401":            "0012240401", //MI	
  "SUBSTATION O 0402":            "0012240402", //MI	
  "ALTAMONT 0201":                "0012430201", //MI	
  "WARD 0401":                    "0012980401", //MI	
  "SAN LEANDRO 1101":             "0013111101", //MI	
  "SAN LEANDRO 1102":             "0013111102", //MI	
  "SAN LEANDRO 1103":             "0013111103", //MI	
  "SAN LEANDRO 1104":             "0013111104", //MI	
  "SAN LEANDRO 1105":             "0013111105", //MI	
  "SAN LEANDRO 1106":             "0013111106", //MI	
  "SAN LEANDRO 1107":             "0013111107", //MI	
  "SAN LEANDRO 1108":             "0013111108", //MI	
  "SAN LEANDRO 1110":             "0013111110", //MI	
  "SAN LEANDRO 1111":             "0013111111", //MI	
  "SAN LEANDRO 1112":             "0013111112", //MI	
  "SAN LEANDRO 1113":             "0013111113", //MI	
  "SAN LEANDRO 1115":             "0013111115", //MI	
  "SAN LEANDRO 1151":             "0013111151", //MI	
  "RADUM 1101":                   "0013151101", //MI	
  "RADUM 1102":                   "0013151102", //MI	
  "RADUM 1105":                   "0013151105", //MI	
  "CHERRY 0401":                  "0013200401", //MI	
  "SOTO 0401":                    "0013260401", //MI	
  "SOTO 0402":                    "0013260402", //MI	
  "SAN LORENZO 0401":             "0013460401", //MI	
  "SAN LORENZO 0402":             "0013460402", //MI	
  "JARVIS 1101":                  "0013501101", //MI	
  "JARVIS 1102":                  "0013501102", //MI	
  "JARVIS 1103":                  "0013501103", //MI	
  "JARVIS 1104":                  "0013501104", //MI	
  "JARVIS 1105":                  "0013501105", //MI	
  "JARVIS 1106":                  "0013501106", //MI	
  "JARVIS 1108":                  "0013501108", //MI	
  "JARVIS 1109":                  "0013501109", //MI	
  "JARVIS 1110":                  "0013501110", //MI	
  "JARVIS 1111":                  "0013501111", //MI	
  "JARVIS 1112":                  "0013501112", //MI	
  "PARKS 1101":                   "0013511101", //MI	
  "PARSONS 0401":                 "0013660401", //MI	
  "PARSONS 0402":                 "0013660402", //MI	
  "ORIOLE 0401":                  "0013730401", //MI	
  "ORIOLE 0402":                  "0013730402", //MI	
  "VASCO 1101":                   "0013751101", //MI	
  "VASCO 1102":                   "0013751102", //MI	
  "VASCO 1103":                   "0013751103", //MI	
  "MT. EDEN 1101":                "0013761101", //MI	
  "MT. EDEN 1102":                "0013761102", //MI	
  "MT. EDEN 1103":                "0013761103", //MI	
  "MT. EDEN 1104":                "0013761104", //MI	
  "MT. EDEN 1105":                "0013761105", //MI	
  "MT. EDEN 1106":                "0013761106", //MI	
  "MT. EDEN 1107":                "0013761107", //MI	
  "MT. EDEN 1108":                "0013761108", //MI	
  "MT. EDEN 1109":                "0013761109", //MI	
  "MT. EDEN 1110":                "0013761110", //MI	
  "MT. EDEN 1111":                "0013761111", //MI	
  "MT. EDEN 1112":                "0013761112", //MI	
  "MT. EDEN 1113":                "0013761113", //MI	
  "MT. EDEN 1114":                "0013761114", //MI	
  "NORTH DUBLIN 2101":            "0014052101", //MI	
  "NORTH DUBLIN 2103":            "0014052103", //MI	
  "CASTRO VALLEY 1101":           "0014091101", //MI	
  "CASTRO VALLEY 1102":           "0014091102", //MI	
  "CASTRO VALLEY 1103":           "0014091103", //MI	
  "CASTRO VALLEY 1104":           "0014091104", //MI	
  "CASTRO VALLEY 1105":           "0014091105", //MI	
  "CASTRO VALLEY 1106":           "0014091106", //MI	
  "CASTRO VALLEY 1107":           "0014091107", //MI	
  "CASTRO VALLEY 1108":           "0014091108", //MI	
  "SAN RAMON 2101":               "0014232101", //MI	
  "SAN RAMON 2103":               "0014232103", //MI	
  "SAN RAMON 2104":               "0014232104", //MI	
  "SAN RAMON 2105":               "0014232105", //MI	
  "SAN RAMON 2106":               "0014232106", //MI	
  "SAN RAMON 2107":               "0014232107", //MI	
  "SAN RAMON 2108":               "0014232108", //MI	
  "SAN RAMON 2110":               "0014232110", //MI	
  "SAN RAMON 2111":               "0014232111", //MI	
  "SAN RAMON 2112":               "0014232112", //MI	
  "SAN RAMON 2113":               "0014232113", //MI	
  "SAN RAMON 2114":               "0014232114", //MI	
  "SAN RAMON 2116":               "0014232116", //MI	
  "SAN RAMON 2117":               "0014232117", //MI	
  "SAN RAMON 2118":               "0014232118", //MI	
  "SAN RAMON 2119":               "0014232119", //MI	
  "SUNOL 1101":                   "0014241101", //MI	
  "FREMONT 1105":                 "0014351105", //MI	
  "FREMONT 1106":                 "0014351106", //MI	
  "FREMONT 1107":                 "0014351107", //MI	
  "FREMONT 1108":                 "0014351108", //MI	
  "FREMONT 1109":                 "0014351109", //MI	
  "FREMONT 1110":                 "0014351110", //MI	
  "FREMONT 1111":                 "0014351111", //MI	
  "FREMONT 1112":                 "0014351112", //MI	
  "GRANT 1102":                   "0014381102", //MI	
  "GRANT 1103":                   "0014381103", //MI	
  "GRANT 1104":                   "0014381104", //MI	
  "GRANT 1105":                   "0014381105", //MI	
  "GRANT 1106":                   "0014381106", //MI	
  "GRANT 1107":                   "0014381107", //MI	
  "GRANT 1108":                   "0014381108", //MI	
  "LAS POSITAS 2103":             "0014402103", //MI	
  "LAS POSITAS 2104":             "0014402104", //MI	
  "LAS POSITAS 2105":             "0014402105", //MI	
  "LAS POSITAS 2106":             "0014402106", //MI	
  "LAS POSITAS 2107":             "0014402107", //MI	
  "LAS POSITAS 2108":             "0014402108", //MI	
  "LAS POSITAS 2109":             "0014402109", //MI	
  "LAS POSITAS 2110":             "0014402110", //MI	
  "Cayetano 2109":                "0014422109", //MI	
  "Cayetano 2111":                "0014422111", //MI	
  "DUMBARTON SUB 1102":           "0014471102", //MI	
  "DUMBARTON SUB 1103":           "0014471103", //MI	
  "DUMBARTON SUB 1104":           "0014471104", //MI	
  "DUMBARTON SUB 1105":           "0014471105", //MI	
  "DUMBARTON SUB 1106":           "0014471106", //MI	
  "DUMBARTON SUB 1107":           "0014471107", //MI	
  "DUMBARTON SUB 1108":           "0014471108", //MI	
  "DUMBARTON SUB 1109":           "0014471109", //MI	
  "DUMBARTON SUB 1110":           "0014471110", //MI	
  "DUMBARTON SUB 2111":           "0014472111", //MI	
  "VINEYARD 2104":                "0014502104", //MI	
  "VINEYARD 2105":                "0014502105", //MI	
  "VINEYARD 2106":                "0014502106", //MI	
  "VINEYARD 2107":                "0014502107", //MI	
  "VINEYARD 2108":                "0014502108", //MI	
  "VINEYARD 2109":                "0014502109", //MI	
  "VINEYARD 2110":                "0014502110", //MI	
  "KATO SUB 2101":                "0014682101", //MI	
  "KATO SUB 2102":                "0014682102", //MI	
  "DIXON LANDING 2101 MI":           "0014722101", //MI	
  "DIXON LANDING 2102 MI":           "0014722102", //MI	
  "DIXON LANDING 2103 MI":           "0014722103", //MI	
  "DIXON LANDING 2105":           "0014722105", //MI	
  "DIXON LANDING 2106":           "0014722106", //MI	
  "DIXON LANDING 2107":           "0014722107", //MI	
  "DIXON LANDING 2109":           "0014722109", //MI	
  "FREMONT-SAN JOSE 1101":        "0018261101", //MI	
  "TRAN - MI 60Kv":               "TR00106003", //MI	
  "TRAN - MI 70Kv":               "TR00107003", //MI	
  "TRAN - MI 115Kv":              "TR00111503", //MI	
  "TRAN - MI 230Kv":              "TR00123003", //MI	
  "TRAN - MI 500Kv":              "TR00150003", //MI	
  "CR-MI Moraga Castro Valley":   "TRC0015000", //MI	
  "CR-MI Castro Valley Newark":   "TRC0015001", //MI	
  "CR-MI Contra Cost Livermore":  "TRC0015002", //MI	
  "CR-MI Pittsburg Eastshore":    "TRC0015003", //MI	
  "CR-MI Tesla Newark":           "TRC0015004", //MI	
  "CR-MI Moraga Oakport":         "TRC0015005", //MI	
  "CR-MI Oakland Newark":         "TRC0015006", //MI	
  "CR-MI Newark Fremont Jarvis":  "TRC0015007", //MI	
  "CR-MI Stanislaus Livermore":   "TRC0015008", //MI	
  "CR-MI Pleasanton 60kv":        "TRC0015009", //MI	
  "CR-MI East Alameda":           "TRC0015010", //MI	
  "SAN RAFAEL 0402":              "0042010402", //NB	
  "SAN RAFAEL 1101":              "0042011101", //NB	
  "SAN RAFAEL 1102":              "0042011102", //NB	
  "SAN RAFAEL 1103":              "0042011103", //NB	
  "SAN RAFAEL 1104":              "0042011104", //NB	
  "SAN RAFAEL 1105":              "0042011105", //NB	
  "SAN RAFAEL 1106":              "0042011106", //NB	
  "SAN RAFAEL 1107":              "0042011107", //NB	
  "SAN RAFAEL 1108":              "0042011108", //NB	
  "SAN RAFAEL 1109":              "0042011109", //NB	
  "SAN RAFAEL 1110":              "0042011110", //NB	
  "NAPA 1101":                    "0042021101", //NB	
  "NAPA 1102":                    "0042021102", //NB	
  "NAPA 1103":                    "0042021103", //NB	
  "NAPA 1104":                    "0042021104", //NB	
  "NAPA 1105":                    "0042021105", //NB	
  "NAPA 1106":                    "0042021106", //NB	
  "NAPA 1107":                    "0042021107", //NB	
  "ALTO 1120":                    "0042031120", //NB	
  "ALTO 1121":                    "0042031121", //NB	
  "ALTO 1122":                    "0042031122", //NB	
  "ALTO 1123":                    "0042031123", //NB	
  "ALTO 1124":                    "0042031124", //NB	
  "ALTO 1125":                    "0042031125", //NB	
  "NORTH TOWER 1101":             "0042041101", //NB	
  "NORTH TOWER 1102":             "0042041102", //NB	
  "NORTH TOWER 1103":             "0042041103", //NB	
  "NORTH TOWER 1104":             "0042041104", //NB	
  "NORTH TOWER 1105":             "0042041105", //NB	
  "NORTH TOWER 2201 NB":             "0042042201", //NB	
  "NORTH TOWER 2204":             "0042042204", //NB	
  "PARKWAY 1101":                 "0042051101", //NB	
  "SANTA ROSA B 0411":            "0042070411", //NB	
  "SANTA ROSA B 0413":            "0042070413", //NB	
  "MIRABEL 1101":                 "0042091101", //NB	
  "MIRABEL 1102":                 "0042091102", //NB	
  "PETALUMA A 0411":              "0042120411", //NB	
  "PETALUMA A 0413":              "0042120413", //NB	
  "SANTA ROSA A 1101":            "0042151101", //NB	
  "SANTA ROSA A 1102":            "0042151102", //NB	
  "SANTA ROSA A 1103":            "0042151103", //NB	
  "SANTA ROSA A 1104":            "0042151104", //NB	
  "SANTA ROSA A 1105":            "0042151105", //NB	
  "SANTA ROSA A 1106":            "0042151106", //NB	
  "SANTA ROSA A 1107":            "0042151107", //NB	
  "SANTA ROSA A 1108":            "0042151108", //NB	
  "SANTA ROSA A 1109":            "0042151109", //NB	
  "SANTA ROSA A 1110":            "0042151110", //NB	
  "SANTA ROSA A 1111":            "0042151111", //NB	
  "SANTA ROSA A 1112":            "0042151112", //NB	
  "NOVATO 1101":                  "0042211101", //NB	
  "NOVATO 1102":                  "0042211102", //NB	
  "NOVATO 1103":                  "0042211103", //NB	
  "NOVATO 1104":                  "0042211104", //NB	
  "BOLINAS 1101":                 "0042261101", //NB	
  "COTATI 1102":                  "0042271102", //NB	
  "COTATI 1103":                  "0042271103", //NB	
  "COTATI 1104":                  "0042271104", //NB	
  "COTATI 1105":                  "0042271105", //NB	
  "OLEMA 1101":                   "0042291101", //NB	& NC
  "TULUCAY 1101":                 "0042301101", //NB	
  "VALLEJO STA B 0411":           "0042450411", //NB	
  "VALLEJO STA B 0412":           "0042450412", //NB	
  "VALLEJO STA B 0413":           "0042450413", //NB	
  "VALLEJO STA B 0414":           "0042450414", //NB	
  "VALLEJO STA B 0415":           "0042450415", //NB	
  "VALLEJO STA B 1101":           "0042451101", //NB	
  "VALLEJO STA B 1102":           "0042451102", //NB	
  "BASALT 1101":                  "0042461101", //NB	
  "BASALT 1102":                  "0042461102", //NB	
  "IGNACIO 1101":                 "0042481101", //NB	
  "IGNACIO 1102":                 "0042481102", //NB	
  "IGNACIO 1103":                 "0042481103", //NB	
  "SAUSALITO 0401":               "0042490401", //NB	
  "SAUSALITO 0402":               "0042490402", //NB	
  "SAUSALITO 1101":               "0042491101", //NB	
  "SAUSALITO 1102":               "0042491102", //NB	
  "SAN ANSELMO 0412":             "0042500412", //NB	
  "VALLEJO STA C 0401":           "0042550401", //NB	
  "FULTON 1101":                  "0042561101", //NB	
  "FULTON 1102":                  "0042561102", //NB	
  "FULTON 1103":                  "0042561103", //NB	
  "FULTON 1104":                  "0042561104", //NB	
  "FULTON 1105":                  "0042561105", //NB	
  "FULTON 1106":                  "0042561106", //NB	
  "FULTON 1107":                  "0042561107", //NB	
  "MOLINO 1101":                  "0042571101", //NB	
  "MOLINO 1102":                  "0042571102", //NB	
  "MOLINO 1103":                  "0042571103", //NB	
  "MOLINO 1104":                  "0042571104", //NB	
  "PETALUMA C 0402":              "0042630402", //NB	
  "PETALUMA C 1101":              "0042631101", //NB	
  "PETALUMA C 1102":              "0042631102", //NB	
  "PETALUMA C 1105":              "0042631105", //NB	
  "PETALUMA C 1106":              "0042631106", //NB	
  "PETALUMA C 1108":              "0042631108", //NB	
  "PETALUMA C 1109":              "0042631109", //NB	
  "HIGHWAY 1101":                 "0042651101", //NB	
  "HIGHWAY 1102":                 "0042651102", //NB	
  "HIGHWAY 1103":                 "0042651103", //NB	
  "HIGHWAY 1104":                 "0042651104", //NB	
  "CALISTOGA 1101":               "0042711101", //NB	
  "CALISTOGA 1102":               "0042711102", //NB	
  "SONOMA 1102":                  "0042721102", //NB	
  "SONOMA 1103":                  "0042721103", //NB	
  "SONOMA 1104":                  "0042721104", //NB	
  "SONOMA 1105":                  "0042721105", //NB	& NC
  "SONOMA 1106":                  "0042721106", //NB	
  "SONOMA 1107":                  "0042721107", //NB	
  "FITCH MOUNTAIN 1111":          "0042751111", //NB	
  "FITCH MOUNTAIN 1112":          "0042751112", //NB	
  "FITCH MOUNTAIN 1113":          "0042751113", //NB	& NC
  "MONTE RIO 1111":               "0042811111", //NB	
  "MONTE RIO 1112":               "0042811112", //NB	
  "MONTE RIO 1113":               "0042811113", //NB	
  "CLOVERDALE 1101":              "0042821101", //NB	
  "CLOVERDALE 1102":              "0042821102", //NB	
  "FORT ROSS 1121":               "0042851121", //NB	
  "GEYSERVILLE 1101":             "0042891101", //NB	
  "GEYSERVILLE 1102":             "0042891102", //NB	
  "LAS GALLINAS A 1103":          "0042991103", //NB	
  "LAS GALLINAS A 1104":          "0042991104", //NB	
  "LAS GALLINAS A 1105":          "0042991105", //NB	
  "LAS GALLINAS A 1106":          "0042991106", //NB	
  "LAS GALLINAS A 1107":          "0042991107", //NB	
  "WOODACRE 1101":                "0043021101", //NB	
  "WOODACRE 1102":                "0043021102", //NB	
  "MONTICELLO 1101":              "0043051101", //NB	
  "DUNBAR 1101":                  "0043071101", //NB	
  "DUNBAR 1102":                  "0043071102", //NB	
  "DUNBAR 1103":                  "0043071103", //NB	
  "GREENBRAE 1101":               "0043091101", //NB	
  "GREENBRAE 1102":               "0043091102", //NB	
  "GREENBRAE 1103":               "0043091103", //NB	
  "GREENBRAE 1104":               "0043091104", //NB	
  "MIDDLETOWN 1102":              "0043141102", //NB	& NC
  "SALMON CREEK 1101":            "0043161101", //NB	
  "BELLEVUE 1102":                "0043181102", //NB	
  "BELLEVUE 1104":                "0043181104", //NB	
  "BELLEVUE 2101":                "0043182101", //NB	
  "BELLEVUE 2103":                "0043182103", //NB	
  "BELLEVUE 2105":                "0043182105", //NB	
  "STAFFORD 1101":                "0043201101", //NB	
  "STAFFORD 1102":                "0043201102", //NB	
  "BAHIA 1101":                   "0043251101", //NB	
  "BAHIA 1102":                   "0043251102", //NB	
  "BAHIA 1103":                   "0043251103", //NB	
  "BAHIA 1104":                   "0043251104", //NB	
  "BAHIA 1105":                   "0043251105", //NB	
  "CARQUINEZ 1103":               "0043281103", //NB	
  "CARQUINEZ 1104":               "0043281104", //NB	
  "CARQUINEZ 1105":               "0043281105", //NB	
  "PUEBLO 1102":                  "0043291102", //NB	
  "PUEBLO 1103":                  "0043291103", //NB	
  "PUEBLO 1104":                  "0043291104", //NB	
  "PUEBLO 1105":                  "0043291105", //NB	
  "PUEBLO 2102":                  "0043292102", //NB	
  "PUEBLO 2103":                  "0043292103", //NB	
  "MONROE 1104":                  "0043301104", //NB	
  "MONROE 1105":                  "0043301105", //NB	
  "MONROE 1106":                  "0043301106", //NB	
  "MONROE 2102":                  "0043302102", //NB	
  "MONROE 2103":                  "0043302103", //NB	
  "MONROE 2107":                  "0043302107", //NB	
  "RINCON 1101":                  "0043321101", //NB	
  "RINCON 1102":                  "0043321102", //NB	
  "RINCON 1103":                  "0043321103", //NB	
  "RINCON 1104":                  "0043321104", //NB	
  "SKAGGS ISLAND 1101":           "0043341101", //NB	
  "LAKEVILLE 1101":               "0043371101", //NB	
  "LAKEVILLE 1102":               "0043371102", //NB	& NC
  "SILVERADO 2103":               "0043432103", //NB	& NC
  "SILVERADO 2104":               "0043432104", //NB	
  "SILVERADO 2105":               "0043432105", //NB	
  "GEYSERS 9 & 10 2109":          "0043442109", //NB	
  "GEYSERS 5 & 6 2103":           "0043452103", //NB	
  "PENNGROVE 1101":               "0043471101", //NB	
  "PENNGROVE 1102":               "0043471102", //NB	
  "GEYSERS 17":                   "0043482117", //NB	
  "CORONA 1101":                  "0043491101", //NB	
  "CORONA 1102":                  "0043491102", //NB	
  "CORONA 1103":                  "0043491103", //NB	
  "DEVELOPMENT 9901":             "0045999901", //NB	
  "DEVELOPMENT 9902":             "0045999902", //NB	
  "Hwy 12 (Sonoma)":              "004HW01201", //NB	
  "Hwy 101North (Sonoma)":        "004HW10101", //NB	
  "Hwy 101South (Sonoma)":        "004HW10102", //NB	
  "Notre Dame 1102":              "0102041102", //NB	
  "TRAN - NB 60Kv":               "TR00406002", //NB	
  "TRAN - NB 70Kv":               "TR00407002", //NB	
  "TRAN - NB 115Kv":              "TR00411502", //NB	
  "TRAN - NB 230Kv":              "TR00423002", //NB	
  "TRAN - NB 500Kv":              "TR00450002", //NB	
  "CR-Larkfield CR":              "TRC0040001", //NB	
  "CR-Aerial Patrol NB":            "TRC0041111", //NB	
  "CR-Lakeville-Ignacio":         "TRC0041112", //NB	
  "CR-Geysers-Fulton":            "TRC0041113", //NB	
  "CR-Lakeville-Tulucay":         "TRC0041114", //NB	
  "CR-Fulton-Lakeville":          "TRC0041115", //NB	
  "CR-Geysers":                   "TRC0041116", //NB	
  "CR-Aerial Patrol NON-NERC":    "TRC0041117", //NB	
  "CLEAR LAKE 1101":              "0042141101", //NC	
  "CLEAR LAKE 1102":              "0042141102", //NC	
  "HOPLAND 1101":                 "0042251101", //NC	
  "POTTER VALLEY P H 1102":       "0042281102", //NC	
  "POTTER VALLEY P H 1104":       "0042281104", //NC	
  "POTTER VALLEY P H 1105":       "0042281105", //NC	
  "PHILO 1101":                   "0042601101", //NC	
  "PHILO 1102":                   "0042601102", //NC	
  "WILLITS 1102":                 "0042661102", //NC	
  "WILLITS 1103":                 "0042661103", //NC	
  "WILLITS 1104":                 "0042661104", //NC	
  "LAYTONVILLE 1101":             "0042681101", //NC	
  "LAYTONVILLE 1102":             "0042681102", //NC	
  "FORT BRAGG STA A 1101":        "0042761101", //NC	
  "FORT BRAGG STA A 1102":        "0042761102", //NC	
  "FORT BRAGG STA A 1103":        "0042761103", //NC	
  "FORT BRAGG STA A 1104":        "0042761104", //NC	
  "FORT BRAGG STA A 1110":        "0042761110", //NC	
  "UKIAH 1111":                   "0042771111", //NC	
  "UKIAH 1113":                   "0042771113", //NC	
  "UKIAH 1114":                   "0042771114", //NC	
  "UKIAH 1115":                   "0042771115", //NC	
  "GUALALA 1111":                 "0042841111", //NC	
  "GUALALA 1112":                 "0042841112", //NC	
  "ANNAPOLIS 1101":               "0042861101", //NC	
  "UPPER LAKE 1101":              "0042871101", //NC	
  "MENDOCINO 1101":               "0042951101", //NC	
  "MENDOCINO 1102":               "0042951102", //NC	
  "ELK 1101":                     "0042981101", //NC	
  "GARCIA 0401":                  "0043040401", //NC	
  "COVELO 1101":                  "0043061101", //NC	
  "BIG RIVER 1101":               "0043081101", //NC	
  "MIDDLETOWN 1101":              "0043141101", //NC	
  "REDBUD 1101":                  "0043191101", //NC	
  "REDBUD 1102":                  "0043191102", //NC	
  "HARTLEY 1101":                 "0043211101", //NC	
  "HARTLEY 1102":                 "0043211102", //NC	
  "KONOCTI 1101":                 "0043311101", //NC	
  "KONOCTI 1102":                 "0043311102", //NC	
  "LUCERNE 1103":                 "0043351103", //NC	
  "Lucerne 1106":                 "0043351106", //NC	
  "HIGHLANDS 1102":               "0043361102", //NC	
  "HIGHLANDS 1103":               "0043361103", //NC	
  "Highlands 1104":               "0043361104", //NC	
  "POINT ARENA 1101":             "0043381101", //NC	
  "CALPELLA 1101":                "0043411101", //NC	
  "CALPELLA 1102":                "0043411102", //NC	
  "ARCATA 1105":                  "0192021105", //NC	
  "ARCATA 1106":                  "0192021106", //NC	
  "ARCATA 1121":                  "0192021121", //NC	
  "ARCATA 1122":                  "0192021122", //NC	
  "ARCATA 1123":                  "0192021123", //NC	
  "MAPLE CREEK 1101":             "0192101101", //NC	
  "STATION A EUREKA 1103":        "0192121103", //NC	
  "STATION A EUREKA 1106":        "0192121106", //NC	
  "STATION A EUREKA 1107":        "0192121107", //NC	
  "NEWBURG 1131":                 "0192151131", //NC	
  "NEWBURG 1132":                 "0192151132", //NC	
  "NEWBURG 1133":                 "0192151133", //NC	
  "WILLOW CREEK 1101":            "0192171101", //NC	
  "WILLOW CREEK 1102":            "0192171102", //NC	
  "WILLOW CREEK 1103":            "0192171103", //NC	
  "BLUE LAKE 1101":               "0192181101", //NC	
  "BLUE LAKE 1102":               "0192181102", //NC	
  "GARBERVILLE 1101":             "0192221101", //NC	
  "GARBERVILLE 1102":             "0192221102", //NC	
  "GARBERVILLE 1103":             "0192221103", //NC	
  "TRINIDAD 1101":                "0192231101", //NC	
  "TRINIDAD 1102":                "0192231102", //NC	
  "RIO DELL 1101":                "0192251101", //NC	
  "RIO DELL 1102":                "0192251102", //NC	
  "ORICK 1101":                   "0192261101", //NC	
  "ORICK 1102":                   "0192261102", //NC	
  "CARLOTTA 1121":                "0192291121", //NC	
  "FRUITLAND 1141":               "0192311141", //NC	
  "FRUITLAND 1142":               "0192311142", //NC	
  "FORT SEWARD 1121":             "0192321121", //NC	
  "FORT SEWARD 1122":             "0192321122", //NC	
  "STATION E EUREKA 1101":        "0192331101", //NC	
  "STATION E EUREKA 1104":        "0192331104", //NC	
  "STATION E EUREKA 1105":        "0192331105", //NC	
  "HUM BAY 1101":                 "0192341101", //NC	
  "HUM BAY 1102":                 "0192341102", //NC	
  "BIG LAGOON 1101":              "0192361101", //NC	
  "EEL RIVER 1101":               "0192381101", //NC	
  "EEL RIVER 1102":               "0192381102", //NC	
  "JANES CREEK 1101":             "0192391101", //NC	
  "JANES CREEK 1102":             "0192391102", //NC	
  "JANES CREEK 1103":             "0192391103", //NC	
  "JANES CREEK 1104":             "0192391104", //NC	
  "HOOPA 1101":                   "0192401101", //NC	
  "LOW GAP 1101":                 "0192411101", //NC	
  "HARRIS 1108":                  "0192431108", //NC	
  "HARRIS 1109":                  "0192431109", //NC	
  "FAIRHAVEN 1103":               "0192451103", //NC	
  "FAIRHAVEN 1104":               "0192451104", //NC	
  "BRIDGEVILLE 1101":             "0192461101", //NC	
  "BRIDGEVILLE 1102":             "0192461102", //NC	
  "RUSS RANCH 1101":              "0192471101", //NC	
  "LAYTONVILLE N.B. FD. 1101":    "0198001101", //NC	
  "Humboldt S Q1 State Parks":    "0199999990", //NC	
  "Humboldt S Q4 State Parks":    "0199999991", //NC	
  "Humbldt North State Parks":    "0199999992", //NC	
  "Humboldt River Cross South":   "019HW00001", //NC	
  "Humboldt River Cross North":   "019HW00002", //NC	
  "Hw36 (Hw101 - Forest Glen":    "019HW03601", //NC	
  "Hw96 (Willow Ck - Somes Br)":  "019HW09601", //NC	
  "Hw101 (Orick - King Salmon)":  "019HW10101", //NC	
  "Hw101 (King Salmon --Holmes)": "019HW10102", //NC	
  "Hw101 (Holmes - Spy Rock)":    "019HW10103", //NC	
  "Hw299 (Eureka -Redwd Vly.)":   "019HW29901", //NC	
  "Hw299 (Redwd Vly.-Del Loma)":  "019HW29902", //NC	
  "Lake Hwy-1":                   "042HW00001", //NC	
  "Lake Hwy-2":                   "042HW00002", //NC	
  "Lake Hwy-3":                   "042HW00003", //NC	
  "Lake Hwy-4":                   "042HW00004", //NC	
  "Hw1 (Navarro Rv - Rock Pt.)":  "042HW00101", //NC	
  "Hw1 (Stewarts Pt-Navarro R)":  "042HW00102", //NC	
  "Hw20 (Hw101 - Lake County)":   "042HW02001", //NC	
  "Hw20 (Hw101 - Irmulco Rd)":    "042HW02002", //NC	
  "Hw20 (Lake Co - Colusa Co)":   "042HW02003", //NC	
  "Hw20 (Hw 1 - Camp 20)":        "042HW02004", //NC	
  "Hw101 (Redwd Vly -Squaw Rk)":  "042HW10101", //NC	
  "Hw101 (Willits - Spy Rock)":   "042HW10102", //NC	
  "Hw116 (All)":                  "042HW11601", //NC	
  "Hw128 (Mtn Hse-Flynn Ck Rd)":  "042HW12801", //NC	
  "Hw162 (All)":                  "042HW16201", //NC	
  "Hw175 (Hw 101 -Lake County)":  "042HW17501", //NC	
  "Hw222 (All)":                  "042HW22201", //NC	
  "Hw253 (All)":                  "042HW25301", //NC	
  "TRAN - NC 60Kv":               "TR00406001", //NC	
  "TRAN - NC 70Kv":               "TR00407001", //NC	
  "TRAN - NC 115Kv":              "TR00411501", //NC	
  "TRAN - NC 230Kv":              "TR00423001", //NC	
  "TRAN - NC 500Kv":              "TR00450001", //NC	
  "PIT NO.5 1101":                "0101321101", //NV	
  "CENTERVILLE 1101":             "0102021101", //NV	
  "NOTRE DAME 1101":              "0102041101", //NV	
  "NOTRE DAME 1102":              "0102041102", //NV	
  "NOTRE DAME 1104":              "0102041104", //NV	
  "CHICO STATION A 0401":         "0102050401", //NV	
  "CHICO STATION A 0402":         "0102050402", //NV	
  "CHICO STATION A 1101":         "0102051101", //NV	
  "CHICO STATION A 1102":         "0102051102", //NV	
  "CHICO STATION A 1103":         "0102051103", //NV	
  "CHICO STATION A 1104":         "0102051104", //NV	
  "CAPAY 1101":                   "0102111101", //NV	
  "CAPAY 1102":                   "0102111102", //NV	
  "HAMILTON STATION A 1101":      "0102121101", //NV	
  "HAMILTON STATION A 1102":      "0102121102", //NV	
  "ESQUON 1101":                  "0102171101", //NV	
  "ESQUON 1102":                  "0102171102", //NV	
  "ESQUON 1103":                  "0102171103", //NV	
  "BUCKS CREEK 1101":             "0102211101", //NV	
  "BUCKS CREEK 1102":             "0102211102", //NV	
  "BUCKS CREEK 1103":             "0102211103", //NV	
  "CARIBOU 2102":                 "0102222102", //NV	
  "HAMILTON BRANCH 1101":         "0102361101", //NV	
  "CHICO STATION B 1101":         "0102491101", //NV	
  "CHICO STATION B 1102":         "0102491102", //NV	
  "CHICO STATION B 1103":         "0102491103", //NV	
  "CHICO STATION B 1105":         "0102491105", //NV	
  "CHICO STATION B 1106":         "0102491106", //NV	
  "OROVILLE 0402":                "0102520402", //NV	
  "OROVILLE 0403":                "0102520403", //NV	
  "OROVILLE 1101":                "0102521101", //NV	
  "OROVILLE 1102":                "0102521102", //NV	
  "OROVILLE 1103":                "0102521103", //NV	
  "OROVILLE 1104":                "0102521104", //NV	
  "GRAYS FLAT 0401":              "0102530401", //NV	
  "VOLTA 1101":                   "0102541101", //NV	
  "VOLTA 1102":                   "0102541102", //NV	
  "EAST QUINCY 1101":             "0102551101", //NV	
  "Glenn 1101":                   "0102601101", //NV	
  "CHICO STATION C 0401":         "0102650401", //NV	
  "ORLAND STATION B 1101":        "0102701101", //NV	
  "ORLAND STATION B 1102":        "0102701102", //NV	
  "ORLAND STATION B 1103":        "0102701103", //NV	
  "WILLOWS STATION A 1101":       "0102741101", //NV	
  "WILLOWS STATION A 1103":       "0102741103", //NV	
  "WILLOWS STATION A 1104":       "0102741104", //NV	
  "ELK CREEK 1101-StnyFrd":       "0102781101", //NV	
  "ELK CREEK 1101-ElkCk":         "010278110A", //NV	
  "BIG MEADOWS 2101":             "0102812101", //NV	
  "BIG MEADOWS 4472":             "0102814472", //NV	
  "PARADISE Tap":                 "0102831100", //NV	
  "PARADISE 1101":                "0102831101", //NV	
  "PARADISE 1102":                "0102831102", //NV	
  "PARADISE 1103":                "0102831103", //NV	
  "PARADISE 1104":                "0102831104", //NV	
  "PARADISE 1105":                "0102831105", //NV	
  "PARADISE 1106":                "0102831106", //NV	
  "PARADISE 1105 USFS":           "010283110Z", //NV	
  "ANITA 1101":                   "0102841101", //NV	
  "ANITA 1102":                   "0102841102", //NV	
  "JACINTO 1101":                 "0102851101", //NV	
  "JACINTO 1102":                 "0102851102", //NV	
  "Wyandotte 1102":               "0102911102", //NV	
  "WYANDOTTE 1103-Sub":           "0102911103", //NV	
  "WYANDOTTE 1105":               "0102911105", //NV	
  "WYANDOTTE 1106":               "0102911106", //NV	
  "WYANDOTTE 1107-MnrRnch":       "0102911107", //NV	
  "WYANDOTTE 1108":               "0102911108", //NV	
  "WYANDOTTE 1109":               "0102911109", //NV	
  "WYANDOTTE 1103-Pdse":          "010291110A", //NV	
  "WYANDOTTE 1103-BaldRk":        "010291110B", //NV	
  "WYANDOTTE 1107-BlkBrt":        "010291110C", //NV	
  "WYANDOTTE 1103-Sub USFS":      "010291110Y", //NV	
  "WYANDOTTE 1103-Pdse USFS":     "010291110Z", //NV	
  "WYANDOTTE 1110":               "0102911110", //NV	
  "COTTONWOOD 1101":              "0102931101", //NV	
  "COTTONWOOD 1102":              "0102931102", //NV	
  "COTTONWOOD 1103":              "0102931103", //NV	
  "DAYTON ROAD 0401":             "0102940401", //NV	
  "DAYTON ROAD 0402":             "0102940402", //NV	
  "SYCAMORE CREEK 1101":          "0102971101", //NV	
  "SYCAMORE CREEK 1102":          "0102971102", //NV	
  "SYCAMORE CREEK 1103":          "0102971103", //NV	
  "SYCAMORE CREEK 1104":          "0102971104", //NV	
  "SYCAMORE CREEK 1105":          "0102971105", //NV	
  "SYCAMORE CREEK 1107":          "0102971107", //NV	
  "SYCAMORE CREEK 1109":          "0102971109", //NV	
  "SYCAMORE CREEK 1110":          "0102971110", //NV	
  "SYCAMORE CREEK 1111":          "0102971111", //NV	
  "CAMELLIA 0401":                "0103010401", //NV	
  "GANSNER 1101-MdwVly":          "0103021101", //NV	
  "GANSNER 1101-Quincy":          "010302110A", //NV	
  "ORO FINO 1101":                "0103031101", //NV	
  "ORO FINO 1102-ButteMdws":      "0103031102", //NV	
  "ORO FINO 1102-FR":             "010303110A", //NV	
  "ORO FINO 1102-Pdse":           "010303110B", //NV	
  "ORO FINO 1102-Pdse-USFS":      "010303110F", //NV	
  "GREENVILLE 0401":              "0103040401", //NV	
  "GREENVILLE 1101":              "0103041101", //NV	
  "NORD 1103":                    "0103071103", //NV	
  "NORD 1104":                    "0103071104", //NV	
  "NORD 1105":                    "0103071105", //NV	
  "NORD 1106":                    "0103071106", //NV	
  "BUTTE 1103":                   "0103081103", //NV	
  "BUTTE 1104":                   "0103081104", //NV	
  "BUTTE 1105":                   "0103081105", //NV	
  "BUTTE 1106":                   "0103081106", //NV	
  "BUTTE 1107":                   "0103081107", //NV	
  "CLARK ROAD 1102-Chrkee":       "0103091102", //NV	
  "CLARK ROAD 1102-ButtVly":      "010309110A", //NV	
  "SPANISH CREEK 4401":           "0103104401", //NV	
  "CRESCENT MILLS. 2101":         "0103132101", //NV	
  "LOGAN CREEK 2101":             "0103142101", //NV	
  "LOGAN CREEK 2102":             "0103142102", //NV	
  "LOGAN CREEK 2103":             "0103142103", //NV	
  "CHESTER 1101":                 "0103181101", //NV	
  "CHESTER 1102":                 "0103181102", //NV	
  "BANGOR 1101":                  "0103191101", //NV	& SI
  "CHALLENGE 1101":               "0103201101", //NV	
  "CHALLENGE 1101- USFS":         "010320110A", //NV	
  "CHALLENGE 1102-USFS":          "010320110D", //NV	
  "HONCUT 1101":                  "0103211101", //NV	& SI 
  "HONCUT 1102":                  "0103211102", //NV	& SI 
  "KANAKA 1101-FEATHERFLS":       "0103221101", //NV	
  "KANAKA 1101-RBNSNMILL":        "010322110A", //NV	
  "KANAKA 1101-RBNSNML-USFS":     "010322110D", //NV	
  "PEACHTON 1101":                "0103241101", //NV	
  "PEACHTON 1102":                "0103241102", //NV	
  "PEACHTON 1103":                "0103241103", //NV	
  "TRES VIAS 1101":               "0103251101", //NV	
  "ANDERSON 1101":                "0103261101", //NV	
  "ANDERSON 1102":                "0103261102", //NV	
  "ANDERSON 1103":                "0103261103", //NV	
  "ANTLER 1101":                  "0103271101", //NV	
  "BOGARD 1101":                  "0103301101", //NV	
  "BURNEY 1101":                  "0103311101", //NV	
  "BURNEY 1102":                  "0103311102", //NV	
  "CEDAR CREEK 1101":             "0103321101", //NV	
  "CORNING 0401":                 "0103330401", //NV	
  "CORNING 0402":                 "0103330402", //NV	
  "CORNING 1101":                 "0103331101", //NV	
  "CORNING 1102":                 "0103331102", //NV	
  "CORNING 1103":                 "0103331103", //NV	
  "CORNING 1104":                 "0103331104", //NV	
  "DAIRYVILLE 1101":              "0103341101", //NV	
  "DESCHUTES 1101":               "0103351101", //NV	
  "FRENCH GULCH 1101":            "0103381101", //NV	
  "FRENCH GULCH 1102":            "0103381102", //NV	
  "GERBER 1101":                  "0103391101", //NV	
  "GERBER 1102":                  "0103391102", //NV	
  "GIRVAN 1101":                  "0103401101", //NV	
  "GIRVAN 1102":                  "0103401102", //NV	
  "JESSUP 1101":                  "0103441101", //NV	
  "JESSUP 1102":                  "0103441102", //NV	
  "JESSUP 1103":                  "0103441103", //NV	
  "KESWICK 1101":                 "0103451101", //NV	
  "PANORAMA 1101":                "0103461101", //NV	
  "PANORAMA 1102":                "0103461102", //NV	
  "LOS MOLINOS 1101":             "0103481101", //NV	
  "LOS MOLINOS 1102":             "0103481102", //NV	
  "MC ARTHUR 1101":               "0103491101", //NV	
  "MC ARTHUR 1102":               "0103491102", //NV	
  "PIT NO.7 1101":                "0103501101", //NV	
  "OREGON TRAIL 1102":            "0103521102", //NV	
  "OREGON TRAIL 1103":            "0103521103", //NV	
  "OREGON TRAIL 1104":            "0103521104", //NV	
  "RAWSON 1103":                  "0103531103", //NV	
  "RED BLUFF 1101":               "0103541101", //NV	
  "RED BLUFF 1102":               "0103541102", //NV	
  "RED BLUFF 1103":               "0103541103", //NV	
  "RED BLUFF 1104":               "0103541104", //NV	
  "RED BLUFF 1105":               "0103541105", //NV	
  "RISING RIVER 1101":            "0103551101", //NV	
  "STILLWATER STATION 1101":      "0103561101", //NV	
  "STILLWATER STATION 1102":      "0103561102", //NV	
  "TYLER 1103":                   "0103571103", //NV	
  "TYLER 1104":                   "0103571104", //NV	
  "TYLER 1105":                   "0103571105", //NV	
  "VINA 1101":                    "0103581101", //NV	
  "WHITMORE 1101":                "0103601101", //NV	
  "WILDWOOD 1101":                "0103611101", //NV	
  "PIT NO 1 1101":                "0103721101", //NV	
  "PIT NO 3 1101":                "0103731101", //NV	
  "I 5 Corridor":                 "010HW05001", //NV	
  "Oroville D.C":                 "010HW05002", //NV	
  "Hwy 99":                       "010HW09901", //NV	
  "Hwy 162":                      "010HW16201", //NV	
  "RED BLUFF HWY 99":             "010HW99001", //NV	
  "CHICO HIGHWAYS":               "010HWCH001", //NV	
  "RED BLUFF ORCHARDS":           "010OR00001", //NV	
  "CHICO Orchards":               "010OR00002", //NV	
  "SUMMER ORCHARDS":              "010OR00003", //NV	
  "GLENN ORCHARDS":               "010OR00004", //NV	
  "Red Bluff Summer Orchards":    "010OR00005", //NV	
  "TRAN - NV 60Kv":               "TR01006001", //NV	
  "TRAN - NV 70Kv":               "TR01007001", //NV	
  "TRAN - NV 115Kv":              "TR01011501", //NV	
  "TRAN - NV 230Kv":              "TR01023001", //NV	
  "TRAN - NV 500Kv":              "TR01050001", //NV	
  "CR-ButteCoLine to Big Bend":   "TRC1000101", //NV	
  "CR-Big Bend to Cresta":        "TRC1000102", //NV	
  "CR-Cresta to Rock Creek":      "TRC1000103", //NV	
  "CR-Rock Creek to Belden":      "TRC1000104", //NV	
  "CR-Belden to Caribou":         "TRC1000105", //NV	
  "CR-Tbl Mtn Sub to Lk Orvll":   "TRC1000106", //NV	
  "CR-Pit1 to Burney":            "TRC1000107", //NV	
  "CR-Pit 3":                     "TRC1000108", //NV	
  "CR-Burney to Round Mtn":       "TRC1000109", //NV	
  "CR-Pit5 to Round Mtn":         "TRC1000110", //NV	
  "CR-Cottonwood to Glen":        "TRC1000111", //NV	
  "CR-Cascade to Lakehead":       "TRC1000112", //NV	
  "CR-Whiskytown to Cottonwood":  "TRC1000113", //NV	
  "CR-GCS to Big Flat":           "TRC1000114", //NV	
  "CR-Glen to Colusa County":     "TRC1000115", //NV	
  "CR-Palermo Sub to Yuba Cnty":  "TRC1000116", //NV	
  "CR-Twain to Elizabeth Town":   "TRC1000117", //NV	
  "CR-Table Mtn to Sutter Cnty":  "TRC1000118", //NV	
  "CR-Round Mtn-Cottonwood":      "TRC1000119", //NV	
  "CR-Paradise-Butte-BigBend":    "TRC1000120", //NV	
  "CR-Sycamore-Butte-TableMtn":   "TRC1000121", //NV	
  "CR-Colgate-Rio Oso":           "TRC1000122", //NV	
  "CR-Round Mtn 500kV North":     "TRC1000123", //NV	
  "CR-Round Mtn 500kV South":     "TRC1000124", //NV	
  "CR-Transmission Orchards":     "TRC1000125", //NV	
  "CR-Chico Three":               "TRC1000126", //NV	
  "CR-Quincy Loop":               "TRC1000127", //NV	
  "CR-Cottonwood 60kV":           "TRC1000128", //NV	
  "CR-Glenn 60kV":                "TRC1000129", //NV	
  "CR-S Fork Feather":            "TRC1000130", //NV	
  "CR-Lake Almanor":              "TRC1000131", //NV	
  "CR-Oroville Taps":             "TRC1000132", //NV	
  "CR-Butte Creek Canyon":        "TRC1000133", //NV	
  "CR-Kilarc to Bullskin Ridge":  "TRC1000134", //NV	
  "CR-Battle Creek Valley":       "TRC1000135", //NV	
  "CR-North Valley LOP":          "TRC1000136", //NV	
  "CR-Browns Mountain":           "TRC1000137", //NV	
  "CR-S Fork Trinity":            "TRC1000138", //NV	
  "CR-Round Table Mtn":           "TRC1000142", //NV	
  "CR-Cottonwood to Colusa":      "TRC1000201", //NV	
  "CR-DWR LINES IN OROVILLE":     "TRC1000301", //NV	
  "CR-Aerial Patrol NV":             "TRC3141111", //NV	
  "SUBSTATION H 0401":            "0022100401", //PE	& SF
  "SUBSTATION H 0402":            "0022100402", //PE	& SF
  "SUBSTATION H 0403":            "0022100403", //PE	
  "SUBSTATION H 0404":            "0022100404", //PE	& SF
  "SUBSTATION H 0405":            "0022100405", //PE	& SF
  "SUBSTATION H 1101":            "0022101101", //PE	& SF
  "BELMONT 1109":                 "0022401109", //PE	
  "BELMONT 1111":                 "0022401111", //PE	
  "LAWNDALE 0401":                "0022440401", //PE	
  "LAWNDALE 0402":                "0022440402", //PE	
  "ACTON 0401":                   "0022470401", //PE	& SF
  "ACTON 0402":                   "0022470402", //PE	& SF
  "EAST GRAND 0401":              "0022570401", //PE	
  "EAST GRAND 0404":              "0022570404", //PE	
  "EAST GRAND 1101":              "0022571101", //PE	
  "EAST GRAND 1102":              "0022571102", //PE	
  "EAST GRAND 1103":              "0022571103", //PE	
  "EAST GRAND 1104":              "0022571104", //PE	
  "EAST GRAND 1105":              "0022571105", //PE	
  "EAST GRAND 1106":              "0022571106", //PE	
  "EAST GRAND 1107":              "0022571107", //PE	
  "EAST GRAND 1108":              "0022571108", //PE	
  "EAST GRAND 1109":              "0022571109", //PE	
  "EAST GRAND 1110":              "0022571110", //PE	
  "EAST GRAND 1111":              "0022571111", //PE	
  "EAST GRAND 1112":              "0022571112", //PE	
  "EAST GRAND 1113":              "0022571113", //PE	
  "EAST GRAND 1114":              "0022571114", //PE	
  "WESTLAKE 0401":                "0022600401", //PE	
  "WESTLAKE 0402":                "0022600402", //PE	
  "WESTLAKE 0403":                "0022600403", //PE	& SF
  "DALY CITY 0401":               "0022640401", //PE	
  "DALY CITY 1101":               "0022641101", //PE	& SF
  "DALY CITY 1102":               "0022641102", //PE	
  "DALY CITY 1103":               "0022641103", //PE	
  "DALY CITY 1104":               "0022641104", //PE	
  "DALY CITY 1105":               "0022641105", //PE	
  "DALY CITY 1106":               "0022641106", //PE	& SF
  "DALY CITY 1107":               "0022641107", //PE	& SF
  "DALY CITY 1108":               "0022641108", //PE	
  "DALY CITY 1109":               "0022641109", //PE	& SF 
  "DALY CITY 1110":               "0022641110", //PE	
  "DALY CITY 1111":               "0022641111", //PE  & SF
  "DALY CITY 1112":               "0022641112", //PE	
  "PLYMOUTH 0401":                "0022680401", //PE	& SF
  "MILLBRAE 0401":                "0022690401", //PE	
  "MILLBRAE 0403":                "0022690403", //PE	
  "MILLBRAE 0404":                "0022690404", //PE	
  "MILLBRAE 1101":                "0022691101", //PE	
  "MILLBRAE 1102":                "0022691102", //PE	
  "MILLBRAE 1103":                "0022691103", //PE	
  "MILLBRAE 1104":                "0022691104", //PE	
  "MILLBRAE 1105":                "0022691105", //PE	
  "MILLBRAE 1106":                "0022691106", //PE	
  "MILLBRAE 1107":                "0022691107", //PE	
  "MILLBRAE 1108":                "0022691108", //PE	
  "SAN BRUNO 0401":               "0022700401", //PE	
  "SAN BRUNO 0402":               "0022700402", //PE	
  "SAN BRUNO 0403":               "0022700403", //PE	
  "SNEATH LANE 1101":             "0022721101", //PE	
  "SNEATH LANE 1102":             "0022721102", //PE	
  "SNEATH LANE 1106":             "0022721106", //PE	
  "SNEATH LANE 1107":             "0022721107", //PE	
  "PACIFICA 1101":                "0022811101", //PE	
  "PACIFICA 1102":                "0022811102", //PE	
  "PACIFICA 1103":                "0022811103", //PE	
  "PACIFICA 1104":                "0022811104", //PE	
  "SULLIVAN 0402":                "0022850402", //PE	
  "SERRAMONTE 1103":              "0022861103", //PE	
  "SERRAMONTE 1104":              "0022861104", //PE	
  "AIRPORT 1101":                 "0022901101", //PE	
  "AIRPORT 1129":                 "0022901129", //PE	
  "BAY MEADOWS 1102":             "0024011102", //PE	
  "BAY MEADOWS 1103":             "0024011103", //PE	
  "BAY MEADOWS 1104":             "0024011104", //PE	
  "BAY MEADOWS 1105":             "0024011105", //PE	
  "BAY MEADOWS 1106":             "0024011106", //PE	
  "BAY MEADOWS 1107":             "0024011107", //PE	
  "BAY MEADOWS 1108":             "0024011108", //PE	
  "BAY MEADOWS 2101":             "0024012101", //PE	
  "BAY MEADOWS 2102":             "0024012102", //PE	
  "BAY MEADOWS 2103":             "0024012103", //PE	
  "BELL HAVEN 0401":              "0024020401", //PE	
  "BELL HAVEN 0402":              "0024020402", //PE	
  "BELL HAVEN 0403":              "0024020403", //PE	
  "BELL HAVEN 0404":              "0024020404", //PE	
  "BELL HAVEN 0405":              "0024020405", //PE	
  "BELL HAVEN 0406":              "0024020406", //PE	
  "BELL HAVEN 0407":              "0024020407", //PE	
  "BELL HAVEN 0408":              "0024020408", //PE	
  "BELL HAVEN 0409":              "0024020409", //PE	
  "BELL HAVEN 1101":              "0024021101", //PE	
  "BELL HAVEN 1102":              "0024021102", //PE	
  "BELL HAVEN 1103":              "0024021103", //PE	
  "BELL HAVEN 1104":              "0024021104", //PE	
  "BELL HAVEN 1105":              "0024021105", //PE	
  "BELL HAVEN 1106":              "0024021106", //PE	
  "BELL HAVEN 1107":              "0024021107", //PE	
  "BELMONT 0401":                 "0024030401", //PE	
  "BELMONT 0402":                 "0024030402", //PE	
  "BELMONT 0403":                 "0024030403", //PE	
  "BELMONT 0406":                 "0024030406", //PE	
  "BELMONT 1102":                 "0024031102", //PE	
  "BELMONT 1103":                 "0024031103", //PE	
  "BELMONT 1104":                 "0024031104", //PE	
  "BELMONT 1105":                 "0024031105", //PE	
  "BELMONT 1106":                 "0024031106", //PE	
  "BELMONT 1107":                 "0024031107", //PE	
  "BELMONT 1108":                 "0024031108", //PE	
  "BELMONT 1110":                 "0024031110", //PE	
  "BERESFORD 0401":               "0024040401", //PE	
  "BERESFORD 0402":               "0024040402", //PE	
  "BERESFORD 0403":               "0024040403", //PE	
  "BERESFORD 0404":               "0024040404", //PE	
  "BERESFORD 0405":               "0024040405", //PE	
  "BURLINGAME 0401":              "0024050401", //PE	
  "BURLINGAME 0402":              "0024050402", //PE	
  "BURLINGAME 0403":              "0024050403", //PE	
  "BURLINGAME 0404":              "0024050404", //PE	
  "BURLINGAME 0405":              "0024050405", //PE	
  "BURLINGAME 2101":              "0024052101", //PE	
  "CAROLANDS 0401":               "0024060401", //PE	
  "CAROLANDS 0402":               "0024060402", //PE	
  "CAROLANDS 0403":               "0024060403", //PE	
  "CAROLANDS 0404":               "0024060404", //PE	
  "EMERALD LAKE 0401":            "0024080401", //PE	
  "EMERALD LAKE 0402":            "0024080402", //PE	
  "GLENWOOD 0404":                "0024090404", //PE	
  "GLENWOOD 0405":                "0024090405", //PE	
  "GLENWOOD 0406":                "0024090406", //PE	
  "GLENWOOD 1101":                "0024091101", //PE	
  "GLENWOOD 1102":                "0024091102", //PE	
  "HALF MOON BAY 1101":           "0024101101", //PE	
  "HALF MOON BAY 1102":           "0024101102", //PE	
  "HALF MOON BAY 1103":           "0024101103", //PE	
  "HILLSDALE 0401":               "0024110401", //PE	
  "HILLSDALE 0402":               "0024110402", //PE	
  "HILLSDALE 0403":               "0024110403", //PE	
  "HILLSDALE 0404":               "0024110404", //PE	
  "HILLSDALE 0405":               "0024110405", //PE	
  "LAS PULGAS 0401":              "0024120401", //PE	
  "LAS PULGAS 0402":              "0024120402", //PE	
  "LAS PULGAS 0403":              "0024120403", //PE	
  "MENLO 0401":                   "0024130401", //PE	
  "MENLO 0402":                   "0024130402", //PE	
  "MENLO 0403":                   "0024130403", //PE	
  "MENLO 0404":                   "0024130404", //PE	
  "MENLO 1101":                   "0024131101", //PE	
  "MENLO 1102":                   "0024131102", //PE	
  "MENLO 1103 PE":                   "0024131103", //PE	
  "MENLO 1104":                   "0024131104", //PE	
  "RALSTON 1101":                 "0024141101", //PE	
  "RALSTON 1102":                 "0024141102", //PE	
  "REDWOOD CITY 0402":            "0024160402", //PE	
  "REDWOOD CITY 0403":            "0024160403", //PE	
  "REDWOOD CITY 0404":            "0024160404", //PE	
  "REDWOOD CITY 0405":            "0024160405", //PE	
  "REDWOOD CITY 0406":            "0024160406", //PE	
  "REDWOOD CITY 0407":            "0024160407", //PE	
  "REDWOOD CITY 0408":            "0024160408", //PE	
  "REDWOOD CITY 0409":            "0024160409", //PE	
  "REDWOOD CITY 0410":            "0024160410", //PE	
  "REDWOOD CITY 1101":            "0024161101", //PE	
  "REDWOOD CITY 1102":            "0024161102", //PE	
  "REDWOOD CITY 1103":            "0024161103", //PE	
  "REDWOOD CITY 1104":            "0024161104", //PE	
  "REDWOOD CITY 1105":            "0024161105", //PE	
  "REDWOOD CITY 1106":            "0024161106", //PE	
  "SAN CARLOS 0401":              "0024180401", //PE	
  "SAN CARLOS 0402":              "0024180402", //PE	
  "SAN CARLOS 0403":              "0024180403", //PE	
  "SAN CARLOS 0404":              "0024180404", //PE	
  "SAN CARLOS 0405":              "0024180405", //PE	
  "SAN CARLOS 0406":              "0024180406", //PE	
  "SAN CARLOS 1101":              "0024181101", //PE	
  "SAN CARLOS 1102":              "0024181102", //PE	
  "SAN CARLOS 1103":              "0024181103", //PE	
  "SAN CARLOS 1104":              "0024181104", //PE	
  "SAN MATEO 0404":               "0024190404", //PE	
  "SAN MATEO 0407":               "0024190407", //PE	
  "SAN MATEO 0408":               "0024190408", //PE	
  "SAN MATEO 0409":               "0024190409", //PE	
  "SAN MATEO 0410":               "0024190410", //PE	
  "SAN MATEO 2101":               "0024192101", //PE	
  "SAN MATEO 2102":               "0024192102", //PE	
  "WATERSHED 0401":               "0024240401", //PE	
  "WATERSHED 0402":               "0024240402", //PE	
  "WOODSIDE 1101":                "0024251101", //PE	
  "WOODSIDE 1102":                "0024251102", //PE	
  "WOODSIDE 1103":                "0024251103", //PE	
  "WOODSIDE 1104":                "0024251104", //PE	
  "WOODSIDE 1105":                "0024251105", //PE	
  "BAIR 1101":                    "0024261101", //PE	
  "BAIR 1102":                    "0024261102", //PE	
  "CIRCUIT: 27777777":            "0027777777", //PE	
  "ALPINE-MENLO":                 "0028881103", //PE	
  "CIRCUIT: 29991199":            "0029991199", //PE	
  "TRAN - PE 60Kv":               "TR00206001", //PE	
  "TRAN - PE 115Kv":              "TR00211501", //PE	
  "TRAN - PE 230Kv":              "TR00223001", //PE	
  "CR-MARTIN-SAN MATEO":          "TRC0020001", //PE	
  "CR-Ravenswood-San Mateo":      "TRC0020002", //PE	
  "CR-Bair-CLanding/Bel hav":     "TRC0020003", //PE	
  "CR-EASTSHORE-SAN MATEO":       "TRC0020004", //PE	
  "CR H-P #3 CABLE/P-X 115KV":    "TRC0020005", //PE	
  "CR-JEFFERSON-MARTIN 230KV":    "TRC0020006", //PE	
  "CR-Martin-Daly City 115kv":    "TRC0020007", //PE	
  "CR-MILLBRAE-PACIFICA":         "TRC0020008", //PE	
  "CR-Monta Vista-Jefferson":     "TRC0020009", //PE	
  "CR-Newark/Tesla-Ravenswood":   "TRC0020010", //PE	
  "CR-Jeff-Las Pulgas/Stanford":  "TRC0020011", //PE	
  "CR-Ravenswood/CLanding-PA":    "TRC0020012", //PE	
  "CR-SMateo-Bair/Bel 115/60KV":  "TRC0020013", //PE	
  "CR-SMateo-Bay Meadows 115KV":  "TRC0020014", //PE	
  "CR-CLnding-Stanf/Menlo/SLAC":  "TRC0020015", //PE	
  "CR-Serramonte/Martin 115/60KV":"TRC0020016", //PE	
  "CR-SFPUC 60 kV":               "TRC0020017", //PE	
  "CR-SFPUC 230 kV":              "TRC0020018", //PE	
  "CR-Aerial Patrol PE":          "TRC0241111", //PE	
  "COLUSA 1101":                  "0062021101", //SA	
  "COLUSA 1103":                  "0062021103", //SA	
  "COLUSA 1104":                  "0062021104", //SA	
  "COLUSA 1105":                  "0062021105", //SA	
  "WOODLAND 1101":                "0062031101", //SA	
  "WOODLAND 1102":                "0062031102", //SA	
  "WOODLAND 1103":                "0062031103", //SA	
  "WOODLAND 1104":                "0062031104", //SA	
  "WOODLAND 1105":                "0062031105", //SA	
  "WOODLAND 1106":                "0062031106", //SA	
  "WOODLAND 1107":                "0062031107", //SA	
  "WOODLAND 1108":                "0062031108", //SA	
  "WOODLAND 1109":                "0062031109", //SA	
  "WOODLAND 1110":                "0062031110", //SA	
  "WOODLAND 1111":                "0062031111", //SA	
  "WOODLAND 1112":                "0062031112", //SA	
  "WOODLAND 1113":                "0062031113", //SA	
  "DAVIS 1102":                   "0062041102", //SA	
  "DAVIS 1103":                   "0062041103", //SA	
  "DAVIS 1104":                   "0062041104", //SA	
  "DAVIS 1105":                   "0062041105", //SA	
  "DAVIS 1106":                   "0062041106", //SA	
  "DAVIS 1107":                   "0062041107", //SA	
  "DAVIS 1108":                   "0062041108", //SA	
  "DAVIS 1109":                   "0062041109", //SA	
  "DAVIS 1110":                   "0062041110", //SA	
  "DAVIS 1111":                   "0062041111", //SA	
  "Davis 1112":                   "0062041112", //SA	
  "WILLIAMS 1101":                "0062051101", //SA	
  "WILLIAMS 1102":                "0062051102", //SA	
  "DIXON 1101":                   "0062061101", //SA	
  "DIXON 1102":                   "0062061102", //SA	
  "DIXON 1103":                   "0062061103", //SA	
  "DIXON 1104":                   "0062061104", //SA	
  "COLUSA JUNCTION 1101":         "0062071101", //SA	
  "ARBUCKLE 1101":                "0062081101", //SA	
  "ARBUCKLE 1102":                "0062081102", //SA	
  "ARBUCKLE 1103":                "0062081103", //SA	
  "SUISUN 1101":                  "0062131101", //SA	
  "SUISUN 1102":                  "0062131102", //SA	
  "SUISUN 1103":                  "0062131103", //SA	
  "SUISUN 1104":                  "0062131104", //SA	
  "SUISUN 1105":                  "0062131105", //SA	
  "SUISUN 1106":                  "0062131106", //SA	
  "SUISUN 1107":                  "0062131107", //SA	
  "SUISUN 1108":                  "0062131108", //SA	
  "SUISUN 1109":                  "0062131109", //SA	
  "SUISUN 1110":                  "0062131110", //SA	
  "SUISUN 1111":                  "0062131111", //SA	
  "SUISUN 1112":                  "0062131112", //SA	
  "GRAND ISLAND 2221":            "0062462221", //SA	
  "GRAND ISLAND 2222":            "0062462222", //SA	
  "GRAND ISLAND 2223":            "0062462223", //SA	
  "GRAND ISLAND 2224":            "0062462224", //SA	
  "GRAND ISLAND 2225":            "0062462225", //SA	
  "GRAND ISLAND 2226":            "0062462226", //SA	
  "GRAND ISLAND 2227":            "0062462227", //SA	
  "MERIDIAN 1101":                "0062541101", //SA	& SI 
  "MERIDIAN 1102":                "0062541102", //SA	
  "RIO VISTA 1101":               "0062601101", //SA	
  "RYDE 0401":                    "0062620401", //SA	
  "CORDELIA 1101":                "0062701101", //SA	
  "CORDELIA 1102":                "0062701102", //SA	
  "CORDELIA 1103":                "0062701103", //SA	
  "CORDELIA 1104":                "0062701104", //SA	
  "KNIGHTS LANDING 1101":         "0062721101", //SA	
  "KNIGHTS LANDING 1102":         "0062721102", //SA	
  "WILKINS SLOUGH 1101":          "0062771101", //SA	
  "WILKINS SLOUGH 1102":          "0062771102", //SA	
  "WILKINS SLOUGH 1103":          "0062771103", //SA	
  "RICE 1101":                    "0062831101", //SA	
  "RICE 1102":                    "0062831102", //SA	
  "RICE 1103":                    "0062831103", //SA	
  "MAXWELL 1101":                 "0062881101", //SA	
  "MAXWELL 1102":                 "0062881102", //SA	
  "MAXWELL 1103":                 "0062881103", //SA	
  "CORTINA 1101":                 "0063121101", //SA	
  "WEST SACRAMENTO 1104":         "0063131104", //SA	
  "WEST SACRAMENTO 1105":         "0063131105", //SA	
  "WEST SACRAMENTO 1106":         "0063131106", //SA	
  "WEST SACRAMENTO 1107":         "0063131107", //SA	
  "WEST SACRAMENTO 1108":         "0063131108", //SA	
  "WEST SACRAMENTO 1109":         "0063131109", //SA	
  "WEST SACRAMENTO 1110":         "0063131110", //SA	
  "WEST SACRAMENTO 1111":         "0063131111", //SA	
  "MADISON 1103":                 "0063171103", //SA	
  "MADISON 1105":                 "0063171105", //SA	
  "MADISON 2101":                 "0063172101", //SA	
  "ZAMORA 1105":                  "0063191105", //SA	
  "ZAMORA 1106":                  "0063191106", //SA	
  "WINTERS 1101":                 "0063321101", //SA	
  "WINTERS 1102":                 "0063321102", //SA	
  "PLAINFIELD 1101":              "0063441101", //SA	
  "PLAINFIELD 1102":              "0063441102", //SA	
  "VACA DIXON 1101":              "0063591101", //SA	
  "VACA DIXON 1103":              "0063591103", //SA	
  "VACA DIXON 1104":              "0063591104", //SA	
  "Vaca Dixon 1106":              "0063591106", //SA	
  "VACAVILLE 1102":               "0063601102", //SA	
  "VACAVILLE 1103":               "0063601103", //SA	
  "VACAVILLE 1104":               "0063601104", //SA	
  "VACAVILLE 1105":               "0063601105", //SA	
  "VACAVILLE 1106":               "0063601106", //SA	
  "VACAVILLE 1107":               "0063601107", //SA	
  "VACAVILLE 1108":               "0063601108", //SA	
  "VACAVILLE 1109":               "0063601109", //SA	
  "VACAVILLE 1110":               "0063601110", //SA	
  "VACAVILLE 1111":               "0063601111", //SA	
  "VACAVILLE 1112":               "0063601112", //SA	
  "DEEPWATER 1108":               "0063621108", //SA	
  "DEEPWATER 1109":               "0063621109", //SA	
  "PEABODY 2104":                 "0063642104", //SA	
  "PEABODY 2105":                 "0063642105", //SA	
  "PEABODY 2106":                 "0063642106", //SA	
  "PEABODY 2107":                 "0063642107", //SA	
  "PEABODY 2108":                 "0063642108", //SA	
  "PEABODY 2113":                 "0063642113", //SA	
  "PUTAH CREEK 1102":             "0063681102", //SA	
  "PUTAH CREEK 1103":             "0063681103", //SA	
  "JAMESON 1101":                 "0063801101", //SA	
  "JAMESON 1102":                 "0063801102", //SA	
  "JAMESON 1103":                 "0063801103", //SA	
  "DUNNIGAN 1101":                "0063811101", //SA	
  "I-5 (Woodland to Maxwell)":    "006HW00501", //SA	
  "Hy 12 (Napa to Bouldin Is)":   "006HW01201", //SA	
  "Hy 16 (Rusmey to Woodland)":   "006HW01601", //SA	
  "Hy 20 (Walnut Rd to Tarke)":   "006HW02001", //SA	
  "Hy 45 (4 Cnrs - Knights Ld)":  "006HW04501", //SA	
  "Hy 80 (Napa to Hy 505)":       "006HW08001", //SA	
  "Hy 80 (505 to W.Sac.)":        "006HW08002", //SA	
  "Hy 84 (RioVista to W.Sac.)":   "006HW08401", //SA	
  "Hwy 12-80 Dixon":              "006HW11301", //SA	
  "Hy 113 (80 to Knights Land)":  "006HW11302", //SA	
  "Hy 113 (Dixon to Hwy 12)":     "006HW11303", //SA	
  "Hy 128 (505 to Napa Co.)":     "006HW12801", //SA	
  "Hy 160 (Antioch Brdg-Rd142)":  "006HW16001", //SA	
  "Hy 162 (4Cnrs - Aqua Frias)":  "006HW16201", //SA	
  "Hy 220 (Ryde to Hy 84)":       "006HW22001", //SA	
  "Hy 505 (Hy 80 to I-5)":        "006HW50501", //SA	
  "Hy 680 (80 to Cyn Hills)":     "006HW68001", //SA	
  "Orchards Yolo County":         "006OR00000", //SA	
  "Orchards Colusa County":       "006OR00001", //SA	
  "Orchards Solano County":       "006OR00002", //SA	
  "Sac Duck Clubs":               "006OR00003", //SA	
  "Sac Refuges":                  "006OR00004", //SA	
  "Orchard":                      "006OR11301", //SA	
  "CHALLENGE 1102":               "0103201102", //SA	& SI & NV
  "HONCUT 1102-A":                "010321110A", //SA	& SI 
  "HONCUT 1102-B":                "010321110B", //SA	& SI 
  "MARYSVILLE 1102":              "0152011102", //SA	& SI
  "MARYSVILLE 1103":              "0152011103", //SA	& SI
  "MARYSVILLE 1104":              "0152011104", //SA	& SI
  "MARYSVILLE 1105":              "0152011105", //SA	& SI
  "MARYSVILLE 1106":              "0152011106", //SA	& SI
  "MARYSVILLE 1107":              "0152011107", //SA	& SI
  "BARRY 1101":                   "0152111101", //SA	& SI
  "BARRY 1102":                   "0152111102", //SA	& SI	
  "BARRY 1103":                   "0152111103", //SA 	& SI
  "EAST NICOLAUS 1101":           "0152151101", //SA	& SI
  "EAST NICOLAUS 1102":           "0152151102", //SA	& SI
  "EAST NICOLAUS 1103":           "0152151103", //SA	& SI
  "EAST MARYSVILLE 1105":         "0152331105", //SA	& SI
  "EAST MARYSVILLE 1107":         "0152331107", //SA	& SI
  "EAST MARYSVILLE 1108":         "0152331108", //SA	& SI
  "WHEATLAND 1101":               "0152811101", //SA	& SI
  "WHEATLAND 1102":               "0152811102", //SA	& SI
  "HARTER 1102":                  "0152851102", //SA	& SI
  "HARTER 1105":                  "0152851105", //SA	& SI
  "HARTER 1106":                  "0152851106", //SA	& SI
  "HARTER 1107":                  "0152851107", //SA	& SI
  "OLIVEHURST 1101":              "0152901101", //SA	& SI
  "OLIVEHURST 1102":              "0152901102", //SA	& SI
  "OLIVEHURST 1103":              "0152901103", //SA	& SI
  "OLIVEHURST 1104":              "0152901104", //SA	& SI
  "BROWNS VALLEY 1101":           "0152921101", //SA	& SI
  "LINCOLN 1102":                 "0153701102", //SA	& SI
  "LINCOLN 1103":                 "0153701103", //SA	& SI
  "LINCOLN 1105":                 "0153701105", //SA	& SI
  "LINCOLN 1101-B":               "015370110B", //SA	& SI
  "TUDOR 1101":                   "0153711101", //SA	& SI
  "TUDOR 1102":                   "0153711102", //SA	& SI
  "PLUMAS 1101":                  "0153731101", //SA	& SI
  "PLUMAS 1102":                  "0153731102", //SA	& SI
  "DOBBINS 1101":                 "0153741101", //SA	& SI
  "PEASE 1101":                   "0153751101", //SA	& SI
  "PEASE 1102":                   "0153751102", //SA	& SI
  "PEASE 1103":                   "0153751103", //SA	& SI
  "PEASE 1104":                   "0153751104", //SA	& SI
  "CATLETT 1101":                 "0153761101", //SA	& SI
  "CATLETT 1102":                 "0153761102", //SA	& SI
  "LIVE OAK 1101":                "0153771101", //SA	& SI
  "LIVE OAK 1102":                "0153771102", //SA	& NV & SI
  "BOGUE 1103":                   "0153781103", //SA	& SI
  "BOGUE 1104":                   "0153781104", //SA	& SI
  "BOGUE 1105":                   "0153781105", //SA	& SI
  "BOGUE 1106":                   "0153781106", //SA	& SI
  "BOGUE 1107":                   "0153781107", //SA	& SI
  "SMARTVILLE 1101":              "0153791101", //SA	& SI
  "Hwy 20 (GV to Msvl)":          "015HW02001", //SA	& SI
  "Hwy 20 (YC West Bndry)":       "015HW02002", //SA	& SI
  "Hwy 65 (70 Split to Linc)":    "015HW06501", //SA	& SI
  "Hwy 70 (Msvl South Bndry)":    "015HW07001", //SA	& SI
  "Hwy 70 (Msvl North Bndry)":    "015HW07002", //SA	& SI
  "Hwy 99 (YC South to Bndry":    "015HW09901", //SA	& SI
  "Hwy 99 (YC North Bndry)":      "015HW09902", //SA	& SI
  "Hwy 113 (99 South Bndry)":     "015HW11301", //SA	& SI
  "Orchards":                     "015OR10001", //SA	& SI 
  "Colgate Duck Club":            "015OR10002", //SA	& SI
  "Colgate Summer Orchards":      "015OR10003", //SA	& SI
  "Colgate Cycle Busters":        "015OR10004", //SA	& SI
  "TRAN - SA 60Kv":               "TR00606001", //SA	
  "TRAN - SA 70Kv":               "TR00607001", //SA	
  "TRAN - SA 115Kv":              "TR00611501", //SA	
  "TRAN - SA 230Kv":              "TR00623001", //SA	
  "TRAN - SA 500Kv":              "TR00650001", //SA	
  "CR-Rices Xing - Colgate PH SA":   "TRC0151006", //SA	
  "CR-Butte Cnty-Nicolaus Sub SA":   "TRC0151007", //SA	
  "CR-Butte Cnty-Rio Oso Sub SA":    "TRC0151008", //SA	
  "CR-BEALE AFB":                 "TRC0151010", //SA	& SI 
  "CR-Smartville":                "TRC0151011", //SA	& SI
  "CR-Nicolaus":                  "TRC0151012", //SA	& SI 
  "CR-Green Pease":               "TRC0151015", //SA	& SI 
  "CR-Wheatland":                 "TRC0151016", //SA	& SI 
  "CR-Rio Oso Orchards":          "TRC0151023", //SA	& SI
  "CR-Nicolaus Orchards":         "TRC0151024", //SA	& SI
  "CR-Yuba Sutter Orchards":      "TRC0151025", //SA	& SI
  "CR-Halsey To Rio Oso":         "TRC0151028", //SA	& SI
  "CR-Table Mtn Vaca":            "TRC0160055", //SA	
  "CR-Delevan TM Vaca":           "TRC0160056", //SA	
  "CR-Eagle Cortina Mendo":       "TRC0160057", //SA	
  "CR-Rio Oso Nicolaus":          "TRC0160058", //SA	
  "CR-Dixon Vaca":                "TRC0160059", //SA	
  "CR-Palermo Bogue RO":          "TRC0160060", //SA	
  "CR-Palermo Pease RO":          "TRC0160061", //SA	
  "CR-RO West Sac":               "TRC0160062", //SA	
  "CR-Poe Cresta RO":             "TRC0160063", //SA	
  "CR-Pease RO Nic Bogue":        "TRC0160064", //SA	
  "CR-Vaca Bahia Pkwy":           "TRC0160065", //SA	
  "CR-Nic Smartville":            "TRC0160066", //SA	
  "CR-Howe":                      "TRC0611001", //SA	
  "CR-Folsom":                    "TRC0611002", //SA	
  "CR-Vaca Sub":                  "TRC0611003", //SA	
  "CR-CORDELIA":                  "TRC0611004", //SA	
  "CR-Vaca Telsa":                "TRC0611005", //SA	
  "CR-Glen Vaca":                 "TRC0611006", //SA	
  "CR-Rio-Bend":                  "TRC0611007", //SA	
  "CR-DAVIS-VACA":                "TRC0611008", //SA	
  "CR-Woodland 115Kv":            "TRC0611009", //SA	
  "CR-South Sac":                 "TRC0611010", //SA	
  "CR-West Sac":                  "TRC0611011", //SA	
  "CR-Aerial Patrol SA":            "TRC0611111", //SA	
  "CR-Colusa - Cortina":          "TRC0611113", //SA	
  "CR-Putah Creek":               "TRC0611114", //SA	
  "CR-Colusa Almonds":            "TRC0611115", //SA	
  "CR-Colusa Walnuts":            "TRC0611116", //SA	
  "CR-Yolo Almonds":              "TRC0611117", //SA	
  "CR-Yolo Walnuts":              "TRC0611118", //SA	
  "CR-Sac Solano Almonds":        "TRC0611119", //SA	
  "CR-Sac Solano Walnuts":        "TRC0611120", //SA	
  "CR-Brighton 115kv":            "TRC0611121", //SA	
  "CR-Rio Del Paso":              "TRC0611122", //SA	
  "CR-Cortina Mendocino":         "TRC0611123", //SA	
  "CR-Elk Grove to Grand Islnd":  "TRC0611124", //SA	
  "CR-Transmission Almond":       "TRCOR06101", //SA	
  "CR-Transmission Walnut":       "TRCOR06102", //SA	
  "TRANSMISSION ORCHARD":         "TRCOR10001", //SA	& SI
  "MISSION 0401":                 "0022010401", //SF	
  "MISSION 0402":                 "0022010402", //SF	
  "MISSION 1101":                 "0022011101", //SF	
  "MISSION 1107":                 "0022011107", //SF	
  "MISSION 1108":                 "0022011108", //SF	
  "MISSION 1109":                 "0022011109", //SF	
  "MISSION 1110":                 "0022011110", //SF	
  "MISSION 1113":                 "0022011113", //SF	
  "MISSION 1116":                 "0022011116", //SF	
  "MISSION 1118":                 "0022011118", //SF	
  "MISSION 1120":                 "0022011120", //SF	
  "MISSION 1124":                 "0022011124", //SF	
  "MISSION 1125":                 "0022011125", //SF	
  "A 1101":                       "0022031101", //SF	
  "A 1102":                       "0022031102", //SF	
  "A 1103":                       "0022031103", //SF	
  "A 1104":                       "0022031104", //SF	
  "A 1105":                       "0022031105", //SF	
  "A 1106":                       "0022031106", //SF	
  "A 1107":                       "0022031107", //SF	
  "A 1108":                       "0022031108", //SF	
  "A 1109":                       "0022031109", //SF	
  "A 1110":                       "0022031110", //SF	
  "A 1111":                       "0022031111", //SF	
  "A 1112":                       "0022031112", //SF	
  "A 1113":                       "0022031113", //SF	
  "A 1114":                       "0022031114", //SF	
  "A 1115":                       "0022031115", //SF	
  "A 1116":                       "0022031116", //SF	
  "A 1117":                       "0022031117", //SF	
  "A 1118":                       "0022031118", //SF	
  "A 1119":                       "0022031119", //SF	
  "SUBSTATION E 0401":            "0022070401", //SF	
  "SUBSTATION E 0402":            "0022070402", //SF	
  "SUBSTATION E 0403":            "0022070403", //SF	
  "SUBSTATION E 0405":            "0022070405", //SF	
  "SUBSTATION E 0406":            "0022070406", //SF	
  "SUBSTATION E 0407":            "0022070407", //SF	
  "SUBSTATION E 0408":            "0022070408", //SF	
  "SUBSTATION E 0409":            "0022070409", //SF	
  "SUBSTATION E 0410":            "0022070410", //SF	
  "SUBSTATION E 1101":            "0022071101", //SF	
  "SUBSTATION E 1103":            "0022071103", //SF	
  "SUBSTATION E 1105":            "0022071105", //SF	
  "SUBSTATION G 0401":            "0022090401", //SF	
  "SUBSTATION G 0402":            "0022090402", //SF	
  "SUBSTATION G 0403":            "0022090403", //SF	
  "SUBSTATION G 0404":            "0022090404", //SF	
  "SUBSTATION G 0405":            "0022090405", //SF	
  "SUBSTATION G 0406":            "0022090406", //SF	
  "SUBSTATION G 0407":            "0022090407", //SF	
  "SUBSTATION G 0408":            "0022090408", //SF	
  "SUBSTATION G 0409":            "0022090409", //SF	
  "SUBSTATION G 0410":            "0022090410", //SF	
  "SUBSTATION G 0411":            "0022090411", //SF	
  "SUBSTATION G 0412":            "0022090412", //SF	
  "SUBSTATION G 0413":            "0022090413", //SF	
  "SUBSTATION G 0414":            "0022090414", //SF	
  "SUBSTATION G 1101 SF":            "0022091101", //SF	
  "SUBSTATION G 1102 SF":            "0022091102", //SF	
  "SUBSTATION H 1110":            "0022101110", //SF	
  "SUBSTATION H 1111":            "0022101111", //SF	
  "SUBSTATION I 0409":            "0022110409", //SF	
  "SUBSTATION I 1102":            "0022111102", //SF	
  "SUBSTATION I 1103":            "0022111103", //SF	
  "SUBSTATION K 0401":            "0022130401", //SF	
  "SUBSTATION K 0402":            "0022130402", //SF	
  "SUBSTATION K 0403":            "0022130403", //SF	
  "SUBSTATION K 0404":            "0022130404", //SF	
  "SUBSTATION K 0405":            "0022130405", //SF	
  "SUBSTATION K 0406":            "0022130406", //SF	
  "SUBSTATION K 0407":            "0022130407", //SF	
  "SUBSTATION K 0408":            "0022130408", //SF	
  "SUBSTATION K 0409":            "0022130409", //SF	
  "SUBSTATION K 0410":            "0022130410", //SF	
  "SUBSTATION K 0411":            "0022130411", //SF	
  "SUBSTATION K 1101 SF":            "0022131101", //SF	
  "SUBSTATION J 0402":            "0022220402", //SF	
  "SUBSTATION J 0404":            "0022220404", //SF	
  "SUBSTATION J 0406":            "0022220406", //SF	
  "SUBSTATION J 0407":            "0022220407", //SF	
  "SUBSTATION J 0409 SF":            "0022220409", //SF	
  "SUBSTATION J 1101 SF":            "0022221101", //SF	
  "SUBSTATION J 1102 SF":            "0022221102", //SF	
  "SUBSTATION J 1105 SF":            "0022221105", //SF	
  "SUBSTATION J 1106 SF":            "0022221106", //SF	
  "SUBSTATION J 1107":            "0022221107", //SF	
  "SUBSTATION L 0401 SF":            "0022260401", //SF	
  "SUBSTATION L 0402":            "0022260402", //SF	
  "SUBSTATION L 0403":            "0022260403", //SF	
  "SUBSTATION L 0404":            "0022260404", //SF	
  "SUBSTATION L 0405 SF":            "0022260405", //SF	
  "SUBSTATION L 0406 SF":            "0022260406", //SF	
  "SUBSTATION L 0407 SF":            "0022260407", //SF	
  "SUBSTATION L 0408 SF":            "0022260408", //SF	
  "SUBSTATION L 0409 SF":            "0022260409", //SF	
  "SUBSTATION L 1101 SF":            "0022261101", //SF	
  "SUBSTATION L 1102 SF":            "0022261102", //SF	
  "SUBSTATION L 1103":            "0022261103", //SF	
  "SUBSTATION M 0401":            "0022270401", //SF	
  "SUBSTATION M 0402":            "0022270402", //SF	
  "SUBSTATION M 0403":            "0022270403", //SF	
  "SUBSTATION M 0404":            "0022270404", //SF	
  "SUBSTATION M 0405":            "0022270405", //SF	
  "SUBSTATION M 0406":            "0022270406", //SF	
  "SUBSTATION N 0401":            "0022280401", //SF	
  "SUBSTATION N 0402":            "0022280402", //SF	
  "SUBSTATION N 0403":            "0022280403", //SF	
  "SUBSTATION N 0404":            "0022280404", //SF	
  "SUBSTATION N 0405":            "0022280405", //SF	
  "SUBSTATION N 0406":            "0022280406", //SF	
  "SUBSTATION N 0408":            "0022280408", //SF	
  "SUBSTATION N 1101":            "0022281101", //SF	
  "SUBSTATION N 1102":            "0022281102", //SF	
  "HUNTERS POINT-COMMON 1101":    "0022331101", //SF	
  "HUNTERS POINT-COMMON 1102":    "0022331102", //SF	
  "HUNTERS POINT-COMMON 1103":    "0022331103", //SF	
  "HUNTERS POINT-COMMON 1104":    "0022331104", //SF	
  "HUNTERS POINT-COMMON 1105":    "0022331105", //SF	
  "HUNTERS POINT-COMMON 1106":    "0022331106", //SF	
  "HUNTERS POINT-COMMON 1109":    "0022331109", //SF	
  "HUNTERS POINT-COMMON 1188":    "0022331188", //SF	
  "HUNTERS POINT-COMMON 1243":    "0022331243", //SF	
  "HUNTERS POINT-COMMON 1244":    "0022331244", //SF	
  "HUNTERS POINT-COMMON 1245":    "0022331245", //SF	
  "BEACH STREET 0401":            "0022340401", //SF	
  "BEACH STREET 0402":            "0022340402", //SF	
  "18TH STREET 0401":             "0022390401", //SF	
  "18TH STREET 0402":             "0022390402", //SF	
  "JUDAH 0401":                   "0022400401", //SF	
  "JUDAH 0402":                   "0022400402", //SF	
  "CASTRO 0401":                  "0022480401", //SF	
  "CASTRO 0402":                  "0022480402", //SF	
  "YOSEMITE 0401":                "0022490401", //SF	
  "YOSEMITE 0402":                "0022490402", //SF	
  "YOSEMITE 0403":                "0022490403", //SF	
  "TARAVAL 0401":                 "0022500401", //SF	
  "TARAVAL 0402":                 "0022500402", //SF	
  "TARAVAL 0403":                 "0022500403", //SF	
  "NORIEGA 0401":                 "0022510401", //SF	
  "NORIEGA 0402":                 "0022510402", //SF	
  "6TH AVENUE 0401":              "0022530401", //SF	
  "6TH AVENUE 0402":              "0022530402", //SF	
  "6TH AVENUE 0403":              "0022530403", //SF	
  "21ST AVENUE 0401":             "0022550401", //SF	
  "21ST AVENUE 0402":             "0022550402", //SF	
  "21ST AVENUE 0403":             "0022550403", //SF	
  "OCEAN AVENUE 0401":            "0022580401", //SF	
  "OCEAN AVENUE 0402":            "0022580402", //SF	
  "RANDOLPH 0402":                "0022590402", //SF	
  "RANDOLPH 0403":                "0022590403", //SF	
  "PORTOLA 0401":                 "0022610401", //SF	
  "PORTOLA 0402":                 "0022610402", //SF	
  "SILVER 0401":                  "0022670401", //SF	
  "MARINA 0401":                  "0022780401", //SF	
  "MARINA 0402":                  "0022780402", //SF	
  "MARINA 0403":                  "0022780403", //SF	
  "MARINA 0404":                  "0022780404", //SF	
  "MARINA 0405":                  "0022780405", //SF	
  "MARINA 0407":                  "0022780407", //SF	
  "MARINA 0408":                  "0022780408", //SF	
  "MARINA 1101":                  "0022781101", //SF	
  "MARINA 1102":                  "0022781102", //SF	
  "LARKIN 1101":                  "0022801101", //SF	
  "LARKIN 1103":                  "0022801103", //SF	
  "LARKIN 1107":                  "0022801107", //SF	
  "LARKIN 1108":                  "0022801108", //SF	
  "LARKIN 1109":                  "0022801109", //SF	
  "LARKIN 1110":                  "0022801110", //SF	
  "LARKIN 1111":                  "0022801111", //SF	
  "LARKIN 1119":                  "0022801119", //SF	
  "LARKIN 1120":                  "0022801120", //SF	
  "LARKIN 1127":                  "0022801127", //SF	
  "LARKIN 1128":                  "0022801128", //SF	
  "LARKIN 1135":                  "0022801135", //SF	
  "LARKIN 1136":                  "0022801136", //SF	
  "LARKIN 1137":                  "0022801137", //SF	
  "LARKIN 1138":                  "0022801138", //SF	
  "EMBARCADERO 1112":             "0022871112", //SF	
  "EMBARCADERO 1113":             "0022871113", //SF	
  "EMBARCADERO 1115":             "0022871115", //SF	
  "EMBARCADERO 1116":             "0022871116", //SF	
  "EMBARCADERO 1118":             "0022871118", //SF	
  "EMBARCADERO 1119":             "0022871119", //SF	
  "EMBARCADERO 1120":             "0022871120", //SF	
  "EMBARCADERO 1121":             "0022871121", //SF	
  "EMBARCADERO 1122":             "0022871122", //SF	
  "EMBARCADERO 1123":             "0022871123", //SF	
  "GRASS VALLEY 1101":            "0152031101", //SI	
  "GRASS VALLEY 1102":            "0152031102", //SI	
  "GRASS VALLEY 1103":            "0152031103", //SI	
  "GRASS VALLEY 1104":            "0152031104", //SI	
  "ROCKLIN 1101":                 "0152061101", //SI	
  "ROCKLIN 1102":                 "0152061102", //SI	
  "ROCKLIN 1103":                 "0152061103", //SI	
  "ROCKLIN 1104":                 "0152061104", //SI	
  "ALLEGHANY 1101":               "0152101101", //SI	
  "ALLEGHANY 1102":               "0152101102", //SI	
  "ALLEGHANY 1101-A":             "015210110A", //SI	
  "ALLEGHANY 1101-B":             "015210110B", //SI	
  "ALLEGHANY 1101-C":             "015210110C", //SI	
  "AUBURN 1101":                  "0152161101", //SI	
  "AUBURN 1102":                  "0152161102", //SI	
  "FORESTHILL 1101":              "0152181101", //SI	
  "FORESTHILL 1102":              "0152181102", //SI	
  "PIKE CITY 1101":               "0152201101", //SI	
  "PIKE CITY 1102":               "0152201102", //SI	
  "HALSEY 1101":                  "0152241101", //SI	
  "HALSEY 1102":                  "0152241102", //SI	
  "SPAULDING 1101":               "0152251101", //SI	
  "DIAMOND SPRINGS 1103":         "0152261103", //SI	
  "DIAMOND SPRINGS 1104":         "0152261104", //SI	
  "DIAMOND SPRINGS 1106":         "0152261106", //SI	
  "DIAMOND SPRINGS 1107":         "0152261107", //SI	
  "WISE 1101":                    "0152271101", //SI	
  "WISE 1102":                    "0152271102", //SI	
  "WISE 1103":                    "0152271103", //SI	
  "WISE 1101-A":                  "015227110A", //SI	
  "WISE 1101-B":                  "015227110B", //SI	
  "MOUNTAIN QUARRIES 2101":       "0152282101", //SI	
  "MOUNTAIN QUARRIES 2101-A":     "015228210A", //SI	
  "MOUNTAIN QUARRIES 2101-B":     "015228210B", //SI	
  "TAMARACK 1101":                "0152291101", //SI	
  "TAMARACK 1102":                "0152291102", //SI	
  "BONNIE NOOK 1101":             "0152301101", //SI	
  "BONNIE NOOK 1102":             "0152301102", //SI	
  "DRUM 1101":                    "0152321101", //SI	
  "SHADY GLEN 1101":              "0152431101", //SI	
  "SHADY GLEN 1102":              "0152431102", //SI	
  "PLEASANT GROVE 2103":          "0152442103", //SI	
  "PLEASANT GROVE 2104":          "0152442104", //SI	
  "PLEASANT GROVE 2107":          "0152442107", //SI	
  "PLEASANT GROVE 2109":          "0152442109", //SI	
  "PLACER 1101":                  "0152461101", //SI	
  "PLACER 1102":                  "0152461102", //SI	
  "PLACER 1103":                  "0152461103", //SI	
  "PLACER 1104":                  "0152461104", //SI	
  "COLUMBIA HILL 1101":           "0152471101", //SI	
  "COLUMBIA HILL 1101-A":         "015247110A", //SI	
  "COLUMBIA HILL 1101-B":         "015247110B", //SI	
  "BRUNSWICK 1102":               "0152481102", //SI	
  "BRUNSWICK 1103":               "0152481103", //SI	
  "BRUNSWICK 1104":               "0152481104", //SI	
  "BRUNSWICK 1105":               "0152481105", //SI	
  "BRUNSWICK 1106":               "0152481106", //SI	
  "BRUNSWICK 1107":               "0152481107", //SI	
  "BRUNSWICK 1105-M":             "015248110M", //SI	
  "BRUNSWICK 1105-N":             "015248110N", //SI	
  "BRUNSWICK 1106-R":             "015248110R", //SI	
  "BRUNSWICK 1106-S":             "015248110S", //SI	
  "BRUNSWICK 1110":               "0152481110", //SI	
  "WEIMAR 1101":                  "0152491101", //SI	
  "WEIMAR 1102":                  "0152491102", //SI	
  "FLINT 1102":                   "0152531102", //SI	
  "PENRYN 1103":                  "0152561103", //SI	
  "PENRYN 1104":                  "0152561104", //SI	
  "HORSESHOE 1101":               "0152571101", //SI	
  "HORSESHOE 1102":               "0152571102", //SI	
  "HORSESHOE 1103":               "0152571103", //SI	
  "HORSESHOE 1104":               "0152571104", //SI	
  "HORSESHOE 1105":               "0152571105", //SI	
  "HORSESHOE 1106":               "0152571106", //SI	
  "DELMAR 1104":                  "0152581104", //SI	
  "DELMAR 2105":                  "0152582105", //SI	
  "DELMAR 2106":                  "0152582106", //SI	
  "SUMMIT 1101":                  "0152591101", //SI	
  "SUMMIT 1102":                  "0152591102", //SI	
  "HIGGINS 1103":                 "0152691103", //SI	
  "HIGGINS 1107":                 "0152691107", //SI	
  "HIGGINS 1108":                 "0152691108", //SI	
  "HIGGINS 1109":                 "0152691109", //SI	
  "HIGGINS 1109-A":               "015269110A", //SI	
  "HIGGINS 1109-B":               "015269110B", //SI	
  "HIGGINS 1110":                 "0152691110", //SI	
  "BELL 1107":                    "0152701107", //SI	
  "BELL 1108":                    "0152701108", //SI	
  "BELL 1109":                    "0152701109", //SI	
  "BELL 1110":                    "0152701110", //SI	
  "EL DORADO P H 2101":           "0152762101", //SI	
  "EL DORADO P H 2102":           "0152762102", //SI	
  "DEER CREEK PH 1101":           "0152DC1101", //SI	
  "PLACERVILLE 1109":             "0153081109", //SI	
  "PLACERVILLE 1110":             "0153081110", //SI	
  "PLACERVILLE 1111":             "0153081111", //SI	
  "PLACERVILLE 1112":             "0153081112", //SI	
  "PLACERVILLE 2106-Eldrdo":      "0153082106", //SI	
  "PLACERVILLE 2106-Grgtwn":      "015308210A", //SI	
  "PLACERVILLE 2106-Grdnvly":     "015308210B", //SI	
  "PLACERVILLE 2106-Grnwd":       "015308210C", //SI	
  "NARROWS 2101":                 "0153132101", //SI	
  "NARROWS 2102":                 "0153132102", //SI	
  "NARROWS 2101-A":               "015313210A", //SI	
  "NARROWS 2101-B":               "015313210B", //SI	
  "OLETA (SACTO) 1101":           "0153541101", //SI	
  "CLARKSVILLE 2103":             "0153612103", //SI	
  "CLARKSVILLE 2104":             "0153612104", //SI	
  "CLARKSVILLE 2109":             "0153612109", //SI	
  "CLARKSVILLE 2110":             "0153612110", //SI	
  "SHINGLE SPRINGS 1103":         "0153651103", //SI	
  "SHINGLE SPRINGS 1104":         "0153651104", //SI	
  "SHINGLE SPRINGS 2105":         "0153652105", //SI	
  "SHINGLE SPRINGS 2106":         "0153652106", //SI	
  "SHINGLE SPRINGS 2109":         "0153652109", //SI	
  "APPLE HILL 1103":              "0153661103", //SI	
  "APPLE HILL 1104":              "0153661104", //SI	
  "APPLE HILL 2102-Seq 1":        "0153662102", //SI	
  "APPLE HILL 2102-Seq 2":        "015366210A", //SI	
  "APPLE HILL 2102-Seq 3":        "015366210B", //SI	
  "LINCOLN 1101":                 "0153701101", //SI	
  "LINCOLN 1101-A":               "015370110A", //SI	
  "PEASE 1105":                   "0153751105", //SI	
  "DOWNIEVILLE DIESEL 1101":      "0158001101", //SI	
  "ECHO SUMMIT 1101":             "0158031101", //SI	
  "Auburn-Folsom Rd":             "015HW00001", //SI	
  "Hwy 20 (NC to I-80)":          "015HW02003", //SI	
  "Hwy 49 (Bear Rvr to NC)":      "015HW04901", //SI	
  "Hwy 49 (NC to Yuba Pass)":     "015HW04902", //SI	
  "Hwy 49 (Auburn to Bear Rvr)":  "015HW04903", //SI	
  "Hwy 49 (Auburn to Coloma)":    "015HW04904", //SI	
  "Hwy 49 (Coloma to Pvlle)":     "015HW04905", //SI	
  "Hwy 49 (D.S.to Almandor)":     "015HW04906", //SI	
  "Hwy 50 (ElDo Hill to Pvlle)":  "015HW05001", //SI	
  "Hwy 50 (Pvlle to Echo Sum)":   "015HW05002", //SI	
  "I-80 (Rocklin to Auburn)":     "015HW08001", //SI	
  "I-80 (Auburn to Donner Sm":    "015HW08002", //SI	
  "Hwy 174 (GV to Bear Rvr)":     "015HW17401", //SI	
  "Hwy 174 (B Rvr to Colfax)":    "015HW17402", //SI	
  "Hw 193 (Linc to Brdg Bndry)":  "015HW19301", //SI	
  "Hw 193 (Newcastle to Brdg":    "015HW19302", //SI	
  "Hw 193 (Cool to Kelsey)":      "015HW19303", //SI	
  "Hw 193 (Kelsey to Pvlle)":     "015HW19304", //SI	
  "Hw 193 (Linc to E. Bndry)":    "015HW19305", //SI	
  "COLGATE ORCHARD":              "015OR00001", //SI	
  "EL DORADO - ORCHARDS":         "015OR10005", //SI	
  "TRAN - SI 60Kv":               "TR01506001", //SI	
  "TRAN - SI 70Kv":               "TR01507001", //SI	
  "TRAN - SI 115Kv":              "TR01511501", //SI	
  "TRAN - SI 230Kv":              "TR01523001", //SI	
  "TRAN - SI 500Kv":              "TR01550001", //SI	
  "CR-Middle Fork":               "TRC0151001", //SI	
  "CR-Drum Summit":               "TRC0151002", //SI	
  "CR-Drum Rio Oso #2":           "TRC0151003", //SI	
  "CR-Spaulding Summit":          "TRC0151004", //SI	
  "CR-MissouriGold":              "TRC0151005", //SI	
  "CR-Rices Xing - Colgate PH SI":   "TRC0151006", //SI	
  "CR-Butte Cnty-Nicolaus Sub SI":   "TRC0151007", //SI	
  "CR-Butte Cnty-Rio Oso Sub SI":    "TRC0151008", //SI	
  "CR-Atlantic":                  "TRC0151009", //SI	
  "CR-Halsey to Steep Hollow":    "TRC0151013", //SI	
  "CR-Steep Hollow to Drum":      "TRC0151014", //SI	
  "CR-Colgate Nevada":            "TRC0151017", //SI	
  "CR-El Apple Flat":             "TRC0151018", //SI	
  "CR-Weimar":                    "TRC0151019", //SI	
  "CR-Placer Atlantic":           "TRC0151020", //SI	
  "CR-Halsey Bear":               "TRC0151021", //SI	
  "CR-Bear Placer":               "TRC0151022", //SI	
  "CR-Drum to Rollins":           "TRC0151026", //SI	
  "CR-Brunswick":                 "TRC0151027", //SI	
  "CR-Placer to Folsom":          "TRC0151029", //SI	
  "CR-Aerial Patrol Sierra":      "TRC0611112", //SI	
  "EVERGREEN 2101":               "0082012101", //SJ	
  "EVERGREEN 2102":               "0082012102", //SJ	
  "EVERGREEN 2103":               "0082012103", //SJ	
  "EVERGREEN 2104":               "0082012104", //SJ	
  "EVERGREEN 2105":               "0082012105", //SJ	
  "BASCOM 0401":                  "0082100401", //SJ	
  "MABURY 1101":                  "0082191101", //SJ	
  "MABURY 1102":                  "0082191102", //SJ	
  "MABURY 1103":                  "0082191103", //SJ	
  "MABURY 1104":                  "0082191104", //SJ	
  "SAN JOSE SUB A 0403":          "0082250403", //SJ	
  "SAN JOSE SUB A 0404":          "0082250404", //SJ	
  "SAN JOSE SUB A 0405":          "0082250405", //SJ	
  "SAN JOSE SUB A 0407":          "0082250407", //SJ	
  "SAN JOSE SUB A 0408":          "0082250408", //SJ	
  "SAN JOSE SUB A 0410":          "0082250410", //SJ	
  "SAN JOSE SUB A 1109":          "0082251109", //SJ	
  "SAN JOSE SUB A 1110":          "0082251110", //SJ	
  "SAN JOSE SUB A 1111":          "0082251111", //SJ	
  "SAN JOSE SUB A 1112":          "0082251112", //SJ	
  "SAN JOSE SUB B 0408":          "0082260408", //SJ	
  "SAN JOSE SUB B 1101":          "0082261101", //SJ	
  "SAN JOSE SUB B 1102":          "0082261102", //SJ	
  "SAN JOSE SUB B 1104":          "0082261104", //SJ	
  "SAN JOSE SUB B 1105":          "0082261105", //SJ	
  "SAN JOSE SUB B 1106":          "0082261106", //SJ	
  "SAN JOSE SUB B 1107":          "0082261107", //SJ	
  "SAN JOSE SUB B 1108":          "0082261108", //SJ	
  "SAN JOSE SUB B 1109":          "0082261109", //SJ	
  "SAN JOSE SUB B 1110":          "0082261110", //SJ	
  "SAN JOSE SUB B 1111":          "0082261111", //SJ	
  "SAN JOSE SUB B 1112":          "0082261112", //SJ	
  "SAN JOSE SUB B 1113":          "0082261113", //SJ	
  "SAN JOSE SUB B 1114":          "0082261114", //SJ	
  "SAN JOSE SUB B 1115":          "0082261115", //SJ	
  "SAN JOSE SUB B 1116":          "0082261116", //SJ	
  "SAN JOSE SUB B 1117":          "0082261117", //SJ	
  "ALMADEN 1101":                 "0082311101", //SJ	
  "ALMADEN 1102":                 "0082311102", //SJ	
  "ALMADEN 1103":                 "0082311103", //SJ	
  "ALMADEN 1110":                 "0082311110", //SJ	
  "ALMADEN 1111":                 "0082311111", //SJ	
  "RIVER OAKS 2101":              "0082342101", //SJ	
  "RIVER OAKS 2102":              "0082342102", //SJ	
  "RIVER OAKS 2106":              "0082342106", //SJ	
  "RIVER OAKS 2107":              "0082342107", //SJ	
  "RIVER OAKS 2108":              "0082342108", //SJ	
  "NORTECH 2109":                 "0082462109", //SJ	
  "NORTECH 2111":                 "0082462111", //SJ	
  "SENTER 1104":                  "0082541104", //SJ	
  "MILPITAS 1101":                "0082831101", //SJ	
  "MILPITAS 1105":                "0082831105", //SJ	
  "MILPITAS 1106":                "0082831106", //SJ	
  "MILPITAS 1108":                "0082831108", //SJ	
  "MILPITAS 1109":                "0082831109", //SJ	
  "MILPITAS 2110":                "0082832110", //SJ	
  "MILPITAS 2111":                "0082832111", //SJ	
  "MILPITAS 2112":                "0082832112", //SJ	
  "MILPITAS 2113":                "0082832113", //SJ	
  "MILPITAS 2114":                "0082832114", //SJ	
  "MILPITAS 2115":                "0082832115", //SJ	
  "EL PATIO 1105":                "0082921105", //SJ
  "EDENVALE 1101":                "0082951101", //SJ	
  "EDENVALE 1102":                "0082951102", //SJ	
  "EDENVALE 1103":                "0082951103", //SJ	
  "EDENVALE 2106":                "0082952106", //SJ	
  "EDENVALE 2107":                "0082952107", //SJ	
  "EDENVALE 2108":                "0082952108", //SJ	
  "EDENVALE 2109":                "0082952109", //SJ	
  "EDENVALE 2110":                "0082952110", //SJ	
  "RUCKER 0401":                  "0083100401", //SJ	
  "LLAGAS 2101":                  "0083182101", //SJ	
  "LLAGAS 2102":                  "0083182102", //SJ	
  "LLAGAS 2103":                  "0083182103", //SJ	
  "LLAGAS 2104":                  "0083182104", //SJ	
  "LLAGAS 2105":                  "0083182105", //SJ	
  "LLAGAS 2106":                  "0083182106", //SJ	
  "LLAGAS 2107":                  "0083182107", //SJ	
  "MORGAN HILL 2104":             "0083242104", //SJ	
  "MORGAN HILL 2105":             "0083242105", //SJ	
  "MORGAN HILL 2106":             "0083242106", //SJ	
  "MORGAN HILL 2108":             "0083242108", //SJ	
  "MORGAN HILL 2109":             "0083242109", //SJ	
  "MORGAN HILL 2110":             "0083242110", //SJ	
  "MORGAN HILL 2111":             "0083242111", //SJ	
  "SAN MARTIN 0401":              "0083280401", //SJ	
  "SWIFT 2102":                   "0083392102", //SJ	
  "SWIFT 2106":                   "0083392106", //SJ	
  "SWIFT 2107":                   "0083392107", //SJ	
  "SWIFT 2108":                   "0083392108", //SJ	
  "SWIFT 2109":                   "0083392109", //SJ	
  "SWIFT 2110":                   "0083392110", //SJ	
  "SWIFT 2111":                   "0083392111", //SJ	
  "HICKS 1108":                   "0083431108", //SJ	
  "HICKS 1110":                   "0083431110", //SJ	
  "HICKS 1112":                   "0083431112", //SJ	
  "HICKS 2101":                   "0083432101", //SJ	
  "HICKS 2102":                   "0083432102", //SJ	
  "HICKS 2105":                   "0083432105", //SJ	
  "HICKS 2106":                   "0083432106", //SJ	
  "HICKS 2110":                   "0083432110", //SJ	
  "HICKS 2111":                   "0083432111", //SJ	
  "MC KEE 1102":                  "0083531102", //SJ	
  "MC KEE 1103":                  "0083531103", //SJ	
  "MC KEE 1104":                  "0083531104", //SJ	
  "MC KEE 1105":                  "0083531105", //SJ	
  "MC KEE 1106":                  "0083531106", //SJ	
  "MC KEE 1107":                  "0083531107", //SJ	
  "MC KEE 1108":                  "0083531108", //SJ	
  "MC KEE 1109":                  "0083531109", //SJ	
  "MC KEE 1110":                  "0083531110", //SJ	
  "MC KEE 1111":                  "0083531111", //SJ	
  "MC KEE 1112":                  "0083531112", //SJ	
  "STONE 1101":                   "0083701101", //SJ	
  "STONE 1102":                   "0083701102", //SJ	
  "STONE 1104":                   "0083701104", //SJ	
  "STONE 1107":                   "0083701107", //SJ	
  "STONE 1108":                   "0083701108", //SJ	
  "STONE 1109":                   "0083701109", //SJ	
  "STONE 1110":                   "0083701110", //SJ	
  "MARKHAM 1101":                 "0083731101", //SJ	
  "TRIMBLE 1101":                 "0083801101", //SJ	
  "TRIMBLE 1103":                 "0083801103", //SJ	
  "TRIMBLE 1104":                 "0083801104", //SJ	
  "TRIMBLE 1105":                 "0083801105", //SJ	
  "TRIMBLE 1106":                 "0083801106", //SJ	
  "TRIMBLE 1107":                 "0083801107", //SJ	
  "TRIMBLE 1108":                 "0083801108", //SJ	
  "TRIMBLE 1109":                 "0083801109", //SJ	
  "TRIMBLE 1110":                 "0083801110", //SJ	
  "TRIMBLE 1111":                 "0083801111", //SJ	
  "TRIMBLE 2114":                 "0083802114", //SJ	
  "TRIMBLE 2115":                 "0083802115", //SJ	
  "TRIMBLE 2116":                 "0083802116", //SJ	
  "TRIMBLE 2117":                 "0083802117", //SJ	
  "TRIMBLE 2118":                 "0083802118", //SJ	
  "TRIMBLE 2119":                 "0083802119", //SJ	
  "FMC 1101":                     "0083871101", //SJ	
  "FMC 1102":                     "0083871102", //SJ	
  "MONTAGUE 2101":                "0083892101", //SJ	
  "MONTAGUE 2102":                "0083892102", //SJ	
  "MONTAGUE 2103":                "0083892103", //SJ	
  "MONTAGUE 2104":                "0083892104", //SJ	
  "MONTAGUE 2105":                "0083892105", //SJ	
  "MONTAGUE 2106":                "0083892106", //SJ	
  "MONTAGUE 2107":                "0083892107", //SJ	
  "MONTAGUE 2108":                "0083892108", //SJ	
  "MONTAGUE 2109":                "0083892109", //SJ	
  "Piercy 2109":                  "0083912109", //SJ	
  "Piercy 2110":                  "0083912110", //SJ	
  "Piercy 2111":                  "0083912111", //SJ	
  "FRANKS 2101":                  "0088002101", //SJ	
  "DIXON LANDING 2101 SJ":           "0088012101", //SJ	
  "DIXON LANDING 2102 SJ":           "0088012102", //SJ	
  "DIXON LANDING 2103 SJ":           "0088012103", //SJ	
  "SANTA CLARA 1101":             "0088111101", //SJ	
  "TRAN - SJ 60Kv":               "TR00806003", //SJ	
  "TRAN - SJ 70Kv":               "TR00807003", //SJ	
  "TRAN - SJ 115Kv":              "TR00811503", //SJ	
  "TRAN - SJ 230Kv":              "TR00823003", //SJ	
  "TRAN - SJ 500Kv":              "TR00850003", //SJ	
  "CR-Los Esteros":               "TRC0040002", //SJ	
  "CR-Lawerence":                 "TRC0040003", //SJ	
  "CR-Westinghouse":              "TRC0040004", //SJ	
  "CR-Monta Vista":               "TRC0040005", //SJ	
  "CR-Evergreen":                 "TRC0040006", //SJ	
  "CR-Gilroy":                    "TRC0040007", //SJ	
  "CR-San Jose B":                "TRC0040008", //SJ	
  "CR-Swift":                     "TRC0040009", //SJ	
  "CR-Applied Materials":         "TRC0040010", //SJ	
  "CR-Newark":                    "TRC0040011", //SJ	
  "CR-Metcalf-El Patio":          "TRC0040012", //SJ	
  "CR-Riparian":                  "TRC0040013", //SJ	
  "CR-Milpitas":                  "TRC0040014", //SJ	
  "CR-Stevens Creek North":       "TRC0040015", //SJ	
  "CR-Stevens Creek South":       "TRC0040016", //SJ	
  "CR-Mabury-Jennings 60 kV":     "TRC0040017", //SJ	
  "CR-Lockheed 115 kV":           "TRC0040018", //SJ	
  "CR-Markham-Stone 115 kV":      "TRC0040019", //SJ	
  "CR-Metcalf-MontaVista 230kV":  "TRC0040020", //SJ	
  
  "CR-Monta Vista - Burns 60kV":  "TRC0040021", //SJ	
  "CR-Agnew - Zanker 115 kV":     "TRC0040022", //SJ	
  "CR-Monta Vista -Wolfe 115kV":  "TRC0040023", //SJ	
  "CR-Evergreen-Los Gatos 60kV":  "TRC0040024", //SJ	
  "CR-MossLandng-Metcalf 500kV":  "TRC0040025", //SJ	
  "CR-Monta Vista-Cupertino":     "TRC0040026", //SJ	
  "CR MV - LG / Campbell":        "TRC0040027", //SJ	
  "CR-Monta Vista-Saratoga":      "TRC0040028", //SJ	
  "CR-Monta Vista-San Jose":      "TRC0040029", //SJ	
  "TIGER CREEK 0201":             "0161380201", //ST	
  "LINDEN 1101":                  "0162071101", //ST	
  "LINDEN 1102":                  "0162071102", //ST	
  "LINDEN 1103":                  "0162071103", //ST	
  "LINDEN 1104":                  "0162071104", //ST	
  "NEW HOPE 1101":                "0162081101", //ST	
  "NEW HOPE 1102":                "0162081102", //ST	
  "MIDDLE RIVER 1101":            "0162091101", //ST	
  "MIDDLE RIVER 1102":            "0162091102", //ST	
  "MIDDLE RIVER 1103":            "0162091103", //ST	
  "LODI 0401":                    "0162110401", //ST	
  "LODI 0402":                    "0162110402", //ST	
  "LODI 0403":                    "0162110403", //ST	
  "LODI 0404":                    "0162110404", //ST	
  "LODI 0405":                    "0162110405", //ST	
  "LODI 1101":                    "0162111101", //ST	
  "LODI 1102":                    "0162111102", //ST	
  "ELECTRA 1101":                 "0162161101", //ST	
  "ELECTRA 1102":                 "0162161102", //ST	
  "CALAVERAS CEMENT 1101":        "0162211101", //ST	
  "CALAVERAS CEMENT 1101-A":      "016221110A", //ST	
  "CALAVERAS CEMENT 1101-B":      "016221110B", //ST	
  "CALAVERAS CEMENT 1101-C":      "016221110C", //ST	
  "COLONY 1101":                  "0162231101", //ST	
  "COLONY 1102":                  "0162231102", //ST	
  "MONARCH 0401":                 "0162300401", //ST	
  "MONARCH 0402":                 "0162300402", //ST	
  "MONARCH 0403":                 "0162300403", //ST	
  "STOCKTON STATION A 0401":      "0162370401", //ST	
  "STOCKTON STATION A 0402":      "0162370402", //ST	
  "STOCKTON STATION A 0403":      "0162370403", //ST	
  "STOCKTON STATION A 0404":      "0162370404", //ST	
  "STOCKTON STATION A 0405":      "0162370405", //ST	
  "STOCKTON STATION A 0406":      "0162370406", //ST	
  "STOCKTON STATION A 0407":      "0162370407", //ST	
  "STOCKTON STATION A 0408":      "0162370408", //ST	
  "STOCKTON STATION A 0409":      "0162370409", //ST	
  "STOCKTON STATION A 0410":      "0162370410", //ST	
  "STOCKTON STATION A 0411":      "0162370411", //ST	
  "STOCKTON STATION A 0412":      "0162370412", //ST	
  "STOCKTON STATION A 1101":      "0162371101", //ST	
  "STOCKTON STATION A 1102":      "0162371102", //ST	
  "STOCKTON STATION A 1103":      "0162371103", //ST	
  "STOCKTON STATION A 1104":      "0162371104", //ST	
  "STOCKTON STATION A 1105":      "0162371105", //ST	
  "STOCKTON STATION A 1106":      "0162371106", //ST	
  "STOCKTON STATION A 1107":      "0162371107", //ST	
  "STOCKTON STATION A 1108":      "0162371108", //ST	
  "STOCKTON STATION A 1109":      "0162371109", //ST	
  "STOCKTON STATION A 1110":      "0162371110", //ST	
  "STAGG 1101":                   "0162421101", //ST	
  "STAGG 1103":                   "0162421103", //ST	
  "STAGG 1105":                   "0162421105", //ST	
  "STAGG 1106":                   "0162421106", //ST	
  "STAGG 2103":                   "0162422103", //ST	
  "STAGG 2104":                   "0162422104", //ST	
  "STAGG 2105":                   "0162422105", //ST	
  "STAGG 2106":                   "0162422106", //ST	
  "STAGG 2107":                   "0162422107", //ST	
  "STAGG 2108":                   "0162422108", //ST	
  "BANTA 1101":                   "0162471101", //ST	
  "BANTA 1102":                   "0162471102", //ST	
  "BANTA 1103":                   "0162471103", //ST	
  "MANTECA 0401":                 "0162610401", //ST	
  "MANTECA 0402":                 "0162610402", //ST	
  "MANTECA 0403":                 "0162610403", //ST	
  "MANTECA 1701":                 "0162611701", //ST	
  "MANTECA 1702":                 "0162611702", //ST	
  "MANTECA 1703":                 "0162611703", //ST	
  "MANTECA 1704":                 "0162611704", //ST	
  "MANTECA 1705":                 "0162611705", //ST	
  "MANTECA 1706":                 "0162611706", //ST	
  "MANTECA 1707":                 "0162611707", //ST	
  "WESTLEY 1101":                 "0162671101", //ST	& YO
  "WESTLEY 1103":                 "0162671103", //ST	& YO
  "VIERRA 1701":                  "0162701701", //ST	
  "VIERRA 1702":                  "0162701702", //ST	
  "VIERRA 1703":                  "0162701703", //ST	
  "Lammers 1101":                 "0162771101", //ST	
  "Lammers 1102":                 "0162771102", //ST	
  "Lammers 1103":                 "0162771103", //ST	
  "Lammers 1105":                 "0162771105", //ST	
  "Lammers 1107":                 "0162771107", //ST	
  "STANISLAUS 1701":              "0162821701", //ST	& YO
  "STANISLAUS 1702":              "0162821702", //ST	& YO
  "STANISLAUS 1701 A":            "016282170A", //ST	
  "STANISLAUS 1701 B":            "016282170B", //ST	
  "STANISLAUS 1702 A":            "016282170Y", //ST	
  "STANISLAUS 1702 B":            "016282170Z", //ST	
  "TRACY 0402":                   "0162880402", //ST	
  "TRACY 0405":                   "0162880405", //ST	
  "TRACY 1102":                   "0162881102", //ST	
  "TRACY 1103":                   "0162881103", //ST	
  "TRACY 1104":                   "0162881104", //ST	
  "TRACY 1105":                   "0162881105", //ST	
  "TRACY 1106":                   "0162881106", //ST	
  "TRACY 1107":                   "0162881107", //ST	
  "TRACY 1109":                   "0162881109", //ST	
  "TRACY 1110":                   "0162881110", //ST	
  "TRACY 1111":                   "0162881111", //ST	
  "TRACY 1112":                   "0162881112", //ST	
  "VALLEY HOME 1701":             "0162981701", //ST	& YO
  "VALLEY HOME 1702":             "0162981702", //ST	& YO
  "CORRAL 1101":                  "0162991101", //ST	
  "CORRAL 1102":                  "0162991102", //ST	
  "CORRAL 1102 A":                "016299110Y", //ST	
  "CORRAL 1102 B":                "016299110Z", //ST	
  "MARTELL 1101":                 "0163011101", //ST	
  "MARTELL 1102":                 "0163011102", //ST	
  "MARTELL 1103":                 "0163011103", //ST	
  "TERMINOUS 1102":               "0163021102", //ST	
  "TERMINOUS 1103":               "0163021103", //ST	
  "LATHROP 0402":                 "0163030402", //ST	
  "CHANNEL 1101":                 "0163071101", //ST	
  "CHANNEL 1102":                 "0163071102", //ST	
  "ROUGH AND READY ISLA 1101":    "0163081101", //ST	
  "ROUGH AND READY ISLA 1102":    "0163081102", //ST	
  "CARBONA 1101":                 "0163091101", //ST	
  "CARBONA 1102":                 "0163091102", //ST	
  "CARBONA 1103":                 "0163091103", //ST	
  "CARBONA 1104":                 "0163091104", //ST	
  "COUNTRY CLUB 0401":            "0163120401", //ST	
  "COUNTRY CLUB 0402":            "0163120402", //ST	
  "COUNTRY CLUB 0403":            "0163120403", //ST	
  "COUNTRY CLUB 1101":            "0163121101", //ST	
  "COUNTRY CLUB 1102":            "0163121102", //ST	
  "COUNTRY CLUB 1103":            "0163121103", //ST	
  "COUNTRY CLUB 1104":            "0163121104", //ST	
  "COUNTRY CLUB 1105":            "0163121105", //ST	
  "COUNTRY CLUB 1106":            "0163121106", //ST	
  "EAST STOCKTON 0401":           "0163130401", //ST	
  "EAST STOCKTON 0402":           "0163130402", //ST	
  "EAST STOCKTON 0403":           "0163130403", //ST	
  "EAST STOCKTON 0404":           "0163130404", //ST	
  "EAST STOCKTON 1101":           "0163131101", //ST	
  "EAST STOCKTON 1102":           "0163131102", //ST	
  "WATERLOO 1101":                "0163151101", //ST	
  "WATERLOO 1102":                "0163151102", //ST	
  "RIVERBANK 1711":               "0163191711", //ST	& YO
  "RIVERBANK 1713":               "0163191713", //ST	& YO
  "WEST POINT 1101":              "0163201101", //ST	
  "WEST POINT 1102":              "0163201102", //ST	
  "WEST POINT 1101-A":            "016320110A", //ST	
  "WEST POINT 1101-B":            "016320110B", //ST	
  "MORMON 1101":                  "0163211101", //ST	
  "MORMON 1102":                  "0163211102", //ST	
  "STOCKTON ACRES 0401":          "0163220401", //ST	
  "STOCKTON ACRES 0402":          "0163220402", //ST	
  "NORTH BRANCH 1101":            "0163231101", //ST	
  "OAK PARK 0401":                "0163270401", //ST	
  "OAK PARK 0402":                "0163270402", //ST	
  "VICTOR 0401":                  "0163280401", //ST	
  "VICTOR 1101":                  "0163281101", //ST	
  "FRENCH CAMP 1101":             "0163291101", //ST	
  "FRENCH CAMP 1102":             "0163291102", //ST	
  "FRENCH CAMP 1103":             "0163291103", //ST	
  "FRENCH CAMP 1104":             "0163291104", //ST	
  "HAMMER 1101":                  "0163301101", //ST	
  "HAMMER 1102":                  "0163301102", //ST	
  "HAMMER 1103":                  "0163301103", //ST	
  "HAMMER 1104":                  "0163301104", //ST	
  "HAMMER 1105":                  "0163301105", //ST	
  "HAMMER 1106":                  "0163301106", //ST	
  "HAMMER 1107":                  "0163301107", //ST	
  "HAMMER 1108":                  "0163301108", //ST	
  "HAMMER 1109":                  "0163301109", //ST	
  "HARDING 0401":                 "0163310401", //ST	
  "HARDING 0402":                 "0163310402", //ST	
  "HARDING 0403":                 "0163310403", //ST	
  "HARDING 0404":                 "0163310404", //ST	
  "HARDING 0405":                 "0163310405", //ST	
  "HARDING 0406":                 "0163310406", //ST	
  "CLAY 1101":                    "0163341101", //ST	
  "CLAY 1102":                    "0163341102", //ST	
  "FROGTOWN 1701":                "0163451701", //ST	
  "FROGTOWN 1702":                "0163451702", //ST	& YO
  "FROGTOWN 1701-A":              "016345170A", //ST	
  "FROGTOWN 1701-B":              "016345170B", //ST	
  "FROGTOWN 1702-A":              "016345170Y", //ST	
  "FROGTOWN 1702-B":              "016345170Z", //ST	
  "WEBER 1101":                   "0163481101", //ST	
  "WEBER 1102":                   "0163481102", //ST	
  "WEBER 1103":                   "0163481103", //ST	
  "WEBER 1104":                   "0163481104", //ST	
  "WEBER 1105":                   "0163481105", //ST	
  "WEBER 1106":                   "0163481106", //ST	
  "WEBER 1107":                   "0163481107", //ST	
  "WEBER 1108":                   "0163481108", //ST	
  "WEBER 1114":                   "0163481114", //ST	
  "OLETA 1101":                   "0163541101", //ST	
  "OLETA 1102":                   "0163541102", //ST	
  "ALPINE 1101":                  "0163561101", //ST	
  "AVENA 1701":                   "0163571701", //ST	& YO
  "AVENA 1702":                   "0163571702", //ST	& YO
  "WEST LANE 1101":               "0163621101", //ST	
  "WEST LANE 1102":               "0163621102", //ST	
  "WEST LANE 1103":               "0163621103", //ST	
  "CHEROKEE 1101":                "0163651101", //ST	
  "CHEROKEE 1102":                "0163651102", //ST	
  "LOCKEFORD SUB 2101":           "0163682101", //ST	
  "LOCKEFORD SUB 2102":           "0163682102", //ST	
  "Salt Springs 1101":            "0163691101", //ST	
  "SALT SPRINGS 2101":            "0163692101", //ST	
  "SALT SPRINGS 2102":            "0163692102", //ST	
  "METTLER 1109":                 "0163701109", //ST	
  "METTLER 1110":                 "0163701110", //ST	
  "MOSHER 2105":                  "0163722105", //ST	
  "MOSHER 2107":                  "0163722107", //ST	
  "MOSHER 2108":                  "0163722108", //ST	
  "HERDLYN 1102 ST":                 "0163741102", //ST	
  "HERDLYN 1103":                 "0163741103", //ST	
  "PINE GROVE 1101":              "0163751101", //ST	
  "PINE GROVE 1102":              "0163751102", //ST	
  "PEORIA FLAT 1701":             "0163781701", //ST	& YO
  "RIPON 1702":                   "0163801702", //ST	
  "RIPON 1704":                   "0163801704", //ST	
  "IONE 1101":                    "0163881101", //ST	
  "EIGHT MILE 2101":              "0163912101", //ST	
  "EIGHT MILE 2102":              "0163912102", //ST	
  "EIGHT MILE 2103":              "0163912103", //ST	
  "TOKAY SUB 1101":               "0168881101", //ST	
  "Cannell 1101":                 "0169991101", //ST	
  "ST HCP MBZ 1601":              "016HCP1601", //ST	
  "ST HCP MBZ 1603":              "016HCP1603", //ST	
  "ST HCP MBZ 1607":              "016HCP1607", //ST	
  "State Hwy 26 - Jackson":       "016HW02601", //ST	
  "Hwy 12 Pin Oaks":              "016HW1201 ", //ST	
  "State Highway 88 -Jackson":    "016HW91101", //ST	
  "TRAN - YO-ST 60Kv":            "TR01606001", //ST	
  "TRAN - YO-ST 70Kv":            "TR01607001", //ST	
  "TRAN - YO-ST 115Kv":           "TR01611501", //ST	
  "TRAN - YO-ST 230Kv":           "TR01623001", //ST	
  "TRAN - YO-ST 500Kv":           "TR01650001", //ST	
  "CR-BELLOTA-WARNERVILLE":       "TRC0160001", //ST	
  "CR-BELLOTA-RIVERBANK":         "TRC0160002", //ST	
  "CR-STAN-MAN":                  "TRC0160003", //ST	
  "CR-STOCKTON A-LOCKEFORD JCT":  "TRC0160005", //ST	
  "CR-STOCKTON A-STOCKTON JCT":   "TRC0160006", //ST	
  "CR-MELONES-WILSON":            "TRC0160007", //ST	
  "CR-WILSON-GREGG":              "TRC0160008", //ST	
  "CR-MELONES SW STATION":        "TRC0160009", //ST	
  "CR-PANOCHE SOUTH":             "TRC0160010", //ST	
  "CR-TIGER CREEK-VLY SPRINGS":   "TRC0160011", //ST	
  "CR-VALLEY SPRINGS-BELLOTA":    "TRC0160012", //ST	
  "CR-TESLA-LOS BANOS":           "TRC0160014", //ST	
  "CR-CHOWCHILLA-KERKOFF":        "TRC0160015", //ST	
  "CR-LOS BANOS-PANOCHE":         "TRC0160016", //ST	
  "CR-BELLOTA-WEBER":             "TRC0160017", //ST	
  "CR-WEBER-TESLA":               "TRC0160018", //ST	
  "CR-LOS BANOS-SOUTH":           "TRC0160019", //ST	
  "CR-TESLA-SALADO-MANTECA":      "TRC0160020", //ST	
  "CR-TIGER CREEK-ELECTRA":       "TRC0160021", //ST	
  "CR-ELECTRA-VALLEY SPRINGS":    "TRC0160022", //ST	
  "CR-RIO OSO-LOCKFRD-BELLOTA":   "TRC0160023", //ST	
  "CR-ELECTRA-BELLOTA":           "TRC0160024", //ST	
  "CR-PANOCHE - Oro Loma":        "TRC0160025", //ST	
  "CR-LOS BANOS-SAN LUIS PGP":    "TRC0160026", //ST	
  "CR-WEBER-MORMON JCT":          "TRC0160027", //ST	
  "CR-STAGG-TESLA":               "TRC0160028", //ST	
  "CR-STAGG-COUNTRY CLUB":        "TRC0160029", //ST	
  "CR-BORDEN-COPPERMINE ST":         "TRC0160030", //ST	
  "CR-RANCHO SECO-BELLOTA":       "TRC0160031", //ST	
  "CR-LOCKEFORD-LOCKEFORD JCT":   "TRC0160032", //ST	
  "CR-TESLA-MANTECA":             "TRC0160033", //ST	
  "CR-TESLA-KASSON":              "TRC0160034", //ST	
  "CR-CARBONA #1":                "TRC0160035", //ST	
  "CR-VIERRA-TRACY":              "TRC0160036", //ST	
  "CR-HOWLAND RD JCT":            "TRC0160037", //ST	
  "CR-WILSON-ATWATER":            "TRC0160038", //ST	
  "CR-PANOCHE-ORO LOMA":          "TRC0160039", //ST	
  "CR-VALLEY SPRINGS-MARTELL#2":  "TRC0160040", //ST	
  "CR-LOS BANOS-CANAL-ORO LOMA ST":  "TRC0160041", //ST	
  "CR-STOCKTON A-WEBER #1":       "TRC0160042", //ST	
  "CR-STOCKTON A-WEBER #3":       "TRC0160043", //ST	
  "CR-AEC TAPS":                  "TRC0160044", //ST	
  "CR-GOLD HILL-STAGG":           "TRC0160045", //ST	
  "CR-GOLD HILL-BELLOTA":         "TRC0160046", //ST	
  "CR-WEBER #1":                  "TRC0160047", //ST	
  "CR-Lockeford Lodi #2":         "TRC0160048", //ST	
  "CR-Tesla Tracy Pumps":         "TRC0160049", //ST	
  "CR-Coburn Panoche":            "TRC0160050", //ST	
  "CR-Lockeford #1":              "TRC0160051", //ST	
  "CR-Dairyland Mendota":         "TRC0160052", //ST	
  "CR-Tesla Stockton Cogen Jct":     "TRC0160053", //ST	
  "CR-ST A Lockeford Bellota":    "TRC0160054", //ST	
  "CR-Aerial Patrol ST":            "TRC0161111", //ST	
  "CR-ST HCP MBZ 1601":           "TRCHCP1601", //ST	
  "CR-ST HCP MBZ 1602":           "TRCHCP1602", //ST	
  "CR-ST HCP MBZ 1604":           "TRCHCP1604", //ST	
  "CR-ST HCP MBZ 1605":           "TRCHCP1605", //ST	
  "CR-ST HCP MBZ 1606":           "TRCHCP1606", //ST	
  "WESTLEY 1102":                 "0162671102", //YO	
  "NEWMAN 1101":                  "0162741101", //YO	
  "NEWMAN 1102":                  "0162741102", //YO	
  "NEWMAN 1103":                  "0162741103", //YO	
  "SPRING GAP 1701":              "0162831701", //YO	
  "PATTERSON RANCH CO. 1101":     "0162921101", //YO	
  "PATTERSON RANCH CO. 1102":     "0162921102", //YO	
  "GUSTINE 1101":                 "0163111101", //YO	
  "GUSTINE 1102":                 "0163111102", //YO	
  "PINECREST 0401":               "0163160401", //YO	
  "RIVERBANK 1712":               "0163191712", //YO	
  "RIVERBANK 1714":               "0163191714", //YO	
  "RIVERBANK 1715":               "0163191715", //YO	
  "RIVERBANK 1716":               "0163191716", //YO	
  "TAR FLAT 0401":                "0163240401", //YO	
  "TAR FLAT 0402":                "0163240402", //YO	
  "CROWS LANDING 1101":           "0163251101", //YO	
  "CROWS LANDING 1102":           "0163251102", //YO	
  "CURTIS 1701":                  "0163351701", //YO	
  "CURTIS 1702":                  "0163351702", //YO	
  "CURTIS 1703":                  "0163351703", //YO	
  "CURTIS 1704":                  "0163351704", //YO	
  "CURTIS 1705":                  "0163351705", //YO	
  "CURTIS 1701 A":                "016335170A", //YO	
  "CURTIS 1701 B":                "016335170B", //YO	
  "CURTIS 1702 A":                "016335170F", //YO	
  "CURTIS 1702 B":                "016335170G", //YO	
  "CURTIS 1703 A":                "016335170K", //YO	
  "CURTIS 1703 B":                "016335170L", //YO	
  "CURTIS 1704 A":                "016335170P", //YO	
  "CURTIS 1704 B":                "016335170R", //YO	
  "CURTIS 1704 C":                "016335170S", //YO	
  "CURTIS 1704 D":                "016335170T", //YO	
  "CURTIS 1704 E":                "016335170U", //YO	
  "MIWUK SUB 1701":               "0163661701", //YO	
  "MIWUK SUB 1702":               "0163661702", //YO	
  "MIWUK SUB 1701 A":             "016366170A", //YO	
  "MIWUK SUB 1701 B":             "016366170B", //YO	
  "MIWUK SUB 1702 A":             "016366170Y", //YO	
  "MIWUK SUB 1702 B":             "016366170Z", //YO	
  "COTTLE 1701":                  "0163711701", //YO	
  "COTTLE 1702":                  "0163711702", //YO	
  "COTTLE 1703":                  "0163711703", //YO	
  "COTTLE 1704":                  "0163711704", //YO	
  "RACETRACK SUB 1703":           "0163761703", //YO	
  "RACETRACK SUB 1704":           "0163761704", //YO	
  "RACETRACK SUB 1703 A":         "016376170A", //YO	
  "RACETRACK SUB 1703 B":         "016376170B", //YO	
  "PEORIA FLAT 1704":             "0163781704", //YO	
  "PEORIA FLAT 1701 A":           "016378170A", //YO	
  "PEORIA FLAT 1701 B":           "016378170B", //YO	
  "PEORIA FLAT 1701 C":           "016378170C", //YO	
  "PEORIA FLAT 1704 A":           "016378170J", //YO	
  "PEORIA FLAT 1704 B":           "016378170K", //YO	
  "PEORIA FLAT 1704 C":           "016378170L", //YO	
  "SALADO 1101":                  "0163811101", //YO	
  "SALADO 1102":                  "0163811102", //YO	
  "YO HCP MBZ 1701":              "017HCP1701", //YO	
  "YO HCP MBZ 1702":              "017HCP1702", //YO	
  "YO HCP MBZ 1703":              "017HCP1703", //YO	
  "YO HCP MBZ 1704":              "017HCP1704", //YO	
  "YO HCP MBZ 1705":              "017HCP1705", //YO	
  "YO HCP MBZ 1706":              "017HCP1706", //YO	
  "YO HCP MBZ 1707":              "017HCP1707", //YO	
  "YO HCP MBZ 1708":              "017HCP1708", //YO	
  "CANAL 1101":                   "0252091101", //YO	
  "CANAL 1102":                   "0252091102", //YO	
  "CANAL 1103":                   "0252091103", //YO	
  "CANAL 1104":                   "0252091104", //YO	
  "CANAL 1105":                   "0252091105", //YO	
  "CANAL 1106":                   "0252091106", //YO	
  "BEAR VALLEY 1101":             "0252191101", //YO	
  "BEAR VALLEY 1105":             "0252191105", //YO	
  "BEAR VALLEY 2101":             "0252192101", //YO	
  "BEAR VALLEY 2105":             "0252192105", //YO	
  "BEAR VALLEY 2105-A":           "025219210A", //YO	
  "BEAR VALLEY 2105-B":           "025219210B", //YO	
  "LIVINGSTON 1101":              "0252261101", //YO	
  "LIVINGSTON 1102":              "0252261102", //YO	
  "LIVINGSTON 1104":              "0252261104", //YO	
  "LIVINGSTON 1105":              "0252261105", //YO	
  "LIVINGSTON 1106":              "0252261106", //YO	
  "MENDOTA 1101":                 "0252311101", //YO	
  "MENDOTA 1102":                 "0252311102", //YO	
  "MENDOTA 1103":                 "0252311103", //YO	
  "DAIRYLAND 1102":               "0252421102", //YO	
  "DAIRYLAND 1103":               "0252421103", //YO	
  "DAIRYLAND 1105":               "0252421105", //YO	
  "DAIRYLAND 1109":               "0252421109", //YO	
  "EL NIDO 1101":                 "0252451101", //YO	
  "EL NIDO 1102":                 "0252451102", //YO	
  "EL NIDO 1103":                 "0252451103", //YO	
  "EL NIDO 1104":                 "0252451104", //YO	
  "POWER HOUSE NO 2 1103":        "0252521103", //YO	
  "POWER HOUSE NO 3 1101":        "0252531101", //YO	
  "POWER HOUSE NO 3 1102":        "0252531102", //YO	
  "POWER HOUSE NO 3 1103":        "0252531103", //YO	
  "POWER HOUSE NO 3 1102-A":      "025253110M", //YO	
  "POWER HOUSE NO 3 1102-B":      "025253110N", //YO	
  "INDIAN FLAT 1104":             "0252691104", //YO	
  "WORLD COLOR PRESS 1101":       "0252751101", //YO	
  "MADERA 1102":                  "0252761102", //YO	
  "MADERA 1104":                  "0252761104", //YO	
  "MADERA 1106":                  "0252761106", //YO	
  "MADERA 1110":                  "0252761110", //YO	
  "MADERA 1112":                  "0252761112", //YO	
  "MADERA 1114":                  "0252761114", //YO	
  "MADERA 1116":                  "0252761116", //YO	
  "MERCED 1108":                  "0252801108", //YO	
  "MERCED 1114":                  "0252801114", //YO	
  "MERCED 1116":                  "0252801116", //YO	
  "MERCED 2101":                  "0252802101", //YO	
  "MERCED 2102":                  "0252802102", //YO	
  "MERCED FALLS 1101":            "0252811101", //YO	
  "MERCED FALLS 1102":            "0252811102", //YO	
  "HAMMONDS 1101":                "0253401101", //YO	
  "HAMMONDS 1102":                "0253401102", //YO	
  "HAMMONDS 1104":                "0253401104", //YO	
  "FIREBAUGH 1101":               "0253471101", //YO	
  "FIREBAUGH 1102":               "0253471102", //YO	
  "SANTA RITA 1102":              "0253541102", //YO	
  "SANTA RITA 1105":              "0253541105", //YO	
  "CHENEY 1101":                  "0253561101", //YO	
  "CHENEY 1102":                  "0253561102", //YO	
  "CHENEY 1103":                  "0253561103", //YO	
  "CHENEY 1104":                  "0253561104", //YO	
  "ATWATER 1102":                 "0253611102", //YO	
  "ATWATER 1103":                 "0253611103", //YO	
  "ATWATER 1104":                 "0253611104", //YO	
  "ATWATER 1105":                 "0253611105", //YO	
  "ATWATER 1106":                 "0253611106", //YO	
  "ATWATER 1107":                 "0253611107", //YO	
  "ATWATER 1108":                 "0253611108", //YO	
  "EL CAPITAN 1102":              "0253881102", //YO	
  "EL CAPITAN 1103":              "0253881103", //YO	
  "EL CAPITAN 1104":              "0253881104", //YO	
  "EL CAPITAN 1105":              "0253881105", //YO	
  "EL CAPITAN 1106":              "0253881106", //YO	
  "EL CAPITAN 2109":              "0253882109", //YO	
  "EL CAPITAN 2110":              "0253882110", //YO	
  "EL PECO 1101":                 "0253981101", //YO	
  "EL PECO 1102":                 "0253981102", //YO	
  "DOS PALOS 1101":               "0254041101", //YO	
  "DOS PALOS 1102":               "0254041102", //YO	
  "SANTA NELLA 1101":             "0254051101", //YO	
  "SANTA NELLA 1102":             "0254051102", //YO	
  "CHOW CHILLA 1103":             "0254101103", //YO	
  "CHOW CHILLA 1104":             "0254101104", //YO	
  "CHOW CHILLA 1105":             "0254101105", //YO	
  "CHOW CHILLA 1106":             "0254101106", //YO	
  "CASSIDY 1102":                 "0254271102", //YO	
  "WILSON 1101":                  "0254301101", //YO	
  "WILSON 1102":                  "0254301102", //YO	
  "WILSON 1103":                  "0254301103", //YO	
  "ORTIGA 1105":                  "0254311105", //YO	
  "ORTIGA 1106":                  "0254311106", //YO	
  "OAKHURST 1101":                "0254421101", //YO	
  "OAKHURST 1102":                "0254421102", //YO	
  "OAKHURST 1103":                "0254421103", //YO	
  "OAKHURST 1103-A":              "025442110A", //YO	
  "OAKHURST 1103-B":              "025442110B", //YO	
  "OAKHURST 1101-A":              "025442110Y", //YO	
  "OAKHURST 1101-B":              "025442110Z", //YO	
  "COARSEGOLD SUB 2102":          "0254432102", //YO	
  "COARSEGOLD SUB 2104":          "0254432104", //YO	
  "MARIPOSA 2101":                "0254452101", //YO	
  "MARIPOSA 2102":                "0254452102", //YO	
  "MARIPOSA 2101-A":              "025445210A", //YO	
  "MARIPOSA 2101-B":              "025445210B", //YO	
  "MARIPOSA 2101-C":              "025445210C", //YO	
  "MARIPOSA 2101-D":              "025445210D", //YO	
  "MARIPOSA 2101-E":              "025445210E", //YO	
  "MARIPOSA 2102-W":              "025445210W", //YO	
  "MARIPOSA 2102-X":              "025445210X", //YO	
  "MARIPOSA 2102-Y":              "025445210Y", //YO	
  "MARIPOSA 2102-Z":              "025445210Z", //YO	
  "NEWHALL 1109":                 "0254461109", //YO	
  "NEWHALL 1111":                 "0254461111", //YO	
  "STOREY 1104":                  "0254611104", //YO	
  "STOREY 1105":                  "0254611105", //YO	
  "STOREY 1106":                  "0254611106", //YO	
  "STOREY 1107":                  "0254611107", //YO	
  "STOREY 1108":                  "0254611108", //YO	
  "STOREY 1109":                  "0254611109", //YO	
  "WRIGHT 1109":                  "0254641109", //YO	
  "CRESSEY 2103":                 "0254702103", //YO	
  "CRESSEY 2104":                 "0254702104", //YO	
  "BORDEN 1101":                  "0255121101", //YO	
  "BORDEN 1102":                  "0255121102", //YO	
  "SHARON 1101":                  "0255331101", //YO	
  "LE GRAND 1104":                "0255361104", //YO	
  "LE GRAND 1106":                "0255361106", //YO	
  "LE GRAND 1110":                "0255361110", //YO	
  "LE GRAND 1112":                "0255361112", //YO	
  "ORO LOMA 1104":                "0255371104", //YO	
  "ORO LOMA 1106":                "0255371106", //YO	
  "ORO LOMA 1108":                "0255371108", //YO	
  "ORO LOMA 1110":                "0255371110", //YO	
  "ORO LOMA 1112":                "0255371112", //YO	
  "ORO LOMA 1114":                "0255371114", //YO	
  "BONITA 1101":                  "0255391101", //YO	
  "BONITA 1102":                  "0255391102", //YO	
  "BONITA 1103":                  "0255391103", //YO	
  "BONITA 1104":                  "0255391104", //YO	
  "CRANE VALLEY 1101":            "0258531101", //YO	
  "SO. CAL. EDISON #2 1101":      "0258851101", //YO	
  "SO. CAL. EDISON #3 1101":      "0258861101", //YO	
  "TRAN - YO 60Kv":               "TR02506003", //YO	
  "TRAN - YO 70Kv":               "TR02507003", //YO	
  "CR-LOS BANOS-CANAL-ORO LOMA YO":  "TR02508000", //YO	
  "CR-BORDEN-COPPERMINE YO":         "TR02508001", //YO	
  "TRAN - YO 115Kv":              "TR02511503", //YO	
  "TRAN - YO 230Kv":              "TR02523003", //YO	
  "TRAN - YO 500Kv":              "TR02550003", //YO	
};


var transmison_circuit_codes = {
  CC: {
    60:  "TR00806001",
    70:  "TR00807001",
    115: "TR00811501",
    230: "TR00823001",
    500: "TR00850001"
  },
  DA: {
    	60:  "TR00806002",
    	70:  "TR00807002",
    	115: "TR00811502",
    	230: "TR00823002",
    	500: "TR00850002"
  },
  EB: {
    	60:  "TR00106002",
    	70:  "TR00107002",
    	115: "TR00111502",
    	230: "TR00123002",
    	500: "TR00150002"
  },
  FR: {
    	60:  "TR02506001",
    	70:  "TR02507001",
    	115: "TR02511501",
    	230: "TR02523001",
    	500: "TR02550001"
  },
  KE: {
    	60:  "TR02506002",
    	70:  "TR02507002",
    	115: "TR02511502",
    	230: "TR02523002",
    	500: "TR02550002"

  },
  LP: {
    	60:  "TR01806001",
    	70:  "TR01807001",
    	115: "TR01811501",
    	230: "TR01823001",
    	500: "TR01850001"
  },
  MI: {
    	60:  "TR00106003",
    	70:  "TR00107003",
    	115: "TR00111503",
    	230: "TR00123003",
    	500: "TR00150003"
  },
  NB: {
    	60:  "TR00406002",
    	70:  "TR00407002",
    	115: "TR00411502",
    	230: "TR00423002",
    	500: "TR00450002"
  },
  NC: {
    	60:  "TR00406001",
    	70:  "TR00407001",
    	115: "TR00411501",
    	230: "TR00423001",
    	500: "TR00450001"
  },
  NV: {
    	60:  "TR01006001",
    	70:  "TR01007001",
    	115: "TR01011501",
    	230: "TR01023001",
    	500: "TR01050001"
  },
  PE: {
    	60:  "TR00206001",
    	115: "TR00211501",
    	230: "TR00223001",
  },
  SA: {
    	60:  "TR00606001",
    	70:  "TR00607001",
    	115: "TR00611501",
    	230: "TR00623001",
    	500: "TR00650001"
  },
  SI: {
    	60:  "TR01506001",
    	70:  "TR01507001",
    	115: "TR01511501",
    	230: "TR01523001",
    	500: "TR01550001"
  },
  SJ: {
    	60:  "TR00806003",
    	70:  "TR00807003",
    	115: "TR00811503",
    	230: "TR00823003",
    	500: "TR00850003"
  },
  ST: {
    	60:  "TR01606001",
    	70:  "TR01607001",
    	115: "TR01611501",
    	230: "TR01623001",
    	500: "TR01650001"
  },
  YO: {
    	60:  "TR02506003",
    	70:  "TR02507003",
    	115: "TR02511503",
    	230: "TR02523003",
    	500: "TR02550003"
  }
};




var location_status = {
  no_work_no_restrict:  "CMP_NW_NR",  // No Tree Work, No Restrictions
  no_work_with_restrict:     "CMP_NW_RE", 	// Complete Status, No Tree Work, Restriction(s) exist
  work_no_restrict:     "CMP_WK_NR",  // Complete Status, Tree Work Prescribed, No Restrictions
  work_with_restrict:   "CMP_WK_RE",  // Tree Work Prescribed, Restriction(s) exist

  no_work:              "CONTACT_NW", // No Tree Work
  work_needed:          "CONTACT_WK", // Tree Work Prescribed

  open:                 "OPEN",       // Open Status (Assigned)
  work_complete:        "WK_CMP"      // Tree Work Completed  
};

var restriction_codes = {
  "debris_management":             "DM",   // Debris Management            
  "eagle":                         "EG",   // Eagle                        
  "hazard_notify":                 "HN",   // Hazard Notification          
  "new_planting":                  "NP",   // New Planting                 
  "nest_review":                   "NR",   // Nest Review                  
  "private_line":                  "PL",   // Private Line                  
  "quarantine":                    "QT",   // Quarantine                   
  "refusal_r":                     "RF",   // Refusal R                    
  "r_review":                      "RP",   // R-Review                     
  "transmission_mitigation":       "TM",   // Transmission Mitigation Plan 
  "velb_removal":                  "VR",   // VELB Removal                 
};
     
var priority_codes = {
  "routine": "R",
  "allgood": "N", //no trim
  "no_trim": "N",
  "HN-Imd": "H",
  "HN-Urg": "U",
  "accelerate": "X",
  "immediate": "I"
};

var trim_codes =  {
  "Br Rmv":"BC",
  "Br Rmv+Trt":"BCS",
  "BCS Br Rmv+Trt":"BCS",
  "BC Br Rmv": "BCS",//confirm
  "Br Trim":"BT",
  "BT Br Trim":"BT",
  "C.Assist":"CON",
  "CON C.Assist":"CON",
  "FP-Rmv1 A":"F1A",
  "F1A FP-Rmv1":"F1A",
  "FP-Rmv1 B":"F1B",
  "FS-R1A+Trt":"F1C",
  "F1C FS-R1A+Trt":"F1C",
  "FS-R1B+Trt":"F1D",
  "F1D FS-R1B+Trt":"F1D",
  "FP-Rmv2 A":"F2A",
  "F2A FP-Rmv2":"F2A",
  "FP-Rmv2 B":"F2B",
  "F2B FP-Rmv2":"F2B",
  "FS-R2A+Trt":"F2C",
  "F2C FS-R2A+Trt":"F2C",
  "FS-R2B+Trt":"F2D",
  "F2D FS-R2B+Trt":"F2D",
  "FP-Rmv3 A":"F3A",
  "F3A FP-Rmv3":"F3A",
  "FP-Rmv3 B":"F3B",
  "F3B FP-Rmv3":"F3B",
  "FS-R3A+Trt":"F3C",
  "F3C FS-R3A+Trt":"F3C",
  "FS-R3B+Trt":"F3D",
  "F3D FS-R3B+Trt":"F3D",
  "FP-Rmv4 A":"F4A",
  "F4A FP-Rmv4":"F4A",
  "FP-Rmv4 B":"F4B",
  "F4B FP-Rmv4":"F4B",
  "FS-R4A+Trt":"F4C",
  "FS-R4B+Trt":"F4D",
  "F4D FS-R4B+Trt":"F4D",
  "FP-Trim A":"FAA",
  "FAA FP-Trim":"FAA",
  "FP-Trim B":"FAB",
  "FAB FP-Trim":"FAB",
  "FP-Major A":"FBA",
  "FBA FP-Major":"FBA",
  "FP-Major B":"FBB",
  "FBB FP-Major":"FBB",
  "FP-Ov A":"FOA",
  "FOA FP-Ov":"FOA",
  "FP-Ov B":"FOB",
  "FOB FP-Ov":"FOB",
  "TGR Only":"GRO",
  "TGR+SD":"GSD",
  "TGR+TD":"GTD",
  "TGR+Top":"GTO",
  "Final Ht":"HFH",
  "Overhang":"OV",
  "Rmv 1-A":"R1A",
  "R1A": "R1A",
  "Rmv 1-B":"R1B",
  "R1B": "R1B",
  "Rmv1-A+Trt":"R1C",
  "R1C":"R1C",
  "Rmv1-B+Trt":"R1D",
  "R1D":"R1D",
  "Rmv 2-A":"R2A",
  "R2A":"R2A",
  "R2B":"R2B",
  "Rmv2-A+Trt":"R2C",
  "R2C":"R2C",
  "Rmv2-B+Trt":"R2D",
  "R2D":"R2D",
  "Rmv 3-A":"R3A",
  "R3A":"R3A",
  "Rmv 3-B":"R3B",
  "R3B":"R3B",
  "Rmv3-A+Trt":"R3C",
  "R3C":"R3C",
  "Rmv3-B+Trt":"R3D",
  "R3D":"R3D",
  "Rmv 4-A":"R4A",
  "R4A":"R4A",
  "Rmv 4-B":"R4B",
  "R4B":"R4B",
  "Rmv4-A+Trt":"R4C",
  "Rmv4-B+Trt":"R4D",
  "R4D":"R4D",
  "Side":"SD",
  "side":"SD",
  "Sec Strain":"SEC",
  "Slope":"SL",
  "Srvc Drop":"SRV",
  "S-Wrap Clb":"SWC",
  "S-Wrap Lft":"SWL",
  "TopDirect":"TD",
  "topdirect":"TD",
  "Top":"TO",
  "top":"TO",
  "ReTreat":"TRT",
  "Retreat Prescription": "TRT",
  //I don't know what to translate these too so this is my best guess
  "ftp":"FAA", 
  "ftpdead": "FBA"
};
var values = _.values(trim_codes);
for(var i = 0; i < values.length; i++) {
  var value = values[i];
  trim_codes[value] = value;
}


var tree_record_status = 
{
  "no_work_no_issues":   "CMP_NI",     // Complete - No Issues     Tree was inspected and no work was needed, 
                                       //                          and there were no restrictions (sNotification=N)
  "no_work_with_issues": "CMP_WI",     // Complete - With Issues   Tree was inspected and no work was needed, but there 
                                       //                          are restrictions if someone later decides to trim it (sNotification=N)
  "contact_no_issues":    "CONTACT_NI", // No Issues               Inspector is waiting for customer to call them back, 
                                        //                         and tree has NO restrictions (sNotification = C, Q, R)
  "contact_with_issues":  "CONTACT_WI", // With Issues             Inspector is waiting for customer to call them back, 
                                        //                         and tree has restrictions (sNotification = C, Q, R)
  "tree_ok":              "OK",	        // OK                      Tree needs to be trimmed (sNotification = O)
  "open":                 "OPEN"        // Open                    Tree has not been inspected yet
};

var notification_codes = {
  "contact":    "C",	
  "hold":       "H",	
  "left_card":  "L",	
  "inventory":  "N",	
  "ok":         "O",	
  "phone":      "P",	
  "quarantine": "Q",	
  "refusal":	  "R"
};


var work_categories = {
  "local":      "AL", // GO165 - Local             A
  "cema":       "CM", // Proj - CEMA               E
  "div_non_vm": "DV", // Division / Non-VM         NULL
  "emergency":  "EM", // Emergency                 NULL
  "express":    "EX", // EXPRESS                   NULL
  "sar_fire":   "FP", // Proj - SRA Fire           NULL
  "orchard":        "OP", // Orchard Project           NULL
  "outage_reduce":  "OR", // Proj - Outage Redctn      NULL
  "project":        "PR", // Project                   NULL
  "routine":        "RT", // Routine Maint             NULL
  "unit_reduce":    "UR", // Unit Reduction            NULL
  "trow":           "WT", // TROW                      W
  "rely_capital":   "YC", // Reliability-Capital       C
  "rely_local":     "YL", // Reliability - Local       NULL
  "rely_system":    "YS", // Reliability - System      NULL
};

//Mike Morley Email:  This column has not been used in a very long time.  It used to indicate what kind of billing to use 
//                    for the tree, but now the work complete file indicates how work will be billed.   Here are the values 
//                    just for reference:
var work_type = {
  "lump_sum":       "L", //         Lump Sum                
  "time_materials": "M", //         T&M (Time & Material)   
  "other":          "O", //         Other                   
  "unit":           "U"  //         Unit     
};


var alert_codes = {
  "other hazard":             "OH", //DISPATCHR ADDED
	"access permit":            "AP",
	"access":                   "AX",
	"bad dog":                  "BD",
	"cat 1":                    "C1",
	"cat 2":                    "C2",
	"cat 3":                    "C3",
	"dog":                      "DG",
	"environmental bmp":        "EB",
	"existing new planting":    "EP",
	"endangered species":       "ES",
	"existing trans mit plan":  "ET",
	"fire threat zone":         "FZ",
	"hoc":                      "HC",
	"concerned customer":       "IC",
	"locked gate":              "LG",
	"mid span clear":           "MC",
	"hcp mapbook zone":         "MZ",
	"nest bmp":                 "NB",
	"notify first":             "NF",
	"new planting":             "NP",
	"pi notify first":          "PI",
	"past nest review":         "PN",
	"poison-oak":               "PO",
	"past r-review":            "PP",
	"past refusal":             "PR",
	"riparian area":            "RA",
	"riparian":                 "RP",
	"tree house":               "TH",
	"mitigation plan":          "TM",
	"traffic issue":            "TR",
	"velb site":                "VS",
	"whole span clear":         "WC",
	"2014 work":                "X4",
	"2015 work":                "X5",
	"2016 work":                "X6",
	"2017 work":                "X7",
	"2018 work":                "X8",
	"2019 work":                "X9",
	"2020 work":                "Y0",
	"2021 work":                "Y1",
	"2022 work":                "Y2",
	"2023 work":                "Y3",
	"2024 work":                "Y4",
	"concurrent patrol-loc":    "YL",
	"concurrent patrol-sys":    "YS",
};


// Company Name                      sInspComp      bPI            bTrim          bTrans
var company_codes = {
  "ACRT":                           "ACR", //      1              0              0
  "ArborMetrics":                   "AMS", //      1              0              NULL
  "Utility Tree (ASP)":             "ASP", //      0              1              1
  "Asplundh (T&M)":                 "ASX", //      0              0              0
  "Big Hill":                       "BHI", //      0              0              0
  "Blue Tent":                      "BLT", //      1              1              1
  "Brenton VMS":                    "BRE", //      1              0              1
  "Bunyan Bros":                    "BUN", //      0              0              0
  "Paul Bunyan":                    "BUY", //      0              0              0
  "CC Land Clearing":               "CCL", //      0              0              0
  "CD Trees":                       "CDT", //      0              0              0
  "Calif. Forestry":                "CFV", //      0              0              0
  "Chem Weed":                      "CHW", //      0              1              1
  "CN Utility":                     "CNU", //      1              0              NULL
  "California Reforestation":       "CRF", //      1              1              1
  "Calif. Ref.":                    "CRI", //      0              0              0
  "Central Sierra Pest":            "CSP", //      0              1              1
  "Craig Thurber":                  "CTH", //      1              0              1
  "CD Trees Inc.":                  "CTI", //      0              0              0
  "Davey Tree":                     "DAV", //      0              1              1  
  "Davey Tree (T&M)(dup)":          "DAX", //      0              0              0
  "D & L Enterprises":              "DLE", //      1              0              0
  "Davey RG":                       "DRG", //      1              0              0
  "DRG":                            "DRG", //      1              0              0
  "CamLand":                        "DT1", //      0              0              0
  "Davey Tree (T&M)":               "DVX", //      0              0              0
  "ENRESTEK":                       "ERT", //      1              1              1
  "Evans":                          "EVA", //      0              0              0
  "Family Tree":                    "FTS", //      0              1              1
  "Godon":                          "GOD", //      0              0              0
  "Gosnell Tree":                   "GOS", //      0              0              0
  "Green":                          "GRE", //      0              0              0
  "GRT":                            "GTT", //      0              0              0
  "High Country Forestry":          "HCF", //      1              0              NULL
  "Hill Top":                       "HIL", //      0              0              0
  "Incline":                        "INC", //      0              0              0
  "K.W.Emerson":                    "KWE", //      0              0              0
  "Loggers Unl.":                   "LOG", //      0              0              0
  "Loggers Unlimited":              "LUN", //      0              1              0
  "Martinez Utility":               "MAR", //      1              0              0
  "Mc Colloch":                     "MCC", //      0              0              0
  "Meadowlark":                     "MEA", //      0              0              0
  "Mountain F. Enterprises":        "MFE", //      0              1              1
  "Mountain F Enterprises":         "MFE", //      0              1              1  
  "Mtn Firewood":                   "MFW", //      0              0              0
  "Mowbray":                        "MOW", //      0              1              0
  "Mt. Firewood":                   "MTF", //      0              0              0
  "N/A":                            "N/A", //      1              1              1
  "Nelson Tree":                    "NEL", //      0              0              0
  "North State Forestry":           "NSF", //      1              1              1
  "NW Forestry":                    "NWF", //      0              0              0
  "Orient Consulting":              "OCJ", //      1              0              0
  "Osmose":                         "OSM", //      0              0              0
  "Other":                          "OTH", //      0              0              0
  "Outback Comm.":                  "OUT", //      0              0              0
  "P.G.& E.":                       "PGE", //      1              0              0
  "Pest Mgmt Tech":                 "PMT", //      0              1              1
  "Precision":                      "PRE", //      0              0              0
  "Provco":                         "PRO", //      0              0              0
  "Provco (T&M)":                   "PRX", //      0              0              0
  "Quality Cl.":                    "QEC", //      0              0              0
  "Quality Ent.":                   "QEI", //      0              0              0
  "R. Brown":                       "RBR", //      0              0              0
  "Renee Godon":                    "REN", //      0              0              0
  "Robinson Timber":                "RTC", //      0              0              0
  "Redding Tree Growers":           "RTG", //      0              1              1
  "Sound Forest":                   "SND", //      0              0              0
  "Scott Timber Contracting":       "STC", //      0              1              0
  "Skyline Tree":                   "STS", //      0              1              1
  "Trees Inc.":                     "TAS", //      0              1              1
  "TBD":                            "TBD", //      1              1              0
  "Tree Elements":                  "TEL", //      0              0              0
  "Total Foresty":                  "TOF", //      0              0              0
  "Total Quality Mgmt":             "TQM", //      0              0              0
  "Trees Inc.  (old)":              "TRI", //      0              0              0
  "Trees Inc.  (T&M)":              "TRX", //      0              0              0
  "Tree Service Unlimited":         "TSU", //      0              1              0
  "Utility Tree (UAS)":             "UAS", //      0              1              1
  "UPT":                            "UPT", //      0              0              0
  "Utility Tree  (old)":            "UTS", //      0              0              0
  "Utility Tree (T&M)":             "UTX", //      0              0              0
  "Webb":                           "WEB", //      0              0              0
  "WECI":                           "WEC", //      1              0              1
  "Windy City":                     "WIC", //      0              0              0
  "Wright Tree":                    "WRT", //      0              1              1
  "Windy Tree":                     "WTS", //      0              1              1
  "Windy Tree (dup)":               "WTX", //      0              0              0
  "Wild West Reforesters":          "WWR"  //      0              1              1
};

// var inspection_companies = {
//   "ACRT":                   "ACR",
//   "Brenton VMS":            "BVM",
//   "Davey Tree":             "DAV",
//   "DRG":                    "DAV",
//   "High Country Forestry":  "HCF",
//   "Martinez Utility":       "MAR",
//   "Nelson Tree":            "NEL",
//   "Newcomb Tree Svc":       "NTS",
//   "P.G.& E.":               "PGE",
//   "Provco":                 "PRO",
//   "Craig Thurber":          "THU",
//   "Total Quality Mgmt":     "TQM",
//   "Trees Inc.":             "TRI",
//   "Utility Tree Service":   "UTS",
//   "Western ECI":            "WEC",
//   "WECI":                   "WEC",
//   "Wright Tree":            "WRT",
//   "Windy Tree":             "WIN",
//   "Mountain F Enterprises": "MFE"
// };


var tree_types = {
  "Acacia":              "ACA",	
  "Blackwood Acacia":    "ACAB",	
  "Ailanthus":           "AILA",	
  "Albizzia":            "ALBI",	
  "Alder":               "ALD",	
  "Alder - White":       "ALDE",	
  "Alder - Red":         "ALDR",	
  "Almond":              "ALMO",	
  "Apple":               "APPL",	
  "Arundo":              "ARUN",	
  "Ash":                 "ASH",	
  "Evergreen Ash":       "ASHE",	
  "Modesto Ash":         "ASHM",	
  "Raywood Ash":         "ASHR",	
  "Athel":               "ATHE",	
  "Australian Willow":   "AUSW",	
  "Avocado":             "AVOC",	
  "Bamboo":              "BAMB",	
  "Bay, Calif.":         "BAY",	
  "Bay":                 "BAY",	  
  "Beech":               "BEEC",	
  "Birch":               "BIRC",	
  "Bottlebrush":         "BOTT",	
  "Brisbane Box":        "BRIS",	
  "Brush (misc)":        "BRUS",	
  "Brush":               "BRUS",	  
  "Buckeye":             "BUCK",	
  "Camphor":             "CAMP",	
  "Carob":               "CARO",	
  "Carrot Wood":         "CARW",	
  "Cascara":             "CASC",	
  "Casuarina":           "CASU",	
  "Catalpa":             "CATA",	
  "Ceanothus":           "CEAN",	
  "Cedar":               "CEDA",	
  "Atlas Cedar":         "CEDT",	
  "Century Plant":       "CENT",	
  "Cherry":              "CHER",	
  "Chestnut":            "CHES",	
  "Chinaberry":          "CHIN",	
  "Chinquapin":          "CHNQ",	
  "Coral":               "CORA",	
  "Cottonwood, Black":   "COTB",	
  "Cottonwood, Freemont": "COTT",	
  "Crape Myrtle":        "CRPE",	
  "Italian Cypress":     "CYPI",	
  "Monterey Cypress":    "CYPM",	
  "Cypress":             "CYPR",	
  "Deodara Cedar":       "DEOD",	
  "Box-Elder":           "ELDE",	
  "Box":                 "ELDE",  
  "Elderberry":          "ELDR",	
  "Elm":                 "ELM",	
  "Elm, American":       "ELMA",	
  "Chinese Elm":         "ELMC",	
  "Eucalyptus":          "EUCA",	
  "Blue Gum":            "EUCB",	
  "Red Gum":             "EUCC",	
  "Red-flowering Gum":   "EUCF",	
  "Coolibah":            "EUCM",	
  "Silver Dollar Gum":   "EUCP",	
  "Red Ironbark":        "EUCS",	
  "Manna Gum":           "EUCV",	
  "Eugenia":             "EUGE",	
  "Ficus":               "FICU",	
  "Fig":                 "FIG",	
  "Fir, True":           "FIR",	
  "Douglas Fir":         "FIRD",	
  "Grand Fir":           "FIRG",	
  "Red Fir":             "FIRR",	
  "White Fir":           "FIRW",	
  "Fruit Tree":          "FRUI",	
  "Ginkgo":              "GINK",	
  "Hackberry":           "HACK",	
  "Hawthorn":            "HAWT",	
  "Hemlock":             "HELM",	
  "Hickory":             "HICK",	
  "Jacaranda":           "JACA",	
  "Juniper":             "JUNI",	
  "Koelreuteria":        "KOEL",	
  "Laurel, Grecian":     "LAUR",	
  "Linden":              "LIND",	
  "Liq Ambar (Sw Gum)":  "LIQ",	
  "Liq Ambar":           "LIQ",	
  "Honey Locust":        "LOCH",	
  "Locust, Black":       "LOCU",	
  "Loquat":              "LOQ",	
  "Madrone":             "MADR",	
  "Magnolia":            "MAGN",	
  "Bigleaf Maple":       "MAPB",	
  "Maple":               "MAPL",	
  "Silver Maple":        "MAPS",	
  "Mayten":              "MAYT",	
  "Melaleuca":           "MELA",	
  "Mesquite":            "MESQ",	
  "Mimosa":              "MIMO",	
  "Monkey Puzzle":       "MONK",	
  "Mulberry":            "MULB",	
  "Myoporum":            "MYOP",	
  "Myrtle, Pacific Wax": "MYRT",	
  "NERC Inventory":      "NERC",	
  "No Trees":            "NONE",	
  "Norfolk Island Pine": "NORF",	
  "Oak":                 "OAK",	
  "Coast Live Oak":      "OAKC",	
  "Coastal live oak":    "OAKC",	  
  "Blue Oak":            "OAKD",	
  "Blue oak":            "OAKD",	  
  "English Oak":         "OAKE",	
  "Oregon White Oak":    "OAKG",	
  "Holly Oak":           "OAKH",	
  "Interior Live Oak":   "OAKI",	
  "Black Oak":           "OAKK",	
  "Black oak":           "OAKK",	  
  "Live Oak":            "OAKL",	
  "Oracle Oak":          "OAKM",	
  "Pin Oak":             "OAKP",	
  "Red Oak, Northern":   "OAKR",	
  "Cork Oak":            "OAKU",	
  "Valley oak":          "OAKV",	  
  "Valley Oak":          "OAKV",	
  "Canyon Live Oak":     "OAKY",	
  "Oleander":            "OLEA",	
  "Olive":               "OLIV",	
  "Other":               "OTHE",	
  "Palm-Date":           "PALD",	
  "Palm-Fan":            "PALF",	
  "Palm":                "PALM",	
  "Palo Verde":          "PALO",	
  "Palm-Queen":          "PALQ",	
  "Pear":                "PEAR",	
  "Pecan":               "PECA",	
  "Pepper Tree":         "PEPP",	
  "Aleppo Pine":         "PINA",	
  "Bishop Pine":         "PINB",	
  "Canary Island Pine":  "PINC",	
  "Pine":                "PINE",	
  "Gray Pine":           "PING",	
  "Gray pine":           "PING",	  
  "Italian Stone Pine":  "PINI",	
  "Jeffery Pine":        "PINJ",	
  "Jeffery pine":        "PINJ",	
  "Knobcone Pine":       "PINK",	
  "Lodgepole Pine":      "PINL",	
  "Monterey Pine":       "PINM",	
  "Ponderosa Pine":      "PINP",	
  "Ponderosa pine":      "PINP",	  
  "Sugar Pine":          "PINU",	
  "Pistache":            "PIST",	
  "Pittosporum":         "PITT",	
  "Plum":                "PLUM",	
  "Podocarpus":          "PODO",	
  "Pomegranate":         "POME",	
  "Poplar":              "POPL",	
  "Lombardy Poplar":     "POPO",	
  "Privet":              "PRIV",	
  "Redbud":              "REDB",	
  "Redwood":             "REDW",	  
  "Redwood, Coast":      "REDW",	
  "Dawn Redwood":        "RWDD",	
  "Salt Cedar":          "SALT",	
  "Sequoia, Giant":      "SEQU",	
  "Silk Oak":            "SILK",	
  "Spruce":              "SPRU",	
  "Sycamore":            "SYCA",	
  "Tallow, Chinese":     "TALL",	
  "Tamarisk":            "TAM",	
  "Tan Oak":             "TAN",	
  "Toyon":               "TOYO",	
  "Tulip Tree":          "TULI",	
  "unknown":             "UNKN",	  
  "Unknown":             "UNKN",	
  null:                  "UNKN",
  "Vine":                "VINE",	
  "Black Walnut":        "WALB",	
  "English Walnut":      "WALE",	
  "Walnut":              "WALN",	
  "Willow":              "WILL",	
  "Weeping Willow":      "WILW",	
  "Yucca":               "YUCC",	
  "Zelkova":             "ZELK"
};

var city_codes = {
	"ABERDEEN":1,
	"ACAMPO":2,
	"ACTIS":3,
	"ACTON":4,
	"ADAMS":5,
	"ADAMS SQUARE":6,
	"ADELA":7,
	"ADELAIDA":8,
	"ADELANTO":9,
	"ADIN":10,
	"ADIN-LOOKOUT":11,
	"AERIAL ACRES":12,
	"AETNA SPRINGS":13,
	"AFTON":14,
	"AGER":15,
	"AGNEW":16,
	"AGOURA":17,
	"AGOURA HILLS":18,
	"AGUA CALIENTE":19,
	"AGUA DULCE":20,
	"AGUA FRIA":21,
	"AHWAHNEE":22,
	"AKERS":23,
	"ALABAMA HILL":24,
	"ALAMEDA":25,
	"ALAMO":26,
	"ALBA":27,
	"ALBANY":28,
	"ALBION":29,
	"ALBRAE":30,
	"ALDER CREEK":31,
	"ALDER SPRINGS":32,
	"ALDERCROFT HEIGHTS":33,
	"ALDERGLEN SPRINGS":34,
	"ALDERPOINT":35,
	"ALGERINE":36,
	"ALGOSO":37,
	"ALHAMBRA":38,
	"ALICIA":39,
	"ALLEGHANY":40,
	"ALLENDALE":41,
	"ALLENSWORTH":42,
	"ALMANOR":43,
	"ALONDRA PARK":44,
	"ALPAUGH":45,
	"ALPINE MEADOWS":46,
	"ALPINE VILLAGE":47,
	"ALTA":48,
	"ALTA HILL":49,
	"ALTA LOMA":50,
	"ALTA SIERRA":51,
	"ALTADENA":52,
	"ALTAMONT":53,
	"ALTAVILLE":54,
	"ALTO":55,
	"ALTON":56,
	"ALTURAS":57,
	"ALUM ROCK":58,
	"ALVARADO":59,
	"ALVISO":60,
	"AMADOR CITY":61,
	"AMBLER":62,
	"AMBOY":63,
	"AMERICAN CANYON":64,
	"AMESTI":65,
	"AMPERE":66,
	"AMSTERDAM":67,
	"ANCHOR BAY":68,
	"ANDERSON":69,
	"ANDERSON SPRINGS":70,
	"ANDERSONIA":71,
	"ANGELINO HEIGHTS":72,
	"ANGELS CITY":73,
	"ANGELUS OAKS":74,
	"ANGIOLA":75,
	"ANGWIN":76,
	"ANITA":77,
	"ANNAPOLIS":78,
	"ANNETTE":79,
	"ANSEL":80,
	"ANTELOPE":81,
	"ANTELOPE ACRES":82,
	"ANTES":83,
	"ANTIOCH":84,
	"APPLE VALLEY":85,
	"APPLEGATE":86,
	"APTOS":87,
	"ARASTRAVILLE":88,
	"ARBUCKLE":89,
	"ARCADIA":90,
	"ARCATA":91,
	"ARCHER":92,
	"ARDEN-ARCADE":93,
	"ARENA":94,
	"ARGUS":95,
	"ARLETA":96,
	"ARLYNDA CORNERS":97,
	"ARMISTEAD":98,
	"ARMONA":99,
	"ARNOLD":100,
	"AROMAS":101,
	"ARROWBEAR LAKE":102,
	"ARROWHEAD FARMS":103,
	"ARROWHEAD HIGHLANDS":104,
	"ARROWHEAD SPRINGS":105,
	"ARROYO GRANDE":106,
	"ARROZ":107,
	"ARTESIA":108,
	"ARTOIS":109,
	"ARVIN":110,
	"ASHFORD JUNCTION":111,
	"ASHLAND":112,
	"ASPEN VALLEY":113,
	"ASPENDELL":114,
	"ASTI":115,
	"ASUNCION":116,
	"ATASCADERO":117,
	"ATHENS":118,
	"ATHERTON":119,
	"ATHLONE":120,
	"ATLANTA":121,
	"ATLAS":122,
	"ATOLIA":123,
	"ATWATER":124,
	"AUBERRY":125,
	"AUBURN":126,
	"AUCKLAND":127,
	"AUGUST":128,
	"AUGUST F HAW":129,
	"AUKUM":130,
	"AURANT":131,
	"AURORA":132,
	"AVENA":133,
	"AVENAL":134,
	"AVERY":135,
	"AVILA BEACH":136,
	"AVOCADO":137,
	"AVOCADO HEIGHTS":138,
	"AZALEA":140,
	"AZUSA":141,
	"BADEN":142,
	"BADGER":143,
	"BADWATER":144,
	"BAGBY":145,
	"BAGDAD":146,
	"BAHIA":147,
	"BAKER":148,
	"BAKERSFIELD":149,
	"BALANCE ROCK":150,
	"BALCH CAMP":151,
	"BALDWIN HILLS":152,
	"BALDWIN PARK":153,
	"BALLARAT":154,
	"BALLARD":155,
	"BALLICO":156,
	"BANGOR":157,
	"BANNISTER":158,
	"BANNOCK":159,
	"BANTA":160,
	"BARDI":161,
	"BARDSDALE":162,
	"BARLOW":163,
	"BARNWELL":164,
	"BARSTOW":165,
	"BARTLE":166,
	"BARTLETT":167,
	"BARTLETT SPRINGS":168,
	"BASS LAKE":169,
	"BASSETT":170,
	"BASSETTS":171,
	"BATAVIA":172,
	"BAXTER":173,
	"BAY FARM ISLAND":174,
	"BAY POINT":175,
	"BAYLISS":176,
	"BAYSIDE":177,
	"BAYVIEW":178,
	"BAYWOOD PARK":180,
	"BEALE AFB":181,
	"BEALVILLE":182,
	"BEAR CREEK":183,
	"BEAR RIVER PINES":184,
	"BEAR VALLEY":185,
	"BEAR VALLEY SPRINGS":186,
	"BEATRICE":187,
	"BEATTY JUNCTION":188,
	"BECKWOURTH":189,
	"BEE ROCK":190,
	"BEEGUM":191,
	"BEL AIR":193,
	"BEL MARIN KEYS":194,
	"BELDEN":195,
	"BELFAST":196,
	"BELL":197,
	"BELL CANYON":198,
	"BELL GARDENS":199,
	"BELL MOUNTAIN":200,
	"BELL SPRINGS":201,
	"BELLA VISTA":202,
	"BELLE HAVEN":203,
	"BELLEVIEW":204,
	"BELLEVUE":206,
	"BELLFLOWER":207,
	"BELLOTA":208,
	"BELMONT":209,
	"BELMONT SHORE":210,
	"BELVEDERE":211,
	"BEN HUR":212,
	"BEN LOMOND":213,
	"BENA":214,
	"BENBOW":215,
	"BEND":216,
	"BENICIA":217,
	"BENITO":218,
	"BENTON":219,
	"BENTON HOT SPRINGS":220,
	"BERENDA":221,
	"BERKELEY":222,
	"BERRY CREEK":223,
	"BERRY GLENN":224,
	"BERRYESSA":225,
	"BERTSCH-OCEANVIEW":226,
	"BETHEL ISLAND":227,
	"BETTERAVIA":228,
	"BEVERLY GLEN":229,
	"BEVERLY HILLS":230,
	"BIEBER":231,
	"BIG BAR":232,
	"BIG BEAR CITY":233,
	"BIG BEAR LAKE":234,
	"BIG BEND":235,
	"BIG BUNCH":236,
	"BIG CREEK":237,
	"BIG LAGOON":238,
	"BIG OAK FLAT":239,
	"BIG PINE":240,
	"BIG PINES":241,
	"BIG RIVER":242,
	"BIG ROCK SPRINGS":243,
	"BIG SPRINGS":244,
	"BIG SUR":245,
	"BIG TREES":246,
	"BIGGS":247,
	"BIJOU":248,
	"BINGHAMTON":249,
	"BIOLA":250,
	"BIRCHVILLE":251,
	"BIRDS LANDING":252,
	"BISHOP":253,
	"BISMARCK":254,
	"BITTERWATER":255,
	"BIXBY KNOLLS":256,
	"BLACK MEADOW LANDING":257,
	"BLACK POINT":258,
	"BLACKHAWK":259,
	"BLAIRSDEN":260,
	"BLANCHARD":261,
	"BLANCO":262,
	"BLOCKSBURG":263,
	"BLOOMFIELD":264,
	"BLOOMINGTON":265,
	"BLUE CANYON":266,
	"BLUE HILLS":267,
	"BLUE JAY":268,
	"BLUE LAKE":269,
	"BLUEWATER":270,
	"BOCA":271,
	"BODEGA":272,
	"BODEGA BAY":273,
	"BODFISH":274,
	"BODIE":275,
	"BOGUE":276,
	"BOLINAS":277,
	"BOLSA KNOLLS":278,
	"BONANZA SPRINGS":279,
	"BONITA":280,
	"BONNEFOY":281,
	"BONNY DOON":282,
	"BOONVILLE":283,
	"BOOTJACK":284,
	"BORDEN":285,
	"BORON":286,
	"BORONDA":287,
	"BOROSOLVAY":288,
	"BOSTON RAVINE":289,
	"BOULDER BAY":290,
	"BOULDER CREEK":291,
	"BOUQUET CANYON":292,
	"BOWERBANK":293,
	"BOWLES":294,
	"BOWMAN":295,
	"BOX CANYON":296,
	"BOYES HOT SPRINGS":297,
	"BOYLE HEIGHTS":298,
	"BOYS REPUBLIC":299,
	"BRADBURY":300,
	"BRADLEY":301,
	"BRANSCOMB":302,
	"BRANT":303,
	"BRAY":304,
	"BRAZOS":305,
	"BRENTS JUNCTION":306,
	"BRENTWOOD":307,
	"BRET HARTE":308,
	"BRETZ MILL":309,
	"BRICEBURG":310,
	"BRICELAND":311,
	"BRIDGEPORT":312,
	"BRIDGEVILLE":313,
	"BRIGGS TERRACE":314,
	"BRIONES":315,
	"BRISBANE":316,
	"BRITO":317,
	"BROADMOOR":318,
	"BROADVIEW FARMS":319,
	"BROCKMANS CORNER":320,
	"BROCKWAY":321,
	"BRODERICK":322,
	"BROMELA":323,
	"BROOKDALE":324,
	"BROOKS":325,
	"BROOKS MILL":326,
	"BROWN":327,
	"BROWNS FLAT":328,
	"BROWNS VALLEY":329,
	"BROWNSVILLE":330,
	"BRUCEVILLE":331,
	"BRUSH CREEK":332,
	"BRYMAN":333,
	"BRYN MAWR":334,
	"BRYSON":335,
	"BRYTE":336,
	"BUCHANAN":337,
	"BUCHLI":338,
	"BUCK MEADOWS":339,
	"BUCKEYE":340,
	"BUCKHORN":342,
	"BUCKS LAKE":343,
	"BUCKS LODGE":344,
	"BUCKTOWN":345,
	"BUELLTON":346,
	"BUENA VISTA":347,
	"BUFFALO HILL":348,
	"BUHACH":349,
	"BUMBLEBEE":350,
	"BUMMERVILLE":351,
	"BUNKER":352,
	"BUNKER HILL":353,
	"BUNTINGVILLE":354,
	"BURBANK":355,
	"BURLINGAME":356,
	"BURLINGTON":357,
	"BURNESS":358,
	"BURNEY":359,
	"BURNHAM":360,
	"BURNT RANCH":361,
	"BURR":362,
	"BURREL":363,
	"BURSON":364,
	"BURTON MILL":365,
	"BUSH":366,
	"BUTLER":367,
	"BUTTE CITY":368,
	"BUTTE MEADOWS":369,
	"BUTTE VALLEY":370,
	"BUTTONWILLOW":371,
	"BYRON":372,
	"BYSTROM":373,
	"C-ROAD":374,
	"CABIN COVE":375,
	"CADENASSO":376,
	"CADIZ":377,
	"CADWELL":378,
	"CAIRNS CORNER":379,
	"CAJON":380,
	"CAJON JUNCTION":381,
	"CAL POLY UNIVERSITY":382,
	"CALABASAS":383,
	"CALABASAS HIGHLANDS":384,
	"CALADA":385,
	"CALAVERITAS":386,
	"CALFLAX":387,
	"CALGRO":388,
	"CALICO":389,
	"CALIENTE":390,
	"CALIFORNIA CITY":391,
	"CALIFORNIA HOT SPRINGS":392,
	"CALIFORNIA VALLEY":393,
	"CALISTOGA":394,
	"CALLA":395,
	"CALLAHAN":396,
	"CALLENDER":397,
	"CALNEVA":398,
	"CALPACK":399,
	"CALPELLA":400,
	"CALPINE":401,
	"CALVILLE":402,
	"CALWA":403,
	"CALZONA":404,
	"CAMARILLO":405,
	"CAMBRIA":406,
	"CAMBRIA PINES":407,
	"CAMBRIAN PARK":408,
	"CAMBRIAN VILLAGE":409,
	"CAMDEN":410,
	"CAMEO":411,
	"CAMERON":412,
	"CAMERON CREEK COLONY":413,
	"CAMERON PARK":414,
	"CAMINO":415,
	"CAMP CONNELL":416,
	"CAMP EVERS":417,
	"CAMP MEEKER":418,
	"CAMP NELSON":419,
	"CAMP OWENS":420,
	"CAMP RICHARDSON":421,
	"CAMP SIERRA":422,
	"CAMPBELL":423,
	"CAMPBELLVILLE":424,
	"CAMPO SECO":425,
	"CAMPTONVILLE":426,
	"CANBY":427,
	"CANBY CROSS":428,
	"CANEBRAKE":429,
	"CANNON":430,
	"CANOGA PARK":431,
	"CANTIL":432,
	"CANTUA CREEK":433,
	"CANYON":434,
	"CANYON COUNTRY":435,
	"CANYON DAM":436,
	"CANYONDAM":437,
	"CAPAY":438,
	"CAPE HORN":439,
	"CAPETOWN":440,
	"CAPITOLA":441,
	"CARBONA":442,
	"CARIBOU":443,
	"CARLOTTA":444,
	"CARMEL":445,
	"CARMEL HIGHLANDS":446,
	"CARMEL VALLEY":447,
	"CARMEL VALLEY VILLAGE":448,
	"CARMEL-BY-THE-SEA":449,
	"CARMEN CITY":450,
	"CARMICHAEL":451,
	"CARNELIAN BAY":452,
	"CARPINTERIA":453,
	"CARRICK":454,
	"CARROLTON":455,
	"CARRVILLE":456,
	"CARSON":457,
	"CARSON HILL":458,
	"CARTAGO":459,
	"CARUTHERS":460,
	"CASA CONEJO":461,
	"CASA LOMA":462,
	"CASCADE":463,
	"CASEY CORNER":464,
	"CASITAS SPRINGS":465,
	"CASMALIA":466,
	"CASPAR":467,
	"CASSEL":468,
	"CASTAIC":469,
	"CASTELLA":470,
	"CASTELLAMMARE":471,
	"CASTLE CRAG":472,
	"CASTLE ROCK SPRINGS":473,
	"CASTRO VALLEY":474,
	"CASTROVILLE":475,
	"CATHEYS VALLEY":476,
	"CATLETT":477,
	"CAVE CITY":478,
	"CAWELO":479,
	"CAYTON":480,
	"CAYUCOS":481,
	"CAZADERO":482,
	"CECILE":483,
	"CECILVILLE":484,
	"CEDAR CREST":485,
	"CEDAR FLAT":486,
	"CEDAR GLEN":487,
	"CEDAR MILL":488,
	"CEDAR RIDGE":489,
	"CEDAR SLOPE":490,
	"CEDARBROOK":491,
	"CEDARPINES PARK":492,
	"CEDARVILLE":493,
	"CELLA":494,
	"CENEDA":495,
	"CENTERVILLE":496,
	"CENTRAL VALLEY":497,
	"CENTURY CITY":498,
	"CERES":499,
	"CERRITOS":500,
	"CHABOT TERRACE":501,
	"CHADBOURNE":502,
	"CHAFFEE":503,
	"CHALFANT":504,
	"CHALFANT VALLEY":505,
	"CHALLENGE":506,
	"CHAMBERS LODGE":507,
	"CHAMBLESS":508,
	"CHANEY RANCH":509,
	"CHANNEL ISLANDS BEACH":510,
	"CHAPMANTOWN":511,
	"CHARTER OAK":512,
	"CHASE":513,
	"CHATSWORTH":514,
	"CHEESEVILLE":515,
	"CHEMEKETA PARK":516,
	"CHEROKEE":517,
	"CHEROKEE STRIP":518,
	"CHERRYLAND":519,
	"CHESTER":520,
	"CHICAGO PARK":521,
	"CHICO":522,
	"CHILCOOT":523,
	"CHILDS MEADOWS":524,
	"CHINA LAKE ACRES":525,
	"CHINATOWN":526,
	"CHINESE CAMP":527,
	"CHINO":528,
	"CHINO HILLS":529,
	"CHINOWTHS CORNER":530,
	"CHIQUITA":531,
	"CHITTENDEN":532,
	"CHOLAME":533,
	"CHORRO":534,
	"CHOWCHILLA":535,
	"CHUALAR":536,
	"CHUBBUCK":537,
	"CIMA":538,
	"CIMARRON":539,
	"CINCO":540,
	"CISCO GROVE":541,
	"CITRO":542,
	"CITRONA":543,
	"CITRUS":544,
	"CITRUS HEIGHTS":545,
	"CITY OF SANTA FE SPRINGS":546,
	"CITY RANCH":547,
	"CITY TERRACE":548,
	"CLAM BEACH":549,
	"CLARAVILLE":550,
	"CLAREMONT":551,
	"CLARIBEL":552,
	"CLARKSBURG":553,
	"CLARKSVILLE":554,
	"CLARSONA":555,
	"CLAUS":556,
	"CLAY":557,
	"CLAYTON":558,
	"CLEAR CREEK":559,
	"CLEARING HOUSE":560,
	"CLEARLAKE":561,
	"CLEARLAKE HIGHLANDS":562,
	"CLEARLAKE OAKS":563,
	"CLEARLAKE PARK":564,
	"CLEMENT JUNCTION":565,
	"CLEMENTS":566,
	"CLEONE":567,
	"CLIMA":568,
	"CLINT":569,
	"CLINTON":570,
	"CLIO":571,
	"CLIPPER MILLS":572,
	"CLOTHO":573,
	"CLOVERDALE":574,
	"CLOVIS":575,
	"CLYDE":576,
	"COALINGA":577,
	"COARSEGOLD":578,
	"COBB":579,
	"COBURN":580,
	"COCHRANE":581,
	"CODORA":582,
	"COHASSET":583,
	"COLD SPRINGS":584,
	"COLEVILLE":585,
	"COLFAX":586,
	"COLFAX SPRING":587,
	"COLIMA":588,
	"COLLEGE CITY":589,
	"COLLEGEVILLE":590,
	"COLLIERVILLE":591,
	"COLLINSVILLE":592,
	"COLMA":593,
	"COLOMA":594,
	"COLTON":595,
	"COLUMBIA":596,
	"COLUSA":597,
	"COMETA":598,
	"COMMERCE":599,
	"COMPTCHE":600,
	"COMPTON":601,
	"CONAWAY":602,
	"CONCORD":603,
	"CONCOW":604,
	"CONEJO":605,
	"CONFEDERATE CORNERS":606,
	"CONFIDENCE":607,
	"CONNER":608,
	"COOL":609,
	"COOPERSTOWN":610,
	"COPCO":611,
	"COPIC":612,
	"COPPER CITY":613,
	"COPPEROPOLIS":614,
	"CORCORAN":615,
	"CORDELIA":616,
	"CORDERO JUNCTION":617,
	"CORNELL":618,
	"CORNING":619,
	"CORRALITOS":620,
	"CORTE MADERA":621,
	"CORTEZ":622,
	"CORY":623,
	"COSO JUNCTION":624,
	"COSY DELL":625,
	"COTATI":626,
	"COTTAGE CORNERS":627,
	"COTTAGE SPRINGS":628,
	"COTTON CENTER":629,
	"COTTONWOOD":630,
	"COULTERVILLE":631,
	"COUNTRY CLUB":632,
	"COUNTRY CLUB PARK":633,
	"COURTLAND":634,
	"COVELO":635,
	"COVINA":636,
	"COW CREEK":637,
	"COYOTE":638,
	"COYOTEVILLE":639,
	"CRABTREE":640,
	"CRAFTON":641,
	"CRANMORE":642,
	"CRANNELL":643,
	"CREED":644,
	"CRENSHAW":645,
	"CRESCENT CITY":646,
	"CRESCENT CITY NORTH":647,
	"CRESCENT MILLS":648,
	"CRESSEY":649,
	"CREST":650,
	"CREST PARK":651,
	"CRESTLINE":652,
	"CRESTMORE":653,
	"CRESTON":654,
	"CRESTVIEW":655,
	"CROCKETT":656,
	"CROMBERG":657,
	"CROME":658,
	"CROMIR":659,
	"CROSS ROADS":660,
	"CROWN":661,
	"CROWN JEWEL":662,
	"CROWS LANDING":663,
	"CRUCERO":664,
	"CRYSTAL CITY":665,
	"CRYSTAL LAKE":666,
	"CRYSTALAIRE":667,
	"CUCAMONGA":668,
	"CUDAHY":669,
	"CULVER CITY":670,
	"CUMMINGS":671,
	"CUPERTINO":672,
	"CURRY VILLAGE":673,
	"CUSHENBURY":674,
	"CUSHING":675,
	"CUTLER":676,
	"CUTTEN":677,
	"CUTTINGS WHARF":678,
	"CUYAMA":679,
	"CYGNUS":680,
	"CYPRESS PARK":681,
	"DAGGETT":682,
	"DAGON":683,
	"DAIRYLAND":684,
	"DALES":685,
	"DALY CITY":686,
	"DANA":687,
	"DANBY":688,
	"DANIELSON":689,
	"DANVILLE":690,
	"DAPHNEDALE PARK":691,
	"DARDANELLE":692,
	"DARLINGTONIA":693,
	"DARRAH":694,
	"DARWIN":695,
	"DAULTON":696,
	"DAVENPORT":697,
	"DAVIS":698,
	"DAVIS CREEK":699,
	"DAY":700,
	"DAY VALLEY":701,
	"DAYTON":702,
	"DAYTON AVENUE":703,
	"DEADWOOD":704,
	"DEATH VALLEY":705,
	"DECLEZVILLE":706,
	"DEDRICK":707,
	"DEER CREEK":708,
	"DEER CREEK COLONY":709,
	"DEER CROSSING":710,
	"DEER LAKE HIGHLANDS":711,
	"DEER PARK":712,
	"DEETZ":713,
	"DEL AIRE":714,
	"DEL LOMA":715,
	"DEL MONTE FOREST":716,
	"DEL PASO HEIGHTS":717,
	"DEL REY":718,
	"DEL REY OAKS":719,
	"DEL RIO":720,
	"DEL ROSA":721,
	"DEL SUR":722,
	"DEL VALLE":723,
	"DELANO":724,
	"DELFT COLONY":725,
	"DELHI":726,
	"DELLEKER":727,
	"DELTA":728,
	"DENAIR":729,
	"DENNY":730,
	"DENVERTON":731,
	"DERBY ACRES":732,
	"DESERT HEIGHTS":733,
	"DESERT LAKE":734,
	"DESERT VIEW HIGHLANDS":735,
	"DEVILS ELBOW":736,
	"DEVORE":737,
	"DEVORE HEIGHTS":738,
	"DEW DROP":739,
	"DI GIORGIO":740,
	"DIABLO":741,
	"DIABLO RANGE":742,
	"DIAMOND BAR":743,
	"DIAMOND SPRINGS":744,
	"DILLARD":745,
	"DILLON BEACH":746,
	"DINKEY CREEK":747,
	"DINSMORE":748,
	"DINUBA":749,
	"DISCOVERY BAY":750,
	"DIXON":751,
	"DIXON LANE-MEADOW CREEK":752,
	"DOBBINS":753,
	"DOBLE":754,
	"DOCKWEILER":755,
	"DOGTOWN":756,
	"DOLLAR POINT":757,
	"DOLOMITE":758,
	"DOMINGUEZ":759,
	"DONNER LAKE":760,
	"DORRINGTON":761,
	"DORRIS":762,
	"DOS PALOS":763,
	"DOS RIOS":764,
	"DOUGLAS CITY":765,
	"DOUGLAS FLAT":766,
	"DOUGLAS PARK":767,
	"DOWNEY":768,
	"DOWNIEVILLE":769,
	"DOYLE":770,
	"DOZIER":771,
	"DRAKESBAD":772,
	"DRYTOWN":773,
	"DUARTE":774,
	"DUBLIN":775,
	"DUCOR":776,
	"DUGAN":777,
	"DUMONT":778,
	"DUNCAN SPRINGS":779,
	"DUNCANS MILLS":780,
	"DUNLAP":781,
	"DUNLAP ACRES":782,
	"DUNMOVIN":783,
	"DUNN":784,
	"DUNNEVILLE":785,
	"DUNNIGAN":786,
	"DUNSMUIR":787,
	"DURHAM":788,
	"DUSTIN ACRES":789,
	"DUTCH FLAT":790,
	"EAGLE LAKE RESORT":791,
	"EAGLE ROCK":792,
	"EAGLE TREE":793,
	"EAGLEVILLE":794,
	"EARLIMART":795,
	"EARP":796,
	"EAST BIGGS":797,
	"EAST COMPTON":798,
	"EAST FARMERSVILLE":799,
	"EAST FOOTHILLS":800,
	"EAST GRIDLEY":801,
	"EAST HIGHLANDS":802,
	"EAST KERN":803,
	"EAST LA MIRADA":804,
	"EAST LOS ANGELES":805,
	"EAST NICOLAUS":806,
	"EAST OAKDALE":807,
	"EAST OROSI":808,
	"EAST PALO ALTO":809,
	"EAST PASADENA":810,
	"EAST PORTERVILLE":811,
	"EAST QUINCY":812,
	"EAST SAN GABRIEL":814,
	"EAST SHORE":815,
	"EAST SIERRA":816,
	"EAST SONORA-PHOENIX LAKE":817,
	"EAST WHITTIER":818,
	"EASTON":819,
	"ECHO LAKE":820,
	"ECHO PARK":821,
	"EDEN VALLEY":822,
	"EDENVALE":823,
	"EDGEWOOD":824,
	"EDISON":825,
	"EDMISTON":826,
	"EDMUNDSON ACRES":827,
	"EDNA":828,
	"EDWARDS AFB":829,
	"EDWIN":830,
	"EL CERRITO":831,
	"EL DORADO":832,
	"EL DORADO HILLS":833,
	"EL GRANADA":834,
	"EL MACERO":835,
	"EL MIRADOR":836,
	"EL MIRAGE":837,
	"EL MONTE":838,
	"EL NIDO":839,
	"EL PASO DE ROBLES PASO ROBLES":840,
	"EL PINAL":841,
	"EL PORTAL":842,
	"EL RIO":843,
	"EL RIO VILLA":844,
	"EL ROBLE":845,
	"EL SEGUNDO":846,
	"EL SERENO":847,
	"EL SERENO CAR":848,
	"EL SOBRANTE":849,
	"EL VERANO":850,
	"ELDERS CORNER":851,
	"ELDERWOOD":852,
	"ELDRIDGE":853,
	"ELECTRA":854,
	"ELIZABETH LAKE":855,
	"ELK":856,
	"ELK CREEK":857,
	"ELK GROVE":858,
	"ELK RIVER":859,
	"ELKHORN":860,
	"ELLWOOD":861,
	"ELM VIEW":862,
	"ELMCO":863,
	"ELMHURST":864,
	"ELMIRA":865,
	"ELMO":866,
	"ELORA":867,
	"ELSA":868,
	"ELVERTA":869,
	"EMERALD BAY":870,
	"EMERALD LAKE HILLS":871,
	"EMERYVILLE":872,
	"EMIGRANT GAP":873,
	"EMMATON":874,
	"EMPIRE":875,
	"ENCINO":876,
	"ENGLEWOOD":877,
	"ENSON":878,
	"ENTERPRISE":879,
	"ESCALLE":880,
	"ESCALON":881,
	"ESPARTO":882,
	"ESQUON":883,
	"ESSEX":884,
	"ESTRELLA":885,
	"ETHEDA SPRINGS":886,
	"ETIWANDA":887,
	"ETNA":888,
	"ETTERSBURG":889,
	"EUGENE":890,
	"EUREKA":891,
	"EVELYN":892,
	"EVERGLADE":893,
	"EVERGREEN":894,
	"EWING":895,
	"EXETER":896,
	"FAIR OAKS":897,
	"FAIR OAKS RANCH":898,
	"FAIR PLAY":899,
	"FAIRFAX":900,
	"FAIRFIELD":901,
	"FAIRMEAD":902,
	"FAIRMONT":903,
	"FAIRVIEW":904,
	"FALES HOT SPRINGS":905,
	"FALL RIVER MILLS":906,
	"FALLEN LEAF":907,
	"FAMOSO":908,
	"FANE":909,
	"FARMERSVILLE":910,
	"FARMINGTON":911,
	"FARWELL":912,
	"FAWNSKIN":913,
	"FAYETTE":914,
	"FEATHER FALLS":915,
	"FEATHER RIVER INN":916,
	"FEATHER RIVER PARK":917,
	"FELIX":918,
	"FELLOWS":919,
	"FELTON":920,
	"FEMMONS":921,
	"FENNER":922,
	"FERGUS":923,
	"FERN":924,
	"FERN ANN FALLS":925,
	"FERNBRIDGE":926,
	"FERNDALE":927,
	"FERNWOOD":928,
	"FETTERS HOT SPRINGS":929,
	"FIDDLETOWN":930,
	"FIELDBROOK":931,
	"FIELDS LANDING":932,
	"FIG ORCHARD":933,
	"FILLMORE":934,
	"FINLEY":935,
	"FIREBAUGH":936,
	"FISH CAMP":937,
	"FISH ROCK":938,
	"FISH SPRINGS":939,
	"FISHEL":940,
	"FIVE CORNERS":941,
	"FIVE MILE TERRACE":942,
	"FIVE POINTS":943,
	"FLAMINGO HEIGHTS":944,
	"FLINTRIDGE":945,
	"FLORENCE":946,
	"FLORIN":947,
	"FLORISTON":948,
	"FLOURNOY":949,
	"FLUHR":950,
	"FLUMEVILLE":951,
	"FLYNN":952,
	"FOLSOM":953,
	"FONTANA":954,
	"FOOTHILL FARMS":955,
	"FOPPIANO":956,
	"FORBESTOWN":957,
	"FORD CITY":958,
	"FOREBAY":959,
	"FOREST":960,
	"FOREST FALLS":961,
	"FOREST GLEN":962,
	"FOREST HILL":963,
	"FOREST KNOLLS":964,
	"FOREST MEADOWS":965,
	"FOREST RANCH":966,
	"FORESTA":967,
	"FORESTHILL":968,
	"FORESTVILLE":969,
	"FORNIS":970,
	"FORT BIDWELL":971,
	"FORT BRAGG":972,
	"FORT DICK":973,
	"FORT GOFF":974,
	"FORT IRWIN":975,
	"FORT JONES":976,
	"FORT ROSS":977,
	"FORT SEWARD":978,
	"FORTUNA":979,
	"FOSTER CITY":980,
	"FOUNTAIN SPRINGS":981,
	"FOUR CORNERS":982,
	"FOUR POINTS":983,
	"FOUTS SPRINGS":984,
	"FOWLER":985,
	"FRANKLIN":986,
	"FRAZIER PARK":987,
	"FREEDOM":988,
	"FREEMAN":989,
	"FREESTONE":990,
	"FREMONT":991,
	"FRENCH CAMP":992,
	"FRENCH CORRAL":993,
	"FRENCH GULCH":994,
	"FRENCHTOWN":995,
	"FRESH POND":996,
	"FRESHWATER":997,
	"FRESNO":998,
	"FRIANT":999,
	"FROST":1000,
	"FRUITDALE":1001,
	"FRUITLAND":1002,
	"FRUITVALE":1003,
	"FRUTO":1004,
	"FULLER ACRES":1005,
	"FULTON":1006,
	"FURNACE CREEK":1007,
	"GALE":1008,
	"GALT":1009,
	"GANNS":1010,
	"GARBERVILLE":1011,
	"GARDEN ACRES":1012,
	"GARDEN FARMS":1013,
	"GARDEN VALLEY":1014,
	"GARDENA":1015,
	"GAREY":1016,
	"GARLOCK":1017,
	"GARVANZA":1018,
	"GAS POINT":1019,
	"GASQUET":1020,
	"GASTON":1021,
	"GAVIOTA":1022,
	"GAZELLE":1023,
	"GENESEE":1024,
	"GEORGE AFB":1025,
	"GEORGETOWN":1026,
	"GERBER":1027,
	"GERBER-LAS FLORES":1028,
	"GEYSERVILLE":1029,
	"GIBSONVILLE":1030,
	"GILLIS":1031,
	"GILROY":1032,
	"GLASGOW":1033,
	"GLASSELL":1034,
	"GLASSELL PARK":1035,
	"GLEN ELLEN":1036,
	"GLENBLAIR":1037,
	"GLENBROOK":1038,
	"GLENBURN":1039,
	"GLENCOE":1040,
	"GLENCOVE":1041,
	"GLENDALE":1042,
	"GLENDORA":1043,
	"GLENHAVEN":1044,
	"GLENN":1045,
	"GLENNVILLE":1046,
	"GLENSHIRE-DEVONSHIRE":1047,
	"GLENVIEW":1048,
	"GLENWOOD":1049,
	"GLORIETTA":1050,
	"GOAT ROCK":1051,
	"GOFFS":1052,
	"GOLD FLAT":1053,
	"GOLD HILL":1054,
	"GOLD RIVER":1055,
	"GOLD RUN":1056,
	"GOLDEN HILLS":1057,
	"GOLDLEAF":1058,
	"GOLDTREE":1059,
	"GOLER HEIGHTS":1060,
	"GOLETA":1061,
	"GONZALES":1062,
	"GOODALE":1063,
	"GOODMILL":1064,
	"GOODYEARS BAR":1065,
	"GORDA":1066,
	"GORDON":1067,
	"GORMAN":1068,
	"GOSFORD":1069,
	"GOSHEN":1070,
	"GRAEAGLE":1071,
	"GRANADA HILLS":1072,
	"GRAND ISLAND":1073,
	"GRAND TERRACE":1074,
	"GRANDVIEW":1075,
	"GRANGEVILLE":1076,
	"GRANITE BAY":1077,
	"GRANITE SPRINGS":1078,
	"GRANITEVILLE":1079,
	"GRAPELAND":1080,
	"GRAPEVINE":1081,
	"GRAPIT":1082,
	"GRASS LAKE":1083,
	"GRASS VALLEY":1084,
	"GRATON":1085,
	"GRAVESBORO":1086,
	"GRAYSON":1087,
	"GREELEY HILL":1088,
	"GREEN VALLEY":1089,
	"GREEN VALLEY LAKE":1091,
	"GREENACRES":1092,
	"GREENBRAE":1093,
	"GREENFIELD":1094,
	"GREENFIELD-PANAMA":1095,
	"GREENHORN":1096,
	"GREENVIEW":1097,
	"GREENVILLE":1098,
	"GREENWATER":1099,
	"GREENWOOD":1100,
	"GREGG":1101,
	"GRENADA":1102,
	"GRIDLEY":1103,
	"GRIMES":1104,
	"GRIZZLY FLAT":1105,
	"GROVELAND":1106,
	"GROVELAND-BIG OAK FLAT":1107,
	"GROVER BEACH":1108,
	"GUADALUPE":1109,
	"GUALALA":1110,
	"GUASTI":1111,
	"GUERNEVILLE":1112,
	"GUERNEWOOD":1113,
	"GUERNSEY":1114,
	"GUINDA":1115,
	"GUSTINE":1116,
	"GYPSITE":1117,
	"HACIENDA HEIGHTS":1118,
	"HACKETSVILLE":1119,
	"HAIGHT-ASHBURY":1120,
	"HALCYON":1121,
	"HALES GROVE":1122,
	"HALF MOON BAY":1123,
	"HALFWAY HOUSE":1124,
	"HALLELUJAH JUNCTION":1125,
	"HALLORAN SPRINGS":1126,
	"HALLS CORNER":1127,
	"HAMBLIN":1128,
	"HAMBONE":1129,
	"HAMBURG":1130,
	"HAMBURG FARMS":1131,
	"HAMILTON BRANCH":1132,
	"HAMILTON CITY":1133,
	"HAMMIL":1134,
	"HAMMOND":1135,
	"HAMMONTON":1136,
	"HANCOCK PARK":1137,
	"HANFORD":1138,
	"HANSEN HILLS":1139,
	"HAPPY CAMP":1140,
	"HAPPY VALLEY":1141,
	"HARBIN SPRINGS":1142,
	"HARBOR CITY":1143,
	"HARBOR HILLS":1144,
	"HARDEN FLAT":1145,
	"HARDWICK":1146,
	"HARDY":1147,
	"HARLEM SPRINGS":1148,
	"HARMONY":1149,
	"HAROLD":1150,
	"HARPERTOWN":1151,
	"HARRIS":1152,
	"HARRISBURG":1153,
	"HARRY FLOYD TERRACE":1154,
	"HART":1155,
	"HARTLEY":1156,
	"HARVARD":1157,
	"HAT CREEK":1158,
	"HATFIELD":1159,
	"HATHAWAY PINES":1160,
	"HAVILAH":1161,
	"HAWAIIAN GARDENS":1162,
	"HAWKINS BAR":1163,
	"HAWKINSVILLE":1164,
	"HAWLEY":1165,
	"HAWTHORNE":1166,
	"HAYDEN":1167,
	"HAYFORK":1168,
	"HAYWARD":1169,
	"HAZARD":1170,
	"HAZELTON":1171,
	"HEALDSBURG":1172,
	"HEARST":1173,
	"HEART BAR CAMPGROUND":1174,
	"HEATHER GLEN":1175,
	"HECTOR":1176,
	"HELENA":1177,
	"HELENDALE":1178,
	"HELM":1179,
	"HENDERSON VILLAGE":1180,
	"HENLEY":1181,
	"HENLEYVILLE":1182,
	"HENRY":1183,
	"HERALD":1184,
	"HERCULES":1185,
	"HERLONG":1186,
	"HERMOSA BEACH":1187,
	"HERNDON":1188,
	"HESPERIA":1189,
	"HETCH HETCHY JUNCTION":1190,
	"HI VISTA":1191,
	"HICKMAN":1192,
	"HIDDEN HILLS":1193,
	"HIDDEN RIVER":1194,
	"HIDDEN SPRINGS":1195,
	"HIDDEN VALLEY":1196,
	"HIDDEN VALLEY LAKE":1197,
	"HIGBY":1198,
	"HIGHLAND":1199,
	"HIGHLAND PARK":1200,
	"HIGHLANDS-BAYWOOD PARK":1201,
	"HIGHTS CORNER":1202,
	"HIGHWAY CITY":1203,
	"HILARITA":1204,
	"HILLCREST":1205,
	"HILLGROVE":1206,
	"HILLMAID":1207,
	"HILLS FERRY":1208,
	"HILLS FLAT":1209,
	"HILLSBOROUGH":1210,
	"HILMAR":1212,
	"HILT":1213,
	"HILTON":1214,
	"HINKLEY":1215,
	"HIOUCHI":1216,
	"HIRSCHDALE":1217,
	"HOBART MILLS":1218,
	"HOBERGS":1219,
	"HOBOKEN":1220,
	"HODGE":1221,
	"HOFFMAN POINT":1222,
	"HOLLIS":1223,
	"HOLLISTER":1224,
	"HOLLY PARK":1225,
	"HOLLYDALE":1226,
	"HOLLYWOOD":1227,
	"HOLLYWOOD BEACH":1228,
	"HOLMES":1229,
	"HOLT":1230,
	"HOLY CITY":1231,
	"HOME GARDEN":1232,
	"HOMER":1233,
	"HOMESTEAD":1234,
	"HOMEWOOD":1235,
	"HOMEWOOD CANYON-VALLEY WELLS":1236,
	"HONBY":1237,
	"HONCUT":1238,
	"HONEYDEW":1239,
	"HOOD":1240,
	"HOOKER":1241,
	"HOOKTON":1242,
	"HOOPA":1243,
	"HOPE VALLEY":1244,
	"HOPETON":1245,
	"HOPLAND":1246,
	"HORNBROOK":1247,
	"HORNITOS":1248,
	"HORSE CREEK":1249,
	"HORSE LAKE":1250,
	"HOUGH SPRINGS":1251,
	"HOWARD":1252,
	"HOWARD LANDING":1253,
	"HOWLAND FLAT":1254,
	"HUASNA":1255,
	"HUB":1256,
	"HUGHES MILL":1258,
	"HUGHSON":1259,
	"HUMBOLDT HILL":1260,
	"HUME":1261,
	"HUMPHREYS":1262,
	"HUNTINGTON LAKE":1263,
	"HUNTINGTON PARK":1264,
	"HUNTLEY":1265,
	"HURLETON":1266,
	"HURON":1267,
	"HYAMPOM":1268,
	"HYDE PARK":1269,
	"HYDESVILLE":1270,
	"HYDRIL":1271,
	"IBIS":1272,
	"IDLEWILD":1273,
	"IGERNA":1274,
	"IGNACIO":1275,
	"IGO":1276,
	"ILMON":1277,
	"INCLINE":1278,
	"INDEPENDENCE":1279,
	"INDIAN FALLS":1280,
	"INDIAN GULCH":1281,
	"INDIAN VILLAGE":1282,
	"INDIANOLA":1283,
	"INDUSTRY":1284,
	"INGLE":1285,
	"INGLENOOK":1286,
	"INGLESIDE":1287,
	"INGLEWOOD":1288,
	"INGOMAR":1289,
	"INGOT":1290,
	"INSKIP":1291,
	"INTERLAKEN":1292,
	"INVERNESS":1293,
	"INWOOD":1294,
	"INYOKERN":1295,
	"IONE":1296,
	"IOWA CITY":1297,
	"IOWA HILL":1298,
	"IRMULCO":1299,
	"IRON HORSE":1300,
	"IRON MOUNTAIN":1301,
	"IRVINGTON":1302,
	"IRWIN":1303,
	"IRWINDALE":1304,
	"ISLA VISTA":1305,
	"ISLAND MOUNTAIN":1306,
	"ISLETON":1307,
	"IVANHOE":1308,
	"IVANPAH":1309,
	"IVESTA":1310,
	"JACINTO":1311,
	"JACKSNIPE":1312,
	"JACKSON":1313,
	"JAMESBURG":1314,
	"JAMESTOWN":1315,
	"JANESVILLE":1316,
	"JARVIS LANDING":1317,
	"JASMIN":1318,
	"JASTRO":1319,
	"JEFFERSON PARK":1320,
	"JENNER":1321,
	"JENNY LIND":1322,
	"JERSEYDALE":1323,
	"JESS RANCH":1324,
	"JESUS MARIA":1325,
	"JET":1326,
	"JIMTOWN":1327,
	"JOHANNESBURG":1328,
	"JOHNSON PARK":1329,
	"JOHNSON VALLEY":1330,
	"JOHNSONDALE":1331,
	"JOHNSONS":1332,
	"JOHNSTONS CORNER":1333,
	"JOHNSTONVILLE":1334,
	"JOHNSVILLE":1335,
	"JOLON":1336,
	"JONES CORNER":1337,
	"JONESVILLE":1338,
	"JORDAN PARK":1339,
	"JOSHUA":1340,
	"JOSHUA TREE":1341,
	"JOVISTA":1342,
	"JUNCTION CITY":1343,
	"JUNE LAKE":1344,
	"JUNIPER HILLS":1345,
	"JUPITER":1346,
	"KADOTA":1347,
	"KAGEL CANYON":1348,
	"KANAWYERS":1349,
	"KARLO":1350,
	"KAWEAH":1351,
	"KEDDIE":1352,
	"KEELER":1353,
	"KEENBROOK":1354,
	"KEENE":1355,
	"KEKAWAKA":1356,
	"KELSEY":1357,
	"KELSEYVILLE":1358,
	"KELSO":1359,
	"KENNEDY":1360,
	"KENNEDY MEADOW":1361,
	"KENNY":1362,
	"KENSINGTON":1363,
	"KENTFIELD":1364,
	"KENWOOD":1365,
	"KEOUGH HOT SPRINGS":1366,
	"KERENS":1367,
	"KERMAN":1368,
	"KERN CITY":1369,
	"KERN LAKE":1370,
	"KERNELL":1371,
	"KERNVILLE":1372,
	"KESWICK":1373,
	"KETT":1374,
	"KETTENPOM":1375,
	"KETTLEMAN":1376,
	"KETTLEMAN CITY":1377,
	"KEYES":1378,
	"KEYESVILLE":1379,
	"KEYSTONE":1380,
	"KIBESILLAH":1381,
	"KILOWATT":1382,
	"KINCAID":1383,
	"KING CITY":1384,
	"KING SALMON":1385,
	"KINGS BEACH":1386,
	"KINGS CANYON":1387,
	"KINGSBURG":1388,
	"KINGSVILLE":1389,
	"KINGVALE":1390,
	"KINYON":1391,
	"KIRKVILLE":1392,
	"KIRKWOOD":1393,
	"KISMET":1395,
	"KIT CARSON":1396,
	"KLAMATH":1397,
	"KLAMATH GLEN":1398,
	"KLAMATH RIVER":1399,
	"KLAU":1400,
	"KLINEFELTER":1401,
	"KLONDIKE":1402,
	"KNEELAND":1403,
	"KNIGHTS FERRY":1404,
	"KNIGHTS LANDING":1405,
	"KNIGHTSEN":1406,
	"KNOB":1407,
	"KNOWLES":1408,
	"KNOWLES CORNER":1409,
	"KNOXVILLE":1410,
	"KORBEL":1411,
	"KOREATOWN":1412,
	"KRAMER HILLS":1413,
	"KRAMER JUNCTION":1414,
	"KYBURZ":1415,
	"LA BARR MEADOWS":1416,
	"LA CANADA":1417,
	"LA CANADA FLINTRIDGE":1418,
	"LA CRESCENTA":1419,
	"LA DELTA":1420,
	"LA FRESA":1421,
	"LA GRANGE":1422,
	"LA HABRA HEIGHTS":1423,
	"LA HONDA":1424,
	"LA HONDA PARK":1425,
	"LA JOLLA RANCH":1426,
	"LA MIRADA":1427,
	"LA PORTE":1428,
	"LA PUENTE":1429,
	"LA RIVIERA":1430,
	"LA SELVA BEACH":1431,
	"LA TUNA CANYON":1432,
	"LA VERNE":1433,
	"LA VINA":1434,
	"LACJAC":1435,
	"LADERA HEIGHTS":1436,
	"LAFAYETTE":1437,
	"LAGUNA":1438,
	"LAGUNA WEST":1439,
	"LAGUNITAS":1440,
	"LAKE ALMANOR COUNTRY CLUB":1441,
	"LAKE ALMANOR PENINSULA":1442,
	"LAKE ALMANOR WEST":1443,
	"LAKE ALPINE":1444,
	"LAKE ARROWHEAD":1445,
	"LAKE CITY":1446,
	"LAKE DAVIS":1448,
	"LAKE FOREST":1449,
	"LAKE HUGHES":1450,
	"LAKE ISABELLA":1451,
	"LAKE LOS ANGELES":1452,
	"LAKE NACIMIENTO":1453,
	"LAKE OF THE PINES":1454,
	"LAKE OF THE WOODS":1455,
	"LAKE SHERWOOD":1456,
	"LAKE WILDWOOD":1457,
	"LAKEHEAD":1458,
	"LAKEPORT":1459,
	"LAKESHORE":1460,
	"LAKEVIEW":1462,
	"LAKEVILLE":1463,
	"LAKEWOOD":1464,
	"LAKIN":1465,
	"LAMOINE":1466,
	"LAMONT":1467,
	"LANARE":1468,
	"LANCASTER":1469,
	"LANDCO":1470,
	"LANDERS":1471,
	"LANE":1472,
	"LANFAIR":1473,
	"LANG":1474,
	"LARGO VISTA":1475,
	"LARKFIELD":1476,
	"LARKFIELD-WIKIUP":1477,
	"LARKIN VALLEY":1478,
	"LARKSPUR":1479,
	"LAS FLORES":1480,
	"LAS GALLINAS":1481,
	"LAS LOMAS":1482,
	"LAS PALMAS":1484,
	"LAS POSAS":1485,
	"LASCO":1486,
	"LAST CHANCE":1487,
	"LATHROP":1488,
	"LATON":1489,
	"LATROBE":1490,
	"LAUGHLIN":1491,
	"LAUREL":1492,
	"LAVIC":1493,
	"LAWNDALE":1494,
	"LAWRENCE":1495,
	"LAWS":1496,
	"LAYTONVILLE":1497,
	"LE GRAND":1498,
	"LEAF":1499,
	"LEAVITT":1500,
	"LEBEC":1501,
	"LEE VINING":1502,
	"LEESVILLE":1503,
	"LEGGETT":1504,
	"LEIMERT PARK":1505,
	"LEISURE TOWN":1506,
	"LEMON COVE":1507,
	"LEMOORE":1508,
	"LENNOX":1509,
	"LENWOOD":1510,
	"LEON":1511,
	"LEONA VALLEY":1512,
	"LERDO":1513,
	"LEVIS":1514,
	"LEWISTON":1515,
	"LEXINGTON HILLS":1516,
	"LIBERTY FARMS":1517,
	"LIKELY":1518,
	"LINCOLN":1519,
	"LINCOLN HEIGHTS":1520,
	"LINCOLN VILLAGE":1521,
	"LINDA":1522,
	"LINDA RURAL":1523,
	"LINDCOVE":1524,
	"LINDEN":1525,
	"LINDSAY":1526,
	"LINGARD":1527,
	"LINNIE":1528,
	"LISKO":1529,
	"LIST":1530,
	"LITCHFIELD":1531,
	"LITTLE GRASS VALLEY":1532,
	"LITTLE LAKE":1533,
	"LITTLE MORONGO HEIGHTS":1534,
	"LITTLE RIVER":1535,
	"LITTLE SHASTA":1536,
	"LITTLE TOKYO":1537,
	"LITTLE VALLEY":1538,
	"LITTLERIVER":1539,
	"LITTLEROCK":1540,
	"LIVE OAK":1541,
	"LIVE OAK ACRES":1542,
	"LIVERMORE":1543,
	"LIVINGSTON":1544,
	"LLAGAS-UVAS":1545,
	"LLANADA":1546,
	"LLANO":1547,
	"LOCANS":1548,
	"LOCKE":1549,
	"LOCKEFORD":1550,
	"LOCKHART":1551,
	"LOCKWOOD":1552,
	"LODI":1553,
	"LODOGA":1554,
	"LOGANDALE":1555,
	"LOGANVILLE":1556,
	"LOIS":1557,
	"LOKERN":1558,
	"LOKOYA":1559,
	"LOLETA":1560,
	"LOMA":1561,
	"LOMA LINDA":1562,
	"LOMA MAR":1563,
	"LOMA RICA":1564,
	"LOMBARD":1565,
	"LOMITA":1566,
	"LOMO":1567,
	"LOMPOC":1568,
	"LONDON":1569,
	"LONE PINE":1570,
	"LONE STAR":1571,
	"LONE STAR JUNCTION":1572,
	"LONE WOLF COLONY":1573,
	"LONG BARN":1574,
	"LONG BEACH":1575,
	"LONGVALE":1576,
	"LONGVILLE":1577,
	"LONSMITH":1578,
	"LOOKOUT":1579,
	"LOOMIS":1580,
	"LOOMIS CORNERS":1581,
	"LORAINE":1582,
	"LORENZO STATION":1583,
	"LORT":1584,
	"LOS ALAMOS":1585,
	"LOS ALTOS":1586,
	"LOS ALTOS HILLS":1587,
	"LOS ANGELES":1588,
	"LOS BANOS":1589,
	"LOS GATOS":1590,
	"LOS MOLINOS":1592,
	"LOS NIETOS":1593,
	"LOS OLIVOS":1594,
	"LOS OSOS":1595,
	"LOS SERRANOS":1596,
	"LOST HILLS":1597,
	"LOTUS":1598,
	"LOVDAL":1599,
	"LOVELOCK":1600,
	"LOWER LAKE":1601,
	"LOWREY":1602,
	"LOYALTON":1603,
	"LOYOLA":1604,
	"LOYOLA CORNERS":1605,
	"LUCAS VALLEY-MARINWOOD":1606,
	"LUCCA":1607,
	"LUCERNE":1608,
	"LUCERNE VALLEY":1609,
	"LUCIA":1610,
	"LUDLOW":1611,
	"LUMER":1612,
	"LUNDY":1613,
	"LYNWOOD":1614,
	"LYONSVILLE":1615,
	"LYOTH":1616,
	"LYTLE CREEK":1617,
	"LYTTON":1618,
	"MABIE":1619,
	"MACDOEL":1620,
	"MAD RIVER":1621,
	"MADELINE":1622,
	"MADERA":1623,
	"MADERA ACRES":1624,
	"MADISON":1625,
	"MAGALIA":1626,
	"MAGNOLIA":1627,
	"MAGRA":1628,
	"MAINE PRAIRIE":1629,
	"MAJORS":1630,
	"MALAGA":1631,
	"MALIBU":1632,
	"MALIBU BOWL":1633,
	"MALIBU HILLS":1634,
	"MALIBU VISTA":1635,
	"MAMMOTH LAKES":1636,
	"MANCHESTER":1637,
	"MANHATTAN BEACH":1638,
	"MANILA":1639,
	"MANIX":1640,
	"MANKAS CORNER":1641,
	"MANTECA":1642,
	"MANTON":1643,
	"MANZANITA":1644,
	"MANZANITA LAKE":1645,
	"MAPLE CREEK":1646,
	"MAPLE GROVE":1647,
	"MAR VISTA":1648,
	"MARICOPA":1649,
	"MARIGOLD":1650,
	"MARIN CITY":1651,
	"MARINA":1652,
	"MARINA DEL REY":1653,
	"MARINA DISTRICT":1654,
	"MARINWOOD":1655,
	"MARIPOSA":1656,
	"MARK WEST":1657,
	"MARK WEST SPRINGS":1658,
	"MARKLEEVILLE":1659,
	"MARSHALL":1660,
	"MARSHALL JUNCTION":1661,
	"MARTELL":1662,
	"MARTINEZ":1663,
	"MARTINS":1664,
	"MARYSVILLE":1665,
	"MASSACK":1666,
	"MATCHIN":1667,
	"MATHER AIR FORCE BASE":1668,
	"MATHESON":1669,
	"MATTEI":1670,
	"MAXWELL":1671,
	"MAYARO":1672,
	"MAYFLOWER VILLAGE":1673,
	"MAYHEW":1674,
	"MAYWOOD":1675,
	"MCARTHUR":1676,
	"MCCLELLAN":1678,
	"MCCLOUD":1679,
	"MCFARLAND":1680,
	"MCGILL":1681,
	"MCKINLEYVILLE":1682,
	"MCKITTRICK":1683,
	"MEADOW LAKES":1684,
	"MEADOW VALLEY":1685,
	"MEADOW VISTA":1686,
	"MEADOWBROOK WOODS":1687,
	"MEDICINE LAKE":1688,
	"MEEKS BAY":1689,
	"MEINERS OAKS":1690,
	"MEINERS OAKS-OJAI":1691,
	"MELBOURNE":1692,
	"MELONES":1693,
	"MELVIN":1694,
	"MENDOCINO":1695,
	"MENDOTA":1696,
	"MENLO BATHS":1697,
	"MENLO PARK":1698,
	"MENTONE":1699,
	"MERAZO":1700,
	"MERCED":1701,
	"MERCED FALLS":1702,
	"MERCEY HOT SPRINGS":1703,
	"MERCURYVILLE":1704,
	"MERIDIAN":1705,
	"MERRYMAN":1706,
	"MESA":1707,
	"MESA VISTA":1708,
	"METTLER":1709,
	"MEXICAN COLONY":1710,
	"MEYERS":1711,
	"MI-WUK VILLAGE":1713,
	"MICHIGAN BLUFF":1714,
	"MIDDLETOWN":1715,
	"MIDOIL":1716,
	"MIDPINES":1717,
	"MIDVALLEY":1718,
	"MIDWAY":1719,
	"MILE HIGH":1720,
	"MILES":1721,
	"MILEY":1722,
	"MILFORD":1723,
	"MILL CREEK":1724,
	"MILL VALLEY":1725,
	"MILLBRAE":1726,
	"MILLERSVILLE":1727,
	"MILLERTON":1728,
	"MILLIGAN":1729,
	"MILLS ORCHARD":1730,
	"MILLSPAUGH":1731,
	"MILLUX":1732,
	"MILLVILLE":1733,
	"MILO":1734,
	"MILPITAS":1735,
	"MILTON":1736,
	"MINA":1737,
	"MINERAL":1738,
	"MINKLER":1739,
	"MINNEOLA":1740,
	"MINNESOTA":1741,
	"MINNESOTA FLAT":1742,
	"MINT CANYON":1743,
	"MINTER VILLAGE":1744,
	"MINTURN":1745,
	"MIRA MONTE":1746,
	"MIRADA":1747,
	"MIRADOR":1748,
	"MIRALESTE":1749,
	"MIRAMAR":1750,
	"MIRAMONTE":1751,
	"MIRANDA":1752,
	"MISSION CANYON":1753,
	"MISSION DISTRICT":1754,
	"MISSION HILLS":1755,
	"MISSION JUNCTION":1757,
	"MISSOURI TRIANGLE":1758,
	"MITCHELL CORNER":1759,
	"MITCHELLS CORNER":1760,
	"MOCCASIN":1761,
	"MODESTO":1762,
	"MOFFETT FIELD":1763,
	"MOHAWK":1764,
	"MOHAWK VISTA":1765,
	"MOJAVE":1766,
	"MOJAVE HEIGHTS":1767,
	"MOKELUMNE CITY":1768,
	"MOKELUMNE HILL":1769,
	"MOLENA":1770,
	"MOLINO":1771,
	"MONACO":1772,
	"MONADA":1773,
	"MONMOUTH":1774,
	"MONO CITY":1775,
	"MONO HOT SPRINGS":1776,
	"MONO MILLS":1777,
	"MONO VISTA":1778,
	"MONOLITH":1779,
	"MONROVIA":1780,
	"MONSON":1781,
	"MONTAGUE":1782,
	"MONTALVO":1783,
	"MONTARA":1784,
	"MONTCLAIR":1785,
	"MONTE NIDO":1786,
	"MONTE RIO":1787,
	"MONTE SERENO":1788,
	"MONTE TOYON":1789,
	"MONTE VISTA":1790,
	"MONTEBELLO":1792,
	"MONTECITO":1793,
	"MONTEREY":1794,
	"MONTEREY PARK":1795,
	"MONTEZUMA":1796,
	"MONTGOMERY CREEK":1797,
	"MONTROSE":1798,
	"MOONEY FLAT":1799,
	"MOONRIDGE":1800,
	"MOONSTONE":1801,
	"MOORES FLAT":1802,
	"MOORPARK":1803,
	"MOORPARK HOME ACRES":1804,
	"MORADA":1805,
	"MORAGA":1806,
	"MORAN":1807,
	"MORGAN HILL":1808,
	"MORMON":1809,
	"MORMON BAR":1810,
	"MORNINGSIDE PARK":1811,
	"MORONGO VALLEY":1812,
	"MORRO BAY":1813,
	"MOSS BEACH":1814,
	"MOSS LANDING":1815,
	"MOTION":1816,
	"MOTOR CITY":1817,
	"MOTT":1818,
	"MOUNT BULLION":1819,
	"MOUNT EDEN":1820,
	"MOUNT HAMILTON":1821,
	"MOUNT HEBRON":1822,
	"MOUNT HERMON":1823,
	"MOUNT SHASTA":1824,
	"MOUNT WASHINGTON":1825,
	"MOUNT WILSON":1826,
	"MOUNTAIN GATE":1827,
	"MOUNTAIN HOME VILLAGE":1828,
	"MOUNTAIN HOUSE":1829,
	"MOUNTAIN MESA":1830,
	"MOUNTAIN PASS":1831,
	"MOUNTAIN RANCH":1832,
	"MOUNTAIN VIEW":1833,
	"MOUNTAIN VIEW ACRES":1834,
	"MT BALDY":1835,
	"MUGGINSVILLE":1836,
	"MUIR BEACH":1837,
	"MURIETTA FARM":1838,
	"MURPHYS":1839,
	"MURRAY":1840,
	"MURRAY PARK":1841,
	"MUSCOY":1842,
	"MYERS FLAT":1843,
	"MYRICKS CORNER":1844,
	"MYRTLETOWN":1845,
	"NANCEVILLE":1846,
	"NAPA":1847,
	"NAPA SODA SPRINGS":1848,
	"NAPLES":1849,
	"NARANJO":1851,
	"NAROD":1852,
	"NASHUA":1853,
	"NASHVILLE":1854,
	"NATIVIDAD":1855,
	"NATOMA":1856,
	"NAUD JUNCTION":1857,
	"NAVARRO":1858,
	"NAVELENCIA":1859,
	"NEBO":1860,
	"NEBO CENTER":1861,
	"NEEDLES":1862,
	"NELSON":1863,
	"NEUFELD":1864,
	"NEVADA":1865,
	"NEVADA CITY":1866,
	"NEVIN":1867,
	"NEW ALMADEN":1868,
	"NEW AUBERRY":1869,
	"NEW CUYAMA":1870,
	"NEW PINE CREEK":1871,
	"NEWARK":1872,
	"NEWBERRY SPRINGS":1873,
	"NEWBERRY-BAKER":1874,
	"NEWBURG":1875,
	"NEWBURY PARK":1876,
	"NEWCASTLE":1877,
	"NEWELL":1878,
	"NEWHALL":1879,
	"NEWMAN":1880,
	"NEWMAN SPRINGS":1881,
	"NEWPORT":1882,
	"NEWTOWN":1883,
	"NEWVILLE":1884,
	"NICASIO":1885,
	"NICE":1886,
	"NICKS COVE":1888,
	"NICOLAUS":1889,
	"NIELSBURG":1890,
	"NILES":1891,
	"NIMBUS":1892,
	"NIMSHEW":1893,
	"NIPOMO":1894,
	"NIPTON":1895,
	"NORD":1896,
	"NORDEN":1897,
	"NORMAN":1898,
	"NORTH AUBURN":1899,
	"NORTH BEACH":1900,
	"NORTH BLOOMFIELD":1901,
	"NORTH COAST":1902,
	"NORTH COLUMBIA":1903,
	"NORTH DINUBA":1904,
	"NORTH EDWARDS":1905,
	"NORTH EL DORADO":1906,
	"NORTH EL MONTE":1907,
	"NORTH FAIR OAKS":1908,
	"NORTH FORK":1909,
	"NORTH HIGHLANDS":1910,
	"NORTH HILLS":1911,
	"NORTH HOLLYWOOD":1912,
	"NORTH LAKEPORT":1913,
	"NORTH RICHMOND":1914,
	"NORTH SAN JUAN":1915,
	"NORTH SHAFTER":1916,
	"NORTH WAWONA":1917,
	"NORTH WOODBRIDGE":1918,
	"NORTHRIDGE":1919,
	"NORTHSPUR":1920,
	"NORTHSTAR":1921,
	"NORTHWOOD":1922,
	"NORTON":1923,
	"NORWALK":1924,
	"NOTARB":1925,
	"NOVATO":1926,
	"NOYO":1927,
	"NUBIEBER":1928,
	"O NEALS":1929,
	"OAK GLEN":1931,
	"OAK GROVE":1932,
	"OAK HILLS":1934,
	"OAK KNOLL":1935,
	"OAK PARK":1936,
	"OAK RUN":1937,
	"OAK VIEW":1938,
	"OAKDALE":1939,
	"OAKHURST":1940,
	"OAKLAND":1941,
	"OAKLEY":1942,
	"OAKS":1943,
	"OAKVILLE":1944,
	"OAKWOOD":1945,
	"OBAN":1946,
	"OCCIDENTAL":1947,
	"OCEAN PARK":1948,
	"OCEANO":1949,
	"OCEANVIEW":1950,
	"OCKENDEN":1951,
	"OCTOL":1952,
	"OIL JUNCTION":1953,
	"OILDALE":1954,
	"OJAI":1955,
	"OLANCHA":1956,
	"OLCOTT":1957,
	"OLD ADOBE":1958,
	"OLD BRETZ MILL":1959,
	"OLD DALE":1960,
	"OLD FORBESTOWN":1961,
	"OLD GILROY":1962,
	"OLD HOPLAND":1963,
	"OLD POINT COMFORT":1964,
	"OLD RIVER":1965,
	"OLD STATION":1966,
	"OLEANDER":1967,
	"OLEMA":1968,
	"OLGA":1969,
	"OLINDA":1970,
	"OLIVE VIEW":1971,
	"OLIVEHURST":1972,
	"OLYMPIC VALLEY":1973,
	"OMEGA":1974,
	"OMO RANCH":1975,
	"ONO":1976,
	"ONTARIO":1977,
	"ONYX":1978,
	"OPAL CLIFFS":1979,
	"OPHIR":1980,
	"ORANGE COVE":1981,
	"ORANGEVALE":1982,
	"ORCUTT":1983,
	"ORDBEND":1984,
	"OREGON CITY":1985,
	"OREGON HOUSE":1986,
	"ORFORD":1987,
	"ORICK":1988,
	"ORINDA":1989,
	"ORLAND":1990,
	"ORLEANS":1991,
	"ORLEANS FLAT":1992,
	"ORO FINO":1993,
	"ORO GRANDE":1994,
	"ORO LOMA":1995,
	"OROSI":1996,
	"OROVILLE":1997,
	"OROVILLE EAST":1998,
	"ORRS SPRINGS":1999,
	"ORTEGA":2000,
	"OTTERBEIN":2002,
	"OUTINGDALE":2003,
	"OWENYO":2004,
	"OXALIS":2005,
	"OXFORD":2006,
	"OXNARD":2007,
	"OXNARD BEACH":2008,
	"PACHECO":2009,
	"PACIFIC GROVE":2010,
	"PACIFIC HEIGHTS":2011,
	"PACIFIC HOUSE":2012,
	"PACIFIC PALISADES":2013,
	"PACIFICA":2014,
	"PACOIMA":2015,
	"PAICINES":2016,
	"PAIGE":2017,
	"PAINTERSVILLE":2018,
	"PAJARO":2019,
	"PALERMO":2020,
	"PALMDALE":2021,
	"PALMO":2022,
	"PALMS":2023,
	"PALO ALTO":2024,
	"PALO CEDRO":2025,
	"PALOMA":2026,
	"PALOMAR PARK":2027,
	"PALOS VERDES ESTATES":2028,
	"PALOS VERDES PENINSULA":2029,
	"PANAMA":2030,
	"PANAMINT SPRINGS":2031,
	"PANOCHE":2032,
	"PANOCHE JUNCTION":2033,
	"PANORAMA CITY":2034,
	"PARADISE":2035,
	"PARADISE SPRINGS":2036,
	"PARAMOUNT":2037,
	"PARDEE":2038,
	"PARIS":2039,
	"PARKER DAM":2040,
	"PARKFIELD":2041,
	"PARKHILL":2043,
	"PARKSDALE":2044,
	"PARKWAY":2045,
	"PARKWOOD":2046,
	"PARLIER":2047,
	"PASADENA":2048,
	"PASKENTA":2049,
	"PASO ROBLES":2050,
	"PATCH":2051,
	"PATRICK CREEK":2052,
	"PATRICKS POINT":2053,
	"PATTERSON":2054,
	"PATTON":2055,
	"PATTON VILLAGE":2056,
	"PAULSELL":2057,
	"PAXTON":2058,
	"PAYNES CREEK":2059,
	"PAYNESVILLE":2060,
	"PEANUT":2061,
	"PEARBLOSSOM":2062,
	"PEARDALE":2063,
	"PEARLAND":2064,
	"PEARSONVILLE":2065,
	"PEBBLE BEACH":2066,
	"PELTIER":2067,
	"PENINSULA VILLAGE":2068,
	"PENN VALLEY":2069,
	"PENNGROVE":2070,
	"PENNINGTON":2071,
	"PENRYN":2072,
	"PENTLAND":2073,
	"PENTZ":2074,
	"PEPPERWOOD":2075,
	"PEPPERWOOD GROVE":2076,
	"PERAL":2077,
	"PEREZ":2078,
	"PERMANENTE":2079,
	"PERRY":2080,
	"PESCADERO":2081,
	"PETALUMA":2082,
	"PETERS":2083,
	"PETROLIA":2084,
	"PHELAN":2085,
	"PHILLIPS":2086,
	"PHILLIPS RANCH":2087,
	"PHILLIPSVILLE":2088,
	"PHILO":2089,
	"PHOENIX LAKE-CEDAR RIDGE":2090,
	"PICO RIVERA":2091,
	"PIEDMONT":2092,
	"PIEDRA":2093,
	"PIERCE":2094,
	"PIERCY":2095,
	"PIKE":2096,
	"PILIBOS RANCH":2097,
	"PILOT HILL":2098,
	"PINE FLAT":2099,
	"PINE GROVE":2100,
	"PINE HILLS":2101,
	"PINE MOUNTAIN CLUB":2102,
	"PINECREST":2103,
	"PINECROFT":2104,
	"PINEDALE":2105,
	"PINEDALE SIDING":2106,
	"PINEHURST":2107,
	"PINERIDGE":2108,
	"PINEZANITA":2109,
	"PINNACLES":2110,
	"PINNIO":2111,
	"PINO GRANDE":2112,
	"PINOLE":2113,
	"PINON HILLS":2114,
	"PIONEER":2115,
	"PIONEER POINT":2116,
	"PIONEERTOWN":2117,
	"PIRU":2118,
	"PISGAH":2119,
	"PISMO BEACH":2120,
	"PITCO":2121,
	"PITTSBURG":2122,
	"PITTVILLE":2123,
	"PIXLEY":2124,
	"PLACERVILLE":2125,
	"PLAINSBURG":2126,
	"PLAINVIEW":2127,
	"PLANADA":2128,
	"PLANO":2129,
	"PLANTATION":2130,
	"PLATINA":2131,
	"PLAYA DEL REY":2132,
	"PLAYA VISTA":2133,
	"PLEASANT GROVE":2134,
	"PLEASANT HILL":2135,
	"PLEASANT VALLEY":2136,
	"PLEASANTON":2137,
	"PLUMAS EUREKA":2138,
	"PLUMAS LAKE":2139,
	"PLYMOUTH":2140,
	"POINT ARENA":2141,
	"POINT MCCLOUD":2142,
	"POINT MUGU NAWC":2143,
	"POINT PLEASANT":2144,
	"POINT REYES STATION":2145,
	"POLARIS":2146,
	"POLE GARDEN":2147,
	"POLK":2148,
	"POLK SPRINGS":2149,
	"POLLARD FLAT":2150,
	"POLLOCK":2151,
	"POLLOCK PINES":2152,
	"POMONA":2153,
	"PONCA":2154,
	"POND":2155,
	"PONDOSA":2156,
	"POPE":2157,
	"POPE VALLEY":2158,
	"POPLAR":2159,
	"POPLAR-COTTON CENTER":2160,
	"PORT COSTA":2162,
	"PORT HUENEME":2163,
	"PORT KENYON":2164,
	"PORT SAN LUIS":2165,
	"PORTAL INN":2166,
	"PORTER RANCH":2167,
	"PORTERVILLE":2168,
	"PORTOLA":2169,
	"PORTOLA VALLEY":2170,
	"PORTUGUESE BEND":2171,
	"POSEY":2172,
	"POTTER VALLEY":2173,
	"POZO":2174,
	"PRATHER":2175,
	"PRATTON":2176,
	"PRATTVILLE":2177,
	"PRESIDIO OF MONTEREY":2178,
	"PRIEST":2179,
	"PRINCETON":2180,
	"PROBERTA":2181,
	"PROJECT CITY":2182,
	"PROSPERO":2183,
	"PRUNEDALE":2184,
	"PULGA":2185,
	"PUMPKIN CENTER":2186,
	"QUAIL":2187,
	"QUAKER MEADOW":2188,
	"QUALITY":2189,
	"QUARTZ":2190,
	"QUARTZ HILL":2191,
	"QUINCY":2192,
	"RACKERBY":2193,
	"RADNOR":2194,
	"RADUM":2195,
	"RAGGED POINT":2196,
	"RAGTOWN":2197,
	"RAIL ROAD FLAT":2198,
	"RAINBOW":2199,
	"RAINBOW WELLS":2200,
	"RAISIN CITY":2201,
	"RALPH":2202,
	"RAMSEY":2203,
	"RANA":2204,
	"RANCHO CALAVERAS":2205,
	"RANCHO CORDOVA":2206,
	"RANCHO CUCAMONGA":2207,
	"RANCHO DOMINGUEZ":2208,
	"RANCHO MURIETA":2209,
	"RANCHO PALOS VERDES":2210,
	"RANCHO PARK":2211,
	"RANCHO TEHAMA RESERVE":2212,
	"RAND":2213,
	"RANDOLPH":2214,
	"RANDSBURG":2215,
	"RAVENDALE":2216,
	"RAVENNA":2217,
	"RAWHIDE":2218,
	"RAYMOND":2219,
	"RAYO":2220,
	"RECTOR":2221,
	"RED APPLE":2222,
	"RED BLUFF":2223,
	"RED DOG":2224,
	"RED MOUNTAIN":2225,
	"RED MOUNTAIN-TRONA":2226,
	"REDBANKS":2227,
	"REDCREST":2228,
	"REDDING":2229,
	"REDLANDS":2230,
	"REDONDO BEACH":2231,
	"REDONDO JUNCTION":2232,
	"REDWAY":2233,
	"REDWOOD CITY":2234,
	"REDWOOD ESTATES":2235,
	"REDWOOD JUNCTION":2236,
	"REDWOOD LODGE":2237,
	"REDWOOD VALLEY":2238,
	"REEDLEY":2239,
	"REEF STATION":2240,
	"REGINA HEIGHTS":2241,
	"REILLY HEIGHTS":2242,
	"RELIEF":2243,
	"RENO JUNCTION":2244,
	"RENOVILLE":2245,
	"REQUA":2246,
	"RESCUE":2247,
	"RESEDA":2248,
	"RIALTO":2250,
	"RIBIER":2251,
	"RICARDO":2252,
	"RICCAS CORNER":2253,
	"RICE":2254,
	"RICH GULCH":2255,
	"RICHARDSON SPRINGS":2256,
	"RICHFIELD":2257,
	"RICHGROVE":2258,
	"RICHMOND":2259,
	"RICHMOND DISTRICT":2260,
	"RICHVALE":2261,
	"RIDGECREST":2262,
	"RIDGEMARK":2263,
	"RIDGEWOOD":2264,
	"RIEGO":2265,
	"RIMFOREST":2267,
	"RIMROCK":2268,
	"RIO BRAVO":2269,
	"RIO DEL MAR":2270,
	"RIO DELL":2271,
	"RIO LINDA":2272,
	"RIO NIDO":2273,
	"RIO OSO":2274,
	"RIO VISTA":2275,
	"RIPON":2276,
	"RIPPERDAN":2277,
	"RIVER PINES":2278,
	"RIVERBANK":2279,
	"RIVERBEND":2280,
	"RIVERDALE":2281,
	"RIVERDALE PARK":2282,
	"RIVERSIDE PARK":2283,
	"RIVERTON":2284,
	"RIVERVIEW":2285,
	"ROADS END":2286,
	"ROB ROY JUNCTION":2287,
	"ROBBINS":2288,
	"ROBERTSVILLE":2289,
	"ROBINSON MILLS":2290,
	"ROBINSONS CORNER":2291,
	"ROBLES DEL RIO":2292,
	"ROCHESTER":2293,
	"ROCK CREEK":2294,
	"ROCK CREST":2295,
	"ROCKAWAY BEACH":2296,
	"ROCKLIN":2297,
	"ROCKPORT":2298,
	"ROCKTRAM":2299,
	"ROCKVILLE":2300,
	"ROCKY HILL":2301,
	"RODEO":2302,
	"ROHNERT PARK":2303,
	"ROHNERVILLE":2304,
	"ROLINDA":2305,
	"ROLLING HILLS":2306,
	"ROLLING HILLS ESTATES":2307,
	"ROOSEVELT":2309,
	"ROSAMOND":2310,
	"ROSEDALE":2311,
	"ROSELAND":2312,
	"ROSEMEAD":2313,
	"ROSEMONT":2314,
	"ROSEVILLE":2315,
	"ROSEWOOD":2316,
	"ROSS":2317,
	"ROUGH AND READY":2318,
	"ROUND MOUNTAIN":2319,
	"ROUND VALLEY":2320,
	"ROVANA":2321,
	"ROWLAND HEIGHTS":2322,
	"RUMSEY":2323,
	"RUNNING SPRINGS":2324,
	"RUSS":2325,
	"RUSSELL":2326,
	"RUSSIAN RIVER MDWS":2327,
	"RUSSIAN RIVER-COASTAL":2328,
	"RUTH":2329,
	"RUTHERFORD":2330,
	"RYAN":2331,
	"RYDE":2332,
	"SACO":2333,
	"SACRAMENTO":2334,
	"SAGELAND":2335,
	"SAINT FRANCIS WOOD":2336,
	"SAINT HELENA":2337,
	"SALIDA":2338,
	"SALINAS":2339,
	"SALMON CREEK":2340,
	"SALTDALE":2341,
	"SALTUS":2342,
	"SALYER":2343,
	"SAMOA":2344,
	"SAN ANDREAS":2345,
	"SAN ANSELMO":2346,
	"SAN ANTONIO HEIGHTS":2347,
	"SAN ARDO":2348,
	"SAN BENITO":2349,
	"SAN BERNARDINO":2350,
	"SAN BRUNO":2351,
	"SAN CARLOS":2352,
	"SAN DIMAS":2353,
	"SAN EMIDIO":2354,
	"SAN FELIPE":2355,
	"SAN FERNANDO":2356,
	"SAN FRANCISCO":2357,
	"SAN GABRIEL":2358,
	"SAN GERONIMO":2359,
	"SAN GREGORIO":2360,
	"SAN JOAQUIN":2361,
	"SAN JOSE":2362,
	"SAN JUAN BAUTISTA":2363,
	"SAN LAWRENCE TERRACE":2364,
	"SAN LEANDRO":2365,
	"SAN LORENZO":2366,
	"SAN LORENZO PARK":2367,
	"SAN LORENZO VALLEY":2368,
	"SAN LUCAS":2369,
	"SAN LUIS OBISPO":2370,
	"SAN MARINO":2371,
	"SAN MARTIN":2372,
	"SAN MATEO":2373,
	"SAN MIGUEL":2374,
	"SAN PABLO":2375,
	"SAN PEDRO":2376,
	"SAN QUENTIN":2377,
	"SAN RAFAEL":2378,
	"SAN RAMON":2379,
	"SAN SIMEON":2380,
	"SANBORN":2381,
	"SAND CITY":2382,
	"SANDBERG":2384,
	"SANDS":2385,
	"SANDY GULCH":2386,
	"SANDYLAND":2387,
	"SANFORD":2388,
	"SANGER":2389,
	"SANTA BARBARA":2390,
	"SANTA CLARA":2391,
	"SANTA CLARITA":2392,
	"SANTA CRUZ":2393,
	"SANTA MARGARITA":2394,
	"SANTA MARIA":2395,
	"SANTA MONICA":2396,
	"SANTA NELLA":2397,
	"SANTA PAULA":2398,
	"SANTA RITA PARK":2399,
	"SANTA ROSA":2400,
	"SANTA ROSA VALLEY":2401,
	"SANTA SUSANA":2402,
	"SANTA VENETIA":2403,
	"SANTA YNEZ":2404,
	"SARATOGA":2406,
	"SARATOGA HILLS":2407,
	"SATICOY":2408,
	"SATTLEY":2409,
	"SAUGUS":2410,
	"SAUSALITO":2411,
	"SAWTELLE":2412,
	"SAWYERS BAR":2413,
	"SAXON":2414,
	"SCARFACE":2415,
	"SCHELLVILLE":2416,
	"SCOTIA":2417,
	"SCOTLAND":2418,
	"SCOTT BAR":2419,
	"SCOTTS":2420,
	"SCOTTS VALLEY":2421,
	"SCOTTSVILLE":2422,
	"SCRANTON":2423,
	"SEABRIGHT":2424,
	"SEARLES":2425,
	"SEARLES VALLEY":2426,
	"SEARS POINT":2427,
	"SEASIDE":2428,
	"SEBASTOPOL":2429,
	"SECOND GARROTTE":2430,
	"SECRET TOWN":2431,
	"SEGURO":2432,
	"SEIAD VALLEY":2433,
	"SEIGLER SPRINGS":2434,
	"SELMA":2435,
	"SEMINOLE HOT SPRINGS":2436,
	"SEMITROPIC":2437,
	"SENECA":2438,
	"SEPULVEDA":2439,
	"SEQUOIA":2440,
	"SEQUOIA NATIONAL PARK":2441,
	"SERRANO":2442,
	"SESPE":2443,
	"SESPE VILLAGE":2444,
	"SEVEN OAKS":2445,
	"SEVEN PINES":2446,
	"SEVEN TREES":2447,
	"SEVILLE":2448,
	"SHACKELFORD":2449,
	"SHADOW HILLS":2450,
	"SHADY GLEN":2451,
	"SHAFTER":2452,
	"SHANDON":2453,
	"SHARON":2454,
	"SHASTA":2455,
	"SHASTA LAKE":2456,
	"SHASTA RETREAT":2457,
	"SHASTA SPRINGS":2458,
	"SHAVER LAKE":2459,
	"SHAVER LAKE HEIGHTS":2460,
	"SHAWS FLAT":2461,
	"SHEEP RANCH":2462,
	"SHELDON":2463,
	"SHELL BEACH":2464,
	"SHELTER COVE":2465,
	"SHERIDAN":2466,
	"SHERMAN ACRES":2467,
	"SHERMAN OAKS":2468,
	"SHERMAN VILLAGE":2469,
	"SHINGLE SPRINGS":2470,
	"SHINGLETOWN":2471,
	"SHIPPEE":2472,
	"SHIRLEY":2473,
	"SHIRLEY MEADOWS":2474,
	"SHIVELY":2475,
	"SHOSHONE":2477,
	"SHUMWAY":2478,
	"SIERRA CITY":2479,
	"SIERRA HEIGHTS":2480,
	"SIERRA MADRE":2481,
	"SIERRA SKY PARK":2482,
	"SIERRAVILLE":2483,
	"SIGNAL HILL":2484,
	"SILVER CITY":2485,
	"SIMI":2486,
	"SIMI VALLEY":2487,
	"SIMMLER":2488,
	"SIMMS":2489,
	"SIMS":2490,
	"SINGING SPRINGS":2491,
	"SISQUOC":2492,
	"SITES":2493,
	"SKIDOO":2494,
	"SKY LONDA":2495,
	"SKYFOREST":2496,
	"SKYHIGH":2497,
	"SKYLAND":2498,
	"SLAGGER":2499,
	"SLEEPY HOLLOW":2500,
	"SLEEPY VALLEY":2501,
	"SLOAT":2502,
	"SLOUGHHOUSE":2503,
	"SMARTVILLE":2504,
	"SMILEY PARK":2505,
	"SMITH CORNER":2506,
	"SMITH MILL":2507,
	"SMITH RIVER":2508,
	"SNELLING":2509,
	"SOAPWEED":2510,
	"SODA BAY":2511,
	"SODA SPRINGS":2512,
	"SOLEDAD":2513,
	"SOLVANG":2514,
	"SOLYO":2515,
	"SOMERSET":2516,
	"SOMES BAR":2518,
	"SOMIS":2519,
	"SONOMA":2520,
	"SONORA":2521,
	"SONORA JUNCTION":2522,
	"SOQUEL":2523,
	"SOULSBYVILLE":2524,
	"SOUTH ANTELOPE VALLEY":2525,
	"SOUTH COYOTE":2526,
	"SOUTH DOS PALOS":2527,
	"SOUTH EL MONTE":2528,
	"SOUTH FORK":2529,
	"SOUTH GATE":2530,
	"SOUTH LAKE":2531,
	"SOUTH LAKE TAHOE":2532,
	"SOUTH OROVILLE":2533,
	"SOUTH PASADENA":2534,
	"SOUTH SAN FRANCISCO":2535,
	"SOUTH SAN GABRIEL":2536,
	"SOUTH SAN JOSE HILLS":2537,
	"SOUTH TAFT":2538,
	"SOUTH TRONA":2539,
	"SOUTH WAWONA":2540,
	"SOUTH WHITTIER":2541,
	"SOUTH WOODBRIDGE":2542,
	"SOUTH YUBA CITY":2543,
	"SOUTHWEST MARIN":2544,
	"SOUTHWEST VILLAGE":2545,
	"SPANISH FLAT":2546,
	"SPANISH RANCH":2547,
	"SPERRY":2548,
	"SPRECKELS":2549,
	"SPRING GAP":2550,
	"SPRING GARDEN":2551,
	"SPRING HILL":2552,
	"SPRING VALLEY LAKE":2553,
	"SPRINGFIELD":2554,
	"SPRINGVILLE":2555,
	"SPYROCK":2556,
	"SQUAB":2557,
	"SQUABBLETOWN":2558,
	"SQUAW HILL":2559,
	"SQUAW VALLEY":2560,
	"SQUIRREL MOUNTAIN VALLEY":2561,
	"ST HELENA":2562,
	"STACY":2563,
	"STAFFORD":2564,
	"STALEY":2565,
	"STALLION SPRINGS":2566,
	"STANDARD":2567,
	"STANDISH":2568,
	"STANFIELD HILL":2569,
	"STANFORD":2570,
	"STATELINE":2571,
	"STEDMAN":2572,
	"STEGEMAN":2573,
	"STENT":2574,
	"STEVENSON RANCH":2575,
	"STEVINSON":2576,
	"STEWARTS POINT":2577,
	"STINSON BEACH":2579,
	"STIRLING CITY":2580,
	"STOCKTON":2581,
	"STOMAR":2582,
	"STONEHURST":2583,
	"STONYFORD":2584,
	"STORRIE":2585,
	"STOUT":2586,
	"STRATFORD":2587,
	"STRATHEARN":2588,
	"STRATHMORE":2589,
	"STRAWBERRY":2590,
	"STRAWBERRY VALLEY":2591,
	"STRONGHOLD":2592,
	"STUDEBAKER":2593,
	"STUDIO CITY":2594,
	"SUBEET":2595,
	"SUCRO":2596,
	"SUGAR PINE":2597,
	"SUGARLOAF":2598,
	"SUISUN CITY":2600,
	"SULTANA":2601,
	"SUMMER HOME":2602,
	"SUMMERLAND":2603,
	"SUMMIT":2604,
	"SUMMIT CITY":2605,
	"SUN VALLEY":2606,
	"SUN VILLAGE":2607,
	"SUNFAIR":2608,
	"SUNFAIR HEIGHTS":2609,
	"SUNLAND":2610,
	"SUNNY BRAE":2611,
	"SUNNYBROOK":2612,
	"SUNNYSIDE":2613,
	"SUNNYVALE":2615,
	"SUNOL":2616,
	"SUNOL-MIDTOWN":2617,
	"SUNSET DISTRICT":2618,
	"SUNSET VIEW":2619,
	"SUNSHINE CAMP":2620,
	"SUNSWEET":2621,
	"SURF":2622,
	"SURPRISE VALLEY":2623,
	"SUSANVILLE":2624,
	"SUTTER":2625,
	"SUTTER CREEK":2626,
	"SUTTER HILL":2627,
	"SUVAL":2628,
	"SWALL":2629,
	"SWALL MEADOWS":2630,
	"SWANSEA":2631,
	"SWEETLAND":2632,
	"SYCAMORE":2633,
	"SYCAMORE SPRINGS":2634,
	"SYKES":2635,
	"SYLMAR":2636,
	"SYLVIA PARK":2637,
	"TAFT":2638,
	"TAFT HEIGHTS":2639,
	"TAFT MOSSWOOD":2640,
	"TAHOE CITY":2641,
	"TAHOE PINES":2642,
	"TAHOE VALLEY":2643,
	"TAHOE VISTA":2644,
	"TAHOMA":2645,
	"TALMAGE":2646,
	"TAMALPAIS VALLEY":2647,
	"TAMARACK":2648,
	"TAN OAK PARK":2649,
	"TANCRED":2650,
	"TANFORAN":2651,
	"TARPEY VILLAGE":2653,
	"TARZANA":2654,
	"TASSAJARA":2655,
	"TASSAJARA HOT SPRINGS":2656,
	"TAURUSA":2657,
	"TAYLOR JUNCTION":2658,
	"TAYLORSVILLE":2659,
	"TEAL":2660,
	"TECOPA":2661,
	"TEHACHAPI":2662,
	"TEHAMA":2663,
	"TELEGRAPH CITY":2664,
	"TEMELEC":2665,
	"TEMPLE CITY":2666,
	"TEMPLETON":2667,
	"TENNANT":2668,
	"TERMINAL ISLAND":2669,
	"TERMINOUS":2670,
	"TERMO":2671,
	"TERRA BELLA":2672,
	"TERRA LINDA":2673,
	"THE CEDARS":2674,
	"THE FORKS":2675,
	"THE GROVE":2676,
	"THE OAKS":2677,
	"THE SEA RANCH":2678,
	"THERMALITO":2679,
	"THOMAS LANE":2680,
	"THOMASSON":2681,
	"THORN":2682,
	"THORN JUNCTION":2683,
	"THORNTON":2684,
	"THOUSAND OAKS":2685,
	"THREE POINTS":2686,
	"THREE RIVERS":2687,
	"THREE ROCKS":2688,
	"THYLE":2689,
	"TIBURON":2690,
	"TIERRA BUENA":2691,
	"TIGER LILY":2692,
	"TIONESTA":2693,
	"TIPTON":2694,
	"TOADTOWN":2695,
	"TOBIN":2696,
	"TOCALOMA":2697,
	"TODD VALLEY":2698,
	"TOKAY":2699,
	"TOLENAS":2700,
	"TOLLHOUSE":2701,
	"TOLUCA LAKE":2702,
	"TOMALES":2703,
	"TOMS PLACE":2704,
	"TOMSPUR":2705,
	"TONYVILLE":2706,
	"TOOLVILLE":2707,
	"TOPANGA":2708,
	"TOPAZ":2709,
	"TORO":2710,
	"TORO CANYON":2711,
	"TORRANCE":2712,
	"TOWLE":2713,
	"TOWN TALK":2714,
	"TOYON":2715,
	"TRACY":2716,
	"TRANCAS":2717,
	"TRANQUILLITY":2718,
	"TRAVER":2719,
	"TRAVIS AIR FORCE BASE":2720,
	"TRENT":2721,
	"TRES PINOS":2722,
	"TREVARNO":2723,
	"TRIGO":2724,
	"TRIMMER":2725,
	"TRINIDAD":2726,
	"TRINITY ALPS":2727,
	"TRINITY CENTER":2728,
	"TRINITY VILLAGE":2729,
	"TRINITY-KLAMATH":2730,
	"TRIUNFO PASS-COASTAL":2731,
	"TROCHA":2732,
	"TRONA":2733,
	"TROWBRIDGE":2734,
	"TROY":2735,
	"TRUCKEE":2736,
	"TUBER":2737,
	"TUDOR":2738,
	"TUJUNGA":2739,
	"TULARE":2740,
	"TULELAKE":2741,
	"TUNNEL INN":2742,
	"TUOLUMNE":2743,
	"TUOLUMNE CITY":2744,
	"TUPMAN":2745,
	"TURK":2746,
	"TURLOCK":2747,
	"TUTTLE":2748,
	"TUTTLETOWN":2749,
	"TWAIN":2750,
	"TWAIN HARTE":2751,
	"TWENTYNINE PALMS":2752,
	"TWIN BRIDGES":2753,
	"TWIN CITIES":2754,
	"TWIN CREEKS":2755,
	"TWIN LAKES":2756,
	"TWIN OAKS":2757,
	"TWIN PEAKS":2758,
	"TWO RIVERS":2759,
	"TWO ROCK":2760,
	"TYLERS CORNER":2761,
	"UCLA":2762,
	"UKIAH":2763,
	"ULTRA":2764,
	"UNA":2765,
	"UNDERWOOD PARK":2766,
	"UNION CITY":2767,
	"UNION HILL":2768,
	"UNIV OF CAL SANTA BARBARA":2769,
	"UNIVERSAL CITY":2770,
	"UPLAND":2771,
	"UPPER LAKE":2772,
	"UPPER LAKE-CLEARLAKE OAKS":2773,
	"UPTON":2774,
	"URGON":2775,
	"UVA":2776,
	"VACAVILLE":2777,
	"VAL VERDE":2778,
	"VALDEZ":2779,
	"VALE":2780,
	"VALENCIA":2781,
	"VALINDA":2782,
	"VALJEAN":2783,
	"VALLA":2784,
	"VALLECITO":2785,
	"VALLEJO":2786,
	"VALLEY ACRES":2787,
	"VALLEY FORD":2788,
	"VALLEY HOME":2789,
	"VALLEY OF ENCHANTMENT":2790,
	"VALLEY RANCH":2791,
	"VALLEY SPRINGS":2792,
	"VALLEY VIEW PARK":2793,
	"VALLEY VILLAGE":2794,
	"VALYERMO":2796,
	"VAN ALLEN":2797,
	"VAN NUYS":2798,
	"VANCE":2799,
	"VANDENBERG AFB":2800,
	"VANDENBERG VILLAGE":2801,
	"VENICE":2802,
	"VENIDA":2803,
	"VENOLA":2804,
	"VENTUCOPA":2805,
	"VENTURA":2806,
	"VERANO":2807,
	"VERDE":2808,
	"VERDUGO CITY":2809,
	"VERNALIS":2810,
	"VERNON":2811,
	"VERONA":2812,
	"VESTAL":2813,
	"VETERANS ADMINISTRATION":2814,
	"VICHY SPRINGS":2815,
	"VICTOR":2816,
	"VICTORVILLE":2817,
	"VIDAL":2818,
	"VIEW PARK":2819,
	"VIEWLAND":2820,
	"VILLA GRANDE":2821,
	"VILLINGER":2822,
	"VINA":2823,
	"VINCENT":2824,
	"VINEBURG":2826,
	"VINEYARD":2827,
	"VINLAND":2828,
	"VINTON":2829,
	"VIOLA":2830,
	"VIRGILIA":2831,
	"VIRGINIA COLONY":2832,
	"VIRGINIATOWN":2833,
	"VISALIA":2834,
	"VOLCANO":2835,
	"VOLCANOVILLE":2836,
	"VOLLMERS":2837,
	"VOLTA":2838,
	"VORDEN":2839,
	"WADDINGTON":2840,
	"WAGNER":2841,
	"WAHTOKE":2843,
	"WALDO":2844,
	"WALDRUE HEIGHTS":2846,
	"WALKER":2847,
	"WALKER LANDING":2848,
	"WALLACE":2849,
	"WALLTOWN":2850,
	"WALMORT":2851,
	"WALNUT":2852,
	"WALNUT CREEK":2853,
	"WALNUT GROVE":2854,
	"WALNUT PARK":2856,
	"WALONG":2857,
	"WALSH STATION":2858,
	"WALTERIA":2859,
	"WARNER":2860,
	"WARNERVILLE":2861,
	"WASCO":2862,
	"WASHINGTON":2863,
	"WATERFORD":2864,
	"WATERLOO":2865,
	"WATSONVILLE":2866,
	"WATSONVILLE JUNCTION":2867,
	"WATTS":2868,
	"WAUKENA":2869,
	"WAWONA":2870,
	"WEAVERVILLE":2871,
	"WEED":2872,
	"WEED PATCH":2873,
	"WEEDPATCH":2874,
	"WEIMAR":2875,
	"WEITCHPEC":2876,
	"WELDON":2877,
	"WELLSONA":2878,
	"WENDEL":2879,
	"WENGLER":2880,
	"WEOTT":2881,
	"WEST ATHENS":2882,
	"WEST BISHOP":2883,
	"WEST CARSON":2884,
	"WEST COLTON":2885,
	"WEST COLUSA":2886,
	"WEST COMPTON":2887,
	"WEST COVINA":2888,
	"WEST HIGHLANDS":2890,
	"WEST HILLS":2891,
	"WEST HOLLYWOOD":2892,
	"WEST LOS ANGELES":2893,
	"WEST MANTECA":2894,
	"WEST MENLO PARK":2895,
	"WEST MODESTO":2896,
	"WEST OAKLAND":2897,
	"WEST POINT":2899,
	"WEST PUENTE VALLEY":2900,
	"WEST SACRAMENTO":2901,
	"WEST VALLEY":2902,
	"WEST VENIDA":2903,
	"WEST WHITTIER-LOS NIETOS":2904,
	"WESTCHESTER":2905,
	"WESTEND":2906,
	"WESTERN ADDITION":2907,
	"WESTHAVEN":2908,
	"WESTLAKE VILLAGE":2909,
	"WESTLEY":2910,
	"WESTMONT":2911,
	"WESTPORT":2912,
	"WESTSIDE":2913,
	"WESTVILLE":2914,
	"WESTWOOD":2915,
	"WESTWOOD JUNCTION":2916,
	"WHEATLAND":2917,
	"WHEATON SPRINGS":2918,
	"WHEELER":2919,
	"WHEELER RIDGE":2920,
	"WHEELER SPRINGS":2921,
	"WHISKEY SPRINGS":2922,
	"WHISKEYTOWN":2923,
	"WHISPERING PINES":2924,
	"WHITE HALL":2925,
	"WHITE PINES":2926,
	"WHITE RIVER":2927,
	"WHITE ROCK":2928,
	"WHITEHAWK":2929,
	"WHITESBORO":2930,
	"WHITETHORN":2931,
	"WHITLEY GARDENS":2932,
	"WHITLOW":2933,
	"WHITMORE":2934,
	"WHITMORE HOT SPRINGS":2935,
	"WHITTIER":2936,
	"WIBLE ORCHARD":2937,
	"WILBUR SPRINGS":2938,
	"WILDFLOWER":2939,
	"WILDWOOD":2940,
	"WILFRED":2941,
	"WILKERSON":2942,
	"WILLAURA ESTATES":2943,
	"WILLIAMS":2944,
	"WILLITS":2945,
	"WILLOTA":2946,
	"WILLOW CREEK":2947,
	"WILLOW GLEN":2948,
	"WILLOW RANCH":2949,
	"WILLOW SPRINGS":2950,
	"WILLOWBROOK":2952,
	"WILLOWS":2953,
	"WILMINGTON":2954,
	"WILSEYVILLE":2955,
	"WILSONA GARDENS":2956,
	"WILSONIA":2957,
	"WILTON":2958,
	"WIMP":2959,
	"WINDSOR":2960,
	"WINDSOR HILLS":2961,
	"WINELAND":2962,
	"WINNETKA":2963,
	"WINTERS":2964,
	"WINTON":2965,
	"WISHON":2966,
	"WITTER SPRINGS":2967,
	"WOFFORD HEIGHTS":2968,
	"WOLF":2969,
	"WOOD RANCH":2970,
	"WOODACRE":2971,
	"WOODBRIDGE":2972,
	"WOODFORDS":2973,
	"WOODLAKE":2974,
	"WOODLAKE JUNCTION":2975,
	"WOODLAKE-THREE RIVERS":2976,
	"WOODLAND":2977,
	"WOODLAND HILLS":2978,
	"WOODLANDS":2979,
	"WOODLEAF":2980,
	"WOODSIDE":2981,
	"WOODVILLE":2982,
	"WOODY":2983,
	"WOOLSEY FLAT":2984,
	"WORTH":2985,
	"WRIGHTWOOD":2986,
	"WYANDOTTE":2987,
	"WYETH":2988,
	"WYNTOON":2989,
	"WYO":2990,
	"YAGER JUNCTION":2991,
	"YANKEE HILL":2992,
	"YANKEE JIMS":2993,
	"YELLOWJACKET":2994,
	"YERMO":2995,
	"YETTEM":2996,
	"YOKOHL":2997,
	"YOLANO":2998,
	"YOLO":2999,
	"YORKVILLE":3000,
	"YOSEMITE FORKS":3001,
	"YOSEMITE JUNCTION":3002,
	"YOSEMITE LAKES":3003,
	"YOSEMITE NATIONAL PARK":3004,
	"YOSEMITE VALLEY":3005,
	"YOSEMITE VILLAGE":3006,
	"YOU BET":3007,
	"YOUNGSTOWN":3008,
	"YOUNTVILLE":3009,
	"YREKA":3010,
	"YUBA CITY":3011,
	"YUBA FOOTHILLS":3012,
	"YUBA PASS":3013,
	"YUBA RURAL":3014,
	"YUCAIPA":3015,
	"YUCCA VALLEY":3016,
	"ZAMORA":3017,
	"ZANTE":3018,
	"ZEDIKER":3019,
	"ZENIA":3020,
	"ZENTNER":3021,
	"ZURICH":3022,
	"Mesa Oaks":3023,
	"Temblor":3024,
	"CIRCLE OAKS":3030,
	"LAKE BERRYESSA":3032,
	"NAPA COUNTY":3033
};

var county_codes = {
  "ALAMEDA": "AL",
  "AMADOR": "AM",
  "ALPINE": "AP",
  "BUTTE": "BU",
  "CALAVERAS": "CA",
  "CONTRA COSTA": "CC",
  "COLUSA": "CO",
  "DEL NORTE": "DN",
  "EL DORADO": "ED",
  "FRESNO": "FR",
  "GLENN": "GL",
  "HUMBOLDT": "HU",
  "INYO": "IN",
  "KERN": "KE",
  "KINGS": "KI",
  "LOS ANGELES": "LA",
  "LAKE": "LK",
  "LASSEN": "LS",
  "MERCED": "MC",
  "MADERA": "MD",
  "MENDOCINO": "ME",
  "MARIN": "MN",
  "MONTEREY": "MO",
  "MARIPOSA": "MR",
  "MODOC": "MX",
  "MONO": "MY",
  "NAPA": "NA",
  "NEVADA": "NE",
  "PLACER": "PC",
  "PLUMAS": "PL",
  "SACRAMENTO": "SA",
  "SAN BENITO": "SB",
  "SANTA CLARA": "SC",
  "SAN BERNARDINO": "SD",
  "SAN FRANCISCO": "SF",
  "SHASTA": "SH",
  "SIERRA": "SI",
  "SAN JOAQUIN": "SJ",
  "SISKIYOU": "SK",
  "SAN LUIS OBISPO": "SL",
  "SAN MATEO": "SM",
  "SONOMA": "SN",
  "SOLANO": "SO",
  "SANTA BARBARA": "SR",
  "STANISLAUS": "ST",
  "SUTTER": "SU",
  "SANTA CRUZ": "SZ",
  "TEHAMA": "TE",
  "TUOLUMNE": "TO",
  "TRINITY": "TR",
  "TULARE": "TU",
  "VENTURA": "VN",
  "YOLO": "YO",
  "YUBA": "YU"
};


// sLineID  sDescrip                sVoltage  bNERC
var line_ids = {
"Rio Bravo Kern Oil":                      	"0724",  	// 115	0
"Wilson Dairland 115kv":                   	"0742",  	// 115	0
"AMES-STELLING":                           	"10001", 	// 115	0
"AMES-WHISMAN":                            	"10002", 	// 115	0
"ATWATER-EL CAPITAN":                      	"10003", 	// 115	0
"Castle 115kv Tap":                        	"10003A",	// 115	0
"ATWATER-MERCED":                          	"10004", 	// 115	0
"LIVINGSTON 115KV TAP":                    	"10004A",	// 115	0
"GALLO 115KV TAP":                         	"10004B",	// 115	0
"CRESSEY 115kv TAP":                       	"10004C",	// 115	0
"JR Wood 115kv Tap":                       	"10004D",	// 115	0
"A H W-1 CABLE":                           	"10005U",	// 115	0
"A H W-2 CABLE":                           	"10006U",	// 115	0
"AX-1 CABLE":                              	"10007U",	// 115	0
"AY-1 CABLE":                              	"10008U",	// 115	0
"AY-2 CABLE":                              	"10009U",	// 115	0
"Bair-Belmont":                            	"10010", 	// 115	0
"Balch-Sanger":                            	"10011", 	// 115	0
"BARTON-SANGER":                           	"10012", 	// 115	0
"BELLOTA-RIVERBANK-MELONES":               	"10013", 	// 115	0
"Tullock 115kv Tap":                       	"10013A",	// 115	0
"Big Bend-Clayton #1":                     	"10015", 	// 115	0
"Big Bend-Clayton #2":                     	"10016", 	// 115	0
"BOGUE-RIO OSO":                           	"10017", 	// 115	0
"Greenleaf 115kv Tap":                     	"10017A",	// 115	0
"BRIDGEVILLE-COTTONWOOD":                  	"10018", 	// 115	0
"Brighton-Clayton #1":                     	"10019", 	// 115	0
"Brighton-Clayton #2":                     	"10020", 	// 115	0
"Brighton-Davis":                          	"10021", 	// 115	0
"Barker Slough 115kv Tap":                 	"10021A",	// 115	0
"UC DAVIS #2 TAP":                         	"10021B",	// 115	0
"BRIGHTON-GRAND ISLAND #1":                	"10022", 	// 115	0
"BRIGHTON-GRAND ISLAND #2":                	"10023", 	// 115	0
"BRITTON-MONTA VISTA":                     	"10024", 	// 115	0
"Butt Valley-Caribou":                     	"10025", 	// 115	0
"BUTTE-SYCAMORE CREEK":                    	"10026", 	// 115	0
"C-L CABLE":                               	"10027U",	// 115	0
"Cabrillo-Santa Ynez Sw. Sta.":            	"10028", 	// 115	0
"Buellton 115kv Tap":                      	"10028A",	// 115	0
"CALLENDAR SW STA-MESA":                   	"10029", 	// 115	0
"Camp Evers-Paul Sweet":                   	"10030", 	// 115	0
"Caribou-Sycamore Creek":                  	"10031", 	// 115	0
"Grizzly 115kv Tap":                       	"10031A",	// 115	0
"CASCADE-COTTONWOOD":                      	"10032", 	// 115	0
"CHOWCHILLA-KERCKHOFF":                    	"10033", 	// 115	0
"SHARON PRISON 115KV TAP":                 	"10033A",	// 115	0
"Oakhurst 115kv Tap":                      	"10033B",	// 115	0
"CHRISTIE-SOBRANTE":                       	"10034", 	// 115	0
"Clayton-Meadow Lane":                     	"10037", 	// 115	0
"CONTRA COSTA #1":                         	"10038", 	// 115	0
"CONTRA COSTA #2":                         	"10039", 	// 115	0
"Fibreboard 115kv Tap":                    	"10039A",	// 115	0
"Cooley Landing-Palo Alto":                	"10040", 	// 115	0
"CORCORAN-SMYRNA":                         	"10041", 	// 115	0
"Quebec 115kv Tap":                        	"10041A",	// 115	0
"Corn Prod -Stkton Cogen Jct":             	"10042", 	// 115	0
"Cortina-Mendocino #1":                    	"10043", 	// 115	0
"Lucerne #1":                              	"10043a",	// 115	0
"Cottonwood-Panorama":                     	"10044", 	// 115	0
"CRAG VIEW-CASCADE":                       	"10045", 	// 115	1
"CX #1 115kv Cable":                       	"10046U",	// 115	0
"CX #2 115kv Cable":                       	"10047U",	// 115	0
"D-L #1 115kv Cable":                      	"10048U",	// 115	0
"Dairyland-Mendota":                       	"10049", 	// 115	0
"Gill Ranch 115kv":                        	"10049B",	// 115	0
"Divide-Cabrillo #2":                      	"10050", 	// 115	0
"City #2 115kv Tap":                       	"10050A",	// 115	0
"Manville 115kv Tap":                      	"10050B",	// 115	0
"Divide-Cabrillo #1":                      	"10051", 	// 115	0
"Surf 115kv Tap":                          	"10051A",	// 115	0
"City #1 115kv Tap":                       	"10051B",	// 115	0
"DIXON LANDING-MCKEE":                     	"10052", 	// 115	0
"Donnells-Curtis":                         	"10053", 	// 115	0
"Beardsley 115kv Tap":                     	"10053A",	// 115	0
"Spring Gap 115kv Tap":                    	"10053B",	// 115	0
"Sand Bar 115kv Tap":                      	"10053C",	// 115	0
"DRUM-PLACER":                             	"10054", 	// 115	0
"Bell #1 115kv Tap":                       	"10054B",	// 115	0
"Bell #2 115kv Tap":                       	"10054C",	// 115	0
"Drum-Rio Oso #1":                         	"10055", 	// 115	0
"Dutch Flat #2 115kv Tap":                 	"10055A",	// 115	0
"Brunswick #1 115kv Tap":                  	"10055B",	// 115	0
"Drum-Rio Oso #2":                         	"10056", 	// 115	0
"Brunswick #2 115kv Tap":                  	"10056A",	// 115	0
"Drum-Summit #1(NERC)":                    	"10057", 	// 115	1
"Drum-Summit #2(NERC)":                    	"10058", 	// 115	1
"DUMBARTON-NEWARK":                        	"10059", 	// 115	0
"EAGLE ROCK-CORTINA":                      	"10061", 	// 115	0
"EAGLE ROCK-REDBUD":                       	"10062", 	// 115	0
"Lower Lake-Homestake":                    	"10062A",	// 115	0
"EAST GRAND-SAN MATEO":                    	"10063", 	// 115	0
"EASTSHORE-MT. EDEN":                      	"10064", 	// 115	0
"EL CAPITAN-WILSON":                       	"10065", 	// 115	0
"EL PATIO-SAN JOSE A":                     	"10066", 	// 115	0
"ELDORADO-MISSOURI FLAT #1":               	"10067", 	// 115	0
"Apple Hill #1 115kv Tap":                 	"10067A",	// 115	0
"ELDORADO-MISSOURI FLAT #2":               	"10068", 	// 115	0
"Apple Hill #2 115kv Tap":                 	"10068A",	// 115	0
"Evergreen-San Jose B":                    	"10069", 	// 115	0
"Markham #1 115kv Tap":                    	"10069A",	// 115	0
"Exchequer-Le Grande":                     	"10070", 	// 115	0
"FELLOWS-MIDSUN":                          	"10071", 	// 115	0
"Victory 115kv Tap":                       	"10071A",	// 115	0
"Midsun Tap":                              	"10071B",	// 115	0
"FELLOWS-TAFT":                            	"10072", 	// 115	0
"Midset 115kv Tap":                        	"10072A",	// 115	0
"FULTON JCT-VACA":                         	"10073", 	// 115	0
"Amerigas 115kv Tap":                      	"10073A",	// 115	0
"FULTON-PUEBLO":                           	"10074", 	// 115	0
"Rincon #1 115kv Tap":                     	"10074A",	// 115	0
"Monticello PH 115kv Tap":                 	"10074B",	// 115	0
"Fulton Jct.-Fulton #2":                   	"10075", 	// 115	0
"Rincon #2 115kv Tap":                     	"10075A",	// 115	0
"Fulton-Santa Rosa #1":                    	"10076", 	// 115	0
"Fulton-Santa Rosa #2":                    	"10077", 	// 115	0
"Geysers #15-Geysers #3":                  	"10080", 	// 115	0
"GEYSERS #3-CLOVERDALE":                   	"10081", 	// 115	0
"Mission Power 115kv Tap":                 	"10081A",	// 115	0
"Geysers #3-Eagle Rock":                   	"10082", 	// 115	0
"Geysers #5-Geysers #3":                   	"10083", 	// 115	0
"Geysers #7-Eagle Rock":                   	"10084", 	// 115	0
"GOLD HILL-BELLOTA-LOCKEFORD":             	"10085", 	// 115	0
"Camanche 115kv Tap":                      	"10085A",	// 115	0
"GRANT-EASTSHORE":                         	"10086", 	// 115	0
"Coles Levee Tap":                         	"10086C",	// 115	0
"Green Valley-Camp Evers":                 	"10087", 	// 115	0
"GREEN VALLEY-LLAGAS":                     	"10088", 	// 115	0
"Green Valley-Paul Sweet":                 	"10089", 	// 115	0
"H-P #1 CABLE":                            	"10090U",	// 115	0
"H-P #3 CABLE":                            	"10091U",	// 115	0
"H-Y #1 CABLE":                            	"10094U",	// 115	0
"Henrietta-Kingsburg":                     	"10095", 	// 115	0
"HERNDON-BARTON":                          	"10096", 	// 115	0
"Herndon-Bullard #1":                      	"10097", 	// 115	0
"Herndon-Bullard #2":                      	"10098", 	// 115	0
"HERNDON-MANCHESTER":                      	"10099", 	// 115	0
"Herndon-Woodward":                        	"10100", 	// 115	0
"Valley Children's Hospital 115kv Tap":    	"10100A",	// 115	0
"River Rock Tap":                          	"10100B",	// 115	0
"HP-2 CABLE":                              	"10101U",	// 115	0
"Humboldt Bay-Humboldt #1 115kv":          	"10102", 	// 115	0
"HUMBOLDT-BRIDGEVILLE":                    	"10103", 	// 115	0
"HUMBOLDT-TRINITY":                        	"10104", 	// 115	0
"IGNACIO-MARE ISLAND #1":                  	"10107", 	// 115	0
"Carquinez #1 115kv Tap":                  	"10107A",	// 115	0
"Skaggs Island #1":                        	"10107B",	// 115	0
"Jameson Canyon Pumping Plant Tap":        	"10107C",	// 115	0
"Meyers Tap":                              	"10107D",	// 115	0
"IGNACIO-MARE ISLAND #2":                  	"10108", 	// 115	0
"Carquinez #2 115kv Tap":                  	"10108A",	// 115	0
"Skaggs Island #2":                        	"10108B",	// 115	0
"Ignacio-San Rafael #1":                   	"10109", 	// 115	0
"Ignacio-San Rafael #3":                   	"10110", 	// 115	0
"Jarvis-Cryogenics":                       	"10111", 	// 115	0
"K-D #1 115kv Cable":                      	"10112U",	// 115	0
"K-D #2 115kv Cable":                      	"10113U",	// 115	0
"Kerckhoff 1-Kerckhoff 2":                 	"10114", 	// 115	0
"KERCKHOFF-CLOVIS-SANGER #1":              	"10115", 	// 115	0
"KERCKHOFF-CLOVIS-SANGER #2":              	"10116", 	// 115	0
"Kern Oil-Dexzel":                         	"10117", 	// 115	0
"KERN OIL-WITCO":                          	"10118", 	// 115	0
"Discovery 115kv Tap":                     	"10118A",	// 115	0
"Kern-Kern Front":                         	"10119", 	// 115	0
"Double C (PSE) 115kv Tap":                	"10119A",	// 115	0
"Badger Crk (PSE) 115kv Tap":              	"10119B",	// 115	0
"Sierra (PSE) 115kv Tap":                  	"10119C",	// 115	0
"Kern-Lamont":                             	"10120", 	// 115	0
"Tevis #1 115kv Tap":                      	"10120A",	// 115	0
"Kern-Lerdo-Kern Oil":                     	"10121", 	// 115	0
"KERN-LIVE OAK":                           	"10122", 	// 115	0
"KERN-MAGUNDEN-WITCO":                     	"10123", 	// 115	0
"Kernwater 115kv Tap":                     	"10123A",	// 115	0
"Witco (COGEN) 115kv Tap":                 	"10123B",	// 115	0
"Kern-Rosedale":                           	"10124", 	// 115	0
"KERN-STOCKDALE":                          	"10125", 	// 115	0
"Tevis #2 115kv Tap":                      	"10125A",	// 115	0
"Kern-Westpark #1":                        	"10126", 	// 115	0
"Kern-Westpark #2":                        	"10127", 	// 115	0
"Kifer-San Jose B":                        	"10128", 	// 115	0
"FMC 115kv Tap":                           	"10128A",	// 115	0
"KINGS RIVER-SANGER-REEDLEY":              	"10129", 	// 115	0
"Rainbow 115kv Tap":                       	"10129A",	// 115	0
"KINGSBURG-CORCORAN #1":                   	"10130", 	// 115	0
"KINGSBURG-CORCORAN #2":                   	"10131", 	// 115	0
"Penngrove Sub 115kv Tap":                 	"10132A",	// 115	0
"Stony Point Sub 115kv Tap":               	"10132B",	// 115	0
"Lakeville-Sonoma":                        	"10133", 	// 115	0
"LAKEWOOD-MEADOW LN-CLAYTON":              	"10134", 	// 115	0
"EBMUD 115kv Tap":                         	"10134A",	// 115	0
"LAWRENCE-MONTA VISTA":                    	"10135", 	// 115	0
"Phillips 115kv Tap":                      	"10135A",	// 115	0
"Le Grand-Dairyland":                      	"10136", 	// 115	0
"LE GRANDE-CHOWCHILLA":                    	"10137", 	// 115	0
"Certainteed 115kv Tap":                   	"10137A",	// 115	0
"CHOWCHILLA #1 115KV TAP":                 	"10137B",	// 115	0
"Lerdo-Famoso":                            	"10138", 	// 115	0
"Ultra Power (Ogle) 115k Tap":             	"10138A",	// 115	0
"Cawelo C 115kv Tap":                      	"10138B",	// 115	0
"Live Oak Sw Stn-Grainte Rd":              	"10139", 	// 115	0
"LIVE OAK-KERN OIL":                       	"10140", 	// 115	0
"VEDDER 115KV TAP":                        	"10140A",	// 115	0
"Llagas-Gilroy Foods":                     	"10141", 	// 115	0
"Gilroy Energy 115kv Tap":                 	"10141A",	// 115	0
"MADISON-VACA":                            	"10143", 	// 115	0
"MANCHESTER-SANGER":                       	"10144", 	// 115	0
"Las Palmas 115kv Tap":                    	"10144A",	// 115	0
"MANTECA-VIERRA":                          	"10145", 	// 115	0
"HOWLAND ROAD 115KV TAP":                  	"10145A",	// 115	0
"Heinz 115kv Tap":                         	"10145C",	// 115	0
"Martin-Daly City #1":                     	"10146", 	// 115	0
"Martin-Daly City #2":                     	"10147", 	// 115	0
"Serramonte 115kv Tap":                    	"10147A",	// 115	0
"MARTIN-EAST GRAND":                       	"10148", 	// 115	0
"MARTIN-MILLBRAE #1":                      	"10149", 	// 115	0
"MARTIN-SF AIRPORT":                       	"10150", 	// 115	0
"United Co-Gen Inc 115kv Tap":             	"10150A",	// 115	0
"Martinez-Shell Oil #1":                   	"10151", 	// 115	0
"Martinez-Shell Oil #2":                   	"10152", 	// 115	0
"Martinez-Sobrante":                       	"10153", 	// 115	0
"Mc Call-Corcoran":                        	"10154", 	// 115	0
"MC CALL-KINGSBURG #1":                    	"10155", 	// 115	0
"Kingsburg Cogen 115kv Tap":               	"10155A",	// 115	0
"Guardian #2 115kv Tap":                   	"10155B",	// 115	0
"MC CALL-KINGSBURG #2":                    	"10156", 	// 115	0
"Guardian #1 115kv Tap":                   	"10156A",	// 115	0
"Mc Call-Malaga":                          	"10157", 	// 115	0
"Ranchers Cotton 115kv Tap":               	"10157A",	// 115	0
"Rio Bravo Tap":                           	"10157B",	// 115	0
"Air Products Tap":                        	"10157C",	// 115	0
"Johnson Wax Tap":                         	"10157D",	// 115	0
"Mc Call-Reedley":                         	"10158", 	// 115	0
"Mc Call-Sanger #1":                       	"10159", 	// 115	0
"Mc Call-Sanger #2":                       	"10160", 	// 115	0
"Mc Call-Sanger #3":                       	"10161", 	// 115	0
"Mc Call-West Fresno #1":                  	"10162", 	// 115	0
"California Ave 115kv Tap":                	"10162A",	// 115	0
"Danish Creamery Tap B":                   	"10162B",	// 115	0
"Mc Call-West Fresno #2":                  	"10163", 	// 115	0
"MCKEE-METCALF":                           	"10164", 	// 115	0
"Melones-Curtis":                          	"10165", 	// 115	0
"Peoria 115kv Tap":                        	"10165A",	// 115	0
"Chinese Camp (Ultra Power) 115k tap":     	"10165B",	// 115	0
"Racetrack 115kv Tap":                     	"10165C",	// 115	0
"Melones-Racetrack":                       	"10166", 	// 115	0
"MENDOCINO-REDBUD":                        	"10167", 	// 115	0
"Lucerne #2":                              	"10167a",	// 115	0
"Mendocino-Ukiah":                         	"10168", 	// 115	0
"Meridian Minerals":                       	"10169", 	// 115	0
"Mesa-Divide #1":                          	"10170", 	// 115	0
"Mesa-Divide #2":                          	"10171", 	// 115	0
"Mesa-Santa Maria":                        	"10172", 	// 115	0
"Fairway #1 115kv Tap":                    	"10172A",	// 115	0
"Mesa-Sisquoc":                            	"10173", 	// 115	0
"SANTA MARIA COGEN 115KV TAP":             	"10173A",	// 115	0
"Metcalf-Coyote Pumping Plant":            	"10174", 	// 115	0
"Metcalf-Edenvale #1":                     	"10175", 	// 115	0
"IBM Harry RD #2 115kv Tap":               	"10175A",	// 115	0
"Metcalf-Edenvale #2":                     	"10176", 	// 115	0
"IBM Bailey 115kv Tap":                    	"10176A",	// 115	0
"Metcalf-El Patio #1":                     	"10177", 	// 115	0
"IBM Harry RD #1 115kv Tap":               	"10177A",	// 115	0
"Metcalf-El Patio #2":                     	"10178", 	// 115	0
"Metcalf-Evergreen #1":                    	"10179", 	// 115	0
"Metcalf-Evergreen #2":                    	"10180", 	// 115	0
"Markham #2 115kv Tap":                    	"10180A",	// 115	0
"Stone 115kv Tap":                         	"10180B",	// 115	0
"METCALF-GREEN VALLEY":                    	"10181", 	// 115	0
"Metcalf-Hicks #1":                        	"10182", 	// 115	0
"Metcalf-Hicks #2":                        	"10183", 	// 115	0
"Metcalf-Morgan Hill":                     	"10184", 	// 115	0
"MIDSUN-MIDWAY":                           	"10185", 	// 115	0
"North Midway 115kv Tap":                  	"10185A",	// 115	0
"Cymric 115kv Tap":                        	"10185B",	// 115	0
"MIDWAY-RENFRO":                           	"10186", 	// 115	0
"Tupman #1 115kv Tap":                     	"10186A",	// 115	0
"TUPMAN-NORCO 115KV TAP":                  	"10186B",	// 115	0
"MIDWAY-RIO BRAVO-RENFRO":                 	"10188", 	// 115	0
"Tupman #2 115kv Tap":                     	"10188A",	// 115	0
"Frito Lay 115kv Tap":                     	"10188B",	// 115	0
"Golden Valley Tap 70kv":                  	"10188C",	// 70 	0
"MIDWAY-SHAFTER":                          	"10189", 	// 115	0
"Midway-Taft":                             	"10190", 	// 115	0
"Midway-Temblor":                          	"10191", 	// 115	0
"Belridge 115kv Tap":                      	"10191A",	// 115	0
"MILLBRAE-SAN MATEO #1":                   	"10192", 	// 115	0
"MILPITAS-SWIFT":                          	"10193", 	// 115	0
"Mabury 115kv Tap":                        	"10193A",	// 115	0
"MISSOURI FLAT-GOLD HILL #1":              	"10194", 	// 115	0
"MISSOURI FLAT-GOLD HILL #2":              	"10195", 	// 115	0
"MONTA VISTA-WOLFE":                       	"10196", 	// 115	0
"Moraga-Claremont #1":                     	"10198", 	// 115	0
"Moraga-Claremont #2":                     	"10199", 	// 115	0
"Moraga-Oakland #1":                       	"10200", 	// 115	0
"Moraga-Oakland #2":                       	"10201", 	// 115	0
"Moraga-Oakland #3":                       	"10202", 	// 115	0
"Moraga-Oakland #4":                       	"10203", 	// 115	0
"MORAGA-OAKLAND J":                        	"10204", 	// 115	0
"Moraga-San Leandro #1":                   	"10205", 	// 115	0
"Moraga-San Leandro #2":                   	"10206", 	// 115	0
"Moraga-San Leandro #3":                   	"10207", 	// 115	0
"Morgan Hill-Llagas":                      	"10208", 	// 115	0
"Morro Bay-San Luis Obispo #1":            	"10209", 	// 115	0
"Morro Bay-San Luis Obispo #2":            	"10210", 	// 115	0
"Goldtree 115kv Tap":                      	"10210A",	// 115	0
"Moss Landing-Del Monte #1":               	"10211", 	// 115	0
"Moss Landing-Del Monte #2":               	"10212", 	// 115	0
"Moss Landing-Green Vly #1":               	"10213", 	// 115	0
"Moss Landing-Green Vly #2":               	"10214", 	// 115	0
"MOSS LANDING-HOLLISTER":                  	"10215", 	// 115	0
"Moss Landing-Salinas #1":                 	"10216", 	// 115	0
"Dolan RD #1 115kv Tap":                   	"10216A",	// 115	0
"Moss Landing-Salinas #2":                 	"10217", 	// 115	0
"Dolan RD #2 115kv Tap":                   	"10217A",	// 115	0
"MOSS LANDING-SALINAS-SOLEDAD #1":         	"10218", 	// 115	0
"Hollister #1 Tap 115 KV":                 	"10218A",	// 115	0
"MOSS LANDING-SALINAS-SOLEDAD #2":         	"10219", 	// 115	0
"HOLLISTER #2 115 KV":                     	"10219A",	// 115	0
"San Francisco #2":                        	"10219Z",	// 115	0
"MOUNTAIN VIEW-MONTA VISTA":               	"10220", 	// 115	0
"MT. EDEN-DUMBARTON":                      	"10221", 	// 115	0
"NEWARK-AMES #1":                          	"10222", 	// 115	0
"NEWARK-AMES #2":                          	"10223", 	// 115	0
"NEWARK-AMES #3":                          	"10224", 	// 115	0
"NEWARK-APPLIED MATERIALS":                	"10226", 	// 115	0
"Lockheed #2 115kv Tap":                   	"10226A",	// 115	0
"A.M.D. 115kv Tap":                        	"10226B",	// 115	0
"NEWARK-DIXON LANDING":                    	"10227", 	// 115	0
"Newark-Fremont #1":                       	"10228", 	// 115	0
"Newark-Fremont #2":                       	"10229", 	// 115	0
"Newark-Jarvis #1":                        	"10230", 	// 115	0
"Newark-Jarvis #2":                        	"10231", 	// 115	0
"Newark-Kifer":                            	"10232", 	// 115	0
"Zanker 115kv #2 Tap":                     	"10232A",	// 115	0
"NEWARK-LAWRENCE":                         	"10233", 	// 115	0
"Lockheed #1 115kv Tap":                   	"10233A",	// 115	0
"Moffett Field 115kv Tap":                 	"10233B",	// 115	0
"Newark-Lawrence Lab":                     	"10234", 	// 115	0
"NEWARK-MILPITAS #1":                      	"10235", 	// 115	0
"NEWARK-NUMMI":                            	"10237", 	// 115	0
"Newark-Scott #1":                         	"10238", 	// 115	0
"Newark-Scott #2":                         	"10239", 	// 115	0
"NEWARK-TRIMBLE":                          	"10240", 	// 115	0
"Zanker 115kv #1 Tap":                     	"10240A",	// 115	0
"Agnew 115kv Tap":                         	"10240B",	// 115	0
"North Tower-Martinez Jct #1":             	"10241", 	// 115	0
"Oakland C- Maritime (USN)":               	"10242", 	// 115	0
"Oakland C-Turbines":                      	"10243", 	// 115	0
"OAKLAND J-GRANT":                         	"10244", 	// 115	0
"Owens Brockway 115Kv Tap":                	"10244A",	// 115	0
"Oleum-G #1":                              	"10245", 	// 115	0
"Valley View #1 115kv Tap":                	"10245A",	// 115	0
"Oleum-G #2":                              	"10246", 	// 115	0
"Valley View #2 115kv Tap":                	"10246A",	// 115	0
"OLEUM-MARTINEZ":                          	"10247", 	// 115	0
"OLEUM-NORTH TOWER-CHRISTIE":              	"10248", 	// 115	0
"P-X #1 CABLE":                            	"10249U",	// 115	0
"P-X #2 CABLE":                            	"10250U",	// 115	0
"Palermo-Big Bend #2":                     	"10251", 	// 115	0
"PALERMO-BOGUE":                           	"10252", 	// 115	0
"Honcut 115kv Tap":                        	"10252A",	// 115	0
"Palermo-Nicolaus":                        	"10253", 	// 115	0
"PALERMO-PEASE":                           	"10254", 	// 115	0
"Panoche-Mendota":                         	"10255", 	// 115	0
"Cheney #1 115kv Tap":                     	"10255A",	// 115	0
"Panoche-Oro Loma":                        	"10256", 	// 115	0
"Kamm Tap":                                	"10256A",	// 115	0
"Westlands #1 RAPP 115k vTap":             	"10256B",	// 115	0
"San Luis #5 115kv Tap":                   	"10256C",	// 115	0
"SAN LUIS #3 115KV TAP":                   	"10256D",	// 115	0
"De Francesco Tap":                        	"10256E",	// 115	0
"Panoche-Schindler #1":                    	"10257", 	// 115	0
"Cantua 115kv Tap":                        	"10257A",	// 115	0
"Westlands #18 RA 115kv Tap":              	"10257B",	// 115	0
"Oxford Tab 115kv":                        	"10257C",	// 115	0
"Panoche-Schindler #2":                    	"10258", 	// 115	0
"Cheney #2 115kv Tap":                     	"10258A",	// 115	0
"PEASE-RIO OSO":                           	"10259", 	// 115	0
"PITTSBURG-CLAYTON #1":                    	"10260", 	// 115	0
"Pittsburg-Clayton #3":                    	"10262", 	// 115	0
"PITTSBURG-COLUMBIA STEEL":                	"10263", 	// 115	0
"GWF #2 115kv Tap":                        	"10263A",	// 115	0
"Linde 115kv Tap":                         	"10263B",	// 115	0
"Dow Chemical 115kv Tap":                  	"10263C",	// 115	0
"Pittsburg-Kirker-Columbia Steel":         	"10264", 	// 115	0
"Pittsburg-Martinez #1":                   	"10265", 	// 115	0
"Bollman #1 115kv Tap":                    	"10265A",	// 115	0
"Imhoff 115kv Tap":                        	"10265B",	// 115	0
"Pittsburg-Martinez #2":                   	"10266", 	// 115	0
"Bollman #2 115kv Tap":                    	"10266A",	// 115	0
"PLACER-GOLD HILL #1":                     	"10267", 	// 115	0
"Flint 115kv Tap":                         	"10267A",	// 115	0
"POSCO-COLUMBIA STEEL":                    	"10268", 	// 115	0
"RAVENSWOOD-AMES #1":                      	"10270", 	// 115	0
"RAVENSWOOD-AMES #2":                      	"10271", 	// 115	0
"Ravenswood-Bair #1":                      	"10272", 	// 115	0
"Shredder 115kv Tap":                      	"10272A",	// 115	0
"Ravenswood-Cooley Lndg #1":               	"10273", 	// 115	0
"Ravenswood-Cooley Lndng #2":              	"10274", 	// 115	0
"Ravenswood-Palo Alto #1":                 	"10275", 	// 115	0
"Ravenswood-Palo Alto #2":                 	"10276", 	// 115	0
"Ravenswood-San Mateo 115kv":              	"10277", 	// 115	0
"Rio Oso-Nicolaus":                        	"10278", 	// 115	0
"RIO OSO-WEST SACRAMENTO":                 	"10279", 	// 115	0
"RIO OSO-WOODLAND #1":                     	"10280", 	// 115	0
"Woodland Poly Tap 115KV":                 	"10280A",	// 115	0
"RIO OSO-WOODLAND #2":                     	"10281", 	// 115	0
"Zamora 115kv Tap":                        	"10281A",	// 115	0
"BELLOTA-RIVERBANK":                       	"10282", 	// 115	0
"Hershey 115kv Tap":                       	"10282A",	// 115	0
"Salado Jct-Sargent Sws":                  	"10283", 	// 115	0
"Salt Springs-Tiger Creek":                	"10284", 	// 115	0
"San Jose A-San Jose B":                   	"10285", 	// 115	0
"SAN LEANDRO-OAKLAND J #1":                	"10286", 	// 115	0
"SAN LUIS OBISPO-CALLENDAR SW STA":        	"10287", 	// 115	0
"San Luis Obispo-Santa Maria - 115kv":     	"10288", 	// 115	0
"San Mateo-Bay Meadows #1":                	"10289", 	// 115	0
"San Mateo-Bay Meadows #2":                	"10290", 	// 115	0
"San Mateo-Bellmont":                      	"10291", 	// 115	0
"San Mateo-Martin #3":                     	"10292", 	// 115	0
"San Mateo-Martin #6":                     	"10293", 	// 115	0
"Sanger-Malaga":                           	"10294", 	// 115	0
"Santa Maria-Sisquoc":                     	"10295", 	// 115	0
"Fairway #2 115kv Tap":                    	"10295A",	// 115	0
"Semitropic-Famoso - 115kv":               	"10296", 	// 115	0
"Wasco Prison Tap":                        	"10296A",	// 115	0
"SEMITROPIC-MIDWAY #1":                    	"10297", 	// 115	0
"SEMITROPIC-MIDWAY #2":                    	"10298", 	// 115	0
"SF AIRPORT-SAN MATEO":                    	"10299", 	// 115	0
"SHAFTER-RIO BRAVO":                       	"10300", 	// 115	0
"Sierra #1":                               	"10301", 	// 115	0
"Sierra #2":                               	"10302", 	// 115	0
"Sisquoc-Garey":                           	"10303", 	// 115	0
"Sisquoc-Santa Ynez Sw Sta":               	"10304", 	// 115	0
"Santa Ynez 115kv Tap":                    	"10304A",	// 115	0
"SMYRNA-SEMITROPIC-MIDWAY":                	"10305", 	// 115	0
"Sobrante-G #1":                           	"10306", 	// 115	0
"Sobrante-G #2":                           	"10307", 	// 115	0
"SOBRANTE-GRIZZLY-CLARMNT #1":             	"10308", 	// 115	0
"SOBRANTE-GRIZZLY-CLARMNT #2":             	"10309", 	// 115	0
"SOBRANTE-R #1":                           	"10311", 	// 115	0
"SOBRANTE-R #2":                           	"10312", 	// 115	0
"Sobrante-Std Oil Swg Sta #1":             	"10313", 	// 115	0
"San Pablo #2 115kv Tap":                  	"10313A",	// 115	0
"Point Pinole 115kv Tap":                  	"10313B",	// 115	0
"Sobrante-Std Oil Swg Sta #2":             	"10314", 	// 115	0
"San Pablo #1 115kv Tap":                  	"10314A",	// 115	0
"Sonoma-Pueblo":                           	"10315", 	// 115	0
"Stanislaus-Manteca #2":                   	"10316", 	// 115	0
"STANISLAUS-MELONES SW STA-MANTECA #1":    	"10317", 	// 115	0
"Frogtown #1 115kv tap":                   	"10317A",	// 115	0
"STANISLAUS-MELONES SW STA-MANTECA #3":    	"10318", 	// 115	0
"Cataract 115kv Tap":                      	"10318A",	// 115	0
"Ripon 115kv Tap":                         	"10318B",	// 115	0
"Stanislaus-Newark #1":                    	"10319", 	// 115	0
"Stanislaus-Newark #2":                    	"10320", 	// 115	0
"STELLING-WOLFE":                          	"10321", 	// 115	0
"STOCKTON A-LCKFRD-BELLOTA #1":            	"10322", 	// 115	0
"STOCKTON A-LCKFRD-BELLOTA #2":            	"10323", 	// 115	0
"Kyoho 115kv tap":                         	"10323A",	// 115	0
"SWIFT-METCALF":                           	"10326", 	// 115	0
"Table Mountain-Butte #1":                 	"10327", 	// 115	0
"TAFT-CHALK CLIFF":                        	"10330", 	// 115	0
"Temblor-Kernridge":                       	"10331", 	// 115	0
"TEMBLOR-SAN LUIS OBISPO":                 	"10332", 	// 115	0
"Carrizo Plains 115kv Tap":                	"10332A",	// 115	0
"Tesla-Kasson":                            	"10333", 	// 115	0
"Owens Illinois 115kv Tap":                	"10333A",	// 115	0
"Tesla-Manteca":                           	"10334", 	// 115	0
"Lawrence Livermore Lab2 Tap":             	"10334A",	// 115	0
"AEC SITE #1 115KV TAP":                   	"10334B",	// 115	0
"AEC Site #2 115kv Tap":                   	"10334C",	// 115	0
"Safeway 115kv Tap":                       	"10334D",	// 115	0
"Tesla-Salado #1":                         	"10335", 	// 115	0
"Modesto Energy 115kv Tap":                	"10335A",	// 115	0
"Miller #1 115kv Tap":                     	"10335B",	// 115	0
"Teichert 115 Tap":                        	"10335C",	// 115	0
"TESLA-SALADO-MANTECA":                    	"10336", 	// 115	0
"Ingram Creek 115kv Tap":                  	"10336A",	// 115	0
"Miller #2 115kv Tap":                     	"10336B",	// 115	0
"TESLA-STOCKTON COGEN JCT":                	"10337", 	// 115	0
"Thermal Energy 115kv Tap":                	"10337A",	// 115	0
"San Joaquin Cogen 115kv tap":             	"10337B",	// 115	0
"Tesla-Tracy - 115kv":                     	"10338", 	// 115	0
"Ellis 115kv Tap":                         	"10338A",	// 115	0
"Leprino Foods (Tracy) 115kv Tap":         	"10338C",	// 115	0
"TRIMBLE-SAN JOSE B":                      	"10339", 	// 115	0
"Gish 115kv Tap":                          	"10339A",	// 115	0
"TRINITY-COTTONWOOD":                      	"10340", 	// 115	0
"Jessup 115kv Tap":                        	"10340A",	// 115	0
"UKIAH-HOPLAND-CLOVERDALE":                	"10341", 	// 115	0
"VACA-JAMESON-MARE ISLAND":                	"10342", 	// 115	0
"VACA-SUISUN":                             	"10345", 	// 115	0
"VACA-SUISUN-JAMESON":                     	"10346", 	// 115	0
"VACA-VACAVILLE-CORDELIA":                 	"10347", 	// 115	0
"VACA-VACAVILLE-JAMESON-NORTH TOWER":      	"10348", 	// 115	0
"WEST SACRAMENTO-BRIGHTON":                	"10349", 	// 115	0
"Deepwater #2 115kv Tap":                  	"10349A",	// 115	0
"West Sacramento-Davis":                   	"10350", 	// 115	0
"Deepwater #1 115kv Tap":                  	"10350A",	// 115	0
"Post Office 115kv Tap":                   	"10350B",	// 115	0
"UC DAVIS #1 TAP":                         	"10350C",	// 115	0
"Westpark-Magunden":                       	"10351", 	// 115	0
"Bear Mtn 115kv Tap":                      	"10351A",	// 115	0
"Bolthouse 115kv Tap":                     	"10351B",	// 115	0
"Cal Water Tap 115 kv":                    	"10351C",	// 115	0
"Wheeler Ridge-Lamont":                    	"10352", 	// 115	0
"Arvin Edison 115kv Tap":                  	"10352A",	// 115	0
"WHISMAN-MOUNTAIN VIEW":                   	"10353", 	// 115	0
"Wilson-Atwater #2":                       	"10354", 	// 115	0
"Wilson-Le Grand":                         	"10355", 	// 115	0
"Wilson-Merced #1":                        	"10356", 	// 115	0
"Wilson-Merced #2":                        	"10357", 	// 115	0
"Wilson-Oro Loma":                         	"10358", 	// 115	0
"Woodland-Davis":                          	"10359", 	// 115	0
"Woodland-Biomass 115kv Tap":              	"10359A",	// 115	0
"Hunt Wesson Tap 115Kv":                   	"10359B",	// 115	0
"Woodleaf-Palermo":                        	"10360", 	// 115	0
"Sly Creek 115kv Tap":                     	"10360A",	// 115	0
"Forbestown 115kv Tap":                    	"10360B",	// 115	0
"Kanaka 115 kv Tap":                       	"10360C",	// 115	0
"X-Y #1 CABLE":                            	"10362U",	// 115	0
"Drum #1 PH 115kv Tap":                    	"10363", 	// 115	0
"Drum #2 PH 115kv Tap":                    	"10364", 	// 115	0
"Lawrence Livermore Lab1 Tap":             	"10365", 	// 115	0
"OLEUM-UNOCAL #1":                         	"10366", 	// 115	0
"OLEUM-UNOCAL #2":                         	"10367", 	// 115	0
"Union Oil 115kv Tap":                     	"10368", 	// 115	0
"PLACER-GOLD HILL #2":                     	"10369", 	// 115	0
"APPLIED MATERIALS-BRITTON":               	"10372", 	// 115	0
"VIERRA-TRACY-KASSON":                     	"10373", 	// 115	0
"SANTA ROSA-CORONA":                       	"10380", 	// 115	0
"CORONA-LAKEVILLE":                        	"10381", 	// 115	0
"AMES DISTRIBUTION-AMES":                  	"10382", 	// 115	0
"NEWARK-AMES DISTRIBUTION":                	"10383", 	// 115	0
"TABLE MTN-SYCAMORE CREEK":                	"10384", 	// 115	0
"PALERMO-WYANDOTTE":                       	"10385", 	// 115	0
"Table Mountain-Butte #2":                 	"10388", 	// 115	0
"McKee-Piercy 115kv":                      	"10389", 	// 115	0
"Piercy-Metcalf 115kv":                    	"10390", 	// 115	0
"Caribou-Palermo":                         	"10391", 	// 115	0
"GEYSERS #11-EAGLE ROCK":                  	"10392", 	// 115	0
"EAGLE ROCK-FULTON":                       	"10393", 	// 115	0
"Gold Hill-Clarksville 115kv":             	"10394", 	// 115	0
"Drum-Bell":                               	"10397", 	// 115	0
"Bell-Placer":                             	"10398", 	// 115	0
"Paradise-Butte":                          	"10399", 	// 115	0
"Paradise-Table Mtn. 115kV":               	"10400", 	// 115	0
"Stelling-Monta Vista":                    	"10403", 	// 115	0
"Whisman-Monta Vista":                     	"10404", 	// 115	0
"Cal Peak-Vac 115KV":                      	"10405", 	// 115	0
"Pittsburg - Los Medanos #1":              	"10406", 	// 115	0
"Pittsburg - Los Medanos #2":              	"10407", 	// 115	0
"Ravenswood-Bair #2":                      	"10412", 	// 115	0
"Los Esteros-Nortech":                     	"10413", 	// 115	0
"LECEF Tap 115KV":                         	"10413A",	// 1  	0
"Los Esteros-Trimble":                     	"10414", 	// 115	0
"Los Esteros-Montague":                    	"10415", 	// 115	0
"Los Esteros-Agnew":                       	"10416", 	// 115	0
"Montague-Trimble":                        	"10417", 	// 115	0
"NEWARK-MILPITAS #2":                      	"10418", 	// 115	0
"Santa Paula-Millbrae":                    	"10419", 	// 115	0
"Moraga - Lakewood 115":                   	"10420", 	// 115	0
"Moraga - Sobrante 115":                   	"10421", 	// 115	0
"Newark-NRS #1":                           	"10424", 	// 115	0
"Newark-NRS #2":                           	"10425", 	// 115	0
"Northern Receiving Sta-Scott #1":         	"10426", 	// 115	0
"Northern Receiving Sta-Scott #2":         	"10427", 	// 115	0
"Frec-Bogue 115kv":                        	"10430", 	// 115	0
"Tesla Schulte SW STA 115kv":              	"10433", 	// 115	0
"GWF Tracy Schulte SW STA 115kv":          	"10434", 	// 115	0
"San Mateo-Martin #4":                     	"10435", 	// 115	0
"NORTECH-NORTHEN RECEIVING STATION":       	"10436", 	// 115	0
"California Ave-McCall":                   	"10437", 	// 115	0
"Danish Creamery Tap A":                   	"10437A",	// 115	0
"West Fresno - California Ave":            	"10438", 	// 115	0
"Smartville-Camp Far West 60kv":           	"10439", 	// 60 	0
"Kifer-FMC 115KV":                         	"10440", 	// 115	0
"Notre Dame-Butte":                        	"10442", 	// 115	0
"Sycamore Creek-Notre Dame-Table Mtn":     	"10443", 	// 115	0
"Silverado - Fulton Jct":                  	"10446", 	// 115	0
"Riverbank JCT SW STA Manteca":            	"10447", 	// 115	0
"Stanislaus Melones SW STA Riverbank JCT": 	"10448", 	// 115	0
"Frogtown #2 115kv tap":                   	"10448A",	// 115	0
"Lammers Kasson 115kv":                    	"10451", 	// 115	0
"Schulte SW STA-Lammers 115kv":            	"10452", 	// 115	0
"Lincoln-Pleasant Grove 115kv":            	"10453", 	// 115	0
"Rio Oso-Lincoln 115kv":                   	"10454", 	// 115	0
"Atlantic-Pleasant Grove #1 115 kv":       	"10455", 	// 115	0
"Higgins - Bell 115kv":                    	"10458", 	// 115	0
"Drum Higgins":                            	"10459", 	// 115	0
"Atwater Cressey 115kv Tap":               	"10460", 	// 115	0
"Charca Famoso 115 kv":                    	"10462", 	// 115	0
"Semitropic Charca 115 kv":                	"10463", 	// 115	0
"San Jose B-Stone-Evergreen":              	"10472", 	// 115	0
"Stone-Evergreen-Metcalf":                 	"10473", 	// 115	0
"Arco-Midway":                             	"20001", 	// 230	1
"ATLANTIC-GOLD HILL":                      	"20002", 	// 230	1
"BAHIA-MORAGA":                            	"20003", 	// 230	1
"Balch-McCall":                            	"20004", 	// 230	1
"BELLOTA-MELONES":                         	"20005", 	// 230	1
"Bellota-Tesla #2":                        	"20006", 	// 230	1
"BELLOTA-WARNERVILLE":                     	"20007", 	// 230	1
"BELLOTA-WEBER":                           	"20008", 	// 230	1
"BORDEN-GREGG":                            	"20009", 	// 230	1
"BRENTWOOD-KELSO":                         	"20010", 	// 230	1
"BRIGHTON-BELLOTA":                        	"20011", 	// 230	1
"BUCKS CREEK-ROCK CREEK-CRESTA":           	"20012", 	// 230	1
"Caribou-Table Mountain":                  	"20013", 	// 230	1
"Belden 230kv Tap":                        	"20013A",	// 230	1
"CASTRO VALLEY-NEWARK":                    	"20014", 	// 230	1
"COBURN-PANOCHE":                          	"20015", 	// 230	1
"Contra Costa PP/ Sub":                    	"20016", 	// 230	1
"CONTRA COSTA-BRENTWOOD":                  	"20017", 	// 230	1
"CONTRA COSTA-DELTA SW YARD":              	"20018", 	// 230	1
"Windmaster 230kv Tap":                    	"20018A",	// 230	1
"Contra Costa -Moraga #2 230":             	"20019", 	// 230	1
"CONTRA COSTA-LAS POSITAS":                	"20020", 	// 230	1
"US Windpower #3 230kv Tap":               	"20021A",	// 230	1
"Contra Costa -Moraga #1 230":             	"20022", 	// 230	1
"TES 230Kv Tap":                           	"20022A",	// 230	1
"CORTINA-VACA":                            	"20023", 	// 230	1
"COTTONWOOD-CORTINA":                      	"20024", 	// 230	1
"Cottonwood-Delevan #2 230KV":             	"20024K",	// 230	1
"COTTONWOOD-GLENN":                        	"20025", 	// 230	1
"COTTONWOOD-LOGAN CREEK":                  	"20026", 	// 230	1
"COTTONWOOD-VACA":                         	"20027", 	// 230	1
"CRESTA-RIO OSO":                          	"20028", 	// 230	1
"DELTA SWITCHING YARD-TESLA":              	"20029", 	// 230	1
"Diablo PP Standby Supply":                	"20030", 	// 230	1
"Diablo-Mesa":                             	"20031", 	// 230	1
"DOS AMIGOS-PANOCHE":                      	"20032", 	// 230	1
"NEWARK E-F BUS TIE":                      	"20033", 	// 230	1
"EASTSHORE-SAN MATEO":                     	"20034", 	// 230	1
"EIGHT MILE ROAD-TESLA":                   	"20035", 	// 230	1
"ELECTRA-BELLOTA":                         	"20036", 	// 230	1
"Fulton-Ignacio #1":                       	"20037", 	// 230	1
"GATES-ARCO":                              	"20038", 	// 230	1
"Gates-Gregg":                             	"20039", 	// 230	1
"Gates-McCall":                            	"20040", 	// 230	1
"Gates-Panoche #1":                        	"20041", 	// 230	1
"Gates-Panoche #2":                        	"20042", 	// 230	1
"CCPA #1 230KV Tap":                       	"20043A",	// 230	1
"GEYSERS #12-FULTON":                      	"20044", 	// 230	1
"Geysers #16 230kv Tap":                   	"20045", 	// 230	1
"GEYSERS #17-FULTON":                      	"20046", 	// 230	1
"Bottle Rock 230kv Tap D.W.R.":            	"20046A",	// 230	1
"CCPA #2 230KV Tap":                       	"20046B",	// 230	1
"GEYSERS #9-LAKEVILLE":                    	"20047", 	// 230	1
"Geysers #13 230kv Tap":                   	"20047A",	// 230	1
"Santa Fe Geothermal 230kv Tap":           	"20047B",	// 230	1
"Geysers #20 230kv Tap":                   	"20047C",	// 230	1
"Geysers #18 230kv Tap":                   	"20047D",	// 230	1
"GLENN-VACA":                              	"20048", 	// 230	1
"GOLD HILL-EIGHT MILE ROAD":               	"20049", 	// 230	1
"GOLD HILL-LODI STIG":                     	"20050", 	// 230	1
"Gregg-Ashlan":                            	"20051", 	// 230	1
"Figarden #2 230kv Tap (UG)":              	"20051A",	// 230	1
"Gregg-Herndon #1":                        	"20052", 	// 230	1
"Gregg-Herndon #2":                        	"20053", 	// 230	1
"H-Z #1 CABLE":                            	"20054U",	// 230	1
"H-Z #2 CABLE":                            	"20055U",	// 230	1
"Haas-McCall":                             	"20056", 	// 230	1
"HELM-MC CALL":                            	"20057", 	// 230	1
"Helms-Gregg #1":                          	"20058", 	// 230	1
"Helms-Gregg #2":                          	"20059", 	// 230	1
"Piedra Tap #1":                           	"20059A",	// 230	1
"Piedra Tap #2":                           	"20059B",	// 230	1
"Herndon-Ashlan":                          	"20060", 	// 230	1
"Figarden #1 230kv Tap (UG)":              	"20060A",	// 230	1
"Herndon-Kearney":                         	"20061", 	// 230	1
"HICKS-METCALF":                           	"20062", 	// 230	1
"IGNACIO-SOBRANTE":                        	"20063", 	// 230	1
"KELSO-TESLA":                             	"20064", 	// 230	1
"Ralph 230kv Tap":                         	"20064A",	// 230	1
"LAKEVILLE-IGNACIO #1":                    	"20065", 	// 230	1
"LAKEVILLE-IGNACIO #2":                    	"20066", 	// 230	1
"Lakeville-Sobrante #2":                   	"20067", 	// 230	1
"LAKEVILLE-TULUCAY":                       	"20068", 	// 230	1
"LAS POSITAS-NEWARK":                      	"20069", 	// 230	1
"LOCKEFORD-BELLOTA":                       	"20070", 	// 230	1
"LODI STIG-STAGG":                         	"20071", 	// 230	1
"LOGAN CREEK-VACA":                        	"20072", 	// 230	1
"LOS BANOS-DOS AMIGOS":                    	"20073", 	// 230	1
"LOS BANOS-PANOCHE #1":                    	"20074", 	// 230	1
"LOS BANOS-PANOCHE #2":                    	"20075", 	// 230	1
"Los Banos-San Luis PGP #1":               	"20076", 	// 230	1
"Los Banos-San Luis PGP #2":               	"20077", 	// 230	1
"Los Banos-Westley":                       	"20078", 	// 230	1
"MELONES-WILSON":                          	"20079", 	// 230	1
"Metcalf-Monta Vista #4":                  	"20080", 	// 230	1
"Metcalf-Moss Landing #1":                 	"20081", 	// 230	1
"Metcalf-Moss Landing #2":                 	"20082", 	// 230	1
"Metcalf-Newark #1":                       	"20083", 	// 230	1
"Metcalf-Newark #2":                       	"20084", 	// 230	1
"Middle Fork-Gold Hill":                   	"20085", 	// 230	1
"MIDWAY-KERN #1":                          	"20086", 	// 230	1
"BAKERSFIELD #1 230KV TAP":                	"20086A",	// 230	1
"STOCKDALE #1 230KV TAP":                  	"20086B",	// 230	1
"Midway-Kern #3":                          	"20088", 	// 230	1
"STOCKDALE #2 230KV TAP":                  	"20088A",	// 230	1
"Midway-Kern #4":                          	"20089", 	// 230	1
"BAKERSFIELD #2 230KV TAP":                	"20089A",	// 230	1
"Midway-Sunset":                           	"20090", 	// 230	1
"Midway-Wheeler Ridge #1":                 	"20091", 	// 230	1
"Buena Vista PP #1 230kv Tap":             	"20091A",	// 230	1
"Wheeler Ridge PP1 230kv Tap":             	"20091B",	// 230	1
"Wind Gap PP #1 230kv Tap":                	"20091C",	// 230	1
"Midway-Wheeler Ridge #2":                 	"20092", 	// 230	1
"Buena Vista PP #2 230kv Tap":             	"20092A",	// 230	1
"Wheeler Ridge PP2 230kv Tap":             	"20092B",	// 230	1
"Wind Gap PP #2 230kv Tap":                	"20092C",	// 230	1
"MONTA VISTA-HICKS":                       	"20093", 	// 230	1
"Monta Vista-Jefferson #1":                	"20094", 	// 230	1
"Monta Vista-Jefferson #2":                	"20095", 	// 230	1
"MONTA VISTA-SARATOGA":                    	"20096", 	// 230	1
"MORAGA-CASTRO VALLEY":                    	"20097", 	// 230	1
"Morro Bay-Diablo":                        	"20098", 	// 230	1
"Morro Bay-Gates #1":                      	"20099", 	// 230	1
"Morro Bay-Gates #2":                      	"20100", 	// 230	1
"Morro Bay-Mesa":                          	"20101", 	// 230	1
"Morro Bay-Midway #1":                     	"20102", 	// 230	1
"Morro Bay-Midway #2":                     	"20103", 	// 230	1
"Moss Landing Interplant 230":             	"20104", 	// 230	1
"MOSS LANDING-COBURN":                     	"20105", 	// 230	1
"Moss Landing-Panoche #2":                 	"20106", 	// 230	1
"Newark-San Mateo #1":                     	"20107", 	// 230	1
"PALERMO-COLGATE":                         	"20108", 	// 230	1
"PANOCHE-HELM":                            	"20109", 	// 230	1
"Panoche-Kearney":                         	"20110", 	// 230	1
"PIT #1-COTTONWOOD":                       	"20111", 	// 230	1
"Burney Forest Products 230kv Tap":        	"20111A",	// 230	1
"PIT #3-PIT #1":                           	"20112", 	// 230	1
"SPI (Burney) Tap":                        	"20112A",	// 230	1
"PIT #3-ROUND MTN":                        	"20113", 	// 230	1
"Pit #5-Round Mtn #1":                     	"20114", 	// 230	1
"Cove Road 230kv Tap":                     	"20114A",	// 230	1
"Pit #5-Round Mtn #2":                     	"20115", 	// 230	1
"BLACK 230KV TAP":                         	"20115A",	// 230	1
"PIT #4 230KV TAP":                        	"20115B",	// 230	1
"PIT #6 JCT-ROUND MTN":                    	"20116", 	// 230	1
"PIT #6 230KV TAP":                        	"20116A",	// 230	1
"PIT #7 230KV TAP":                        	"20116B",	// 230	1
"Pittsburg - San Mateo 230":               	"20117", 	// 230	1
"Rossmoor #1 230kv Tap":                   	"20117A",	// 230	1
"Pittsburg - Eastshore 230":               	"20118", 	// 230	1
"Rossmoor #2 230kv Tap":                   	"20118A",	// 230	1
"PITTSBURG-TASSAJARA":                     	"20119", 	// 230	1
"Pittsburg-Panoche (idle)":                	"20120", 	// 230	1
"PITTSBURG-SAN RAMON":                     	"20121", 	// 230	1
"Pittsburg-Sobrante #2":                   	"20122", 	// 230	1
"Pittsburg-Tesla #1":                      	"20123", 	// 230	1
"Pittsburg-Tesla #2":                      	"20124", 	// 230	1
"PITTSBURG-TIDEWATER":                     	"20125", 	// 230	1
"POE-RIO OSO":                             	"20126", 	// 230	1
"Rancho Seco-Bellota #1":                  	"20127", 	// 230	1
"Rancho Seco-Bellota #2":                  	"20128", 	// 230	1
"Camanche Pumping Plant Tap":              	"20128A",	// 230	0
"Rancho Seco-Stagg-Tesla":                 	"20129", 	// 230	1
"Ravenswood-San Mateo 230kv":              	"20130", 	// 230	1
"RIO OSO-ATLANTIC":                        	"20131", 	// 230	1
"RIO OSO-BRIGHTON":                        	"20132", 	// 230	1
"RIO OSO-GOLD HILL":                       	"20133", 	// 230	1
"RIO OSO-LOCKEFORD":                       	"20134", 	// 230	1
"ROCK CREEK-POE":                          	"20135", 	// 230	1
"Round Mountain-Cottonwood #2":            	"20136", 	// 230	1
"ROUND MTN-COTTONWOOD #3":                 	"20137", 	// 230	1
"San Mateo-Martin Cable":                  	"20138U",	// 230	1
"SAN RAMON-MORAGA":                        	"20139", 	// 230	1
"STAGG-TESLA":                             	"20141", 	// 230	1
"TABLE MTN-PALERMO":                       	"20142", 	// 230	1
"Table Mtn-Rio Oso #2":                    	"20143", 	// 230	1
"TESLA-ADCC":                              	"20144", 	// 230	1
"Tesla-Newark #1":                         	"20145", 	// 230	1
"TESLA-RAVENSWOOD":                        	"20146", 	// 230	1
"TESLA-TRACY #1":                          	"20147", 	// 230	1
"TESLA-TRACY #2":                          	"20148", 	// 230	1
"Tesla-Westley":                           	"20149", 	// 230	1
"TIDEWATER-SOBRANTE":                      	"20150", 	// 230	1
"TIGER CREEK-ELECTRA":                     	"20151", 	// 230	1
"TIGER CREEK-VALLEY SPRINGS":              	"20152", 	// 230	1
"TULUCAY-VACA":                            	"20153", 	// 230	1
"VACA-BAHIA":                              	"20154", 	// 230	1
"Vaca-Contra Costa #1":                    	"20155", 	// 230	1
"Peabody #1 230kv Tap":                    	"20155A",	// 230	1
"Vaca-Contra Costa #2":                    	"20156", 	// 230	1
"Peabody #2 230kv Tap":                    	"20156A",	// 230	1
"Vaca-Lakeville #1":                       	"20157", 	// 230	1
"VACA-PARKWAY":                            	"20158", 	// 230	1
"VALLEY SPRINGS-BELLOTA":                  	"20159", 	// 230	1
"WARNERVILLE-BORDEN":                      	"20160", 	// 230	1
"WEBER-TESLA":                             	"20161", 	// 230	1
"WILSON-GREGG":                            	"20162", 	// 230	1
"COLGATE-RIO OSO":                         	"20163", 	// 230	1
"MALACHA 230KV TAP":                       	"20164", 	// 230	1
"TASSAJARA-NEWARK":                        	"20165", 	// 230	1
"San Ramon Reseach Center Tap":            	"20165A",	// 230	1
"PARKWAY-MORAGA":                          	"20166", 	// 230	1
"SARATOGA-VASONA":                         	"20170", 	// 230	1
"VASONA-METCALF":                          	"20171", 	// 230	1
"MORRO BAY-TEMPLETON":                     	"20172", 	// 230	1
"Templeton-Gates":                         	"20173", 	// 230	1
"Metcalf-Monta Vista #3":                  	"20174", 	// 230	1
"Vaca Dixon - Moraga 230Kv (idle section)":	"20175", 	// 230	1
"Ravnwood - San Mateo #2":                 	"20176", 	// 230	1
"Newark-Ravenswood":                       	"20177", 	// 230	1
"Tesla-Newark #2":                         	"20179", 	// 230	1
"Lodi Stig Eight Mile Rd 230kv":           	"20180", 	// 230	1
"Eight Mile Rd Stagg 230kv":               	"20181", 	// 230	1
"Newark-Los Esteros 230 kv":               	"20186", 	// 230	1
"Los Esteros-Metcalf":                     	"20187", 	// 230	1
"Vaca Lambie Sw Sta":                      	"20188", 	// 230	1
"Lambie Sw Sta - Contra Costa 230":        	"20189", 	// 230	1
"Peabody - Contra Costa 230":              	"20190", 	// 230	1
"Vaca Peabody":                            	"20191", 	// 230	1
"Coyote SW ST-Metcalf 230":                	"20192", 	// 230	1
"Monta Vista-Coyote SW ST 230":            	"20193", 	// 230	1
"Vineyard - Newark 230":                   	"20196", 	// 230	1
"North Dublin-Vineyard":                   	"20197", 	// 230	1
"North Dublin - Cayetano":                 	"20198", 	// 230	1
"Contra Costa -Cayetano 230":              	"20199", 	// 230	1
"Gates-Midway 230kv":                      	"20200", 	// 230	1
"Warnerville-Wilson":                      	"20202", 	// 230	1
"Wilson Borden 230kv":                     	"20203", 	// 230	1
"Birds Landing Sw Sta-Contra Costa PP":    	"20204", 	// 230	1
"Peabody-Birds Landing Sw Sta":            	"20205", 	// 230	1
"High Winds-Birds Landing Sw Sta":         	"20206", 	// 230	1
"Birds Landing Sw Sta-Shiloh":             	"20207", 	// 230	1
"Pittsburg-Tesoro":                        	"20208", 	// 230	1
"Tesoro-Sobrante":                         	"20209", 	// 230	1
"FULTON-LAKEVILLE-IGNACIO":                	"20210", 	// 230	0
"Birds Landing Sw Sta Contra Costa Sub":   	"20212", 	// 230	1
"Lambie Sw Sta-Birds Landing Sw Sta":      	"20213", 	// 230	1
"Moss Lndg TX BK 1-230 SWYD":              	"20214", 	// 230	1
"Moss Lndg TX BK 2-230 SWYD":              	"20215", 	// 230	1
"Birds Landing Sw Sta - Russell":          	"20216", 	// 230	1
"Shiloh II Birds Landing Sw Sta":          	"20217", 	// 230	1
"Contra Costa-Lone Tree":                  	"20218", 	// 230	1
"Lone Tree-Cayetano":                      	"20219", 	// 230	1
"Cottonwood-Delevan #1 230KV":             	"20220", 	// 230	1
"Delevan-Cortina 230KV":                   	"20221", 	// 230	1
"Logan Creek-Delevan 230KV":               	"20222", 	// 230	1
"Delevan-Vaca #1 230KV":                   	"20223", 	// 230	1
"Delevan-Vaca #2 230KV":                   	"20225", 	// 230	1
"Glenn-Delevan 230KV":                     	"20226", 	// 230	1
"Delevan-Vaca #3 230KV":                   	"20227", 	// 230	1
"Carberry Sw Sta-Rnd Mtn 230 kv":          	"20228", 	// 230	1
"Pit#3 - Carberry Sw Sta 230 kv":          	"20229", 	// 230	1
"Russell City Energy Center-Eastshore #1": 	"20231", 	// 230	1
"Russell City Energy Center- Eastshore #2":	"20232", 	// 230	1
"Diablo Unit #1 Tie":                      	"50001", 	// 500	1
"Diablo Unit #2 Tie":                      	"50002", 	// 500	1
"Diablo-Gates #1":                         	"50003", 	// 500	1
"Diablo-Midway #2":                        	"50004", 	// 500	1
"Diablo-Midway #3":                        	"50005", 	// 500	1
"GATES-MIDWAY 500kv":                      	"50006", 	// 500	1
"LOS BANOS-GATES":                         	"50007", 	// 500	1
"Los Banos-Midway #2":                     	"50008", 	// 500	1
"Malin-RndMt2[Malin-IndSpr]":              	"50009A",	// 500	1
"Malin-RndMt2[IndSpr-RndMt]":              	"50009B",	// 500	1
"Midway-Whirlwind 500kV":                  	"50010", 	// 500	1
"Moss Landing-Los Banos":                  	"50011", 	// 500	1
"Moss Landing-Metcalf":                    	"50012", 	// 500	1
"Round Mt.-Table Mt. #1":                  	"50013", 	// 500	1
"Round Mt.-Table Mt. #2":                  	"50014", 	// 500	1
"Table Mountain-Tesla":                    	"50015", 	// 500	1
"Table Mountain-Vaca":                     	"50016", 	// 500	1
"Tesla-Los Banos #1":                      	"50017", 	// 500	1
"Tesla-Metcalf":                           	"50018", 	// 500	1
"Tesla-Tracy - 500kv":                     	"50019", 	// 500	1
"Tracy-Los Banos":                         	"50020", 	// 500	1
"Vaca-Tesla":                              	"50021", 	// 500	1
"ALMENDA JCT-NICOLAUS":                    	"60001", 	// 60 	0
"Harrington 60kv Tap":                     	"60002A",	// 60 	0
"ATLANTIC-DEL MAR":                        	"60003", 	// 60 	0
"Atlantic-NCPA":                           	"60004", 	// 60 	0
"Atlantic-Pleasant Grove":                 	"60005", 	// 60 	0
"Atlantic-Roseville":                      	"60006", 	// 60 	0
"Bair-Cooley Landing #1":                  	"60007", 	// 60 	0
"Bellhaven #1 60kv Tap":                   	"60007A",	// 60 	0
"Bair-Cooley Landing #2":                  	"60008", 	// 60 	0
"Bellhaven #2 60kv Tap":                   	"60008A",	// 60 	0
"Bridgeville-Garberville":                 	"60010", 	// 60 	0
"Fruitland 60kv Tap":                      	"60010A",	// 60 	0
"Fort Seward 60kv Tap":                    	"60010B",	// 60 	0
"Burns-Lone Star #1":                      	"60011", 	// 60 	0
"Lone Star Tap 60 KV":                     	"60011A",	// 60 	0
"Burns-Lone Star #2":                      	"60012", 	// 60 	0
"Crusher 60kv Tap":                        	"60012A",	// 60 	0
"Butte-Chico #1":                          	"60013", 	// 60 	0
"Butte-Chico #2":                          	"60014", 	// 60 	0
"BUTTE-ESQUON":                            	"60015", 	// 60 	0
"Esquon 60kv Tap":                         	"60015A",	// 60 	0
"CARIBOU #2":                              	"60016", 	// 60 	0
"Caribou-Plumas Jct":                      	"60017", 	// 60 	0
"Plumas Sierra 60kv Tap":                  	"60017A",	// 60 	0
"Caribou-Westwood":                        	"60018", 	// 60 	0
"CASCADE-BENTON-DESCHUTES":                	"60019", 	// 60 	0
"Wintu 60kv Tap":                          	"60019A",	// 60 	0
"CENTERVILLE-TABLE MTN":                   	"60021", 	// 60 	0
"Paradise #2 60kv Tap":                    	"60021A",	// 60 	0
"CENTERVILLE-TABLE MTN-OROVILLE":          	"60022", 	// 60 	0
"Paradise #1 60kv Tap":                    	"60022A",	// 60 	0
"Chester-Collins Pine":                    	"60023", 	// 60 	0
"Chico A-Dayton Road":                     	"60024", 	// 60 	0
"CHRISTIE-FRANKLIN #1":                    	"60025", 	// 60 	0
"Union Chemical 60kv Tap":                 	"60025A",	// 60 	0
"CHRISTIE-FRANKLIN #2":                    	"60026", 	// 60 	0
"SEQUOIA 60KV TAP":                        	"60026A",	// 60 	0
"CHRISTIE-WILLOW PASS":                    	"60027", 	// 60 	0
"Port Costa Brick 60kv Tap":               	"60027A",	// 60 	0
"Stauffer 60kv Tap":                       	"60027B",	// 60 	0
"Urich 60kv Tap":                          	"60027C",	// 60 	0
"CLEAR LAKE-EAGLE ROCK":                   	"60029", 	// 60 	0
"CLEAR LAKE-HOPLAND":                      	"60030", 	// 60 	0
"Coburn-Basic Energy":                     	"60031", 	// 60 	0
"Basic Vegetable 60kv Tap":                	"60031A",	// 60 	0
"Coburn-Oil Fields #1":                    	"60032", 	// 60 	0
"Texaco 60kv Tap":                         	"60032A",	// 60 	0
"Coburn-Oil Fields #2":                    	"60033", 	// 60 	0
"San Ardo 60kv Tap":                       	"60033A",	// 60 	0
"Coleman-Cottonwood":                      	"60034", 	// 60 	0
"COLEMAN-RED BLUFF":                       	"60035", 	// 60 	0
"COLEMAN-SOUTH":                           	"60036", 	// 60 	0
"Colgate PH-Colgate SW Sta":               	"60037", 	// 60 	0
"Colgate-Alleghany":                       	"60038", 	// 60 	0
"Colgate-Challenge":                       	"60039", 	// 60 	0
"Colgate-Grass Valley":                    	"60040", 	// 60 	0
"Colgate-Palermo":                         	"60041", 	// 60 	0
"Colgate-Smartville #1":                   	"60042", 	// 60 	0
"NARROWS #1 60KV TAP":                     	"60042A",	// 60 	0
"Colgate-Smartville #2":                   	"60043", 	// 60 	0
"NARROWS #2 60KV TAP":                     	"60043A",	// 60 	0
"SMARTVILLE 60KV TAP":                     	"60043B",	// 60 	0
"Collector Line For Wind Farms":           	"60044", 	// 60 	0
"Contra Costa-Du Pont":                    	"60045", 	// 60 	0
"Contra Costa-Pittsburg":                  	"60046", 	// 60 	0
"Contra Costa-Shell Chemical #1":          	"60047", 	// 60 	0
"Pittsburg #1 60kv Tap":                   	"60047A",	// 60 	0
"COOLEY LANDING-LOS ALTOS":                	"60048", 	// 60 	0
"Westinghouse 60kv Tap":                   	"60048A",	// 60 	0
"Cooley Landing-Stanford":                 	"60049", 	// 60 	0
"Menlo 60kv Tap":                          	"60049A",	// 60 	0
"CORTINA #1":                              	"60050", 	// 60 	0
"CORTINA #2":                              	"60051", 	// 60 	0
"Arbuckle 60kv Tap":                       	"60051A",	// 60 	0
"CORTINA #3":                              	"60052", 	// 60 	0
"Wadham 60kv Tap":                         	"60052A",	// 60 	0
"CORTINA #4":                              	"60053", 	// 60 	0
"COTTONWOOD #1":                           	"60054", 	// 60 	0
"COTTONWOOD #2":                           	"60055", 	// 60 	0
"Red Bank Tap":                            	"60055A",	// 60 	0
"Cottonwood-Benton #1":                    	"60056", 	// 60 	0
"Cottonwood-Benton #2":                    	"60057", 	// 60 	0
"COTTONWOOD-RED BLUFF":                    	"60058", 	// 60 	0
"Davis-Cordelia":                          	"60059", 	// 60 	0
"DAVIS-DIXON #1":                          	"60060", 	// 60 	0
"DAVIS-DIXON #2":                          	"60061", 	// 60 	0
"Deer Creek-Drum":                         	"60062", 	// 60 	0
"Del Monte-Monterey":                      	"60063", 	// 60 	0
"DEL MONTE-VIEJO":                         	"60064", 	// 60 	0
"Navy Lab 60kv Tap":                       	"60064A",	// 60 	0
"DESABLA-CENTERVILLE":                     	"60065", 	// 60 	0
"Oro Fino 60kv Tap":                       	"60065A",	// 60 	0
"Forks of the Butte":                      	"60065B",	// 60 	0
"DIXON-VACA #1":                           	"60066", 	// 60 	0
"Travis 60kv Tap":                         	"60066A",	// 60 	0
"DIXON-VACA #2":                           	"60067", 	// 60 	0
"Cache Slough 60kv Tap":                   	"60067A",	// 60 	0
"DELTA-MOUNTAIN GATE JCT":                 	"60068", 	// 60 	0
"LODI-INDUSTRIAL":                         	"60069", 	// 60 	0
"DRUM-GRASS VALLEY-WEIMAR":                	"60070", 	// 60 	0
"Cape Horn 60kv Tap":                      	"60070A",	// 60 	0
"Rollins 60kv Tap":                        	"60070B",	// 60 	0
"Drum-Spaulding":                          	"60071", 	// 60 	0
"East Quincy 60kv Tie":                    	"60072", 	// 60 	0
"Garcia 60kv Tap":                         	"60073A",	// 60 	0
"ESSEX JCT-ARCATA-FAIRHAVEN":              	"60074", 	// 60 	0
"BLUE LAKE 60KV TAP":                      	"60074A",	// 60 	0
"Blue Chip Milling 60kv Tap":              	"60074B",	// 60 	0
"ULTRA POWER 60KV TAP":                    	"60074C",	// 60 	0
"SIMPSON-CORBEL 60KV TAP":                 	"60074D",	// 60 	0
"Janes Creek 60kv Tap":                    	"60074E",	// 60 	0
"Essex Jct-Orick":                         	"60075", 	// 60 	0
"Trinidad 60kv Tap":                       	"60075A",	// 60 	0
"Eureka-Sta. A":                           	"60076", 	// 60 	0
"Evergreen-Los Gatos":                     	"60077", 	// 60 	0
"Senter #2 60kv Tap":                      	"60077A",	// 60 	0
"Evergreen-Mabury":                        	"60078", 	// 60 	0
"Senter #1 60kv Tap":                      	"60078A",	// 60 	0
"Jennings 60kv Tap":                       	"60078B",	// 60 	0
"FAIRHAVEN #1":                            	"60079", 	// 60 	0
"Louisiana Pac (RR) 60kv Tap":             	"60079A",	// 60 	0
"Simpson 60 kv Tap":                       	"60079B",	// 60 	0
"Fairhaven Power Co. 60kv Tap":            	"60079C",	// 60 	0
"FAIRHAVEN-HUMBOLDT":                      	"60080", 	// 60 	0
"French Meadows-Middle Fork":              	"60081", 	// 60 	0
"FULTON-CALISTOGA":                        	"60082", 	// 60 	0
"FULTON-HOPLAND":                          	"60083", 	// 60 	0
"Fitch Mountain #1 60kv Tap":              	"60083A",	// 60 	0
"Healdsburg #1 60kv Tap":                  	"60083B",	// 60 	0
"FULTON #1":                               	"60084", 	// 60 	0
"Fitch Mountain #2 60kv Tap":              	"60084A",	// 60 	0
"Healdsburg #2 60kv Tap":                  	"60084B",	// 60 	0
"FULTON-MOLINO-COTATI":                    	"60085", 	// 60 	0
"Washoe 60kv Tap":                         	"60085A",	// 60 	0
"Laguna Tap":                              	"60085B",	// 60 	0
"GLENN #1":                                	"60087", 	// 60 	0
"Elk Creek 60kv Tap":                      	"60087A",	// 60 	0
"GLENN #2":                                	"60088", 	// 60 	0
"GLENN #3":                                	"60089", 	// 60 	0
"Headgate 60kv Tap":                       	"60089A",	// 60 	0
"GOLD HILL #1":                            	"60090", 	// 60 	0
"Limestone 60kv Tap":                      	"60090A",	// 60 	0
"Gold Hill-Pleasant Grove":                	"60091", 	// 60 	0
"Green Valley-Watsonville":                	"60092", 	// 60 	0
"CIC Tap 60 kv":                           	"60092A",	// 60 	0
"Dean Foods Tap 60 kv":                    	"60092B",	// 60 	0
"GUALALA-MONTE RIO":                       	"60093", 	// 60 	0
"Salmon Creek 60kv Tap":                   	"60093A",	// 60 	0
"HALSEY-PLACER":                           	"60094", 	// 60 	0
"Mountain Quarries 60kv Tap":              	"60094A",	// 60 	0
"Auburn 60kv Tap":                         	"60094B",	// 60 	0
"Hamilton Branch-Chester":                 	"60095", 	// 60 	0
"COLLINS PINE 60KV TAP":                   	"60095A",	// 60 	0
"Hammer-Country Club (Mettler Tap)":       	"60096", 	// 60 	0
"Mosher 60kv Tap":                         	"60096A",	// 60 	0
"Hat Creek #1-Pit #1":                     	"60097", 	// 60 	0
"Hat Creek #1-Westwood":                   	"60098", 	// 60 	0
"PIT #1-HAT CREEK #2-BURNEY":              	"60099", 	// 60 	0
"Burney 60kv Tap":                         	"60099A",	// 60 	0
"HERDLYN-BALFOUR":                         	"60100", 	// 60 	0
"Westside 60kv Tap":                       	"60100A",	// 60 	0
"Middle River 60kv Tap":                   	"60100B",	// 60 	0
"Mc Donald 60kv Tap":                      	"60100C",	// 60 	0
"Marsh 60kv Tap":                          	"60100D",	// 60 	0
"Briones 60kv Tap":                        	"60100E",	// 60 	0
"Bixler 60kv Tap":                         	"60100F",	// 60 	0
"Hillsdale Jct-Half Moon Bay":             	"60101", 	// 60 	0
"Humboldt Bay-Eureka":                     	"60102", 	// 60 	0
"Humboldt Bay-Humboldt #1 60kv":           	"60103", 	// 60 	0
"Humboldt Bay-Humboldt #2":                	"60104", 	// 60 	0
"HUMBOLDT BAY-RIO DELL JCT":               	"60105", 	// 60 	0
"Eel River 60kv Tap":                      	"60105A",	// 60 	0
"HUMBOLDT-ARCATA-JANES CREEK":             	"60106", 	// 60 	0
"LP Flakeboard 60kv Tap":                  	"60106A",	// 60 	0
"Humboldt-Eureka":                         	"60107", 	// 60 	0
"Humboldt-Maple Creek":                    	"60108", 	// 60 	0
"IGNACIO-BOLINAS #1":                      	"60109", 	// 60 	0
"IGNACIO-ALTO":                            	"60110", 	// 60 	0
"IGNACIO-ALTO-SAUSALITO #1":               	"60111", 	// 60 	0
"IGNACIO-ALTO-SAUSALITO #2":               	"60112", 	// 60 	0
"IGNACIO-BOLINAS #2":                      	"60113", 	// 60 	0
"JEFFERSON-HILLSDALE JCT":                 	"60114", 	// 60 	0
"Watershed 60kv Tap":                      	"60114A",	// 60 	0
"Jefferson-Las Pulgas":                    	"60115", 	// 60 	0
"JEFFERSON-MARTIN":                        	"60116", 	// 230	1
"Crystal Springs 60kv Tap":                	"60116A",	// 60 	0
"Jefferson-Stanford":                      	"60117", 	// 60 	0
"SLAC 60KV Tap":                           	"60117A",	// 60 	0
"KASSON #1":                               	"60118", 	// 60 	0
"Carbona #1 60kv Tap":                     	"60118A",	// 60 	0
"Lyoth 60kv Tap":                          	"60118B",	// 60 	0
"Carbona #2 60kv Tap":                     	"60118C",	// 60 	0
"Banta Carbona 60kv Tap":                  	"60118D",	// 60 	0
"Kasson-Banta #1":                         	"60119", 	// 60 	0
"Kasson-Louise":                           	"60120", 	// 60 	0
"Calvo 60kv Tap":                          	"60120A",	// 60 	0
"KESWICK-CASCADE":                         	"60121", 	// 60 	0
"Keswick-Trinity-Weaverville":             	"60122", 	// 60 	0
"Kifer-Agnew Jct.":                        	"60123", 	// 60 	0
"Kilarc-Cedar Creek":                      	"60124", 	// 60 	0
"Clover Creek 60kv Tap":                   	"60124A",	// 60 	0
"Kilarc-Deschutes":                        	"60125", 	// 60 	0
"Kilarc-Volta 60kv Tie":                   	"60126", 	// 60 	0
"KING CITY-COBURN #1":                     	"60127", 	// 60 	0
"Jolon 60kv Tap":                          	"60127A",	// 60 	0
"KING CITY-COBURN #2":                     	"60128", 	// 60 	0
"Los Coches 60kv Tap":                     	"60128A",	// 60 	0
"LAKEVILLE #2":                            	"60129", 	// 60 	0
"Lakeville-Petaluma C":                    	"60130", 	// 60 	0
"LAKEVILLE #1":                            	"60131", 	// 60 	0
"LAS POSITAS-VASCO":                       	"60132", 	// 60 	0
"Laureles-Otter":                          	"60133", 	// 60 	0
"Laytonville-Covelo":                      	"60134", 	// 60 	0
"LINCOLN-PLEASANT GROVE":                  	"60135", 	// 60 	0
"Sierra Pacific Ind 60kv Tap":             	"60135A",	// 60 	0
"Rio Bravo(Rocklin) 60kv Tap":             	"60135C",	// 60 	0
"LIVERMORE-LAS POSITAS":                   	"60136", 	// 60 	0
"Lockeford-Industrial":                    	"60137", 	// 60 	0
"Lockeford-Lodi #1":                       	"60138", 	// 60 	0
"Lockeford-Lodi #2":                       	"60139", 	// 60 	0
"Industrial 60kv Tap":                     	"60139A",	// 60 	0
"Victor 60kv Tap":                         	"60139B",	// 60 	0
"Woodbridge 60kv Tap":                     	"60139C",	// 60 	0
"LOCKEFORD-LODI #3":                       	"60140", 	// 60 	0
"MANTECA #1":                              	"60141", 	// 60 	0
"Lee 60kv Tap":                            	"60141A",	// 60 	0
"MANTECA-LOUISE":                          	"60142", 	// 60 	0
"Gronemeyer 60kv Tap":                     	"60142A",	// 60 	0
"Manteca-Patterson":                       	"60144", 	// 60 	0
"Maple Creek-Hoopa":                       	"60145", 	// 60 	0
"MARTIN-MILLBRAE #2":                      	"60146", 	// 60 	0
"MENDOCINO-PHILO JCT-HOPLAND":             	"60148", 	// 60 	0
"Masonite 60kv Tap":                       	"60148A",	// 60 	0
"MENDOCINO #1":                            	"60149", 	// 60 	0
"Mendocino-Willits":                       	"60150", 	// 60 	0
"MENDOCINO-WILLITS-FORT BRAGG":            	"60151", 	// 60 	0
"WEIMAR #1":                               	"60152", 	// 60 	0
"Oxbow 60kv Tap":                          	"60152A",	// 60 	0
"MILLBRAE-PACIFICA":                       	"60153", 	// 60 	0
"San Andreas (CCSF) 60kv Tap":             	"60153A",	// 60 	0
"San Bruno 60kv Tap":                      	"60153B",	// 60 	0
"MILLBRAE-SAN MATEO #2":                   	"60154", 	// 60 	0
"Monta Vista-Burns":                       	"60156", 	// 60 	0
"MONTA VISTA-LOS ALTOS":                   	"60157", 	// 60 	0
"Monta Vista-Los Gatos":                   	"60158", 	// 60 	0
"Monta Vista-Permanente":                  	"60159", 	// 60 	0
"Permanente #1 60kv Tap":                  	"60159A",	// 60 	0
"Permanente #2 60kv Tap":                  	"60159B",	// 60 	0
"MONTE RIO-FULTON":                        	"60160", 	// 60 	0
"Wohler 60kv Tap":                         	"60160A",	// 60 	0
"MOUNTAIN GATE JCT-CASCADE":               	"60161", 	// 60 	0
"Mountain Gate 60kv Tap":                  	"60161A",	// 60 	0
"Newark-Decoto":                           	"60162", 	// 60 	0
"Decoto 60kv Tap":                         	"60162A",	// 60 	0
"Newark-Livermore":                        	"60163", 	// 60 	0
"NEWARK-VALLECITOS":                       	"60164", 	// 60 	0
"Nicolaus-Catlett":                        	"60165", 	// 60 	0
"Nicolaus-Marysville":                     	"60166", 	// 60 	0
"NICOLAUS-PLAINFIELD JCT":                 	"60167", 	// 60 	0
"District 1001 60kv Tap":                  	"60167A",	// 60 	0
"NICOLAUS-WILKINS SLOUGH":                 	"60168", 	// 60 	0
"District 1500 60kv Tap":                  	"60168A",	// 60 	0
"Tocaloma 60kv Tap":                       	"60169A",	// 60 	0
"Oil Fields-Salinas River":                	"60170", 	// 60 	0
"Oil Fields-Sargent Canyon":               	"60171", 	// 60 	0
"PALERMO-OROVILLE #1":                     	"60172", 	// 60 	0
"Pacific Oroville Power Tap":              	"60172A",	// 60 	0
"Louisiana Pacific (Oroville) Tap":        	"60172B",	// 60 	0
"PALERMO-OROVILLE #2":                     	"60173", 	// 60 	0
"Encinal 60kv Tap":                        	"60174A",	// 60 	0
"PEASE-HARTER":                            	"60175", 	// 60 	0
"Greenleaf #2 60kv Tap":                   	"60175A",	// 60 	0
"PEASE-MARYSVILLE-HARTER":                 	"60176", 	// 60 	0
"Yuba City Cogen 60kv Tap":                	"60176A",	// 60 	0
"PHILO JCT-FORT BRAGG":                    	"60177", 	// 60 	0
"Pit #1-McArthur":                         	"60178", 	// 60 	0
"BIG VALLEY LUMBER 60KV TAP":              	"60178A",	// 60 	0
"PLACER-DEL MAR":                          	"60179", 	// 60 	0
"Sierra Pines Limited 60kv":               	"60179A",	// 60 	0
"Potter Valley-Mendocino":                 	"60180", 	// 60 	0
"Potter Valley-Willits":                   	"60181", 	// 60 	0
"VINEYARD-LIVERMORE":                      	"60182", 	// 60 	0
"Kaiser 60kv Tap":                         	"60182A",	// 60 	0
"RADUM-VINEYARD":                          	"60183", 	// 60 	0
"RIO DELL JCT-BRIDGEVILLE":                	"60184", 	// 60 	0
"Rio Del 60kv Tap":                        	"60184A",	// 60 	0
"Pacific Lumber Co 60kv Tap":              	"60184B",	// 60 	0
"SALADO-NEWMAN #1":                        	"60185", 	// 60 	0
"Stanislaus Recovery 60kTap":              	"60185A",	// 60 	0
"Gustine #1 60kv Tap":                     	"60185B",	// 60 	0
"SALADO-NEWMAN #2":                        	"60186", 	// 60 	0
"Crows Landing 60kv Tap":                  	"60186A",	// 60 	0
"Gustine #2 60kv Tap":                     	"60186B",	// 60 	0
"SALINAS #1":                              	"60188", 	// 60 	0
"Manzanita 60kv Tap":                      	"60188A",	// 60 	0
"SALINAS-FIRESTONE #1":                    	"60189", 	// 60 	0
"Fresh Express 60kv Tap":                  	"60189A",	// 60 	0
"SALINAS-FIRESTONE #2":                    	"60190", 	// 60 	0
"Salinas-Lagunitas":                       	"60191", 	// 60 	0
"SALINAS-LAURELES":                        	"60192", 	// 60 	0
"San Mateo-Bair":                          	"60193", 	// 60 	0
"San Mateo-Hillsdale Jct":                 	"60194", 	// 60 	0
"SAN RAMON-RADUM":                         	"60195", 	// 60 	0
"Parks 60kv Tap":                          	"60195A",	// 60 	0
"SMARTVILLE-LINCOLN":                      	"60197", 	// 60 	0
"Beale A.F.B. #2 60kv Tap":                	"60197A",	// 60 	0
"Camp Far West 60kv Tap":                  	"60197B",	// 60 	0
"Smartville-Marysville":                   	"60198", 	// 60 	0
"Smartville-Nicolaus #1":                  	"60199", 	// 60 	0
"SMARTVILLE-NICOLAUS #2":                  	"60200", 	// 60 	0
"Beale A.F.B. #1 60kv Tap":                	"60200A",	// 60 	0
"SOLEDAD #1":                              	"60201", 	// 60 	0
"Gonzales #1 60kv Tap":                    	"60201A",	// 60 	0
"Chualar 60kv Tap":                        	"60201B",	// 60 	0
"SOLEDAD #2":                              	"60202", 	// 60 	0
"Gonzales #2 60kv Tap":                    	"60202A",	// 60 	0
"SOLEDAD #3":                              	"60203", 	// 60 	0
"SOLEDAD #4":                              	"60204", 	// 60 	0
"Spaulding #3-Spaulding #1":               	"60205", 	// 60 	0
"Spaulding-Summi(NERC)":                   	"60206", 	// 60 	1
"Cisco Grove Tap 60kv":                    	"60206A",	// 60 	0
"STAGG #1":                                	"60207", 	// 60 	0
"Terminous 60kv Tap":                      	"60207A",	// 60 	0
"Sebastiani 60kv Tap":                     	"60207B",	// 60 	0
"Stagg-Country Club #1":                   	"60208", 	// 60 	0
"Stagg-Country Club #2":                   	"60209", 	// 60 	0
"Stagg-Hammer":                            	"60210", 	// 60 	0
"STOCKTON A #1":                           	"60211", 	// 60 	0
"Newark-Sierra Paperbrd 60k":              	"60211A",	// 60 	0
"Pacific Ethanol 60kv":                    	"60211D",	// 60 	0
"STOCKTON A-WEBER #1":                     	"60212", 	// 60 	0
"STOCKTON A-WEBER #2":                     	"60213", 	// 60 	0
"Stockton Acres 60kv Tap":                 	"60213A",	// 60 	0
"STOCKTON A-WEBER #3":                     	"60214", 	// 60 	0
"Sumiden Wire Products 60kv":              	"60214A",	// 60 	0
"Oak Park 60kv Tap":                       	"60214B",	// 60 	0
"Stockton-Newark":                         	"60215", 	// 60 	0
"TRINITY #1":                              	"60216", 	// 60 	0
"Trinity-Maple Creek":                     	"60217", 	// 60 	0
"Hyampom 60kv Tap":                        	"60217A",	// 60 	0
"Tulucay-Napa #1":                         	"60218", 	// 60 	0
"Basalt #1 60kv Tap":                      	"60218A",	// 60 	0
"Cordelia #1 60kv Tap":                    	"60218B",	// 60 	0
"Cordelia Interim Pmps 60k T":             	"60218C",	// 60 	0
"Cordelia #2 60kv Tap":                    	"60218D",	// 60 	0
"Tulucay-Napa #2":                         	"60219", 	// 60 	0
"VACA-PLAINFIELD JCT":                     	"60220", 	// 60 	0
"Plainfield 60kv Tap":                     	"60220A",	// 60 	0
"VALLEY SPRINGS #1":                       	"60221", 	// 60 	0
"New Hogan 60kv Tap":                      	"60221A",	// 60 	0
"Valley Springs-Caleveras Cement":         	"60222", 	// 60 	0
"Valley Springs #2 60 kv":                 	"60223", 	// 60 	0
"Pardee #1 60kv Tap":                      	"60223A",	// 60 	0
"VALLEY SPRINGS-MARTEL #1":                	"60224", 	// 60 	0
"Amfor 60kv Tap":                          	"60224A",	// 60 	0
"VALLEY SPRINGS-MARTEL #2":                	"60225", 	// 60 	0
"Pardee #2 60kv Tap":                      	"60225A",	// 60 	0
"Ione Energy 60kv Tap":                    	"60225B",	// 60 	0
"Ione 60kv Tap":                           	"60225C",	// 60 	0
"VASCO-HERDLYN":                           	"60226", 	// 60 	0
"US Windpower 60kv Tap":                   	"60226A",	// 60 	0
"South Bay 60kv Tap":                      	"60226B",	// 60 	0
"Altamont Cogen 60kv Tap":                 	"60226C",	// 60 	0
"Viejo-Monterey":                          	"60227", 	// 60 	0
"VINEYARD-VALLECITOS":                     	"60228", 	// 60 	0
"Iuka 60kv Tap":                           	"60228A",	// 60 	0
"Volta-Deschutes":                         	"60229", 	// 60 	0
"Volta-South":                             	"60230", 	// 60 	0
"WATSONVILLE-SALINAS":                     	"60231", 	// 60 	0
"Granite Rock 60kv Tap":                   	"60231A",	// 60 	0
"Lagunitas 60kv Tap":                      	"60231B",	// 60 	0
"WEBER #1":                                	"60232", 	// 60 	0
"Robertson 60kv Tap A":                    	"60232A",	// 60 	0
"Robertson 60kv Tap B":                    	"60232B",	// 60 	0
"Cogeneration National 60kv":              	"60232C",	// 60 	0
"Rough & Ready 60kv Tap":                  	"60232D",	// 60 	0
"WEBER-MORMON JCT":                        	"60234", 	// 60 	0
"WEIMAR-HALSEY":                           	"60235", 	// 60 	0
"WEST POINT-VALLEY SPRINGS":               	"60236", 	// 60 	0
"PINE GROVE 60KV TAP":                     	"60236A",	// 60 	0
"Kekawaka 60 KV Tap":                      	"60237A",	// 60 	0
"Willits-Garberville (North/Eureka)":      	"60237n",	// 60 	0
"Willits-Garberville (South/Ukiah)":       	"60237s",	// 60 	0
"WILLOW PASS-CONTRA COSTA":                	"60238", 	// 60 	0
"Pittsburg #2 60kv Tap":                   	"60238A",	// 60 	0
"GWF #1 60KV TAP":                         	"60238B",	// 60 	0
"Wind Farms":                              	"60239", 	// 60 	0
"Zond Wind 60kv Tap":                      	"60239A",	// 60 	0
"COLUSA JCT #1":                           	"60241", 	// 60 	0
"DEL MONTE #1":                            	"60242", 	// 60 	0
"MIDDLE FORK #1":                          	"60243", 	// 60 	0
"ELK-GUALALA":                             	"60244", 	// 60 	0
"CONTRA COSTA-BALFOUR":                    	"60368", 	// 60 	0
"DEL MONTE #2":                            	"60375", 	// 60 	0
"SALINAS #2":                              	"60376", 	// 60 	0
"GLENN #4":                                	"60377", 	// 60 	0
"TABLE MTN-PEASE":                         	"60378", 	// 60 	0
"RADUM #1":                                	"60379", 	// 60 	0
"GLENN #5":                                	"60380", 	// 60 	0
"Atlantic-Pleasant Grove #2 60 kv":        	"60381", 	// 60 	0
"Coleman Co-gen Tap":                      	"60382", 	// 60 	0
"Lockeford #1 60kv":                       	"60383", 	// 60 	0
"Del Mar Atlantic #1":                     	"60385", 	// 60 	0
"Arcata-Humboldt":                         	"60386", 	// 60 	0
"Allison-Davis(idle) 60kv":                	"60387", 	// 60 	0
"Humboldt #1":                             	"60388", 	// 60 	0
"Fort Bragg-Elk":                          	"60389", 	// 60 	0
"Philo Junction-Elk":                      	"60390", 	// 60 	0
"Garberville-Laytonville":                 	"60393", 	// 60 	0
"Laytonville-Willits":                     	"60394", 	// 60 	0
"Jefferson #1 60kv":                       	"60395", 	// 60 	0
"Martin #1":                               	"60396", 	// 60 	0
"Del Mar Atlantic #2":                     	"60397", 	// 60 	0
"Almaden-Los Gatos":                       	"60401", 	// 60 	0
"Evergreen-Almaden":                       	"60402", 	// 60 	0
"Hartley-Clearlake 60kv":                  	"60405", 	// 60 	0
"Mendocino-Hartley 60kv":                  	"60406", 	// 60 	0
"Clearlake-Konocti 60kv":                  	"60418", 	// 11 	0
"Konocti-Eagle Rock 60kv":                 	"60419", 	// 11 	0
"Konocti-Middletown 60kv":                 	"60420", 	// 20 	0
"Arco-Carneras":                           	"70001", 	// 70 	0
"Arco-Cholame":                            	"70002", 	// 70 	0
"Berrenda A 70kv Tap":                     	"70002A",	// 70 	0
"Antelope 70kv Tap":                       	"70002B",	// 70 	0
"Berrenda C 70kv Tap":                     	"70002C",	// 70 	0
"Arco-Polonio Pass PP":                    	"70003", 	// 70 	0
"Lost Hills 70kv Tap":                     	"70003A",	// 70 	0
"Badger Hill 70kv Tap":                    	"70003B",	// 70 	0
"Las Perillas 70kv Tap":                   	"70003C",	// 70 	0
"Arco-Tulare Lake":                        	"70004", 	// 70 	0
"Las Perillas Tap":                        	"70004C",	// 70 	0
"Arco-Twissleman":                         	"70005", 	// 70 	0
"Texaco (Lost Hills) 70k Tap":             	"70005A",	// 70 	0
"CHEVRON (LOST HILLS) 70KTAP":             	"70005B",	// 70 	0
"Mobile2 (Lost Hills) 70kTap":             	"70005C",	// 70 	0
"Atascadero-Cayucos":                      	"70006", 	// 70 	0
"ATASCADERO-SAN LUIS OBISPO":              	"70007", 	// 70 	0
"Borden-Coppermine":                       	"70008", 	// 70 	0
"IKG 70kv Tap":                            	"70008A",	// 70 	0
"Yancy 70kv Tap":                          	"70008B",	// 70 	0
"River Rock 70kv tap":                     	"70008C",	// 70 	0
"Borden-Madera #1":                        	"70009", 	// 70 	0
"Borden-Madera #2":                        	"70010", 	// 70 	0
"Calif Ave-Kearney":                       	"70011", 	// 70 	0
"Carneras-McKittrick":                     	"70012", 	// 70 	0
"Celeron 70kv Tap":                        	"70012A",	// 70 	0
"KING ELLIS 70KV TAP":                     	"70012B",	// 70 	0
"Mobil South Belridgen":                   	"70012C",	// 70 	0
"PSE McKittrick":                          	"70012D",	// 70 	0
"CARUTHERS-KINGSBURG":                     	"70013", 	// 70 	0
"Cayucos-Cambria":                         	"70014", 	// 70 	0
"Coalinga #1-Coalinga #2":                 	"70015", 	// 70 	0
"Coalinga Cogen 70kv Tap":                 	"70015A",	// 70 	0
"Tornado 70kv Tap":                        	"70015B",	// 70 	0
"Derrick 70kv Tap":                        	"70015C",	// 70 	0
"Oil City 70kv Tap":                       	"70015D",	// 70 	0
"PENN ZIER 70KV TAP":                      	"70015E",	// 70 	0
"COALINGA #1-SAN MIGUEL":                  	"70016", 	// 70 	0
"COPPERMINE-TIVY VALLEY":                  	"70017", 	// 70 	0
"Corcoran-Angiola":                        	"70018", 	// 70 	0
"Boswell 70kv Tap":                        	"70018A",	// 70 	0
"DINUBA-OROSI":                            	"70019", 	// 70 	0
"Stone Corral 70kv Tap":                   	"70019A",	// 70 	0
"Divide-Vandenberg #1":                    	"70020", 	// 70 	0
"Divide-Vandenberg #2":                    	"70021", 	// 70 	0
"Divide-Zaca-Lompoc":                      	"70022", 	// 70 	0
"Exchequer-Mariposa":                      	"70023", 	// 70 	0
"Exchequer-Yosemite":                      	"70024", 	// 70 	0
"BRICEBURG JCT-MARIPOSA 70k":              	"70024A",	// 70 	0
"Friant-Coppermine":                       	"70025", 	// 70 	0
"Gates-Coalinga #1":                       	"70026", 	// 70 	0
"Gates-Coalinga #2":                       	"70027", 	// 70 	0
"Gates-Huron-Schindler":                   	"70028", 	// 70 	0
"Gates-Tulare Lake":                       	"70029", 	// 70 	0
"Kettleman Hills 70kv Tap":                	"70029A",	// 70 	0
"Avenal 70kv Tap":                         	"70029B",	// 70 	0
"Chevron Pipeline Kettleman 70kv Tap":     	"70029C",	// 70 	0
"GLASS-MADERA":                            	"70030", 	// 70 	0
"GUERNSEY-HENRIETTA":                      	"70031", 	// 70 	0
"Reserve Oil 70kv Tap":                    	"70031A",	// 70 	0
"Armstrong 70kv Tap":                      	"70031B",	// 70 	0
"GWF Hanford Cogen 70kv Tap":              	"70031C",	// 70 	0
"Haas-Woodchuck":                          	"70032", 	// 70 	0
"Helm-Kerman":                             	"70034", 	// 70 	0
"Fresno Co-Gen (Agrico) Tap":              	"70034A",	// 70 	0
"HELM-STROUD SW STA":                      	"70035", 	// 70 	0
"HELM-VALLEY NITROGEN":                    	"70036", 	// 70 	0
"Henrietta-Lemoore":                       	"70037", 	// 70 	0
"Leprino 70kv Tap":                        	"70037A",	// 70 	0
"HENRIETTA-LEMOORE NAS":                   	"70038", 	// 70 	0
"Henrietta-Tulare Lake":                   	"70039", 	// 70 	0
"HERDLYN-TRACY":                           	"70040", 	// 70 	0
"Kearney-Biola":                           	"70041", 	// 70 	0
"Kearney-Bowles":                          	"70042", 	// 70 	0
"KEARNEY-CARUTHERS":                       	"70043", 	// 70 	0
"Kearney-Kerman":                          	"70044", 	// 70 	0
"Kern Canyon-Magunden-Weedpatch":          	"70045", 	// 70 	0
"Kern-Fruitvale":                          	"70046", 	// 70 	0
"Kern-Kern Oil-Famoso":                    	"70047", 	// 70 	0
"Cawelo B 70kv Tap":                       	"70047A",	// 70 	0
"Cawelo B Tap":                            	"70047B",	// 70 	0
"KERN-MAGUNDEN":                           	"70048", 	// 70 	0
"Fruitvale 70kv Tap":                      	"70048A",	// 70 	0
"Eisen 70kv Tap":                          	"70048C",	// 70 	0
"KERN-OLD RIVER #1":                       	"70049", 	// 70 	0
"KERN-OLD RIVER #2":                       	"70050", 	// 70 	0
"Carnation 70kv Tap":                      	"70050A",	// 70 	0
"KINGSBURG-LEMOORE":                       	"70051", 	// 70 	0
"Hardwick 70kv Tap":                       	"70051A",	// 70 	0
"Livingston-Livingston Jct":               	"70052", 	// 70 	0
"LOS BANOS-CANAL-ORO LOMA":                	"70053", 	// 70 	0
"Wright 70kv Tap":                         	"70053A",	// 70 	0
"Arburua 70kv Tap":                        	"70053B",	// 70 	0
"LOS BANOS-LIVINGSTON JCT":                	"70054", 	// 70 	0
"Los Banos-O'neill PGP":                   	"70055", 	// 70 	0
"Los Banos-Pacheco":                       	"70056", 	// 70 	0
"Dinosaur Point 70kv Tap":                 	"70056A",	// 70 	0
"MARICOPA-OLD RIVER":                      	"70057", 	// 70 	0
"Gardner 70kv Tap":                        	"70057A",	// 70 	0
"Texaco Basic School 70k Tap":             	"70057B",	// 70 	0
"Pentland 70kv Tap":                       	"70057C",	// 70 	0
"MENDOTA-SAN JOAQUIN-HELM":                	"70058", 	// 70 	0
"Mendota Biomass 70kv Tap":                	"70058A",	// 70 	0
"Levis 70kv Tap":                          	"70058B",	// 70 	0
"Westlands 70kv Tap":                      	"70058C",	// 70 	0
"Wesix 70kv Tap":                          	"70058D",	// 70 	0
"Giffen 70kv Tap":                         	"70058E",	// 70 	0
"Pleasant Valley Pumps":                   	"70058F",	// 70 	0
"Merced Falls-Exchequer":                  	"70059", 	// 70 	0
"MC SWAIN 70KV TAP":                       	"70059A",	// 70 	0
"MERCED #1":                               	"70060", 	// 70 	0
"Bonita 70kv Tap":                         	"70060A",	// 70 	0
"El Peco 70kv Tap":                        	"70060B",	// 70 	0
"El Nido (SJVE) 70kv Tap":                 	"70060C",	// 70 	0
"Merced-Merced Falls":                     	"70061", 	// 70 	0
"Oro Loma-Canal #1":                       	"70062", 	// 70 	0
"Oro Loma-Mendota":                        	"70063", 	// 70 	0
"PG&E Tule-Springville":                   	"70064", 	// 70 	0
"Reedley-Dinuba #1":                       	"70065", 	// 70 	0
"Dinuba Energy 70kv Tap":                  	"70065A",	// 70 	0
"REEDLEY-OROSI":                           	"70066", 	// 70 	0
"Dunlap 70kv Tap":                         	"70066A",	// 70 	0
"Rio Bravo Hydro":                         	"70067", 	// 70 	0
"San Bernard-Tejon":                       	"70068", 	// 70 	0
"San Luis Obispo-Cayucos":                 	"70069", 	// 70 	0
"Mustang 70kv Tap":                        	"70069A",	// 70 	0
"San Luis Obispo-Santa Maria - 70kv":      	"70070", 	// 70 	0
"San Miguel-Atascadero":                   	"70071", 	// 70 	0
"Sanger-California Ave #1":                	"70072", 	// 70 	0
"Sanger-California Ave #2":                	"70073", 	// 70 	0
"Sanger-Reedley":                          	"70074", 	// 70 	0
"Sanger Cogen 70kv Tap":                   	"70074A",	// 70 	0
"Schindler-Coalinga #2":                   	"70075", 	// 70 	0
"SCHINDLER-HURON-GATES":                   	"70076", 	// 70 	0
"Semitropic-Famoso - 70kv":                	"70077", 	// 70 	0
"Mc Farland 70kv Tap":                     	"70077A",	// 70 	0
"STROUD SW STA-SCHINDLER":                 	"70078", 	// 70 	0
"STROUD SW STA-STROUD":                    	"70079", 	// 70 	0
"Valley Nitrogen Tap":                     	"70079A",	// 70 	0
"Taft-Cuyama #1":                          	"70080", 	// 70 	0
"Taft-Cuyama #2":                          	"70081", 	// 70 	0
"Taft-Elk Hills":                          	"70082", 	// 70 	0
"Texaco Buena Vista Hills":                	"70082A",	// 70 	0
"TAFT-MARICOPA":                           	"70083", 	// 70 	0
"Solar Tannehill 70kv Tap":                	"70083A",	// 70 	0
"Cadet 70kv Tap":                          	"70083B",	// 70 	0
"MOCO 70kv Tap":                           	"70083C",	// 70 	0
"University Cogen Tap":                    	"70083D",	// 70 	0
"Taft-Mc Kittrick":                        	"70084", 	// 70 	0
"Texaco Tap":                              	"70084A",	// 70 	0
"Tejon-Lebec":                             	"70085", 	// 70 	0
"Rose 70kv Tap":                           	"70085A",	// 70 	0
"Grapevine 70kv Tap":                      	"70085B",	// 70 	0
"Castaic 70kv Tap":                        	"70085C",	// 70 	0
"TIVY VALLEY-REEDLEY":                     	"70086", 	// 70 	0
"Weedpatch-San Bernard":                   	"70087", 	// 70 	0
"Stallion 70kv Tap":                       	"70087A",	// 70 	0
"Weedpatch-Wellfield":                     	"70088", 	// 70 	0
"Wheeler Ridge-Lakeview":                  	"70089", 	// 70 	0
"Emidio 70kv Tap":                         	"70089A",	// 70 	0
"Valpredo 70kv Tap":                       	"70089B",	// 70 	0
"Kelley 70kvTap":                          	"70089C",	// 70 	0
"Wheeler Ridge-San Bernard":               	"70090", 	// 70 	0
"Wheeler Ridge-Tejon":                     	"70091", 	// 70 	0
"Tecuya 70kv Tap":                         	"70091A",	// 70 	0
"Wheeler Ridge-Weedpatch":                 	"70092", 	// 70 	0
"Wishon-Coppermine":                       	"70093", 	// 70 	0
"Auberry 70kv Tap":                        	"70093A",	// 70 	0
"Wishon-San Joaquin #3":                   	"70094", 	// 70 	0
"Yanke (North Fork) 70kv Tap":             	"70094A",	// 70 	0
"GLASS-BIOLA":                             	"70095", 	// 70 	0
"Canandaiqua Winery 70kv":                 	"70095A",	// 70 	0
"CORCORAN-GUERNSEY":                       	"70096", 	// 70 	0
"Quebec Tap":                              	"70096A",	// 70 	0
"Kearny Tie":                              	"70097", 	// 70 	0
"Kearny Alternate Tie":                    	"70098", 	// 70 	0
"SAN MIGUEL-PASO ROBLES":                  	"70106", 	// 70 	0
"PASO ROBLES-TEMPLETON":                   	"70107", 	// 70 	0
"TEMPLETON-ATASCADERO":                    	"70108", 	// 70 	0
"Maricopa Copus 70kv":                     	"70114", 	// 70 	0
"Copus Old River 70kv":                    	"70115", 	// 70 	0
"Semitropic Wasco 70 kv":                  	"70116", 	// 70 	0
"Wasco Famoso 70 kv":                      	"70117", 	// 70 	0
"Los Altos Sub":                           	"71315", 	// 60 	0
"Temblor Tap 70kv":                        	"71526", 	// 70 	0
"Grimway Malaga 115kv":                    	"71594", 	// 115	0
"Bucks Grizzly Tap":                       	"COSC01",	// 115	0
"DWR Lines":                               	"DWR01", 	// 230	1
"Oroville-Thermalito-Table-Mountain #1":   	"DWR02", 	// 230	1
"Oroville-Thermalito-Table Mountain #2":   	"DWR03", 	// 230	1
"Oroville-Thermalito-Table Mountain #3":   	"DWR04", 	// 230	1
"Metcalf-Salinas #1-115 kv":               	"M10035",	// 115	0
"Metcalf-Salinas #2 115kv":                	"M20035",	// 115	0
"Calpine Delta Energy Center 230 KV":      	"PVT",   	// 230	0
"Standard Line #1 and #2":                 	"SL012"  	// 60 	0
};


/**
 * @description cleans up line names to have standard format
 * @param {String} str line name
 * @returns {String} sanitized line name
 */
function sanitizeLineName(str){
  str = str.trim();
  str = str.replace(/[#\(\)\.]/g, "");
  str = str.trim();
  str = str.replace(/[\s-]/g, '_');
  str = str.replace(/&/g, "_");
  str = str.replace(/'/g, "_");    
  str = str.replace(/_+/g, "_");
  str = str.toUpperCase();
  return str;
}

var sanitized = {};
for(var line_name in line_ids) {
  if(line_ids.hasOwnProperty(line_name)) {
    var line_id = line_ids[line_name];
    line_name = sanitizeLineName(line_name);
    sanitized[line_name] = line_id;
  }
}
line_ids = sanitized;


var trim_code_to_billing_code = {
  "BC": 		"BR", //	Br Rmv    
  "BCS":		"BX", //	Br Rmv+Trt
  "BT": 		"BT", //	Br Trim   
  "CON":		"TR", //	C.Assist  
  "F1A":		"A1", //	FP-Rmv1 A 
  "F1B":		"B1", //	FP-Rmv1 B 
  "F1C":		"C1", //	FS-R1A+Trt
  "F1D":		"D1", //	FS-R1B+Trt
  "F2A":		"A2", //	FP-Rmv2 A 
  "F2B":		"B2", //	FP-Rmv2 B 
  "F2C":		"C2", //	FS-R2A+Trt
  "F2D":		"D2", //	FS-R2B+Trt
  "F3A":		"A3", //	FP-Rmv3 A 
  "F3B":		"B3", //	FP-Rmv3 B 
  "F3C":		"C3", //	FS-R3A+Trt
  "F3D":		"D3", //	FS-R3B+Trt
  "F4A":		"A4", //	FP-Rmv4 A 
  "F4B":		"B4", //	sTrimCode
  "F4C":		"C4", //	FS-R4A+Trt
  "F4D":		"D4", //	FS-R4B+Trt
  "FAA":		"AA", //	FP-Trim A 
  "FAB":		"BA", //	FP-Trim B 
  "FBA":		"AB", //	FP-Major A
  "FBB":		"BB", //	FP-Major B
  "FOA":		"AO", //	FP-Ov A   
  "FOB":		"BO", //	FP-Ov B   
  "GRO":		"GO", //	TGR Only  
  "GSD":		"TG", //	TGR+SD    
  "GTD":		"TG", //	TGR+TD    
  "GTO":		"TG", //	TGR+Top   
  "HFH":		"TR", //	Final Ht  
  "OV": 		"TR", //	Overhang  
  "R1A":		"R1", //	Rmv 1-A   
  "R1B":		"R1", //	Rmv 1-B   
  "R1C":		"R1", //	Rmv1-A+Trt
  "R1D":		"R1", //	Rmv1-B+Trt
  "R2A":		"R2", //	Rmv 2-A   
  "R2B":		"R2", //	Rmv 2-B   
  "R2C":		"R2", //	Rmv2-A+Trt
  "R2D":		"R2", //	Rmv2-B+Trt
  "R3A":		"R3", //	Rmv 3-A   
  "R3B":		"R3", //	Rmv 3-B   
  "R3C":		"R3", //	Rmv3-A+Trt
  "R3D":		"R3", //	Rmv3-B+Trt
  "R4A":		"TM", //	Rmv 4-A   
  "R4B":		"TM", //	Rmv 4-B   
  "R4C":		"TM", //	Rmv4-A+Trt
  "R4D":		"TM", //	Rmv4-B+Trt
  "SD": 		"TR", //	Side      
  "SEC":		"TR", //	Sec Strain
  "SL": 		"TR", //	Slope     
  "SWC":		"WC", //	S-Wrap Clb
  "SWL":		"WL", //	S-Wrap Lft
  "TD": 		"TR", //	TopDirecti
  "TO": 		"TR", //	Top       
  "TRT":		"NW", //	ReTreat   
};

module.exports = {
  trim_codes: trim_codes, 
  circuit_numbers: circuit_numbers,
  division_codes: division_codes, 
  priority_codes: priority_codes, 
  tree_record_status: tree_record_status,
  notification_codes: notification_codes,
  alert_codes: alert_codes,
  company_codes: company_codes,
  tree_types: tree_types,
  city_codes: city_codes,
  county_codes: county_codes,
  account_types: account_types,
  tag_types: tag_types,
  location_status: location_status,
  transmison_circuit_codes: transmison_circuit_codes,
  crew_type: crew_type,
  work_type: work_type,
  restriction_codes: restriction_codes, 
  line_ids: line_ids,
  work_categories: work_categories,
  trim_code_to_billing_code: trim_code_to_billing_code
};
