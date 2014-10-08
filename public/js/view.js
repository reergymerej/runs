$(function () {
    'use strict';

    var fields = {};

    // get a reference to each field
    $('input[type!="submit"]').each(function () {
        var $this = $(this);
        fields[$this.attr('id')] = $this;
    });

    var onSubmit = function () {
        var data = {};

        $.each(fields, function (fieldName, field) {
            data[fieldName] = field.val();
        });

        console.log('it was submitted', data);

        $.ajax({
            type: 'PUT',
            url: '/api/run/' + data._id,
            data: data,
            error: function () {
                console.log('error');
            },
            success: function () {
                console.log('success');
            }
        });

        return false;
    };


    $('form').on('submit', onSubmit);
}());
