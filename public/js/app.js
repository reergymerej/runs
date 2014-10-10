$(function () {
    'use strict';

    // TODO: De-dupe all the stuff in here and view.js.
    var fields = {};

    var msg = function (str) {
        $('.message').html(str);
    };

    // get a reference to each field
    $('input[type!="submit"]').each(function () {
        var $this = $(this);
        fields[$this.attr('id')] = $this;
    });

    // handle form submission
    var onSubmit = function () {
        var data = {};

        $('input').prop('disabled', true);

        $.each(fields, function (fieldName, field) {
            data[fieldName] = field.val();
        });

        // We don't actually have an _id yet.
        // Delete it so the backend doesn't try to use "".
        delete data._id;

        $.ajax({
            type: 'POST',
            url: '/api/run',
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

    // initialize form values
    fields.date.val((new Date()).toISOString().substring(0, 10));

    $('form').on('submit', onSubmit);
}());
