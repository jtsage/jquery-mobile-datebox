/* JTSage-DateBox 
 *
 * Basic boilerplate
 *
 * Contains open, close, create, etc.  The stuff that used to be in frameworks and is now agnostic.
 * 
 */
	
JTSageDateBox._create = function() {
	// Create the widget, called automatically by widget system
	$( document ).trigger( "dateboxcreate" );

	var w = this, runTmp, ranTmp,
		o = $.extend(
			this.options,
			this._getLongOptions( this.element ),
			this.element.data( "options" )
		),
		d = {
			input: this.element,
			wrap: this.element.parent(),
			mainWrap: $( "<div>", { 
				"class": "dbContainer"
				} ).css( "zIndex", o.zindex ),
			intHTML: false
		},
		styleTag = "<style>" +
				".dbContainer { width: " + o.controlWidth + "}" +
				"@media (max-width: " + o.breakpointWidth + ") { " +
				".dbContainer { width: 95%; margin-left: auto; margin-right: auto; } }" +
			"</style>",
		evtid = ".datebox" + this.uuid,
		touch = ( typeof window.ontouchstart !== "undefined" ),
		drag = {
			eStart : "touchstart" + evtid + " mousedown" + evtid,
			eMove  : "touchmove" + evtid + " mousemove" + evtid,
			eEnd   : "touchend" + evtid + " mouseup" + evtid,
			eEndA  : (true ?
				(["mouseup","touchend","touchcancel","touchmove"].join(evtid+" ") + evtid) :
				"mouseup" + evtid
			),
			move   : false,
			start  : false,
			end    : false,
			pos    : false,
			target : false,
			delta  : false,
			tmp    : false
		};

	$( "head" ).append( $( styleTag ) );

	$.extend(w, {d: d, drag: drag, touch:touch});

	if ( o.usePlaceholder !== false ) {
		if ( o.usePlaceholder === true && w._grabLabel() !== "" ) { 
			w.d.input.attr( "placeholder", w._grabLabel());
		}
		if ( typeof o.usePlaceholder === "string" ) {
			w.d.input.attr( "placeholder", o.usePlaceholder );
		}
	}

	w.cancelClose = false;
	w.calDateVisible = true;
	w.disabled = false;
	w.runButton = false;
	w._date = window.Date;
	w._enhanceDate();
	w.baseID = w.d.input.attr( "id" );

	w.initDate = new w._date();
	w.initDate.setMilliseconds(0);
	w.theDate = ( o.defaultValue ) ?
		w._makeDate() :
		( (w.d.input.val() !== "" ) ?
			w._makeDate( w.d.input.val() ) :
			new w._date() );

	if ( w.d.input.val() === "" ) { w._startOffset( w.theDate ); }

	w.initDone = false;

	if ( o.showInitialValue ) {
		w.d.input.val( w._formatter( w.__fmt(), w.theDate ) );
	}

	w.d.wrap = w.styleFunctions.baseInputWrap(w.d.input);
	
	if ( o.mode !== false ) {
		if ( o.buttonIcon === false ) {
			if ( o.mode.substr( 0, 4 ) === "time" || o.mode.substr( 0 ,3 ) === "dur" ) {
				o.buttonIcon = o.buttonIconTime;
			} else {
				o.buttonIcon = o.buttonIconDate;
			}
		}
	}
	if ( o.useButton ) {
		$( w.styleFunctions.baseInputButton( o.buttonIcon, w.__( "tooltip") ) )
			.on(o.clickEvent, function( e ) {
				e.preventDefault();
				if ( o.useFocus ) {
					w.d.input.focus();
				} else {
					if ( !w.disabled ) { w._t( { method: "open" } ); }
				}
			})
			.appendTo(w.d.wrap);
	} else {
		w.styleFunctions.baseInputNoButton(w.d.wrap);
	}

	if ( o.hideInput ) { w.d.wrap.hide(); }

	w.d.input
		.on( "focus.datebox", function(){
			w.styleFunctions.focusInput(w.d.input);
			if ( w.disabled === false && o.useFocus ) {
				w._t( { method: "open" } );
			}
		})
		.on( "blur.datebox", function() {
			w.styleFunctions.blurInput(w.d.input);
		})
		.on( "change.datebox", function() {
			/* 
			o.runOnBlur === function ( {oldDate, newDate, wasGoodDate} ) { 
				return {didSomething(bool), newDate};
			}
			*/
			if ( typeof o.runOnBlurCallback === "function" ) {
				runTmp = w._makeDate( w.d.input.val(), true );
				ranTmp = o.runOnBlurCallback.apply( w, [{
					oldDate: w.theDate,
					newDate: runTmp[0],
					wasGoodDate: !runTmp[1],
					wasBadDate: runTmp[1]
				}]);
				if ( typeof ranTmp !== "object" ) { 
					w.theDate = w._makeDate( w.d.input.val() );
					w.refresh();
				} else {
					if ( ranTmp.didSomething === true ) {
						w.d.input.val(ranTmp.newDate);
					}
					w.theDate = w._makeDate( w.d.input.val() );
					w.refresh();
				}
			} else {
				w.theDate = w._makeDate( w.d.input.val() );
				w.refresh();
			}
		})
		.on( "datebox", w._event );

	if ( o.lockInput ) { 
		w.d.input.attr( "readonly", "readonly" ); 
	}

	// Check if mousewheel plugin is loaded
	if ( typeof $.event.special.mousewheel !== "undefined" ) {
		w.wheelExists = true;
	}

	// Disable when done if element attribute disabled is true.
	if ( w.d.input.is( ":disabled" ) ) {
		w.disable();
	}

	w.applyMinMax(false, false);

	if ( o.displayMode === "inline" || o.displayMode === "blind" ) {
		//o.useInline || o.useInlineBlind ) {
		w.open();
	}

	//Throw dateboxinit event
	$( document ).trigger( "dateboxaftercreate" );
};

