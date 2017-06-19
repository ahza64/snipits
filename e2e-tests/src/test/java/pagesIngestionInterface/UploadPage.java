package pagesIngestionInterface;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;

import java.awt.AWTException;
import java.net.MalformedURLException;

import pagesInternalAdmin.DropDownMenu;
import setup.WebAppPage;

import static constants.Constants.FILE_NAME;

/**
 * Created by az on 6/5/17.
 */

public class UploadPage extends WebAppPage
{
    private String dropZone = ".//div[@class='dropzone']";
    private String heatMapContainer = ".//div[@class='highcharts-container ']";
    private String selectProjectButton = ".//div[text()='Choose Project']";
    private String selectConfigButton = ".//div[text()='Choose Config']";
    private String uploadFilePopupSubmitButton = ".//span[text()='Submit']/parent::div/parent::button";
    private String uploadFilePopupCancelButton = ".//span[text()='Cancel']/parent::div/parent::button";
    private String fileUploadingWait = ".//span[text()='File Uploading']/parent::div";
    private String filesTable = ".//*[@class='row']";
    private String fileUploadErrorPopUpCloseButton = ".//span[text()='Close']/parent::div/parent::button";
    private String dropDownButton = ".//*[@class='dropdown']/a";
    private String searchTextField = ".//div[text()='Search for ingestion files ... ']/following-sibling::input";
    private String totalFilesText = ".//div[@class='row' and text()[contains(., 'total')]]";

    UploadPage() throws MalformedURLException
    {
        waitForVisible(By.xpath(dropZone));
        waitForVisible(By.xpath(heatMapContainer));
        waitForVisible(By.xpath(selectProjectButton));
        waitForVisible(By.xpath(selectConfigButton));
        waitForPageLoadComplete();
        holdOnForACoupleOfSec();
    }

    public void selectProject(int namePostFix) throws MalformedURLException
    {
        selectEntity("Project", namePostFix, selectProjectButton);
    }

    public void selectConfig(int namePostFix) throws MalformedURLException
    {
        selectEntity("Config", namePostFix, selectConfigButton);
    }

    public void uploadFile(int namePostFix) throws AWTException, MalformedURLException
    {
        WebElement uploadFileButton = driver.findElement(By.xpath(dropZone));
        String fileName = FILE_NAME + namePostFix + ".txt";
        uploadFilesFromSystem(getDriver(), uploadFileButton, namePostFix, fileName);
        waitForVisible(By.xpath(uploadFilePopupSubmitButton));
        clickOnElement(By.xpath(uploadFilePopupSubmitButton));
        waitForElementToDisappear(By.xpath(uploadFilePopupSubmitButton));
    }

    public void waitForUploadFileToComplete() throws MalformedURLException
    {
        holdOnForACoupleOfSec();
        waitForAjaxCompletion();
        waitForVisible(By.xpath(fileUploadingWait));
        waitForElementToDisappear(By.xpath(fileUploadingWait));
    }

    public boolean verifyFileOnHeatMap(int namePostFix) throws MalformedURLException
    {
        boolean isFileDisplayedOnHeatMap = false;

        holdOnForACoupleOfSec();
        scrollToElement(driver.findElement(By.xpath(heatMapContainer)));
        holdOnForACoupleOfSec();
        int totalrectsOnHeatMap = driver.findElements(By.xpath(".//*[name()='rect']")).size();

        for(int i=0; i<totalrectsOnHeatMap; i++)
        {
            if (isElementPresent(By.xpath(".//*[name()='rect'][" + i + "]")))
            {
                hoverOverElement(driver.findElement(By.xpath(".//*[name()='rect'][" + i + "]")));
                waitForVisible(By.xpath(".//*[name()='g' and @class='highcharts-label highcharts-tooltip highcharts-color-0']"));
                String fileNameFromHeatMap = driver.findElement(By.xpath(".//*[name()='g' and @class='highcharts-label highcharts-tooltip highcharts-color-0']")).getText();
                LOGGER.info(fileNameFromHeatMap);
                if (fileNameFromHeatMap.contains(FILE_NAME + namePostFix + ".txt"))
                {
                    isFileDisplayedOnHeatMap = true;
                    break;
                }
            }
        }

        return isFileDisplayedOnHeatMap;
    }

    public boolean isErrorForReuploadDisplayed()
    {
        boolean isVisible = false;
        try
        {
            waitForVisible(By.xpath(fileUploadErrorPopUpCloseButton));
            clickOnElement(By.xpath(fileUploadErrorPopUpCloseButton));
            waitForElementToDisappear(By.xpath(fileUploadErrorPopUpCloseButton));
            isVisible = true;
        } catch (MalformedURLException e)
        {
            e.printStackTrace();
        }
        return isVisible;
    }

    public DropDownMenuII clickDropDownMenu()
    {
        clickOnElement(By.xpath(dropDownButton));
        return new DropDownMenuII();
    }

    public void typeInSearchField(String fileName, int namePostFix)
    {
        WebElement searchField = driver.findElement(By.xpath(searchTextField));
        clearAndType(searchField, fileName + namePostFix);
        waitForAjaxCompletion();
    }

    public void clearSearchField()
    {
        WebElement searchField = driver.findElement(By.xpath(searchTextField));
        searchField.sendKeys(Keys.CONTROL + "a");
        searchField.sendKeys(Keys.DELETE);
        waitForAjaxCompletion();
    }

    public String getFilesCountFromPage()
    {
        return driver.findElement(By.xpath(totalFilesText)).getText();
    }
}
