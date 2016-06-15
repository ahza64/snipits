/**
 * @fileoverview JPGFile: This creates a FILE subdocument for JPG files
 */
var _ = require("underscore");


var FILE = {              //<TreeLocFile> or <TreeRecsFile> 	  Note that <TreeLocFile> section can be repeated for multiple files
                          //	<iTreeLocID>    int			          *File will be associated with this location
  sFileName: null,        //  <sFileName>     varchar(100)		  *Should conform to windows file naming standards - 
                          //                                    no special chars such as ? , etc...
  sFile: null,            //  <sFile>         BLOB data stream	*No data limit
};                        //</TreeLocFile> or </TreeRecsFile>


/**
 * 
 * @description JPGFile constructor
 * @param {Object} jpg_asset Dispatchr jpg asset from database
 */
var JPGFile = function(jpg_asset) {
  this.file = _.extend({}, FILE);
  this.file.sFileName = jpg_asset._id+".jpg";
  this.file.sFile = jpg_asset.data;
};

JPGFile.prototype.getData = function() {
  return this.file;
};

module.exports = JPGFile;