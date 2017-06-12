package pagesIngestionInterface;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.awt.AWTException;
import java.net.MalformedURLException;

import setup.WebAppPage;

/**
 * Created by az on 6/5/17.
 */

public class UploadPage extends WebAppPage
{
    private String dropZone = ".//div[@class='dropzone']";
    private String heatMapContainer = ".//div[@class='highcharts-container ']";
    private String selectProjectButton = ".//div[text()='Choose Project']";
    private String selectConfigButton = ".//div[text()='Choose Config']";
    private String selectProjectDropDown = ".//*[@style='padding: 16px 0px; display: table-cell; user-select: none; width: 192px;']";
    private String selectConfigDropDown = ".//*[@style='padding: 16px 0px; display: table-cell; user-select: none; width: 192px;']";
    private String uploadFilePopupSubmitButton = ".//span[text()='Submit']/parent::div/parent::button";
    private String uploadFilePopupCancelButton = ".//span[text()='Cancel']/parent::div/parent::button";
    private String fileUploadingWait = ".//span[text()='File Uploading']/parent::div";
    private String filesTable = ".//*[@class='row']";

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
        selectEntity("Project", namePostFix, selectProjectButton, selectProjectDropDown);
    }

    public void selectConfig(int namePostFix) throws MalformedURLException
    {
        selectEntity("Config", namePostFix, selectConfigButton, selectConfigDropDown);
    }

    public void uploadFile(int namePostFix) throws AWTException, MalformedURLException
    {
        WebElement uploadFileButton = driver.findElement(By.xpath(dropZone));
        String fileName = "myFile" + namePostFix + ".txt";
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
}
