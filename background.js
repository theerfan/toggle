// This will store the current proxy setting state
let proxyEnabled = false;

function updateProxyEnabled() {
    browser.proxy.settings.get({}).then((config) => {
        proxyEnabled = config.value.proxyType !== "none";
    });
}

function checkPrivateBrowsingPermission() {
    browser.extension.isAllowedIncognitoAccess().then((isAllowedAccess) => {
        if (!isAllowedAccess) {
            browser.notifications.create({
                "type": "basic",
                "iconUrl": browser.runtime.getURL("icons/icon-48.png"),
                "title": "Private Browsing Permission",
                "message": "Please allow this extension to run in private windows through the add-on settings."
            });
        }
    });
}

// Check the proxy settings on startup
updateProxyEnabled();

// Check the private browsing permission on startup
checkPrivateBrowsingPermission();

// Function to update proxy settings
function updateProxySettings(proxyAddress) {
    if (proxyAddress) {
        // Parse the proxyAddress and apply the settings
        let [protocol, fullHost] = proxyAddress.split('://');
        let [host, port] = fullHost.split(':');

        browser.proxy.settings.set({
            value: {
                proxyType: "manual",
                http: host,
                httpProxyAll: true,
                port: parseInt(port),
                // If you want to set different proxies for other protocols,
                // set them here as well
                // ssl: host,
                // ftp: host,
                // etc...
            },
            scope: "regular"
        });
    }
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const proxyAddr = "http://localhost:5000";
    if (message.toggleProxy) {
        proxyEnabled = !proxyEnabled; // Toggle the proxyEnabled state
        if (proxyEnabled) {
            // Set to manual proxy configuration
            browser.proxy.settings.set({
                value: {
                    proxyType: "manual",
                    // You will need to set your manual configuration here
                    socks: proxyAddr,
                    ssl: proxyAddr,
                    proxyDNS: true,
                    // ... other proxy settings
                },
                scope: "regular"
            });
        } else {
            // Set to no proxy configuration
            browser.proxy.settings.set({
                value: { proxyType: "none" },
                scope: "regular"
            });
        }
        sendResponse({ proxyEnabled: proxyEnabled });
    }
});

// Listen for changes in the proxy settings
browser.proxy.settings.onChange.addListener(updateProxyEnabled);

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Existing message handling...

    if (message.updateProxy) {
        updateProxySettings(message.proxyAddress);
        sendResponse({ status: "Proxy settings updated" });
    }

    // Return true to indicate that you wish to send a response asynchronously
    return true;
});