JTSageDateBox.open = function () {
	// PUBLIC function to open the control
	var w = this,
		o = this.options,
		basepop = {};

	if ( o.useFocus && w.fastReopen === true ) { 
		w.d.input.blur();
		return false;
	}

	w.theDate = w._makeDate( w.d.input.val() );
	w.originalDate = w._makeDate( w.d.input.val() );
	
	if ( w.d.input.val() === "" ) { w._startOffset( w.theDate ); }
	w.d.input.blur();

	if ( typeof w._build[ o.mode ] === "undefined" ) {
		w._build[ "default" ].apply( w, [] );
	} else {
		w._build[ o.mode ].apply( w, [] );
	}
	if ( typeof w._drag[ o.mode ] !== "undefined" ) {
		w._drag[ o.mode ].apply( w, [] );
	}

	w._t( { method: "refresh" } );

	if ( w.__( "useArabicIndic" ) === true ) { w._doIndic(); }

	// Ignore if already open
	if ( w.d.intHTML.is( ":visible" ) ) { return false; }

	w.d.mainWrap.empty();

	if ( o.useHeader ) {
		w.d.mainWrap.append( $( w.styleFunctions.widgetHeader(
			w.d.headerText,
			o.theme_headerTheme,
			o.theme_headerBtnCls,
			o.theme_headerBtnIcn
		) ) )
		.find( ".closer" ).on( o.clickEventAlt, function( e ) {
			e.preventDefault();
			w._t( { method: "close", closeCancel: true } );
		} );
	}
	
	w.d.mainWrap.append( w.d.intHTML ).css( "zIndex", o.zindex );

	w._t( { method: "postrefresh" } );

	// Perpare open callback, if provided. Additionally, if this
	// returns false then the open/update will stop.
	if ( o.openCallback !== false ) {
		if ( ! $.isFunction( o.openCallback ) ) {
			if ( typeof window[ o.openCallback ] === "function" ) {
				o.openCallback = window[ o.openCallback ];
			}
		}
		basepop.afteropen = function() {
			w._t( { method: "postrefresh" } );
			if ( o.openCallback.apply( w, $.merge([{
						custom: w.customCurrent,
						initDate: w.initDate,
						date: w.theDate,
						duration: w.lastDuration
					}], o.openCallbackArgs ) ) === false ) {

				w._t( {method: "close"} );
			}
		};
	} else {
		basepop.afteropen = function() {
			w._t( { method: "postrefresh" } );
		};
	}

	// Perpare BEFORE open callback, if provided. Additionally, if this
	// returns false then the open/update will stop.
	if ( o.beforeOpenCallback !== false ) {
		if ( ! $.isFunction( o.beforeOpenCallback ) ) {
			if ( typeof window[ o.beforeOpenCallback ] === "function" ) {
				o.beforeOpenCallback = window[ o.beforeOpenCallback ];
			}
		}
		if ( o.beforeOpenCallback.apply( w, $.merge([{
				custom: w.customCurrent,
				initDate: w.initDate,
				date: w.theDate,
				duration: w.lastDuration
			}], o.beforeOpenCallbackArgs ) ) === false ) {
				return false;
		}
	}

	switch ( o.displayMode ) {
		case "inline":
			w.d.wrap.parent().append( w.d.mainWrap );
			w.d.mainWrap.addClass( o.theme_inlineContainer );
			w.d.mainWrap.css( { zIndex: "auto" } );
			switch ( o.displayInlinePosition ) {
				case "right":
					w.d.mainWrap.css( { marginRight: 0, marginLeft: "auto" } );
					break;
				case "left":
					w.d.mainWrap.css( { marginLeft: 0, marginRight: "auto" } );
					break;
				//case "center":
				//case "middle":
				default:
					w.d.mainWrap.css( { marginLeft: "auto", marginRight: "auto" } );
					break;
			}
			w._t( { method: "postrefresh" } );
			break;
		case "blind":
			if ( w.initDone ) {
				w.refresh();
				w.d.mainWrap.slideDown();
			} else {
				w.d.wrap.parent().append( w.d.mainWrap );
				w.d.mainWrap.addClass( o.theme_inlineContainer );
				w.d.mainWrap.css( { zIndex: "auto", display: "none" } );
				switch ( o.displayInlinePosition ) {
					case "right":
						w.d.mainWrap.css( { marginRight: 0, marginLeft: "auto" } );
						break;
					case "left":
						w.d.mainWrap.css( { marginLeft: 0, marginRight: "auto" } );
						break;
					//case "center":
					//case "middle":
					default:
						w.d.mainWrap.css( { marginLeft: "auto", marginRight: "auto" } );
						break;
				}
				w.initDone = true;
			}
			w._t( { method: "postrefresh" } );
			break;
		case "modal":
			w.d.mainWrap
				.show()
				.addClass( o.theme_modalContainer )
				.appendTo( w.d.wrap.parent() )
				.one( o.tranDone, function() { 
					if ( w.d.mainWrap.is( ":visible" ) ) {
						basepop.afteropen.call();
					} else {
						basepop.afterclose.call();
						w.d.mainWrap.removeClass( "db-show" );
					}
				});

			w.d.backdrop = $("<div class='jtsage-datebox-backdrop-div'></div>")
				.css( o.theme_backgroundMask )
				.appendTo( "body" )
				.on( o.clickEvent, function (e) {
					e.preventDefault();
					w._t( { method: "close", closeCancel: true } );
				});

			w.popper = new Popper( $( "body" ), w.d.mainWrap, { placement: "bottom" });
			
			break;
		// case "dropdown":
		default:
			w.d.mainWrap
				.show()
				.addClass( o.theme_dropdownContainer )
				.appendTo( w.d.wrap.parent() )
				.one( o.tranDone, function() { 
					if ( w.d.mainWrap.is( ":visible" ) ) {
						basepop.afteropen.call();
					} else {
						basepop.afterclose.call();
						w.d.mainWrap.removeClass( "db-show" );
					}
				});

			w.d.backdrop = $("<div class='jtsage-datebox-backdrop-div'></div>")
				.css( o.theme_backgroundMask )
				.appendTo( "body" )
				.on( o.clickEvent, function (e) {
					e.preventDefault();
					w._t( { method: "close", closeCancel: true } );
				});

			w.popper = new Popper(w.d.wrap, w.d.mainWrap, { placement: o.displayDropdownPosition });
			
			break;
	}
	window.setTimeout(function () {
		w.d.mainWrap.addClass( "db-show" );
	}, 0);
	window.setTimeout(function () { // This is hacky as hell.
		w.d.mainWrap.trigger( "oTransitionEnd" );
	}, 200);
};

