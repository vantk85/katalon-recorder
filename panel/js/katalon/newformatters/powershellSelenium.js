$(document).ready(function () {
  newFormatters.powershellSelenium = function (name, commands) {
    var content = powershellSeleniumWebDriver(name).formatter(commands);
    return {
      content: content,
      extension: 'ps1',
      mimetype: 'text/plain'
    }
  }
})


const powershellSeleniumWebDriver = function (scriptName) {
  let _scriptName = scriptName || "";
  const selectStr = "-By {ByType} -value '{ByValue}' -Timeout $DefaultTimeOut -ErrorAction Stop"
  const locatorType = {
    xpath: (target) => {
      return selectStr.replace('{ByType}', 'XPath').replace('{ByValue}', target).replace(/'/g, '"');
    },
    css: (target) => {
      return selectStr.replace('{ByType}', 'CssSelector').replace('{ByValue}', target).replace(/'/g, '"');
    },
    id: (target) => {
      return selectStr.replace('{ByType}', 'Id').replace('{ByValue}', target).replace(/'/g, '"');
    },
    link: (target) => {
      return selectStr.replace('{ByType}', 'LinkText').replace('{ByValue}', target).replace(/'/g, '"');
    },
    name: (target) => {
      return selectStr.replace('{ByType}', 'Name').replace('{ByValue}', target).replace(/'/g, '"');
    },
    tag_name: (target) => {
      return selectStr.replace('{ByType}', 'TagName').replace('{ByValue}', target).replace(/'/g, '"');
    }
  };

  // https://w3c.github.io/webdriver/#keyboard-actions
  const specialKeyMap = {
    '\${KEY_LEFT}': 'ArrowLeft',
    '\${KEY_UP}': 'ArrowUp',
    '\${KEY_RIGHT}': 'ArrowRight',
    '\${KEY_DOWN}': 'ArrowDown',
    '\${KEY_PAGE_UP}': 'PageUp',
    '\${KEY_PAGE_DOWN}': 'PageDown',
    '\${KEY_BACKSPACE}': 'Backspace',
    '\${KEY_DEL}': 'Delete',
    '\${KEY_DELETE}': 'Delete',
    '\${KEY_ENTER}': 'Key.ENTER',
    '\${KEY_TAB}': 'Tab',
    '\${KEY_HOME}': 'Home',
    '\${KEY_END}': 'End'
  };

  // webdriver api
  // https://webdriver.io/docs/api.html
  // katalon
  // https://docs.katalon.com/katalon-recorder/docs/selenese-selenium-ide-commands-reference.html
  const seleneseCommands = {
    "open": "Set-SeUrl '_TARGET_'",

    "click": `$el__STEP_ = Get-SeElement _BY_LOCATOR_
    Invoke-SeClick -Element $el__STEP_`,

    "clickAndWait": `$el__STEP_ = Wait-SeElement _BY_LOCATOR_ -Condition ElementToBeClickable
    $el__STEP_ = Get-SeElement _BY_LOCATOR_
    Invoke-SeClick -Element $el__STEP_`,

    "doubleClick": `$el__STEP_ = Get-SeElement _BY_LOCATOR_
    Invoke-SeClick -Element $el__STEP_ -Action DoubleClick`,

    "doubleClickAndWait": `$el__STEP_ = Wait-SeElement _BY_LOCATOR_ -Condition ElementToBeClickable
    $el__STEP_ = Get-SeElement _BY_LOCATOR_
    Invoke-SeClick -Element $el__STEP_ -Action DoubleClick`,

    "type": `$el__STEP_ = Get-SeElement _BY_LOCATOR_
    Invoke-SeKeys -Element $el__STEP_ -Keys '_VALUE_' -ClearFirst`,

    "typeAndWait": `$el__STEP_ = Wait-SeElement _BY_LOCATOR_ -Condition ElementToBeClickable
    $el__STEP_ = Get-SeElement _BY_LOCATOR_
    Invoke-SeKeys -Element $el__STEP_ -Keys '_VALUE_' -ClearFirst`,

    "pause": "Start-Sleep -Seconds _VALUE_",
    "refresh": "Set-SeUrl -Refresh",
    "sendKeys": `$el__STEP_ = Get-SeElement _BY_LOCATOR_
    Invoke-SeKeys -Element $el__STEP_ -Keys '_VALUE_'`,

    "sendKeysAndWait": `$el__STEP_ = Wait-SeElement _BY_LOCATOR_ -Condition ElementToBeClickable
    $el__STEP_ = Get-SeElement _BY_LOCATOR_
    Invoke-SeKeys -Element $el__STEP_ -Keys '_VALUE_'`,

    "select": "SelectBy-VisibleText _BY_LOCATOR_ '_SELECT_OPTION_'",
    "goBack": "Set-SeUrl -Back",
    "assertConfirmation": "Clear-SeAlert -Action Accept",
    "_assertConfirmation": "Clear-SeAlert -Action Dismiss", // not yet
    "verifyText": "if(_BY_LOCATOR_).toHaveTextContaining(`_VALUE_STR_`);",
    "verifyTitle": "if(browser).toHaveTitle(`_VALUE_STR_`);",
    "verifyValue": "if(_BY_LOCATOR_).toHaveValueContaining(`_VALUE_STR_`)",
    "assertText": "if(_BY_LOCATOR_).toHaveTextContaining(`_VALUE_STR_`);",
    "assertTitle": "if(browser).toHaveTitle(`_VALUE_STR_`);",
    "assertValue": "if(_BY_LOCATOR_).toHaveValueContaining(`_VALUE_STR_`)",
    "waitForAlertPresent": "Wait-SeDriver -Condition AlertState -Value $true",
    "waitForElementPresent": "_BY_LOCATOR_.waitForExist();",
    "waitForValue": `$el__STEP_ = Get-SeElement _BY_LOCATOR_
    $el__STEP_ = Wait-SeElement -Element $el__STEP_ -Condition TextToBePresentInElementValue -ConditionValue '_VALUE_STR_'
    if($el__STEP_) {
      # True
    }`,
    "waitForNotValue": `# TODO: Not Work yet
    $el__STEP_ = Get-SeElement _BY_LOCATOR_
    $el__STEP_ = Wait-SeElement -Element $el__STEP_ -Condition TextToBePresentInElementValue -ConditionValue '_VALUE_STR_'
    if(!$el__STEP_) {
      # True
    }`,

    "storeText": "$_VALUE_STR_ = _BY_LOCATOR_",
    "submit": `$el__STEP_ = Get-SeElement _BY_LOCATOR_
    Invoke-SeKeys -Element $el__STEP_ -Submit`,

    "comment": `# _BY_LOCATOR_ _VALUE_STR_`,
    "waitForVisible": `$el__STEP_ = Wait-SeElement _BY_LOCATOR_ -Condition ElementIsVisible`
    // "dragAndDrop": `# _BY_LOCATOR_ _VALUE_STR_`,
  };

  const header = `Import-Module './Modules/selenium-powershell/Selenium.psd1'
# Start the Selenium Chrome Driver
$url = 'https://www.letmeread.net/'
$downloadPath = 'C:/Data/Download'
# $unpackedExtensionPath = 'C:/Data/Projects/Chrome/katalon-recorder'
# $unpackedExtensionPath1 = 'C:/Users/vtang2/AppData/Local/Microsoft/Edge/User Data/Default/Extensions/odfafepnkmbhccpbejgmiehpchacaeak/1.59.0_0'
$Options = New-SeDriverOptions -Browser Chrome -StartURL $url -State Maximized -DefaultDownloadPath $downloadPath
# $Options.AddArgument('--load-extension=' + $unpackedExtensionPath + ',' + $unpackedExtensionPath1)
Start-SeDriver -Options $Options
`;

  const footer = ``;

  function formatter(commands) {

    return header.replace(/_SCRIPT_NAME_/g, _scriptName) +
      commandExports(commands).content +
      footer;
  }

  function commandExports(commands) {

    return commands.reduce((accObj, commandObj) => {
      if (typeof (accObj) == "undefined") {
        accObj = { content: "" };
      }

      let { command, target, value } = commandObj;
      let cmd = seleneseCommands[command];
      if (typeof (cmd) == "undefined") {
        if (command == "selectFrame") {
          switch (target) {
            case 'relative=parent':
              accObj.content += `Switch-SeFrame -Parent\n`;
              return accObj;
            case 'relative=root':
              accObj.content += `Switch-SeFrame -Root\n`;
              return accObj;

            default:
              let frameIndex = target.trim().split("=", 2)[1];
              accObj.content += `Switch-SeFrame -Frame ${frameIndex}\n`;
              return accObj;
          }
        } else {
          accObj.content += `\n\n\t// WARNING: unsupported command ${command}. Object= ${JSON.stringify(commandObj)}\n\n`;
        }
        return accObj;
      }

      let funcStr = cmd;

      let targetStr = target.trim().replace(/'/g, "\\'")
        .replace(/"/g, '\\"');

      let valueStr = value.trim().replace(/'/g, "\\'")
        .replace(/"/g, '\\"');

      let selectOption = value.trim().split("=", 2)[1];

      let locatorStr = locator(target);

      funcStr = funcStr.replace(/_STEP_/g, accObj.step)
        .replace(/_TARGET_STR_/g, targetStr)
        .replace(/_BY_LOCATOR_/g, locatorStr)
        .replace(/_TARGET_/g, target)
        .replace(/_SEND_KEY_/g, specialKeyMap[value])
        .replace(/_VALUE_STR_/g, valueStr)
        .replace(/_VALUE_/g, value)
        .replace(/_SELECT_OPTION_/g, selectOption);

      accObj.step += 1;
      accObj.content += `${funcStr}\n`

      return accObj;
    }, { step: 1, content: "" });
  }

  function locator(target) {
    let locType = target.split("=", 1);
    let selectorStr = target.substr(target.indexOf("=") + 1, target.length);
    let locatorFunc = locatorType[locType];
    if (typeof (locatorFunc) == 'undefined') {
      return `'${target.replace(/'/g, '"')}'`;
    }

    return locatorFunc(selectorStr);
  }

  return {
    formatter,
    locator
  };
}

