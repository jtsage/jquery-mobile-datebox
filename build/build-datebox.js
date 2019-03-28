const config    = require( "../package.json" ),
	fs          = require( "fs" ),
	m           = require( "module" ),
	UglifyJS    = require( "uglify-js" ),
	pretty      = require( "js-object-pretty-print" ).pretty,
	vm          = require( "vm" ),
	glob        = require( "glob" ),

	dontBundle  = [ "jqm" ];

var frameName, inCode, outCodeFull, outCodeMin, outCodeObj,
	today = new Date(),
	externalLibsJS = "",
	dbModeLibsJS = "",
	buildFiles = [],
	buildMode = ( typeof process.argv[2] !== "undefined" ) ? process.argv[2] : "latest",

	outFolder = "dist/" + (( buildMode === "latest" ) ? "latest" : config.version) + "/",
	outFileNameBegin = "jtsage-datebox" + (( buildMode === "latest" ) ? "" : "-" + config.version ),

	baseObjectJS = fs.readFileSync("src/js/baseObject.js"),
	externalLibs = glob.sync("src/js/external/*.js"),
	frameWorks   = glob.sync("src/js/framework/*.js"),
	modes        = glob.sync("src/js/modes/*.js"),
	internalLibs = glob.sync("src/js/lib/*.js"),

	preamble = {
		long : function ( framework ) {
			return [
				"/*",
				" * JTSage-DateBox-" + config.version + " (" + framework + ")",
				" * For: " + JSON.stringify( config.supports ),
				" * Date: " + today.toISOString(),
				" * http://dev.jtsage.com/DateBox/",
				" * https://github.com/jtsage/jquery-mobile-datebox",
				" *",
				" * Copyright 2010, " + today.getFullYear() + " JTSage. and other contributors",
				" * Released under the MIT license.",
				" * https://github.com/jtsage/jtsage-datebox/blob/master/LICENSE.txt",
				" *",
				" */",
				"" ]
				.join( "\n");
		},
		short : function ( framework ) {
			return [
				"/* JTSage-DateBox-" + config.version + " (" + framework + ")",
				today.toISOString(),
				"(c) 2010," + today.getFullYear() + " JTSage",
				"https://github.com/jtsage/jtsage-datebox/blob/master/LICENSE.txt */\n" ]
				.join( " | " );
		},
		binding : "\n\n(function( $ ) { " +
			"$(document).ready( function() { " +
			"$( \"[data-role='datebox']\" ).each( function() { " +
			"$( this ).datebox(); " +
			" }); }); })( jQuery );\n"
	};

fs.mkdirSync( outFolder , { recursive : true } );

for ( var i = 0, len = externalLibs.length; i < len; i++ ) {
	externalLibsJS += fs.readFileSync( externalLibs[i] );
}

for ( i = 0, len = internalLibs.length; i < len; i++ ) {
	dbModeLibsJS += fs.readFileSync( internalLibs[i] );
}

for ( i = 0, len = modes.length; i < len; i++ ) {
	dbModeLibsJS += fs.readFileSync( modes[i] );
}

frameWorks.forEach( function( thisFramework ) {
	frameName = thisFramework.split( "/" ).pop().split( "." )[ 0 ];
	console.log(frameName);

	buildFiles.push( {
		name           : frameName,
		outName        : outFileNameBegin + "." + frameName,
		outputFileName : outFolder + outFileNameBegin + "." + frameName + ".js",
		outputMinName  : outFolder + outFileNameBegin + "." + frameName + ".min.js",
		outputMapName  : outFolder + outFileNameBegin + "." + frameName + ".min.js.map",
		inputJS        :
			baseObjectJS +
			fs.readFileSync( thisFramework ) +
			dbModeLibsJS +
			"\n\nmodule.exports.JTSageDateBox = JTSageDateBox;\n\n"
	} );
} );

buildFiles.forEach( function( fileObj ) {

	vm.runInThisContext(
		m.wrap( fileObj.inputJS )
	)( exports, require, module, __filename, __dirname );

	inCode = "" +
		"(function( $ ) { $.widget( \"jtsage.datebox\"," +
		pretty( module.exports.JTSageDateBox, 4, "PRINT", true ) +
		" ); })( jQuery );" + preamble.binding;

	outCodeObj = UglifyJS.minify( inCode, {
		mangle   : false,
		compress : false,
		output   : {
			beautify : true
		}
	} );

	outCodeFull = "" +
		preamble.long( fileObj.name ) +
		"\n\n" +
		( ( dontBundle.includes( fileObj.name ) ) ? "" : externalLibsJS ) +
		"\n\n" +
		outCodeObj.code;

	outCodeMin = UglifyJS.minify( outCodeFull, {
		mangle   : true,
		compress : true,
		output   : {
			beautify : false,
			preamble : preamble.short( fileObj.name )
		},
		sourceMap : {
			filename : fileObj.outName + ".js",
			url      : fileObj.outName + ".min.js.map",
		}
	} );

	fs.writeFileSync( fileObj.outputFileName, outCodeFull );
	fs.writeFileSync( fileObj.outputMinName,  outCodeMin.code );
	fs.writeFileSync( fileObj.outputMapName,  outCodeMin.map );

	console.log( fileObj.outputFileName + " written." );
} );



