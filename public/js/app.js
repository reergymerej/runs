$(function () {
    'use strict';
    
    var fields = {};

    // get a reference to each field
    $('input[type!="submit"]').each(function () {
        var $this = $(this);
        fields[$this.attr('id')] = $this;
    });

    /**
    * prepopulate values
    * @param {$} field
    */
    var setDate = function (field) {
        var date = new Date();
        var val = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
        field.val(val);
    };

    // handle form submission
    var onSubmit = function () {
        var data = {};

        $.each(fields, function (fieldName, field) {
            data[fieldName] = field.val();
        });

        $.ajax({
            type: 'POST',
            url: 'api/run',
            data: data,
            error: function () {
                console.error('not cool');
            },
            success: function () {
                console.log('cool');
            }
        });

        return false;
    };

    setDate(fields.date);

    $('form').on('submit', onSubmit);
}());
