$(function () {
    'use strict';

    var fields = {};

    var msg = function (str) {
        $('.message').html(str);
    };

    // get a reference to each field
    $('input[type!="submit"]').each(function () {
        var $this = $(this);
        fields[$this.attr('id')] = $this;
    });

    var onSubmit = function () {
        var data = {};

        $('input').prop('disabled', true);

        $.each(fields, function (fieldName, field) {
            data[fieldName] = field.val();
        });

        $.ajax({
            type: 'PUT',
            url: '/api/run/' + data._id,
            data: data,
            error: function () {
                msg('unable to save run :(');
            },
            success: function (run) {
                msg('run saved');
                $('button, #view').toggleClass('hidden');
                $('#view').attr('href', '/view/' + run._id);
            }
        });

        return false;
    };


    $('form').on('submit', onSubmit);
}());
