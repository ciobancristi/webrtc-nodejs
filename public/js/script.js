$(document).ready(() => {
    $('#contect-security-btn').click(() => {
        if (confirm('Are you sure you want to alert the security company?')) {
            $.post('/user/alert-security',
                (response) => {
                    if (response.success) {
                        toastr.success(response.message);
                    } else {
                        toastr.error(response.message);
                    }
                })
        }
    });
    $('#user-details-form').submit((e) => {
        e.preventDefault();
        $.post('/user-details',
            $('#user-details-form').serialize(),
            (data) => {
                $('#user-details-alert').show();
            });
    })
})