/* JTSage-DateBox 
 *
 * MODE File
 *
 * Provide the following display modes:
 * * datebox
 * * timebox
 * * durationbox
 * * datetimebox
 *
 * Define the standard options as well
 */

mergeOpts({		
	validHours: false, // moved
	repButton: true, // removed
	durationStep: 1,
	durationSteppers: {"d": 1, "h": 1, "i": 1, "s": 1}
});

JTSageDateBox._dbox_run_update = function(shortRun) {
	// Update the current view of the datebox.
	//
	// Datebox is different from most modes, it replaints
	// it's screen, it doesn't rebuild & replace it.
	var w = this,
		o = this.options,
		i = w.theDate.getTime() - w.initDate.getTime(),
		dur = ( o.mode === "durationbox" ? true : false ),
		cDur = w._dur( i<0 ? 0 : i );

	if ( i < 0 ) {
		w.lastDuration = 0;
		if ( dur ) { w.theDate.setTime( w.initDate.getTime() ); }
	}
	
	if ( dur ) {
		w.lastDuration = i / 1000;
		if ( o.minDur !== false &&
				( w.theDate.getEpoch() - w.initDate.getEpoch() ) < o.minDur ) {
			w.theDate = new Date( w.initDate.getTime() + ( o.minDur * 1000 ) );
			w.lastDuration = o.minDur;
			cDur = w._dur( o.minDur * 1000 );
		}
		if ( o.maxDur !== false &&
				( w.theDate.getEpoch() - w.initDate.getEpoch() ) > o.maxDur ) {
			w.theDate = new Date( w.initDate.getTime() + ( o.maxDur * 1000 ) );
			w.lastDuration = o.maxDur;
			cDur = w._dur( o.maxDur * 1000 );
		}
	}
		
	if ( shortRun !== true && dur !== true ) {
		w._check();
	
		if ( o.mode === "datebox" || o.mode === "datetimebox" ) {
			w.d.intHTML
				.find( ".dbHeader" ).childern().first()
					.text( w._formatter( w.__( "headerFormat" ), w.theDate ) );
		}
		
		if ( o.useSetButton ) {
			if ( w.dateOK === false ) { 
				w.setBut.addClass( o.disabledState );
			} else {
				w.setBut.removeClass( o.disabledState );
			}
		}
	}
	
	w.d.intHTML.find( "input" ).each(function () {
		switch ( $(this).data( "field" ) ) {
			case "y":
				$(this).val(w.theDate.get(0)); break;
			case "m":
				$(this).val(w.theDate.get(1) + 1); break;
			case "d":
				$(this).val( ( dur ? cDur[0] : w.theDate.get(2) ) );
				break;
			case "h":
				if ( dur ) {
					$(this).val(cDur[1]);
				} else {
					if ( w.__("timeFormat") === 12 ) {
						$(this).val(w.theDate.get12hr());
					} else {
						$(this).val(w.theDate.get(3)); 
					}
				}
				break;
			case "i":
				if ( dur ) {
					$(this).val(cDur[2]);
				} else {
					$(this).val(w._zPad(w.theDate.get(4)));
				} 
				break;
			case "M":
				$(this).val(w.__("monthsOfYearShort")[w.theDate.get(1)]); break;
			case "a":
				$(this).val(w.__( "meridiem" )[ (w.theDate.get(3) > 11) ? 1 : 0 ] );
				break;
			case "s":
				if ( dur ) {
					$(this).val(cDur[3]);
				} else {
					$(this).val(w._zPad(w.theDate.get(5)));
				} 
				break;
		}
	});
	if ( w.__( "useArabicIndic" ) === true ) { w._doIndic(); }
};


JTSageDateBox._dbox_enter = function (item) {
	var tmp,
		w = this, 
		t = 0;
	
	if ( item.data( "field" ) === "M" ) {
		tmp = $.inArray( item.val(), w.__( "monthsOfYearShort" ) );
		if ( tmp > -1 ) { w.theDate.setMonth( tmp ); }
	}
	if ( item.val() !== "" && item.val().toString().search(/^[0-9]+$/) === 0 ) {
		switch ( item.data( "field" ) ) {
			case "y":
				w.theDate.setD( 0, parseInt(item.val(),10)); break;
			case "m":
				w.theDate.setD( 1, parseInt(item.val(),10)-1); break;
			case "d":
				w.theDate.setD( 2, parseInt(item.val(),10));
				t += (60*60*24) * parseInt(item.val(),10);
				break;
			case "h":
				w.theDate.setD( 3, parseInt(item.val(),10));
				t += (60*60) * parseInt(item.val(),10);
				break;
			case "i":
				w.theDate.setD( 4, parseInt(item.val(),10));
				t += (60) * parseInt(item.val(),10);
				break;
			case "s":
				w.theDate.setD( 5, parseInt(item.val(),10));
				t += parseInt(item.val(),10); 
				break;
		}
	}
	if ( this.options.mode === "durationbox" ) { 
		w.theDate.setTime( w.initDate.getTime() + ( t * 1000 ) );
	}
	setTimeout(function() { w.refresh(); }, 150);
};


JTSageDateBox._build.timebox = function () { this._build.datebox.apply( this, [] ); };
JTSageDateBox._build.datetimebox = function () { this._build.datebox.apply( this, [] ); };
JTSageDateBox._build.durationbox =  function () { this._build.datebox.apply( this, [] ); };

