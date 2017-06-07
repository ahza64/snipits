package pagesIngestionInterface;

import org.openqa.selenium.By;

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
}
