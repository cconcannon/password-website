'use strict';

// use path library to filter requests for pages vs assets
const path = require('path');

exports.handler = (event, context, callback) => {

    // Get request and request headers
    const request = event.Records[0].cf.request;
    const headers = event.Records[0].cf.request.headers;
    headers.authorization = headers.authorization || [];
    
    console.log("Request: " + JSON.stringify(request));

    // Configure authentication
    const authUser = "password";
    const authPass = "concannon.tech";

    // Construct the Basic Auth string
    const authString = 'Basic ' + new Buffer(authUser + ':' + authPass).toString('base64');

    // Require Basic authentication
    if (headers.authorization.length == 0) {
        returnUnauthorizedResponse(callback);
    }
    else if (headers.authorization[0].value != authString) {
        returnUnauthorizedResponse(callback);
    }

    // Extract the URI path from the request (removes trailing '/' when present)
    const parsedPath = path.parse(request.uri);
    let newUri;

    if (parsedPath.ext === '') {
        // fetch index.html for requests with no file extensions
        newUri = path.join(parsedPath.dir, parsedPath.base, 'index.html');
    }
    else {
        // preserve the uri when it has file extensions
        newUri = request.uri;
    }

    request.uri = newUri;

    // Continue request processing if authentication passed
    return callback(null, request);
};

function returnUnauthorizedResponse(callback) {
    const body = 'Unauthorized';
    const response = {
        status: '401',
        statusDescription: 'Unauthorized',
        body: body,
        headers: {
            'www-authenticate': [{ key: 'WWW-Authenticate', value: 'Basic' }]
        },
    };
    console.log("Responding with: " + JSON.stringify(response));
    callback(null, response);
};
