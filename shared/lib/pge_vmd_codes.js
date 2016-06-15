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

var inspection_companies = {
  "ACRT":                   "ACR",	       
  "Brenton VMS":            "BVM",	       
  "Davey Tree":             "DAV",	       
  "High Country Forestry":  "HCF",	       
  "Martinez Utility":       "MAR",	       
  "Nelson Tree":            "NEL",	       
  "Newcomb Tree Svc":       "NTS",	       
  "P.G.& E.":               "PGE",	       
  "Provco":                 "PRO",	       
  "Craig Thurber":          "THU",	       
  "Total Quality Mgmt":     "TQM",	       
  "Trees Inc.":             "TRI",	       
  "Utility Tree Service":   "UTS",	       
  "Western ECI":            "WEC",	       
  "Wright Tree":            "WRT"
};

var tree_types = {
  "Acacia":              "ACA ",	
  "Blackwood Acacia":    "ACAB",	
  "Ailanthus":           "AILA",	
  "Albizzia":            "ALBI",	
  "Alder":               "ALD ",	
  "Alder - White":       "ALDE",	
  "Alder - Red":         "ALDR",	
  "Almond":              "ALMO",	
  "Apple":               "APPL",	
  "Arundo":              "ARUN",	
  "Ash":                 "ASH ",	
  "Evergreen Ash":       "ASHE",	
  "Modesto Ash":         "ASHM",	
  "Raywood Ash":         "ASHR",	
  "Athel":               "ATHE",	
  "Australian Willow":   "AUSW",	
  "Avocado":             "AVOC",	
  "Bamboo":              "BAMB",	
  "Bay, Calif.":         "BAY ",	
  "Beech":               "BEEC",	
  "Birch":               "BIRC",	
  "Bottlebrush":         "BOTT",	
  "Brisbane Box":        "BRIS",	
  "Brush (misc)":        "BRUS",	
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
  "Elm":                 "ELM ",	
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
  "Fig":                 "FIG ",	
  "Fir, True":           "FIR ",	
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
  "Liq Ambar (Sw Gum)":  "LIQ ",	
  "Honey Locust":        "LOCH",	
  "Locust, Black":       "LOCU",	
  "Loquat":              "LOQ ",	
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
  "Oak":                 "OAK ",	
  "Coast Live Oak":      "OAKC",	
  "Blue Oak":            "OAKD",	
  "Blue oak":            "OAKD",	  
  "English Oak":         "OAKE",	
  "Oregon White Oak":    "OAKG",	
  "Holly Oak":           "OAKH",	
  "Interior Live Oak":   "OAKI",	
  "Black Oak":           "OAKK",	
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
  "Tamarisk":            "TAM ",	
  "Tan Oak":             "TAN ",	
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

module.exports = {
  trim_codes: trim_codes, 
  division_codes: division_codes, 
  priority_codes: priority_codes, 
  tree_record_status: tree_record_status,
  notification_codes: notification_codes,
  alert_codes: alert_codes,
  inspection_companies: inspection_companies,
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
  line_ids: line_ids
};
