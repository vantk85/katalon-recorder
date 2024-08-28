var _gaq = _gaq || []; // DO NOT REMOVE THIS LINE

var manifestData = browser.runtime.getManifest();

var katalonEndpoint = manifestData.homepage_url;
// var testOpsEndpoint = 'https://analytics.katalon.com';
var testOpsEndpoint = 'http://localhost:8444';
var testOpsUrls = {
    getFirstProject: `${testOpsEndpoint}/api/v1/projects/first`,
    getUploadUrl: `${testOpsEndpoint}/api/v1/files/upload-url`,
    getUploadUrlAvatar: `${testOpsEndpoint}/api/v1/files/upload-url-avatar`,
    getUserInfo: `${testOpsEndpoint}/api/v1/users/me`,
    uploadBackup: `${testOpsEndpoint}/api/v1/katalon-recorder/backup`,
    uploadTestReports: `${testOpsEndpoint}/api/v1/katalon-recorder/test-reports`,
}

// for Selenium IDE
// function Log() {
// }

// Log.prototype = console;

this.log = console; // remove Selenium IDE Log



// store window size upon resizing
$(window).on('resize', function () {
    var data = {
        window: {
            width: window.outerWidth,
            height: window.outerHeight
        }
    };
    browser.storage.local.set(data);
});



// modify and add handler for command grid toolbar buttons
$(function () {

    //move select and find buttons to the toolbar using js in order not to modify HTML
    // var pasteButton = $('#grid-paste-btn');
    // var selectElementButton = $('#selectElementButton');
    // var showElementButton = $('#showElementButton');
    // selectElementButton.removeClass('btn_sf');
    // showElementButton.removeClass('btn_sf');
    // pasteButton.after(showElementButton).after(selectElementButton);
    var selectElementButton = $('#selectElementButton');
    var showElementButton = $('#showElementButton');
    selectElementButton.text("");
    showElementButton.text("");
});

function addContextMenuButton(id, node, menu, type) {
    var buttonWrapper = document.createElement('div');
    buttonWrapper.innerHTML = '<button class="btn-more"><img src="/katalon/images/SVG/more-icon.svg" alt="More" title="More"></button>';
    var button = buttonWrapper.firstChild;
    node.appendChild(button);
    button.addEventListener("click", function (event) {
        event.stopPropagation();
        if (type === "case") {
            setSelectedCase(id);
        } else if (type === "suite") {
            setSelectedSuite(id);
        }
        var mid = "#" + "menu" + id;
        $(".menu").css("left", event.pageX);
        $(".menu").css("top", event.pageY);
        $(mid).show();

    }, false);

}
//KAT-END



// KAT-BEGIN Show/hide bottom panel
$(function () {
    $('#show-hide-bottom-panel').click(function (e) {
        e.stopPropagation();
        var $bottomContent = $('#tab4');
        $bottomContent.toggle();
        var $icon = $("#show-hide-bottom-panel img");
        // total height = 100% - 20px (toolbar)
        if ($bottomContent.is(":hidden")) {
            $('#log-section').css("height", "38px");
            // $(this).parent().get(0).title = "Show";
            $icon.attr("src", $icon.data("show"));
        } else {
            $('#log-section').css("height", "30%");
            // $(this).parent().get(0).title = "Hide";
            $icon.attr("src", $icon.data("hide"));
        }
    });
});
// KAT-END

