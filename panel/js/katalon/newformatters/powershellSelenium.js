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
  const locatorType = {
    xpath: (target) => {
      return `([OpenQA.Selenium.By]::XPath('${target.replace(/'/g, '"')}'))`;
    },
    css: (target) => {
      return `([OpenQA.Selenium.By]::CssSelector('${target.replace(/'/g, '"')}'))`;
    },
    id: (target) => {
      return `([OpenQA.Selenium.By]::Id('${target.replace(/'/g, '"')}'))`;
    },
    link: (target) => {
      return `([OpenQA.Selenium.By]::LinkText('${target.replace(/'/g, '"')}'))`;
    },
    name: (target) => {
      return `([OpenQA.Selenium.By]::Name('${target.replace(/'/g, '"')}'))`;
    },
    tag_name: (target) => {
      return `'${target.replace(/"/g, "\'")}'`;
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
    "open": "$GLobal:Selenium.Navigate().GoToUrl('_TARGET_')",
    "click": "$el__STEP_ = Selenium-Click _BY_LOCATOR_",
    "clickAndWait": "$el__STEP_ = Selenium-Click _BY_LOCATOR_",
    "doubleClick": "$el__STEP_ = Selenium-DoubleClick _BY_LOCATOR_",
    "doubleClickAndWait": "#wait\n$el__STEP_ = Selenium-DoubleClick _BY_LOCATOR_\n",
    "type": "$el__STEP_ = Selenium-SetText _BY_LOCATOR_ '_VALUE_'",
    "typeAndWait": "$el__STEP_ = Selenium-SendKeys _BY_LOCATOR_ '_VALUE_' # Wait",
    "pause": "$GLobal:Selenium.Navigate().pause(_VALUE_)",
    "refresh": "$GLobal:Selenium.Navigate().refresh()",
    "sendKeys": "$el__STEP_ = Selenium-SendKeys _BY_LOCATOR_ _SEND_KEY_",
    "sendKeysAndWait": "$el__STEP_ = Selenium-SendKeys _BY_LOCATOR_ '_SEND_KEY_' # '_VALUE_'",
    "select": "SelectBy-VisibleText _BY_LOCATOR_ '_SELECT_OPTION_'",
    "goBack": "$GLobal:Selenium.Navigate().Back()",
    "assertConfirmation": "$GLobal:Selenium.switchTo().alert().Accept()",
    "verifyText": "if(_BY_LOCATOR_).toHaveTextContaining(`_VALUE_STR_`);",
    "verifyTitle": "if(browser).toHaveTitle(`_VALUE_STR_`);",
    "verifyValue": "if(_BY_LOCATOR_).toHaveValueContaining(`_VALUE_STR_`)",
    "assertText": "if(_BY_LOCATOR_).toHaveTextContaining(`_VALUE_STR_`);",
    "assertTitle": "if(browser).toHaveTitle(`_VALUE_STR_`);",
    "assertValue": "if(_BY_LOCATOR_).toHaveValueContaining(`_VALUE_STR_`)",
    "waitForAlertPresent":
      "browser.waitUntil(function() {\n" +
      "\t\t\treturn browser.getAlertText()\n" +
      "\t\t})",
    "waitForElementPresent": "_BY_LOCATOR_.waitForExist();",
    "waitForValue":
      "$el__STEP_ = _BY_LOCATOR_;\n" +
      "\t\tbrowser.waitUntil(() => el__STEP_.getValue() === `_VALUE_STR_`);",
    "waitForNotValue":
      "$el__STEP_ = _BY_LOCATOR_;\n" +
      "\t\tbrowser.waitUntil(() => el__STEP_.getValue() !== `_VALUE_STR_`);",
    "waitForVisible": "_BY_LOCATOR_.waitForDisplayed();",
    "selectFrame": ""
  };

  const header =
    "$ScriptPath = 'C:/Data/Projects/PowerShell/Demo'\n" +
    "# Set-Location $ScriptPath'\n" +
    "Import-Module './Modules/selenium-powershell/Selenium.psd1'\n\n" +
    "# Start the Selenium Chrome Driver\n\n" +
    "Start-SeDriver -Browser Chrome -StartURL 'https://google.com'\n";

  const footer = "\t});\n\n});";

  function formatter(commands) {

    return header.replace(/_SCRIPT_NAME_/g, _scriptName) +
      commandExports(commands).content +
      footer;
  }

  function commandExports(commands) {

    return commands.reduce((accObj, commandObj) => {
      let { command, target, value } = commandObj;
      let cmd = seleneseCommands[command];
      if (typeof (cmd) == "undefined") {
        accObj.content += `\n\n\t// WARNING: unsupported command ${command}. Object= ${JSON.stringify(commandObj)}\n\n`;
        return accObj;
      }

      let funcStr = cmd;

      if (typeof (accObj) == "undefined") {
        accObj = { content: "" };
      }

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
      accObj.content += `\t\t${funcStr}\n`

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