JTSageDateBox.close = function() {
	// Provide a PUBLIC function to close the element.
	var w = this,
		o = this.options,
		basepop = {};

	// Trigger the popup to close
	// // Prepare close callback.
	if ( o.closeCallback !== false ) {
		if ( ! $.isFunction( o.closeCallback ) ) {
			if ( typeof window[ o.closeCallback ] === "function" ) {
				o.closeCallback = window[ o.closeCallback ];
			}
		}
		basepop.afterclose = function() {
			o.closeCallback.apply( w, $.merge([{
				custom: w.customCurrent,
				initDate: w.initDate,
				date: w.theDate,
				duration: w.lastDuration,
				cancelClose: w.cancelClose
			}], o.closeCallbackArgs ) );
		};
	} else {
		basepop.afterclose = function() {
			return true;
		};
	}
	
	switch ( o.displayMode ) {
		case "inline":
			// Do Nothing.
			basepop.afterclose.call();
			return true;
		case "blind":
			w.d.mainWrap.slideUp();
			basepop.afterclose.call();
			return true;
		// case "modal":
		// case "dropdown":
		default:
			w.d.backdrop.remove();
			$( ".jtsage-datebox-backdrop-div" ).remove();
			w.d.mainWrap.removeClass( "db-show" );
			basepop.afterclose.call();
			w.d.mainWrap.hide();
			break;
	}

	// Unbind all drag handlers.
	$( document )
		.off( w.drag.eMove )
		.off( w.drag.eEnd )
		.off( w.drag.eEndA );

	if ( o.useFocus ) {
		w.fastReopen = true;
		setTimeout( (function( t ) { 
			return function () { 
				t.fastReopen = false; 
			};
		}( w )), 300 );
	}
};

