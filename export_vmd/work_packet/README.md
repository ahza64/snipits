## Members

<dl>
<dt><a href="#_">_</a></dt>
<dd><p>JPGFile: This creates a FILE subdocument for JPG files</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#Alert">Alert(type, alert_code, user, date)</a></dt>
<dd><p>Constructor for Alert</p>
</dd>
<dt><a href="#JPGFile">JPGFile(jpg_asset)</a></dt>
<dd><p>JPGFile constructor</p>
</dd>
<dt><a href="#Restriction">Restriction(type, restrict_code, user, date)</a></dt>
<dd><p>Constructor for restriction</p>
</dd>
<dt><a href="#TreeLocation">TreeLocation()</a></dt>
<dd><p>TreeLocation consturctor - Tree locations group trees.  Each tree will have the same address and customer info.</p>
</dd>
<dt><a href="#TreeRecord">TreeRecord(tree, inspector, line, pmd)</a></dt>
<dd><p>Tree Record Constructor</p>
</dd>
<dt><a href="#WorkPacket">WorkPacket(test_email)</a></dt>
<dd><p>WorkPacket constructuor</p>
</dd>
</dl>

<a name="_"></a>

## _
JPGFile: This creates a FILE subdocument for JPG files

**Kind**: global variable  
<a name="Alert"></a>

## Alert(type, alert_code, user, date)
Constructor for Alert

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>String</code> | type of allert (tree or location) |
| alert_code | <code>String</code> | alert code that can be mapped in pge_vmd_codes |
| user | <code>String</code> | User string |
| date | <code>String</code> | inspection date (or date restriction was added) |

<a name="JPGFile"></a>

## JPGFile(jpg_asset)
JPGFile constructor

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| jpg_asset | <code>Object</code> | Dispatchr jpg asset from database |

<a name="Restriction"></a>

## Restriction(type, restrict_code, user, date)
Constructor for restriction

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>String</code> | type of restriction (tree or location) |
| restrict_code | <code>String</code> | restrictions code that can be mapped in pge_vmd_codes |
| user | <code>String</code> | User string |
| date | <code>String</code> | inspection date (or date restriction was added) |

<a name="Restriction.createTreeRestricitons"></a>

### Restriction.createTreeRestricitons(tree)
create a tree restrictions

**Kind**: static method of <code>[Restriction](#Restriction)</code>  

| Param | Type | Description |
| --- | --- | --- |
| tree | <code>Object</code> | tree to inspect and add restrictions too |

<a name="TreeLocation"></a>

## TreeLocation()
TreeLocation consturctor - Tree locations group trees.  Each tree will have the same address and customer info.

**Kind**: global function  

* [TreeLocation()](#TreeLocation)
    * [.toXML()](#TreeLocation+toXML) ⇒ <code>String</code>
    * [.addTree(tree)](#TreeLocation+addTree)

<a name="TreeLocation+toXML"></a>

### treeLocation.toXML() ⇒ <code>String</code>
toXML

**Kind**: instance method of <code>[TreeLocation](#TreeLocation)</code>  
**Returns**: <code>String</code> - xml string  
<a name="TreeLocation+addTree"></a>

### treeLocation.addTree(tree)
add a TreeRecord to this location

**Kind**: instance method of <code>[TreeLocation](#TreeLocation)</code>  

| Param | Type | Description |
| --- | --- | --- |
| tree | <code>[TreeRecord](#TreeRecord)</code> | the tree record to add to this location |

<a name="TreeRecord"></a>

## TreeRecord(tree, inspector, line, pmd)
Tree Record Constructor

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| tree | <code>Object</code> | tree resoruce from mongo db |
| inspector | <code>Object</code> | inspector user object (cuf) |
| line | <code>Object</code> | grid/circuit/line object |
| pmd | <code>Object</code> | PMD project object |

<a name="WorkPacket"></a>

## WorkPacket(test_email)
WorkPacket constructuor

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| test_email | <code>String</code> | An optional email address to add for exports to the test system. |


* [WorkPacket(test_email)](#WorkPacket)
    * [.addLocation(location)](#WorkPacket+addLocation)
    * [.toXML()](#WorkPacket+toXML) ⇒ <code>String</code>

<a name="WorkPacket+addLocation"></a>

### workPacket.addLocation(location)
add a TreeLocation object to this WorkPacket

**Kind**: instance method of <code>[WorkPacket](#WorkPacket)</code>  

| Param | Type | Description |
| --- | --- | --- |
| location | <code>[TreeLocation](#TreeLocation)</code> | A TreeLocation to add to this work packet |

<a name="WorkPacket+toXML"></a>

### workPacket.toXML() ⇒ <code>String</code>
toXML

**Kind**: instance method of <code>[WorkPacket](#WorkPacket)</code>  
**Returns**: <code>String</code> - xml string  
