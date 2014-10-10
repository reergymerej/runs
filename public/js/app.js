$(function () {
    'use strict';

    var page = window.location.pathname;
    var fields = {};

    var msg = function (str) {
        var alert = $('.alert').clone();
        $('.msg', alert).html(str);
        alert.appendTo('#alert-center').removeClass('hidden');
        
    };

    if (page === '/' || page.match(/\/view/)) {
        // get a reference to each field
        $('input[type!="submit"]').each(function () {
            var $this = $(this);
            fields[$this.attr('id')] = $this;
        });

        // initialize form values
        fields.date.val((new Date()).toISOString().substring(0, 10));

        $('form').on('submit', function () {
            var $form = $(this);
            var data = {};

            $('input').prop('disabled', true);

            $.each(fields, function (fieldName, field) {
                data[fieldName] = field.val();
            });

            // We don't actually have an _id yet.
            // Delete it so the backend doesn't try to use "".
            if (page === '/') {
                delete data._id;
            }

            $.ajax({
                type: $form.attr('method'),
                url: $form.attr('action'),
                data: data,
                error: function () {
                    msg('unable to save run :(');
                },
                success: function (run) {
                    msg('run saved');
                    $('button[type="submit"], #view').toggleClass('hidden');
                    $('#view').attr('href', '/view/' + run._id);
                }
            });

            return false;
        });
    }
}());
