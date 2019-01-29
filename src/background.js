import "@babel/polyfill";
import urlUtils from "./utils/urlutil";
import * as JsonData from './data/websites';
import dB from "./utils/db";

const urlUtilsController = new urlUtils();
const dbController = new dB();
let ActiveTabDetails = {
    tabId : null
};

dbController.get("isFirstTimeLoad").then((res) => {
    if(res === undefined) {
        dbController.set(JsonData.blocked_sites).then(() => {
            dbController.set({"isFirstTimeLoad":true});
        });
    }
})
.catch((e)=>{

});

chrome.history.onVisited.addListener(function (details) {
   // urlUtilsController.closeAllCurrentBlockedUrlTabs();
    const promise = urlUtilsController.deleteUrlInHistory(details.url);
    console.log(details.url);
    promise.then((res) => {
        console.log("success" , res);
    })
    .catch((e) => {
        console.log(e);
    });
});

chrome.tabs.onActivated.addListener((activeTabDetail)=>{
    ActiveTabDetails.tabId =  activeTabDetail.tabId;
    chrome.tabs.get(activeTabDetail.tabId , (tab) => {
        dbController.get(urlUtilsController.getHostname(tab.url)).then((res)=>{
            const key = Object.keys(res);
            if(key.length>0)
                chrome.browserAction.setBadgeText({text: '♥'});
            else
                chrome.browserAction.setBadgeText({text: ''});
        }).catch((e)=>{
            console.log("else ",e);
            chrome.browserAction.setBadgeText({text: ''});
        })
    });
});
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    console.log("onUpdated",tabId);
    if(tabId === ActiveTabDetails.tabId) {
        chrome.tabs.get(tabId , (tab) => {
            dbController.get(urlUtilsController.getHostname(tab.url)).then((res)=>{
                const key = Object.keys(res);
                if(key.length>0)
                    chrome.browserAction.setBadgeText({text: '♥'});
                else
                    chrome.browserAction.setBadgeText({text: ''});
            }).catch((e)=>{
                console.log("else ",e);
                chrome.browserAction.setBadgeText({text: ''});
            })
        });
    }
});