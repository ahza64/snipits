#VMD Export



## Object Hiearchy:
```
----------------
<TreeWorkPacket>					Work Packet of locations to be inspected
	<TreeLoc>...					Inspected Locations(s)
		<TreeLoc_GPS>				GPS coordinates of location
		<TreeLocAlerts>				Alerts for location
		<TreeLocRestrictions>		Restrictions for location
		<TreeLocContacts>			Customer Contact Records
		<TreeLocFile>				File specific to location (JPG, etc)
		<TreeRecs>...				Inspected Tree(s)
			<TreeRecs_GPS>			GPS coordinates of tree
			<TreeRecsAlerts>		Alerts for specfic tree
			<TreeRecsRestrictions>	Restrictions for specific tree
			<TreeRecsFile>			File specific to tree (JPG, etc)


<WRTrees>							Work Request info
	<WRTreeLoc>						Inspected Locations(s)
		<WRTreeLocAlerts>			Alerts for location
		<WRTreeLocContacts>			Customer Contact Records
		<WRTreeRecs>				Inspected Tree(s)
			<WRTreeRecsAlerts>		Alerts for specfic tree


<TreeWorkComp>						Work Compelete 
	<TreeWorkCompFile>				File of completed work (JPG, etc)

```

## FileSturcture
```
.
├─src-doc 	            # VMD Spec
├─templates  			# XSD Templates 
├─work_packet   		# WorkPacket Generation
│ ├─work_packet.js      # Class for xml generation of WorkPacket
│ ├─tree_location.js	# Class for xml generation of TreeLoc
│ ├─tree_record.js      # Class for xml generation of TreeRecs
│ ├─restricitons.js
│ ├─alert.js
│ ├─file.js
│ ├─customer_contact.js
│ └─test				# unit test for all work packet structures 
│   ├─test_location.js
│   ├─test_packet.js
│   ├─test_record.js 
│	└─data				# test data
├─xsdgen.js				# generates XSD docuamets from src-doc documents
└─xsd					# auto generated XSD documents 
```


## Transfrom 
### WorkPacket

```

	var WorkPacket = require("./workpacket/work_packet");
	var TreeLocation = require("./workpacket/tree_location");
	var TreeRecord = require("./workpacket/tree_record");
	
	var workorders = WorkOrder.find({tree_query});
	var packet = new WorkPacket();
	workorders.forEach(wo => {
		var location = new TreeLocation();
		wo.trees.forEach(tree = > {
			var inspector = tree.getPI();
			var line = tree.getCircuit();
			var pmd = tree.getProject();
			var image = tree.getImage();
			var record = new TreeRecord(tree, inspector, line, pmd, image);
			location.addTree(record);
		});
		packet.addLocation(location);		
	});
		

```



## TODO

- [x] Finish: TreeLocAlerts & TreeRecsAlerts
- [x] Finish: TreeLocFile & TreeRecsFile
- [x] Test:   TreeLocRestrictions & TreeRecsRestrictions
- [x] Document workpacket transform Classes
- [ ] Testing with more than one tree in a location
 - [ ] Throw errors if inspected by diffrent people
 - [ ] Throw errors if trees are have different locations
 - [ ] ExternalLocID - static workorder, is it okay to have have the same ExternalLocID in locations from different packets?
- [ ] Checks to makesure all required values exist in exports
- [ ] Extract layer 
 - [ ] pull trees from the database 
 - [ ] trees that have been inspected (ready or no_trim)
 - [ ] trees that have not been exproted before  
 - [ ] Inspected in a given date range
- [ ] Migrations
- [ ] Need to get data from public fire soruces SRA

## Data migratons
- [x] Publish all deliveries on ArcServer
- [x] Put new backup of trans database onto prod meteor
- [x] Export Field (sarvar)
- [x] Address (tejas)
- [x] User Companies (tejas)
- [x] Project (pmd_num) should be integers (xuchang)
- [x] Bad pmd_num in trees (rahul)
- [x] SpanNames (rahul)
- [x] PMD (Trees) (rahul)
- [ ] Lines need LineNumbers, voltage, and type(dist/trans) 
- [ ] Division (Trees) (rahul)
- [ ] Region (Trees) (rahul)
- [ ] GPS aquasition date. (from GIS data)

## Other issues and things to check
- [ ] Missing trimcodes on inspected trees
- [x] All database trim codes in database will map to a trimcode in pge_vmd_codes.js (tejas)
- [ ] Warnings when states are inconsistant (i.e. READY BUT MISSING NTW )
- [x] All projects are integers
- [ ] All lines map to a line in pge_vmd_codes.js
- [ ] GPS date needs date GPS was captured f (minor)

## Final Steps
- [ ] Make sure all data is migrated in production.
- [ ] Generate Workorders in production.
- [ ] Check against XSD schema




## Questions (Mike Morely)
- [x] Can I use the P (phone) notification for our "notify customer" flag
 - NO, we'll use a "notify first" alert
- [x] What is BMP?
 - “Best Management Practice” – Which refers to a published procedure that the CUF must follow.) 
- [x] What is the "Nest BMP" alert (I was thinking I could map our "raptor nest" flag to this)  
 - It indicates a next is in the tree.  Josh, can you clarify when users would select “Nest BMP” vs. “Eagle” restriction?  It seems like a raptor issue should map to an Eagle restriction AND a Nest BMP alert.
- [x] What is the "Environmental BMP" alert (Our system has an "other" environmental flag I was thinking of mapping to this?) 
 - Seems appropriate to me, but Josh should weigh in.
- [x] If a tree is ready can it still have restrictions on it?  I.e. it is in a riparian zone but has been okayed to work? 
 - No.  The record cannot be OK to work if there are any restrictions.   When the restriction is removed, then a corresponding alert code is added to the record (RA – Riparian Area) and the sNotification is changed to O.    This way the tree crews are alerted to the fact that it’s in a riparian area and they need to follow certain procedures.
- [x] bTreeRecsRestriction notes says "IF related sLT value is L, then 0, else 1"  On restrictions that the LT value is (B)oth should it be 1 or should it be 1 if it is in a TreeRec?  
 - I’m not 100% certain how the developer used this, so for now let’s go with using a value of 1 only if it is being used in a tree record restriction.   If it’s being used with a location restriction, use 0.
- [x] If a two trees were at the same address but inspected by different people should multiple Locations and WorkPackets get created?  
 - I would say yes.
- [x] Does the work packet Assigned user have to be the same as the inspect users of threes and locations?
 - Yes implied by previous answer
 
 
## Moving forward
- [ ] Are all trees being correctly added to workorders.