JTSageDateBox._destroy = function() {
	var w = this,
		o = this.options,
		button = this.styleFunctions.baseInputButtonFinder(this.d.wrap);

	if ( o.useButton === true ) {
		button.remove();
		w.d.input.unwrap();	
	}

	if ( o.lockInput ) {
		w.d.input.removeAttr( "readonly" );
	}

	w.d.input
		.off( "datebox" )
		.off( "focus.datebox" )
		.off( "blur.datebox" )
		.off( "change.datebox" );
		
	$( document )
		.off( w.drag.eMove )
		.off( w.drag.eStart )
		.off( w.drag.eEnd )
		.off( w.drag.eEndA );
};

JTSageDateBox._stdSel = function(data, id, cls) {
	var i, returnVal = "<select class='" + cls + "' id='" + id + "'>";

	for ( i = 0; i < data.length; i++ ) {
		returnVal += "<option value='" + data[i][0] + "'" + 
			( data[i][2] === true ? " selected='selected'" : "" ) + ">" +
			data[i][1] + "</option>";
	}
	returnVal += "</select>";

	return returnVal;
};

JTSageDateBox._stdBtn = {
	cancel: function() {
		var w = this, o = this.options;
		return $( w.styleFunctions.button(
				o.theme_cancelBtnCls,
				o.theme_cancelBtnIcn,
				w.__("cancelButton")
			) )
			.on(o.clickEventAlt, function (e) {
				e.preventDefault();
				w._t({ method: "close", closeCancel: true });
			});
	},
	clear: function() {
		var w = this, o = this.options;
		return $( w.styleFunctions.button(
				o.theme_clearBtnCls,
				o.theme_clearBtnIcn,
				w.__("clearButton")
			) )
			.on(o.clickEventAlt, function(e) {
				e.preventDefault();
				w.d.input.val("");
				w._t( { method: "clear" } );
				w._t( { method: "close", closeCancel: true } );
			});
	},
	close: function(txt, trigger) {
		var w = this, o = this.options;

		if ( typeof trigger === "undefined" ) { trigger = false; }

		return $( w.styleFunctions.button( o.theme_closeBtnCls, o.theme_closeBtnIcn, txt ) ) 
			.addClass( "" +
				( ( w.dateOK === true ) ? "" : "disabled")
			)
			.on(o.clickEventAlt, function(e) {
				e.preventDefault();
				if ( w.dateOK === true ) {
					if ( trigger === false ) {
						w._t( {
							method: "set", 
							value: w._formatter(w.__fmt(),w.theDate),
							date: w.theDate
						} );
					} else {
						w._t( trigger );
					}
					w._t( { method: "close" } );
				}
				
			});
	},
	today: function() {
		var w = this, o = this.options;
		return $( w.styleFunctions.button(
				o.theme_todayBtnCls,
				o.theme_todayBtnIcn,
				w.__("todayButtonLabel")
			) )
			.on(o.clickEventAlt, function(e) {
				e.preventDefault();
				w.theDate = w._pa([0,0,0], new w._date());
				w._t( { method: "doset" } );
				if ( o.closeTodayButton === true ) { w._t( { method: "close" } ); }
			});
	},
	tomorrow: function() {
		var w = this, o = this.options;
		return $( w.styleFunctions.button(
				o.theme_tomorrowBtnCls,
				o.theme_tomorrowBtnIcn,
				w.__("tomorrowButtonLabel") 
			) )
			.on(o.clickEventAlt, function(e) {
				e.preventDefault();
				w.theDate = w._pa([0,0,0], new w._date()).adj( 2, 1 );
				w._t( { method: "doset" } );
				if ( o.closeTomorrowButton === true ) { w._t( { method: "close" } ); }
			});
	},
};

JTSageDateBox.disable = function() {
	var w = this;
	// Provide a PUBLIC function to Disable the element
	w.d.input.attr( "disabled", true );
	w.disabled = true;
	w._t( { method: "disable" } );
};

JTSageDateBox.enable = function() {
	var w = this;
	// Provide a PUBLIC function to Enable the element
	w.d.input.attr( "disabled", false );
	w.disabled = false;
	w._t( { method: "enable" } );
};