// KAT-BEGIN styling log/reference when clicked
$(function () {
    var logLi = $('#history-log');
    var referenceLi = $('#reference-log');
    var variableLi = $('#variable-log');
    var screenshotLi = $('#screenshot');
    var selfHealingLi = $('#self-healing');
    var lis = [logLi, referenceLi, variableLi, screenshotLi, selfHealingLi];

    var logContainer = $('#logcontainer');
    var referenceContainer = $('#refercontainer');
    var variableContainer = $('#variablecontainer');
    var screenshotContainer = $('#screenshotcontainer');
    var dataContainer = $('#datacontainer');
    var extensionsContainer = $('#extensionscontainer');
    var selfHealingContainer = $('#selfHealingContainer');
    var containers = [logContainer, referenceContainer, variableContainer, screenshotContainer, dataContainer, extensionsContainer, selfHealingContainer];

    var clearLog = $('#clear-log');
    var saveLog = $('#save-log');
    var upload = $('#ka-upload');

    var downloadAll = $('#download-all');

    var selfHealingSelect = $("#select-self-healing-test-status");

    setActiveTab(logLi, logContainer);

    logLi.on("click", function () {
        setActiveTab(logLi, logContainer);
    });
    referenceLi.on("click", function () {
        setActiveTab(referenceLi, referenceContainer);
    });
    variableLi.on("click", function () {
        setActiveTab(variableLi, variableContainer);
    });
    screenshotLi.on("click", function () {
        setActiveTab(screenshotLi, screenshotContainer);
    });

    selfHealingLi.on('click', function () {
        setActiveTab(selfHealingLi, selfHealingContainer);
    })



    function setActiveTab(li, container) {
        for (var i = 0; i < lis.length; i++) {
            lis[i].removeClass("active");
        }
        li.addClass("active");

        for (var i = 0; i < containers.length; i++) {
            containers[i].hide();
        }
        container.show();

        if (li == logLi) {
            // upload.show();
            saveLog.show();
            clearLog.show();
            downloadAll.hide();
            selfHealingSelect.hide();
        } else if (li == screenshotLi) {
            // upload.hide();
            saveLog.hide();
            clearLog.hide();
            downloadAll.show();
            selfHealingSelect.hide();
        } else if (li == selfHealingLi) {
            saveLog.hide();
            clearLog.hide();
            downloadAll.hide();
            selfHealingSelect.show();
        }
        else {
            // upload.hide();
            saveLog.hide();
            clearLog.hide();
            downloadAll.hide();
            selfHealingSelect.hide();
        }
        // if (li !== logLi) {
        //     clearLog.parent().hide();
        // } else {
        //     clearLog.parent().show();
        // }
    }
});

// KAT-END
var settingWindowID;
// KAT-BEGIN handle click event for settings button
$(function () {
    function openPanel() {
        let height = 740;
        let width = 820;
        browser.windows.create({
            url: browser.runtime.getURL("setting-panel/index.html"),
            type: "popup",
            height: height,
            width: width,
            focused: true,
        }).then(panel => settingWindowID = panel.id);
    }
    $("#settings").on("click", function () {
        if (settingWindowID === undefined) {
            openPanel();
        } else {
            browser.windows.update(settingWindowID, {
                focused: true
            }).catch(function () {
                settingWindowID = undefined;
                openPanel();
            });
        }
    });
});
// KAT-END

// KAT-BEGIN add tooltip for button
$(function () {
    $('#record').attr('title', "Click and navigate to the desired browser tab and record your tests. NOTE: If the tab has been opened before Katalon Recorder was installed, please refresh it.");
    $('#playback').attr('title', "Run selected test case on the active tab, any interference may stop the process. NOTE: If the tab has been opened before Katalon Recorder was installed, please refresh it.");
    $('#playSuite').attr('title', "Run selected test suite on the active tab, any interference may stop the process. NOTE: If the tab has been opened before Katalon Recorder was installed, please refresh it.");
    $('#playSuites').attr('title', "Run all test suites on the active tab, any interference may stop the process. NOTE: If the tab has been opened before Katalon Recorder was installed, please refresh it.");
    $('#extended-features').attr('title', "Daily usage");
    $('#settings').attr('title', "Settings");
    $('.sub_btn#help').attr('title', "Help");
    $('#selectElementButton').attr('title', "Select a target element for the current command");
    $('#showElementButton').attr('title', "Find and highlight the curent target element of the current command");
    $('#speed').attr('title', "Adjust play speed");
    $('#new').attr('title', "Create new test case");
    $('#export').attr('title', "Export the current test case to script in C#, Java, Ruby, Python, (Katalon Studio) Groovy, or Robot Framework");
    $('#suite-open').attr('title', "Open test suite");
    $('#suite-plus').attr('title', "Create new test suite");
})
// KAT-END

// KAT-BEGIN modify log
// $(function() {
//     var logContainer = document.getElementById('logcontainer');

