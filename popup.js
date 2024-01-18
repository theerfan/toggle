function updateProxyEnabled() {
  browser.proxy.settings.get({}).then((config) => {
      const innerProxyEnabled = config.value.proxyType !== "none";
      // Update the proxy status in the popup
      document.getElementById("proxyStatus").innerText = innerProxyEnabled ? "enabled" : "disabled";
  });
}

updateProxyEnabled();

document.getElementById("toggleProxy").addEventListener("click", () => {
  // Send a message to the background script to toggle proxy
  browser.runtime.sendMessage({ toggleProxy: true }).then(response => {
    console.log("Proxy is now " + (response.proxyEnabled ? "enabled" : "disabled"));
    // Also show the proxy status in the popup
    document.getElementById("proxyStatus").innerText = response.proxyEnabled ? "enabled" : "disabled";
  });
});

document.getElementById("save").addEventListener("click", () => {
  let proxyAddress = document.getElementById("proxyAddress").value;
  // Validate the proxy address format here if necessary

  // Send a message to the background script to update the proxy settings
  browser.runtime.sendMessage({ updateProxy: true, proxyAddress: proxyAddress }).then(response => {
    console.log("Proxy settings updated");
  });
});
