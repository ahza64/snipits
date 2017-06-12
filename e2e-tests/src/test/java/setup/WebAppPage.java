package setup;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Action;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;

import java.awt.AWTException;
import java.awt.Robot;
import java.awt.event.KeyEvent;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

import constants.Constants;

/**
 * Created by az on 4/6/17.
 */

public class WebAppPage
{
    public static WebDriver driver;
    JavascriptExecutor javascriptExecutor;
    public static Logger LOGGER = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);

    public void launchWebsite()
    {
        driver = Driver.startChromeBrowser();
        waitForPageLoadComplete();
        PageFactory.initElements(driver, this);
        String windowSize = System.getProperty("windowSize","");
        if(windowSize.equals(""))
            maximizeWindow();
    }

    public WebDriver getDriver()
    {
        return driver;
    }

    public void openURL(String url)
    {
        driver.get(url);
    }

    public void waitForPageLoadComplete()
    {
        waitForPageLoad(Constants.MAX_TIMEOUT_PAGE_LOAD);
        waitForAjaxCompletion();
        return;
    }

    public void waitForPageLoad(int timeout)
    {
        Wait<WebDriver> wait = new FluentWait<WebDriver>(driver).withTimeout(timeout, TimeUnit.SECONDS).pollingEvery(3, TimeUnit.SECONDS).ignoring(NoSuchElementException.class,WebDriverException.class);
        wait.until(new ExpectedCondition<Boolean>()
        {
            public Boolean apply(WebDriver driver)
            {
                String result = (String)getJavascriptExecutor().executeScript("return document.readyState");
                if(result == null)
                    return false;
                else
                    return result.equals("complete");
            }
        });
        return;
    }

    public JavascriptExecutor getJavascriptExecutor()
    {
        if(javascriptExecutor == null)
            javascriptExecutor = (JavascriptExecutor) driver;
        return javascriptExecutor;
    }

    public void maximizeWindow()
    {
        driver.manage().window().maximize();
    }

    public void windowResize(int height, int width)
    {
        Dimension d = new Dimension(width, height);
        driver.manage().window().setSize(d);
    }

    public void clearAndType(WebElement e, String text)
    {
        e.clear();
        e.sendKeys(text);
    }

    public void appendText(WebElement e, String text)
    {
        e.sendKeys(text);
    }

    public void assertTitle(String s)
    {
        Assert.assertEquals(s, driver.getTitle(), "Expected HTML Title '"+ s + "' Actual - '"+ driver.getTitle());
    }

    public void assertText(String s)
    {
        Assert.assertTrue(getPageSource().contains(s),"Expected text '"+s+"' not present in HTML source");
    }

    public String getPageSource()
    {
        return driver.getPageSource();
    }

    public void waitForVisible(WebElement e)
    {
        WebDriverWait wait = new WebDriverWait(driver, Constants.VISIBILITY_TIMEOUT_IN_SEC);
        if(!isElementPresent(e))
        {
            try
            {
                wait.until(ExpectedConditions.visibilityOf(e));
            }catch(Exception ex)
            {
                ex.printStackTrace();
                return;
            }
        }
    }

    public void waitForVisible(By locator) throws MalformedURLException {
        waitForVisible(locator, Constants.VISIBILITY_TIMEOUT_IN_SEC);
    }

    public void waitForVisible(By locator, int timeoutInSecs) throws MalformedURLException {
        WebDriverWait wait = new WebDriverWait(driver, timeoutInSecs);
        if(!isElementPresent(locator))
        {
            try
            {
                wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
            }catch(Exception ex)
            {
                ex.printStackTrace();
                return;
            }
        }
    }

    public void waitForElementToBeEnabled(WebElement e)
    {
        final WebElement element = e;
        Wait<WebDriver> wait = new FluentWait<WebDriver>(driver).withTimeout(Constants.WAIT_ONE_MIN, TimeUnit.SECONDS).pollingEvery(1, TimeUnit.SECONDS).ignoring(NoSuchElementException.class);
        wait.until(new ExpectedCondition<Boolean>() {
            public Boolean apply(WebDriver driver)
            {
                return element.isEnabled();
            }
        });
        return;
    }

    public void waitForElementToBeEnabled(By locator)
    {
        final By b = locator;
        Wait<WebDriver> wait = new FluentWait<WebDriver>(driver).withTimeout(Constants.WAIT_ONE_MIN, TimeUnit.SECONDS).pollingEvery(1, TimeUnit.SECONDS).ignoring(NoSuchElementException.class);
        wait.until(new ExpectedCondition<Boolean>() {
            public Boolean apply(WebDriver driver)
            {
                return driver.findElement(b).isEnabled();
            }
        });
        return;
    }

    public void waitForElementToBeClickable(By locator)
    {
        WebDriverWait wait = new WebDriverWait(driver, Constants.WAIT_ONE_MIN);
        try
        {
            wait.until(ExpectedConditions.elementToBeClickable(locator));
        }catch(Exception ex)
        {
            ex.printStackTrace();
            return;
        }

    }

    public Boolean isElementPresent(WebElement e)
    {
        try
        {
            e.getAttribute("innerHTML");
        }
        catch(Exception ex)
        {
            return false;
        }
        return true;
    }

    public boolean isElementPresentAndDisplayed(WebElement e)
    {
        try
        {
            return isElementPresent(e) && e.isDisplayed();
        }
        catch(Exception ex)
        {
            return false;
        }
    }

    public boolean isElementPresentAndDisplayedByLocator(By locator)
    {
        try
        {
            return isElementPresentAndDisplayed(driver.findElement(locator));
        }
        catch(Exception e)
        {
            return false;
        }
    }

    public boolean hoverOverElement(WebElement element)
    {
        try
        {
            Actions builder = new Actions(driver);
            Actions hoverOver = builder.moveToElement(element);
            hoverOver.perform();
            holdOn(500);
            return true;
        }
        catch(Exception ex)
        {
            ex.printStackTrace();
            return false;
        }
    }

    public boolean hoverOverElement(By locator)
    {
        try
        {
            Actions builder = new Actions(driver);
            Actions hoverOver = builder.moveToElement(driver.findElement(locator));
            hoverOver.perform();
            holdOn(500);
            return true;
        }
        catch(Exception ex)
        {
            ex.printStackTrace();
            return false;
        }
    }

    public void hoverOverElementUsingJS(WebElement element)
    {
        String js = "if(document.createEvent){var evObj = document.createEvent('MouseEvents');evObj.initEvent('mouseover',true, false); arguments[0].dispatchEvent(evObj);} else if(document.createEventObject) { arguments[0].fireEvent('onmouseover');}";
        getJavascriptExecutor().executeScript(js, element);
        holdOn(1000);
    }

    public void holdOn(long millis)
    {
        try
        {
            Thread.sleep(millis);
        }
        catch(Exception e)
        {
            LOGGER.warning(e.getMessage());
        }
    }

    public void holdOnForASec()
    {
        holdOn(1000);
    }

    public void holdOnForACoupleOfSec()
    {
        holdOn(2000);
    }

    public void clickOnElement(WebElement e)
    {
        e.click();
        holdOn(500);
    }

    public void clickOnElement(By locator)
    {
        driver.findElement(locator).click();
    }

    public void waitForElementToDisappear(By locator) throws MalformedURLException {
        WebDriverWait wait = new WebDriverWait(driver, Constants.WAIT_ONE_MIN);
        if(isElementPresent(locator))
        {
            try
            {
                wait.until(ExpectedConditions.invisibilityOfElementLocated(locator));
            }catch(Exception ex)
            {
                ex.printStackTrace();
                return;
            }
        }
    }

    public void waitForElementToDisappear(WebElement e)
    {
        WebDriverWait wait = new WebDriverWait(driver, Constants.WAIT_TWO_MIN);
        if(isElementPresent(e))
        {
            try
            {
                wait.until(invisibilityOfElementLocated(e));
            }catch(Exception ex)
            {
                ex.printStackTrace();
                return;
            }
        }
    }

    public boolean waitForElementToHaveText(WebElement e, String text)
    {
        try
        {
            WebDriverWait wait = new WebDriverWait(driver, Constants.VISIBILITY_TIMEOUT_IN_SEC);
            wait.until(ExpectedConditions.textToBePresentInElement(e, text));
            return true;
        }
        catch (Exception ex)
        {
            ex.printStackTrace();
            return false;
        }
    }

    public void waitForElementToHaveAttribute(WebElement e, String attribute, String attributeValue)
    {
        WebDriverWait wait = new WebDriverWait(driver, Constants.WAIT_ONE_MIN);
        try
        {
            wait.until(textToBePresentInElementAttribute(e, attribute, attributeValue));
        }
        catch(Exception ex)
        {
            ex.printStackTrace();
            return;
        }
    }

    public ExpectedCondition<Boolean> textToBePresentInElementAttribute(final WebElement element, final String attribute, final String attributeValue) {
        return new ExpectedCondition<Boolean>() {
            public Boolean apply(WebDriver driver) {
                try
                {
                    String attributeText = element.getAttribute(attribute);
                    if(attributeText != null) {
                        return attributeText.contains(attributeValue);
                    } else {
                        return false;
                    }
                } catch(StaleElementReferenceException e) {
                    return null;
                }
            }

            public String toString() {
                return String.format("Text - (%s) to be the value of (%s) attribute of element (%s)",attributeValue, attribute, element);
            }
        };
    }

    public ExpectedCondition<Boolean> invisibilityOfElementLocated(final WebElement element) {
        return new ExpectedCondition<Boolean>() {
            public Boolean apply(WebDriver driver) {
                try
                {
                    return !(element.isDisplayed());
                }catch (NoSuchElementException e) {
                    return true;
                }catch (StaleElementReferenceException e){
                    return true;
                }
            }
        };
    }

    public void refresh()
    {
        driver.navigate().refresh();
        //ajaxTrackerUpdate();
    }

    public void waitForAjaxCompletion()
    {

        holdOn(500);
        try
        {
            ExpectedCondition<Boolean> isLoadingFalse = new ExpectedCondition<Boolean>() {

                @Override
                public Boolean apply(WebDriver driver) {
                    try {
                        Long jQueryState = (Long)((JavascriptExecutor)driver).executeScript("return jQuery.active");
                        String jsState = ((JavascriptExecutor)driver).executeScript("return document.readyState").toString();
                        return (jQueryState==0 && jsState.equals("complete"));
                    }
                    catch (Exception e) {
                        return true;
                    }
                }
            };

            Wait<WebDriver> wait = new FluentWait<WebDriver>(driver).
                    withTimeout(Constants.WAIT_ONE_MIN, TimeUnit.SECONDS).
                    pollingEvery(500, TimeUnit.MILLISECONDS).
                    ignoring(NoSuchElementException.class);
            wait.until(isLoadingFalse);
        }
        catch(Exception e)
        {
        }
    }

    public boolean isElementPresent(By locator) throws MalformedURLException {
        return driver.findElements(locator).size() != 0;
    }

    public void scrollToElement(WebElement element)
    {
        getJavascriptExecutor().executeScript("arguments[0].scrollIntoView(false)",element);
        holdOn(500);
    }

    public boolean waitForAlert()
    {
        try
        {
            WebDriverWait wait = new WebDriverWait(driver, Constants.VISIBILITY_TIMEOUT_IN_SEC);
            wait.until(ExpectedConditions.alertIsPresent());
            return true;
        }
        catch (Exception e)
        {
            e.printStackTrace();
            return false;
        }
    }

    public boolean isAlertPresent()
    {
        try
        {
            driver.switchTo().alert();
            return true;
        }
        catch(Exception e)
        {
            e.printStackTrace();
            return false;
        }
    }

    public Alert switchToAlert() throws Exception
    {
        Alert alert = driver.switchTo().alert();
        return alert;
    }

    public String getAlertText() throws Exception
    {
        return switchToAlert().getText();
    }

    public void dismissAlertIfPresent(boolean shouldWait) throws Exception
    {
        boolean dismissed = false;
        if(shouldWait)
        {
            if(waitForAlert())
            {
                switchToAlert().accept();
                dismissed = true;
            }
        }
        else
        {
            holdOn(1000);
            if(isAlertPresent()){
                switchToAlert().accept();
                dismissed = true;
            }
        }
        if(!dismissed)
            LOGGER.warning("No Alert to dismiss");
    }

    protected JSONObject readJSONFile(String filePath, String fileName)
    {
        JSONObject jsonObject = null;
        JSONParser parser = new JSONParser();

        try
        {
            Object obj = parser.parse(new FileReader(filePath + fileName));

            jsonObject = (JSONObject) obj;
        } catch (Exception e)
        {
            LOGGER.info(filePath + fileName + " NOT FOUND");
        }
        return jsonObject;
    }

    public int getEntriesInTable() throws MalformedURLException
    {
        int totalEnteriesInTable = 0;
        if(isElementPresent(By.xpath(".//*[@class='row']/descendant::tr")))
        {
            totalEnteriesInTable = driver.findElements(By.xpath(".//*[@class='row']/descendant::tr")).size();
        }
        return totalEnteriesInTable;
    }

    protected void selectEntity(String entityType, int namePostFix, String buttonLocator, String dropDownLocator) throws MalformedURLException
    {
        clickOnElement(By.xpath(buttonLocator));
        waitForVisible(By.xpath(dropDownLocator));
        if(entityType.contentEquals("Company"))
        {
            holdOnForASec();
            scrollToElement(driver.findElement(By.xpath(dropDownLocator + "/descendant::div[text()='" + entityType + namePostFix + "']")));
        }
        holdOnForASec();
        clickOnElement(By.xpath(dropDownLocator + "/descendant::div[text()='" + entityType + namePostFix + "']"));
        LOGGER.info(entityType + " is Selected");
        holdOnForASec();
    }

    public void createFile(int namePostFix)
    {
        try (Writer writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream("myFile" + namePostFix + ".txt"), StandardCharsets.UTF_8))) {
            writer.write("TextToWrite");
        }
        catch (IOException e)
        {
            e.printStackTrace();
        }
    }

    public void deleteFile(int namePostFix)
    {
        try{

            File file = new File("myFile" + namePostFix + ".txt");

            if(file.delete())
            {
                LOGGER.info(file.getName() + " is deleted!");
            }
            else
            {
               LOGGER.info("Delete operation is failed.");
            }

        }catch(Exception e)
        {
            e.printStackTrace();
        }
    }

    private void sendKeysDialogBox(Robot robot, String fileName) throws AWTException
    {
        for (char c : fileName.toCharArray())
        {
            int keyCode = KeyEvent.getExtendedKeyCodeForChar(c);
            if (KeyEvent.CHAR_UNDEFINED == keyCode)
            {
                throw new RuntimeException(
                        "Key code not found for character '" + c + "'");
            }
            robot.keyPress(keyCode);
            robot.delay(50);
            robot.keyRelease(keyCode);
            robot.delay(50);
        }
    }

    protected void uploadFilesFromSystem(WebDriver driver, WebElement uploadFileButton, int namePostFix, String fileName) throws AWTException
    {
        Actions builder = new Actions(driver);
        Action myAction = builder.click(uploadFileButton).release().build();
        myAction.perform();
        Robot robot = new Robot();
        sendKeysDialogBox(robot, fileName);
        robot.keyPress(KeyEvent.VK_ENTER);
        robot.keyRelease(KeyEvent.VK_ENTER);
    }

    public void closeBrowser()
    {
        getDriver().quit();
    }
}