#VMD Export



### Object Hiearchy:
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

### FileSturcture
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

### TODO


* Finish: TreeLocAlerts & TreeRecsAlerts
* Finish: TreeLocFile & TreeRecsFile
* Test:   TreeLocRestrictions & TreeRecsRestrictions
* Testing with more than one tree in a location
* Checks to makesure all required values exist in exports
* Extract layer 
 * pull trees from the database 
 * trees that have been inspected
 * trees that have not been exproted before 
* Migrations


## Data migratons
* Export Field
* Address 
* Division
* SpanNames
* LineNumbers
* User Companyies
* Project (pmd_num) should be integers
* Lines need voltage, division, and type(dist/trans)

