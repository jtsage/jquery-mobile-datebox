/* JTSage-DateBox 
 *
 * Bootstrap option overrides and 
 * basic input/output functions
 */

mergeOpts({
	theme: {
		clearBtnCls : "outline-secondary",
		clearBtnIcn : "eraser",

		closeBtnCls : "outline-secondary",
		closeBtnIcn : "check",

		cancelBtnCls : "outline-secondary",
		cancelBtnIcn : "times",

		tomorrowBtnCls : "outline-secondary",
		tomorrowBtnIcn : "fast-forward",

		todayBtnCls : "outline-secondary",
		todayBtnIcn : "step-forward",

		dropdownContainer : "bg-light border border-dark mt-1",
		modalContainer : "bg-light border border-dark m-4",
		inlineContainer : "bg-light border border-dark my-2",

		headerTheme : "bg-dark",
		headerBtnCls : "outline-secondary",
		headerBtnIcn : "times",

		cal_Today : "outline-info",
		cal_DayHigh : "outline-warning",
		cal_Selected : "outline-info",
		cal_DateHigh : "outline-warning",
		cal_DateHighAlt : "outline-danger",
		cal_DateHighRec : "outline-warning",
		cal_Default : "outline-primary",
		cal_OutOfBounds : "outline-secondary",

		cal_NextBtnIcn : "plus",
		cal_NextBtnCls : "outline-dark",
		cal_PrevBtnIcn : "minus",
		cal_PrevBtnCls : "outline-dark",

		backgroundMask : {
			position: "fixed",
			left: 0,
			top: 0,
			right: 0,
			bottom: 0,
			backgroundColor: "rgba(0,0,0,.4)"
		}
	},

	buttonIconDate: "calendar",
	buttonIconTime: "clock-o fa-clock",

	btnCls: " btn btn-sm btn-outline-",
	icnCls: " fa fa-",

	clickEvent: "click",
	tranDone: "webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend"
});

JTSageDateBox.styleFunctions = {
	button: function( themeClass, iconClass, contents ) {
		var retty;

		retty  = "<a href='#' role='button' class='btn btn-sm btn-" + themeClass + "'>";
		retty += ( iconClass !== false ) ? "<span class='fa fa-" + iconClass + "'></span> " : "";
		retty += contents + "</a>";
		return retty;
	},
	buttonGroup: function () {
		return $("<div class='btn-group-vertical w-100 p-1'>");
	},
	baseInputWrap: function ( originalInput ) { 
		/* Set up a wrap around the input for styling, and return it */
		return originalInput.wrap("<div class='input-group'>").parent();
	},
	baseInputButton: function ( iconClass, title ) {
		return "<div class='input-group-append' title='" + title + "'>" +
			"<div class='input-group-text'>" + 
			"<span class='fa fa-" + iconClass + "'></span>" + 
			"</div></div>";
	},
	baseInputButtonFinder: function ( originalInputWrap ) {
		return originalInputWrap.find(".input-group-append");
	},
	baseInputNoButton: function ( originalInputWrap ) {
		originalInputWrap.addClass( "w-100" );
	},
	focusInput: function ( originalInput ) {
		originalInput.addClass( "ui-focus" );
	},
	blurInput: function ( originalInput ) {
		originalInput.removeClass( "ui-focus" );
	},
	widgetHeader: function ( text, themeBar, themeIcon, iconClass ) {
		return "<div class='navbar " + themeBar + "'>" + 
			"<h5 class='text-white'>" + text + "</h5>" + 
			this.button( themeIcon + " closer", iconClass, "") + "</div>";
	},
	calHeader: function ( text, firstBtnIcn, firstBtnCls, secondBtnIcn, secondBtnCls ) {
		var returnVal = $("<div class='my-2 text-center d-flex justify-content-between'>");

		$( this.button(firstBtnCls + " mx-2 dbCalPrev", firstBtnIcn, "") ).appendTo( returnVal );
		$("<h5>" + text + "</h5>").appendTo( returnVal );
		$( this.button(secondBtnCls + " mx-2 dbCalNext", secondBtnIcn, "") ).appendTo( returnVal );

		return returnVal;
	},
	calGrid: function () {
		return $( "<div class='w-100 p-1'><table class='dbCalGrid w-100'></table></div>" );
	},
	calRow: function () {
		return $( "<tr>" );
	},
	calButton: function ( data, totalElements ) {
		var style = ( totalElements !== undefined ?
				" style='width: " + ( 100 / totalElements ) + "%'" :
				""
			),
			disable = ( data.bad ? "disabled='disabled'" : ""),
			cls = "class='dbEvent w-100 btn-sm btn btn-" + 
				data.theme + ( data.bad ? " disabled":"" ) + "'";

		return $("<td class='m-0 p-0 text-center'" + style + ">" +
			"<a href='#' " + cls + " " + disable + ">" + 
			data.displayText + 
			"</a>" + "</td>");
	},
	calNonButton: function ( text, header, totalElements ) {
		var style = ( totalElements !== undefined ?
				" style='width: " + ( 100 / totalElements ) + "%'" :
				""
			),
			cls = ( header ) ? " font-weight-bold" : ""
		return $("<td class='m-0 p-0 text-center" + cls + "'" + style + ">" + text + "</td>");
	},
	calPickers: function ( ranges ) {
		var returnVal = "";

		returnVal += "<div class='row my-2 mx-1'>";

		returnVal += "<div class='col-sm-8 p-0 m-0'>";
		returnVal += this._stdSel( ranges.month, "dbCalPickMonth", "form-control" );
  		returnVal += "</div>";

		returnVal += "<div class='col-sm-4 p-0 m-0'>";
		returnVal += this._stdSel( ranges.year, "dbCalPickYear", "form-control" );
  		returnVal += "</div>";

		returnVal += "</div>";

		return $(returnVal);
	},
	calDateList: function ( listLabel, list ) {
		var returnVal = "";

		list.unshift([false, listLabel, true]);

		returnVal += "<div class='row my-2 mx-1'>";
		returnVal += this._stdSel( list, "dbCalPickList", "form-control" );
		returnVal += "</div>";

		return $(returnVal);
	}
};


JTSageDateBox.baseMode = "bootstrap4";

JTSageDateBox._controlGroup = function(element) {
	var o = this.options;

	if ( o.useCollapsedBut ) {
		element.find( "a" ).css({ width: "auto" });
		element.addClass( "btn-group btn-group-justified" );
	} else {
		element.addClass( "btn-group-vertical" );
	}
	return element;
};

