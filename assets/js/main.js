//- Noscript
document.querySelectorAll('.noscript').forEach(elem => {
    elem.style.display = 'none';
});

document.addEventListener('DOMContentLoaded', function () {
    const plist = require('simple-plist');

    // Shortcut for querySelector
    const qs = selector => document.querySelector(selector);

    const resetButton = qs('#reset-button');
    const configForm = qs('.config-form');
    const identifierField = qs('#payloadIdentifier');

    function userConfig(item) {
        let field = configForm.querySelector(`#${item}`);
        return field.value || field.dataset.defaultval;
    }

    function refreshIdentifier() {
        identifierField.dataset.defaultval = 'com.example.font-' + randomString();
    }

    function updateFileCount() {
        const files = fileInput.files;
        let text = files.length ? `${files.length} file${files.length === 1 ? '' : 's'} selected` : 'No files selected';
        fileName.textContent = text;
    }

    function generateConfig() {

        // Build the profile
        let config = {
            PayloadContent: payloads.map(payload => ({
                AirPrint: {
                    ForceTLS: userConfig('useTLS'),
                    IPAddress: userConfig('IPAddress'),
                    Port: userConfig('port'),
                    ResourcePath: userConfig('resourcePath')
                },
                PayloadIdentifier: userConfig('payloadIdentifier') + '.' + payload.name,
                PayloadType: 'com.apple.airprint',
                PayloadUUID: generateUUID(),
                PayloadVersion: 1
            })),
            PayloadIdentifier: userConfig('payloadIdentifier'),
            PayloadType: 'Configuration',
            PayloadUUID: generateUUID(),
            PayloadVersion: 1
        };
        if (userConfig('payloadDescription')) {
            config.PayloadDescription = userConfig('payloadDescription');
        }
        if (userConfig('payloadDisplayName')) {
            config.PayloadDisplayName = userConfig('payloadDisplayName');
        }
        
        let prof = plist.stringify(config);

        downloadFile(prof, 'printer.mobileconfig', "application/x-apple-aspen-config");

        // Refresh the identifier if it was used
        refreshIdentifier();
    }

    function downloadFile(data, filename, type) {
        let blob = new Blob([data], {type: type});
        let url = URL.createObjectURL(blob);
        download(url, filename);
    }

    function download(url, filename) {
        let downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    function randomString() {
        return [...Array(6)].map(() => (~~(Math.random()*16)).toString(16).toUpperCase()).join('');
    }

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    updateFileCount();
    refreshIdentifier();

    fileInput.addEventListener('change', updateFileCount);

    resetButton.addEventListener('click', () => {
        configForm.reset();
        refreshIdentifier();
        updateFileCount();
    });

    configForm.addEventListener('submit', event => {
        event.preventDefault();
        generateConfig();
    });
});
