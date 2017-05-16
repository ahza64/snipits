package pages;

import org.openqa.selenium.By;

import java.net.MalformedURLException;

import setup.WebAppPage;

/**
 * Created by az on 5/16/17.
 */

public class IngestionConfigPage extends WebAppPage {

    private String selectCompanyButton = ".//label[text()='Company']/parent::div/div/descendant::button";
    private String selectProjectButton = "//label[text()='Work Project']/parent::div/div/descendant::button";
    private String selectCompanyDropDown = ".//*[@style='padding: 16px 0px; display: table-cell; user-select: none; width: 256px;']";
    private String selectProjectDropDown = ".//*[@style='padding: 16px 0px; display: table-cell; user-select: none; width: 256px;']";
    private String addConfigButton = ".//*[@class='col-lg-2 col-md-2 col-sm-0 col-xs-0']/descendant::span[text()='Add Configuration']";
    private String addConfigFormCancelButton = ".//span[text()='Cancel']";
    private String addConfigFormConfirmButton = ".//span[text()='Confirm']";
    private String addConfigNameField = ".//div[text()='Enter Configuration Type']/following-sibling::input";
    private String configTable = ".//*[@class='row']";
    private String badgeCount = ".//*[text()='Total Configuration Found']/div/span";
    private String dropDownButton = ".//*[@class='dropdown']/a";

    IngestionConfigPage() throws MalformedURLException
    {
        waitForVisible(By.xpath(addConfigButton));
        waitForPageLoadComplete();
        holdOnForACoupleOfSec();
    }

    private void waitForAddConfigFormToDisplay()
    {
        try {
            waitForVisible(By.xpath(addConfigFormCancelButton));
            LOGGER.info("Add COnoig Form is displayed");
        } catch (MalformedURLException e) {
            LOGGER.info("Add Config Form is not displayed");
        }
    }

    public void selectCompany(int namePostFix) throws MalformedURLException
    {
        clickOnElement(By.xpath(selectCompanyButton));
        waitForVisible(By.xpath(selectCompanyDropDown));
        holdOnForASec();
        clickOnElement(By.xpath(selectCompanyDropDown + "/descendant::div[text()='Company" + namePostFix + "']"));
        LOGGER.info("Company is Selected");
        holdOnForASec();
    }

    public void selectProject(int namePostFix) throws MalformedURLException
    {
        clickOnElement(By.xpath(selectProjectButton));
        waitForVisible(By.xpath(selectProjectDropDown));
        holdOnForASec();
        clickOnElement(By.xpath(selectProjectDropDown + "/descendant::div[text()='Project" + namePostFix + "']"));
        LOGGER.info("Project is Selected");
        holdOnForASec();
    }

    public void addNewConfig(int namePostFix) throws MalformedURLException
    {
        clickOnElement(By.xpath(addConfigButton));
        waitForAddConfigFormToDisplay();
        driver.findElement(By.xpath(addConfigNameField)).sendKeys("Config" + namePostFix);
        clickOnElement(By.xpath(addConfigFormConfirmButton));
        LOGGER.info("Ingestion Config is Added");
    }

    public boolean verifyNewConfigIsAdded(int namePostFix)
    {
        boolean isNewConfigAdded = false;

        if(isElementPresentAndDisplayedByLocator(By.xpath(configTable)))
        {
            int totalRowsInConfigTable = driver.findElements(By.xpath(configTable + "/descendant::tr")).size();
            LOGGER.info(String.valueOf(totalRowsInConfigTable));
            String configNameDisplayed;

            for(int i=2; i<totalRowsInConfigTable+2; i++)
            {
                configNameDisplayed = driver.findElement(By.xpath(configTable + "/descendant::tr[" + i + "]/td[4]")).getText();
                if(configNameDisplayed.contentEquals("Config" + namePostFix))
                {
                    String companyName, projectName;
                    companyName = driver.findElement(By.xpath(configTable + "/descendant::tr[" + i + "]/td[2]")).getText();
                    projectName = driver.findElement(By.xpath(configTable + "/descendant::tr[" + i + "]/td[3]")).getText();
                    LOGGER.info(companyName + " " + projectName);
                    if(companyName.contentEquals("Company" + namePostFix) && projectName.contentEquals("Project" + namePostFix))
                    {
                        isNewConfigAdded = true;
                        break;
                    }
                }
            }
        }

        return isNewConfigAdded;
    }

    public int getBadgeCount()
    {
        return Integer.parseInt(driver.findElement(By.xpath(badgeCount)).getText());
    }

    public DropDownMenu clickDropDownMenu()
    {
        clickOnElement(By.xpath(dropDownButton));
        return new DropDownMenu();
    }
}
