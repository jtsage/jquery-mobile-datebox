/*
 * jQuery Mobile Framework : plugin to provide a date and time picker.
 * Copyright (c) JTSage
 * CC 3.0 Attribution.  May be relicensed without permission/notifcation.
 * https://github.com/jtsage/jquery-mobile-datebox
 *
 * Translation by: Rodrigo Vieira <rodrigovieira1994@gmail.com>
 */

jQuery.extend(jQuery.mobile.datebox.prototype.options.lang, {
    'pt-BR': {
        setDateButtonLabel: 'Informar data',
        setTimeButtonLabel: 'Informar hora',
        setDurationButtonLabel: 'Informar duração',
        calTodayButtonLabel: 'Ir para hoje',
        titleDateDialogLabel: 'Escolha a data',
        titleTimeDialogLabel: 'Escolha a hora',
        daysOfWeek: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
        daysOfWeekShort: ['D','S','T','Q','Q','S','S'],
        monthsOfYear: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
        monthsOfYearShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
        durationLabel: ['Dias','Horas','Minutos','Segundos'],
        durationDays: ['Dia','Dias'],
        timeFormat: 12,
        dateFieldOrder: ['d', 'm', 'y'],
        timeFieldOrder: ['h', 'i', 'a'],
        slideFieldOrder: ['y', 'm', 'd'],
        headerFormat: 'ddd, mmm dd, YYYY',
        isRTL: false
    }
});
jQuery.extend(jQuery.mobile.datebox.prototype.options, {
    useLang: 'pt-BR'
});