JTSageDateBox._build.datebox = function () {
	var offAmount, i, ctrlWrk,
		w = this,
		o = this.options,
		_sf = this.styleFunctions,
		ctrlContainer = _sf.dboxContainer(),
		dur = ( o.mode === "durationbox" ? true : false ),
		defDurOrder = ["d","h","i","s"];
	
	if ( typeof w.d.intHTML !== "boolean" ) {
		w.d.intHTML.empty().remove();
	}
	
	w.d.headerText = ( ( w._grabLabel() !== false ) ?
		w._grabLabel() : 
		( ( o.mode === "datebox" || o.mode === "datetimebox" ) ? 
			w.__( "titleDateDialogLabel" ) :
			w.__( "titleTimeDialogLabel" )
		)
	);
	w.d.intHTML = $( "<span>" );
	
	switch ( o.mode ) {
		case "durationbox" :
			w.fldOrder = w.__( "durationOrder" );
			break;
		case "timebox" :
			w.fldOrder = w.__( "timeFieldOrder" );
			break;
		case "datetimebox" :
			w.fldOrder = w.__( "datetimeFieldOrder" );
			break;
		case "datebox" :
			w.fldOrder = w.__( "dateFieldOrder" );
			break;
	}

	if ( !dur ) {
		w._check();
		w._minStepFix();
	} else {
		w.dateOK = true;
		w._fixstepper( w.fldOrder );
	}
	
	if ( o.mode === "datebox" || o.mode === "datetimebox" ) { 
		_sf.intHeader( w._formatter( w.__( "headerFormat" ), w.theDate ) )
			.appendTo( w.d.intHTML );
	}
	
	for ( i = 0; i < w.fldOrder.length; i++ ) {

		if ( w.fldOrder[i] === "a" && w.__( "timeFormat" ) !== 12 ) { continue; }

		if ( dur ) {
			offAmount = o.durationSteppers[w.fldOrder[i]];
		} else {
			offAmount = ( w.fldOrder[i] === "i" ) ? o.minuteStep: 1;
		}

		ctrlWrk = _sf.dboxControl( 
			o.theme_dbox_PrevBtnIcn,
			o.theme_dbox_PrevBtnCls,
			o.theme_dbox_NextBtnIcn,
			o.theme_dbox_NextBtnCls,
			w.fldOrder[i],
			( dur ) ? w.__( "durationLabel" )[ $.inArray( w.fldOrder[i], defDurOrder ) ] : null
		);
		ctrlWrk.find("input").data({ 
			field: w.fldOrder[i],
			amount: offAmount
		});
		ctrlWrk.find(".dbBoxNext").data({
			field: w.fldOrder[i],
			amount: offAmount
		});
		ctrlWrk.find(".dbBoxPrev").data({
			field: w.fldOrder[i],
			amount: offAmount * -1
		});

		ctrlContainer.append( ctrlWrk );
	}

	ctrlContainer.appendTo(w.d.intHTML);

	w._dbox_run_update(true);

	if ( 
			o.useSetButton ||
			o.useTodayButton ||
			o.useTomorrowButton ||
			o.useClearButton ||
			o.useCancelButton
	) {
		ctrlContainer = _sf.buttonGroup();
		
		if ( o.useSetButton ) {
			switch (o.mode) {
				case "timebox" :
					ctrlWrk = w.__("setTimeButtonLabel"); break;
				case "durationbox" :
					ctrlWrk = w.__("setDurationButtonLabel"); break;
				case "datebox":
				case "datetimebox":
					ctrlWrk = w.__("setDateButtonLabel"); break;
			}
			w.setBut = w._stdBtn.close.apply( w, [ ctrlWrk ] );
			w.setBut.appendTo( ctrlContainer );
		}

		if ( o.useTodayButton ) {
			ctrlContainer.append(w._stdBtn.today.apply(w));
		}
		if ( o.useTomorrowButton ) {
			ctrlContainer.append(w._stdBtn.tomorrow.apply(w));
		}
		if ( o.useClearButton ) {
			ctrlContainer.append(w._stdBtn.clear.apply(w));
		}
		if ( o.useCancelButton ) {
			ctrlContainer.append(w._stdBtn.cancel.apply(w));
		}

		ctrlContainer.appendTo( w.d.intHTML );
	}

	w.d.intHTML
		.on( "change", "input", function() { w._dbox_enter( $( this ) ); })
		.on( "keypress", "input", function(e) {
			if ( e.which === 13 && w.dateOK === true ) {
				w._dbox_enter( $( this ) );
				w._t( {
					method: "set",
					value: w._formatter(w.__fmt(),w.theDate),
					date: w.theDate
				} );
				w._t( { method: "close" } );
			}
		})
		.on( "mousewheel", "input", function( e, d ) {
			e.preventDefault();
			w._offset( 
				$( this ).data( "field" ),
				( ( d < 0 ) ? -1 : 1 ) * $( this ).data( "amount" )
			);
		})
		.on(o.clickEvent, ".dbBoxPrev, .dbBoxNext", function(e) {
			w.d.intHTML.find( ":focus" ).blur();
			e.preventDefault();
			w._offset(
				$( this ).data( "field" ),
				$( this ).data( "amount" )
			);
		});
};