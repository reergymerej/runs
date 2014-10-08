$(function () {
    'use strict';

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

    // handle form submission
    var onSubmit = function () {
        var data = {};

        $.each(fields, function (fieldName, field) {
            data[fieldName] = field.val();
        });

        delete data._id;

        $.ajax({
            type: 'POST',
            url: 'api/run',
            data: data,
            error: function () {
                msg.set('unable to save run :(');
            },
            success: function () {
                msg.set('run saved');
                $('button').hide();
            }
        });

        return false;
    };

    // initialize form values
    fields.date.val((new Date()).toISOString().substring(0, 10));

    $('form').on('submit', onSubmit);
}());