//     var callback = function(mutationList) {
//         for (var mutation of mutationList) {
//             if (mutation.type == "childList") {
//                 var nodes = mutation.addedNodes;
//                 for (var i = 0; i < nodes.length; i++) {
//                     var node = nodes[i];
//                     var text = node.textContent;
//                     if (node.className.indexOf('log-info') != -1) {
//                         text = "[INFO]  " + text.substring("[info] ".length);
//                     } else if (node.className.indexOf('log-error') != -1) {
//                         text = "[ERROR] " + text.substring("[error] ".length);
//                     }

//                     if (text.includes("Executing:")) {
//                         text = text.substring(0, text.indexOf("|")) + text.substring(text.indexOf("|") + 1, text.lastIndexOf("|"));
//                     }
//                     node.textContent = text;
//                 }
//             }
//         }
//     }

//     var observer = new MutationObserver(callback);
//     observer.observe(logContainer, { childList: true });
// })
// KAT-END

// KAT-BEGIN add pulse animation for record button
// $(function() {
//     var record = $('.sub_btn#record');
//     record.on('click', function() {
//         if (record.text().trim() === "Stop") {
//             switchRecordButton(false);
//         } else {
//             switchRecordButton(true);
//         }
//     });
// })
// KAT-END

$(function () {
    var slider = $('#slider');
    var sliderContainer = $('#slider-container');
    var speedButton = $('#speed');

    slider.slider({
        min: 0,
        max: 3000,
        value: 0,
        step: 600,
        orientation: 'vertical'
    }).slider("pips", {
        rest: "label", labels: ["Fast", "", "", "", "", "Slow"]
    });
    sliderContainer.append(slider);
    slider.show();

    speedButton.on("click", function () {
        sliderContainer.toggle();
    });
})
// KAT-END

// KAT-BEGIN log variables
function handleDisplayVariables() {
    var varGridBody = $('#variable-grid tbody');
    varGridBody.empty();
    for (var variable in declaredVars) {
        var value = declaredVars[variable];
        var cellName = $('<td></td>');
        cellName.text(variable);
        var cellType = $('<td></td>');
        cellType.text(typeof value);
        var cellValue = $('<td></td>');
        cellValue.text(value);
        cellValue.attr('title', value);
        var row = $('<tr></tr>');
        row.append(cellName);
        row.append(cellType);
        row.append(cellValue);
        varGridBody.append(row);
    }
}
// KAT-END

// KAT-BEGIN add handler for button "New" click event
$(function () {
    $('#new').on('click', function () {
        saveOldCase();
        $('#add-testCase').click();
    });
});
// KAT-END

// KAT-BEGIN modify toolbar buttons
$(function () {
    // var record = $('#record');
    // var newCase = $('#new');
    // record.after(newCase);

    var imagesLookup = {
        "#record": "record.svg",
        "#playback": "play.svg",
        "#stop": "pause.svg",
        "#playSuite": "play-suite.svg",
        "#playSuites": "play-all.svg",
        "#pause": "pause.svg",
        "#resume": "play.svg",
        "#notification": "notify.svg",
        "#referral": "gift.svg",
        "#more": "more.svg"
    };

    // These images need to set margin to 0
    var imagesLookup2 = {
        "#settings": "setting-icon-16.svg",
        ".sub_btn#help": "help-icon-16.svg",
        "#github-repo": "github-icon.png",
        "#extended-features": "extended-features.svg",
        "#speed": "speed-icon-16.svg",
        "#github": "github-icon.svg"
    };

    for (var buttonId in imagesLookup) {
        if (imagesLookup.hasOwnProperty(buttonId)) {
            var button = $(buttonId);
            var img = $("<img>");
            img.attr("src", "./icons/" + imagesLookup[buttonId]);
            button.find("i:first-child").remove();
            button.prepend(img);
        }
    }

    for (var buttonId in imagesLookup2) {
        if (imagesLookup2.hasOwnProperty(buttonId)) {
            var button = $(buttonId);
            var img = $("<img>");
            img.attr("src", "/katalon/images/SVG/" + imagesLookup2[buttonId]);
            // img.attr("style", "margin-right: 0px;");
            button.find("i:first-child").remove();
            button.prepend(img);
        }
    }
});
// KAT-END

