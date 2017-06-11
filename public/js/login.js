var auth0 = new auth0.WebAuth({
    domain: 'ciobancristi.eu.auth0.com',
    clientID: 'zjyYqkJyMI_atpgsBrsVOHaPLus2GUv4',
    redirectUri: 'http://localhost:3000/callback'
});

function signinGoogle() {
    auth0.authorize({
        connection: 'google-oauth2',
        responseType: 'code'
    });
}

function signinDb() {
    auth0.redirect.loginWithCredentials({
        connection: 'Username-Password-Authentication',
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        responseType: 'code'
    }, function (err) {
        if (err.code == 'invalid_user_password')
            alert(err.description);
    });
}