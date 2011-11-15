/*
 * jQuery Mobile Framework : plugin to provide a date and time picker.
 * Copyright (c) JTSage
 * CC 3.0 Attribution.  May be relicensed without permission/notifcation.
 * https://github.com/jtsage/jquery-mobile-datebox
 *
 * Norwegian localisation for JQM DateBox plugin *
 * Written by: Robin Heggelund Hansen (skinneyz89@gmail.com)
 */

jQuery.extend(jQuery.mobile.datebox.prototype.options.lang, {
    'nb-NO': {
        setDateButtonLabel: 'Velg dato',
        setTimeButtonLabel: 'Velg tidspunkt',
        setDurationButtonLabel: 'Velg varighet',
        calTodayButtonLabel: 'G&#229; til dagens dato',
        titleDateDialogLabel: 'Velg dato',
        titleTimeDialogLabel: 'Velg tidspunkt',
        daysOfWeek: ['S&#248;ndag','Mandag','Tirsdag','Onsdag','Torsdag','Fredag','L&#248;rdag'],
        daysOfWeekShort: ['S&#248;n','Man','Tirs','Ons','Tors','Fre','L&#248;r'],
        monthsOfYear: ['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember'],
        monthsOfYearShort: ['jan','feb','mar','apr','mai','jun','jul','aug','sep','okt','nov','des'],
        durationLabel: ['Dager','Timer','Minutter','Sekunder'],
        durationDays: ['Dag','Dager'],
        timeFormat: 24,
        dateFieldOrder: ['d', 'm', 'y'],
        timeFieldOrder: ['h', 'i', 'a'],
        slideFieldOrder: ['d', 'm', 'y'],
        headerFormat: 'ddd, mmm dd, YYYY',
	    dateFormat: 'mm/dd/YYYY',
        isRTL: false
    }
});
jQuery.extend(jQuery.mobile.datebox.prototype.options, {
    useLang: 'nb-NO'
});