// KAT-BEGIN add handler for button "Profile" click event
$('#extended-features').click(() => {
    $('#dailyUsage').click();
});

$('#more').click(() => {
    $('#myDropdown').toggle();
});
// KAT-END

$(function () {
    $(document).attr('title', 'Katalon Recorder ' + manifestData.version)
});

// KAT-BEGIN clear "Save" and "Clear" text
$(function () {
    var saveLog = $('#save-log a');
    var clearLog = $('#clear-log a');

    saveLog.empty();
    clearLog.empty();
})
// KAT-END

function switchRecordButton(stop) {
    var record = $('#record');
    if (stop) {
        record.find('img').attr('src', '/katalon/images/SVG/record-icon-16.svg');
        record.removeClass("record--stop");
    } else {
        record.find('img').attr('src', '/katalon/images/SVG/record-stop-icon-16.svg');
        record.addClass("record--stop");
    }
}

// KAT-BEGIN disable event propagation when double clicking command toolbar fieldset
$(function () {
    $('#command-toolbar .fieldset').on("dblclick", function (event) {
        event.stopPropagation();
    });
})
// KAT-END


function logTime() {
    var now = new Date();
    sideex_log.info("Time: " + now + " Timestamp: " + now.getTime());
}

function logStartTime() {
    logTime();
    sideex_log.info('OS: ' + (bowser.osname || '') + ' Version: ' + (bowser.osversion || ''));
    sideex_log.info('Browser: ' + (bowser.name || '') + ' Version: ' + (bowser.version || ''));
    sideex_log.info('If the test cannot start, please refresh the active browser tab');
}

function logEndTime() {
    logTime();
}


// //for test
// function addSampleDataToScreenshot() {
// }

// .then(function(downloadId) {
//     var saveListener = function(delta) {
//         if (delta.id === downloadId && delta.state && delta.state.current === 'complete') {
//             $('a.downloadable-screenshot').each(function() {
//                 var $this = $(this);
//                 var href = $this.attr('href');
//                 var title = $this.attr('title');
//                 var a = document.createElement('a');
//                 a.title = title;
//                 a.download = title;
//                 a.href = href;
//                 // firefox doesn't support `a.click()`...
//                 a.dispatchEvent(new MouseEvent('click'));
//             });
//         }
//     };
//     browser.downloads.onChanged.addListener(saveListener);
// });


// KAT-BEGIN handle event for help button click
$(function () {
    $('#help.sub_btn').on('click', function () {
        $("#helpDialog").dialog({
            autoOpen: false,
            modal: true,
            height: "auto",
            width: "584px",
            dialogClass: "help-dialog",
            draggable: false,
            resize: function (event, ui) {
                var size = ui.size;
                var helpDialog = $('#helpDialog');
                if (size.width <= 350) {
                    helpDialog.addClass('small');
                } else {
                    helpDialog.removeClass('small');
                }
            },
            open: function (event, ui) {
                $('.ui-widget-overlay').addClass("dim-overlay");
            },
            close: function (event, ui) {
                $('#helpDialog').removeClass('small');
                $('.ui-widget-overlay').removeClass("dim-overlay");
            }
        })
            .parent()
            .draggable();

        $('#helpDialog').dialog("open");

        $('#helpDialog-close').on("click", function () {
            $('#helpDialog').dialog("close");
        });
    });
});

function evalIfCondition(expression) {
    return eval(expandForStoreEval(expression));
}

function isVarName(str) {

    if (str.trim() !== str) {
        return false;
    }

    try {
        new Function(str, 'var ' + str);
    } catch (e) {
        return false;
    }

    return true;
}

function expandForStoreEval(expression) {
    var variables = '';
    for (var i in declaredVars) {
        if (isVarName(i)) {
            variables += 'var ' + i + '=' + JSON.stringify(declaredVars[i]) + ';';
        }
    }
    var mergedVars = Object.assign({}, storedVars, declaredVars);
    variables += 'var storedVars = ' + JSON.stringify(mergedVars) + ';';
    return variables + expression;
}

browser.runtime.onMessage.addListener(handleFormatCommand);

