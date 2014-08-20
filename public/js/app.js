$(function () {
    'use strict';

    var onUpdatePage = $('form#new').length === 0;

    var msg = {
        div: $('#message'),
        delay: 3000,
        timeoutId: null,
        queue: [],
        set: function (message) {
            this.queue.push(message);

            // If already processing, don't worry.
            if (this.timeoutId === null) {
                this.process();
            }
        },
        process: function () {
            var that = this;

            // clear previous
            this.div.fadeOut('slow', function () {
                var message;
                that.timeoutId = null;
                if (that.queue.length) {
                    message = that.queue.shift();
                    that.div.html(message).fadeIn('fast', function () {
                        that.timeoutId = setTimeout(function () {
                            that.process();
                        }, that.delay);
                    });
                }
            });
        }
    };
    
    window.msg = msg;

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
            type: onUpdatePage ? 'PUT' : 'POST',
            url: 'api/run' + (onUpdatePage ? '/' + data._id : ''),
            data: data,
            error: function () {
                msg.set('unable to save run :(');
            },
            success: function () {
                msg.set('run saved');
                $.each(fields, function (fieldName, field) {
                    field.val('');
                });
            }
        });

        return false;
    };

    if (!onUpdatePage) {
        setDate(fields.date);
    }

    $('form').on('submit', onSubmit);
}());
